import numpy as np
import pandas as pd
from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import select, insert, text, join, delete
from sklearn.svm import SVR
from sklearn.preprocessing import MinMaxScaler, StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error  
from config.db import get_db, conn
from models.index import priceTomat, settingPredict, resultPredict
from datetime import datetime, timedelta
from middleware.index import verify_token

# Inisialisasi Router
predict_router = APIRouter(
    prefix="/predict",
    tags=["Prediksi Harga Tomat"]
)

@predict_router.get("/date")
async def read_data(db: Session = Depends(get_db)):
    try:
        query = text("SELECT tanggal FROM price_tomat ORDER BY tanggal DESC LIMIT 1;")
        result = db.execute(query).fetchone()
        
        if result:
            return {"tanggal": result[0]}
        else:
            return {"message": "No data found"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    

@predict_router.get("/price", response_model=dict, dependencies=[Depends(verify_token)])
def predict_price(db: Session = Depends(get_db)):
    existing_data = db.execute(select(resultPredict)).fetchone()
    if existing_data:
        db.execute(delete(resultPredict))  # Hapus semua data lama
        db.commit()
    # Ambil data dari database
    data = db.execute(select(priceTomat)).fetchall()
    settings = db.execute(select(settingPredict).where(settingPredict.c.status == True)).fetchone()
    
    if not data:
        raise HTTPException(status_code=404, detail="Data harga tomat tidak ditemukan")
    if not settings:
        raise HTTPException(status_code=400, detail="Tidak ada konfigurasi prediksi yang aktif")
    
    # Konversi data ke DataFrame
    df = pd.DataFrame([{ 
        "id": item.id,  # Simpan ID
        "Tanggal": item.tanggal, 
        "Pasar_Bandung": item.pasar_bandung,
        "Pasar_Ngunut": item.pasar_ngunut,
        "Pasar_Ngemplak": item.pasar_ngemplak,
        "RataRata_Kemarin": item.ratarata_kemarin,
        "RataRata_Sekarang": item.ratarata_sekarang
    } for item in data])
    
    if df.shape[0] < 3:
        raise HTTPException(status_code=400, detail="Data tidak cukup untuk melakukan prediksi")
    
    # Preprocessing data
    df['RataRata_Kemarin'] = pd.to_numeric(df['RataRata_Kemarin'], errors='coerce')
    df['RataRata_Sekarang'] = pd.to_numeric(df['RataRata_Sekarang'], errors='coerce')
    df.dropna(inplace=True)
    df['Tanggal'] = pd.to_datetime(df['Tanggal'])
    df['RataRata_2Hari_Lalu'] = df['RataRata_Kemarin'].shift(1)
    df.dropna(inplace=True)
    
    # Normalisasi Data
    scaler = StandardScaler()
    df[['Pasar_Bandung', 'Pasar_Ngunut', 'Pasar_Ngemplak', 'RataRata_Kemarin', 'RataRata_2Hari_Lalu', 'RataRata_Sekarang']] = scaler.fit_transform(
        df[['Pasar_Bandung', 'Pasar_Ngunut', 'Pasar_Ngemplak', 'RataRata_Kemarin', 'RataRata_2Hari_Lalu', 'RataRata_Sekarang']]
    )

    # Ambil parameter model dari database
    kernel = settings.nama_kernel
    C = float(settings.nilai_c) if settings.nilai_c is not None else 1.0
    gamma = float(settings.nilai_gamma) if settings.nilai_gamma not in [None, "auto", "scale"] else settings.nilai_gamma
    epsilon = float(settings.nilai_epsilon) if settings.nilai_epsilon is not None else 0.1
    degree = int(settings.nilai_degree) if settings.nilai_degree is not None else 3
    coef0 = float(settings.nilai_coef) if settings.nilai_coef is not None else 0.0

    # Inisialisasi Model SVR
    if kernel == "linear":
        svr = SVR(kernel=kernel, C=C, epsilon=epsilon)
    else:
        svr = SVR(kernel=kernel, C=C, gamma=gamma, epsilon=epsilon)
        if kernel in ["poly", "sigmoid"]:
            svr.coef0 = coef0
        if kernel == "poly":
            svr.degree = degree
    
    # **Melakukan Prediksi Rolling Window**
    hasil_prediksi = []
    X = df[['Pasar_Bandung', 'Pasar_Ngunut', 'Pasar_Ngemplak', 'RataRata_Kemarin', 'RataRata_2Hari_Lalu']].values
    y = df['RataRata_Sekarang'].values
    
    # Latih model dengan semua data yang tersedia
    svr.fit(X, y)
    
    # Prediksi harga untuk semua tanggal di masa depan
    for i in range(len(df)):
        fitur_input = X[i]
        prediksi = svr.predict([fitur_input])[0]
        hasil_prediksi.append(prediksi)
    
    # Evaluasi Model
    mae = mean_absolute_error(y, hasil_prediksi)
    rmse = np.sqrt(mean_squared_error(y, hasil_prediksi))
    mape = np.mean(np.abs((y - hasil_prediksi) / y)) * 100
    
    # Simpan hasil ke database
    for i in range(len(hasil_prediksi)):
        id_tomat = df.iloc[i]['id']  # Ambil ID dari tabel price_tomat
        prediksi_value = float(scaler.inverse_transform([[0, 0, 0, 0, 0, hasil_prediksi[i]]])[0][5])

        # Perbarui atau masukkan data baru
        existing = db.execute(select(resultPredict).where(resultPredict.c.id == id_tomat)).fetchone()
        if existing:
            db.execute(
                resultPredict.update()
                .where(resultPredict.c.id == id_tomat)
                .values(hasil_prediksi=prediksi_value)
            )
        else:
            db.execute(insert(resultPredict).values(id=id_tomat, hasil_prediksi=prediksi_value))

    db.commit()
    
    return {
        "Kernel": kernel,
        "Evaluasi": { "MAE": mae, "RMSE": rmse, "MAPE": mape },
        "Pesan": "Prediksi seluruh data berhasil disimpan ke database"
    }





@predict_router.get("/history")
def get_price_history(
    tanggal: str = Query(..., description="Tanggal dalam format YYYY-MM-DD"),
    data_type: str = Query("all", enum=["all", "actual", "predicted"], description="Jenis data yang ingin ditampilkan"),
    db: Session = Depends(get_db)
):
    try:
        # Konversi input tanggal ke datetime
        try:
            tanggal_input = datetime.strptime(tanggal, "%Y-%m-%d").date()
        except ValueError:
            raise HTTPException(status_code=400, detail="Format tanggal harus YYYY-MM-DD")
        
        # Cek tanggal terbaru di database
        latest_date_query = db.execute(select(priceTomat.c.tanggal).order_by(priceTomat.c.tanggal.desc())).fetchone()
        if not latest_date_query:
            raise HTTPException(status_code=404, detail="Data harga tidak ditemukan")

        latest_date = latest_date_query[0]  # Ambil tanggal terbaru
        
        if tanggal_input == latest_date:
            # **Melakukan Prediksi 30 Hari ke Depan**
            settings = db.execute(select(settingPredict).where(settingPredict.c.status == True)).fetchone()
            if not settings:
                raise HTTPException(status_code=400, detail="Tidak ada konfigurasi prediksi yang aktif")

            # Ambil data untuk pelatihan model
            data = db.execute(select(priceTomat)).fetchall()
            if not data:
                raise HTTPException(status_code=404, detail="Data harga tomat tidak ditemukan")
            
            df = pd.DataFrame([{ 
                "Tanggal": item.tanggal, 
                "Pasar_Bandung": item.pasar_bandung,
                "Pasar_Ngunut": item.pasar_ngunut,
                "Pasar_Ngemplak": item.pasar_ngemplak,
                "RataRata_Kemarin": item.ratarata_kemarin, 
                "RataRata_Sekarang": item.ratarata_sekarang 
            } for item in data])

            if df.shape[0] < 3:
                raise HTTPException(status_code=400, detail="Data tidak cukup untuk melakukan prediksi")

            # Preprocessing
            # 3. Perbaiki Format Tanggal
            df['Tanggal'] = pd.to_datetime(df['Tanggal'], dayfirst=True, errors='coerce')

            # 4. Hapus Data yang Gagal Dikoreksi (jika ada)
            df = df.dropna(subset=['Tanggal']).reset_index(drop=True)

           # 6. Normalisasi Data
            # scaler = MinMaxScaler()
            scaler = StandardScaler()
            df[['Pasar_Bandung', 'Pasar_Ngunut', 'Pasar_Ngemplak', 'RataRata_Kemarin', 'RataRata_Sekarang']] = scaler.fit_transform(
                df[['Pasar_Bandung', 'Pasar_Ngunut', 'Pasar_Ngemplak', 'RataRata_Kemarin', 'RataRata_Sekarang']]
            )


            # 7. Siapkan Data untuk Pelatihan Model
            X = df[['Pasar_Bandung', 'Pasar_Ngunut', 'Pasar_Ngemplak', 'RataRata_Kemarin']]
            y = df['RataRata_Sekarang']

            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, shuffle=False)

            # Inisialisasi SVR
            kernel = settings.nama_kernel
            C = float(settings.nilai_c) if settings.nilai_c is not None else 1.0
            gamma = float(settings.nilai_gamma) if settings.nilai_gamma not in [None, "auto", "scale"] else settings.nilai_gamma
            epsilon = float(settings.nilai_epsilon) if settings.nilai_epsilon is not None else 0.1
            degree = int(settings.nilai_degree) if settings.nilai_degree is not None else 3
            coef0 = float(settings.nilai_coef) if settings.nilai_coef is not None else 0.0

            # 8. Latih Model SVR dengan Kernel Linear
            # Inisialisasi Model SVR
            if kernel == "linear":
                svr = SVR(kernel=kernel, C=C, epsilon=epsilon)
            else:
                svr = SVR(kernel=kernel, C=C, gamma=gamma, epsilon=epsilon)
                if kernel in ["poly", "sigmoid"]:
                    svr.coef0 = coef0
                if kernel == "poly":
                    svr.degree = degree
            # svr = SVR(kernel='linear', C=1.0, epsilon=0.01)
            # svr = SVR(kernel='rbf', C=1.0, epsilon=0.01, gamma='scale')
            svr.fit(X_train, y_train)

            # 9. Lakukan Prediksi pada Data Uji
            y_pred = svr.predict(X_test)

            # 10. Evaluasi Model
            mae = mean_absolute_error(y_test, y_pred)
            rmse = np.sqrt(mean_squared_error(y_test, y_pred))
            mape = np.mean(np.abs((y_test - y_pred) / y_test)) * 100


            # 11. Prediksi 30 Hari ke Depan
            last_data = pd.DataFrame([X.iloc[-1].values], columns=X.columns)  # ✅ Gunakan DataFrame

            predictions = []
            for _ in range(7):
                pred = svr.predict(last_data)[0]
                predictions.append(pred)

                # ✅ Update input dengan DataFrame, bukan NumPy array
                last_data = pd.DataFrame([[last_data.iloc[0, 1], last_data.iloc[0, 2], last_data.iloc[0, 3], pred]], columns=X.columns)

            # 12. Konversi hasil prediksi ke skala asli
            predictions = scaler.inverse_transform([[0, 0, 0, 0, p] for p in predictions])[:, 4]

            # 13. Tampilkan hasil prediksi
            prediksi_harga = []
            harga_list = []  # Menyimpan harga untuk mencari min dan max

            for i, pred in enumerate(predictions, start=1):
                tanggal_prediksi = latest_date + timedelta(days=i)
                tanggal_str = tanggal_prediksi.strftime("%Y-%m-%d")  # Format tanggal YYYY-MM-DD
                harga_bulat = round(pred, 2)
                
                # print(f"Tanggal {tanggal_str}: {harga_bulat}")
                
                prediksi_harga.append({"tanggal": tanggal_str, "harga_prediksi": harga_bulat})
                harga_list.append(harga_bulat)

            # Dapatkan nilai min dan max
            harga_min = min(harga_list)
            harga_max = max(harga_list)
            y_axis = f"{harga_min},{harga_max}"

            dataTableAktual = []
            dataTablePrediksi = []

            

            return {
                "Mean Absolute Error (MAE)": mae,
                "Root Mean Squared Error (RMSE)": rmse,
                "Mean Absolute Percentage Error (MAPE)": mape,
                "dataTableAktual": dataTableAktual, 
                "dataTablePrediksi": prediksi_harga,
                "tanggal_input": tanggal,
                "dataGrafik": prediksi_harga,
                "YAxis": y_axis
            }


        else:
            # Ambil data historis jika tanggal bukan yang terbaru
            start_date = tanggal_input - timedelta(days=30)
            end_date = tanggal_input

            query = (
                select(
                    priceTomat.c.tanggal, 
                    priceTomat.c.ratarata_sekarang.label("harga_aktual"), 
                    resultPredict.c.hasil_prediksi.label("harga_prediksi")
                )
                .select_from(
                    join(priceTomat, resultPredict, priceTomat.c.id == resultPredict.c.id, isouter=True)  
                )
                .where(priceTomat.c.tanggal.between(start_date, end_date))
                .order_by(priceTomat.c.tanggal)
            )
            
            results = db.execute(query).fetchall()
            if not results:
                raise HTTPException(status_code=404, detail="Tidak ada data yang ditemukan dalam rentang tanggal")

            response = []
            dataTableAktual = []
            dataTablePrediksi = []
            harga_list = []

            for row in results:
                data = {"tanggal": row.tanggal}
                if data_type == "all":
                    data["harga_aktual"] = row.harga_aktual
                    data["harga_prediksi"] = row.harga_prediksi
                elif data_type == "actual":
                    data["harga_aktual"] = row.harga_aktual
                elif data_type == "predicted":
                    data["harga_prediksi"] = row.harga_prediksi
                response.append(data)

                # Data tabel aktual hanya menyimpan data harga aktual
                if row.harga_aktual is not None:
                    dataTableAktual.append({"tanggal": row.tanggal, "harga_aktual": row.harga_aktual})
                    harga_list.append(row.harga_aktual)

                # Data tabel prediksi hanya menyimpan data harga prediksi
                if row.harga_prediksi is not None:
                    dataTablePrediksi.append({"tanggal": row.tanggal, "harga_prediksi": row.harga_prediksi})
                    harga_list.append(row.harga_prediksi)

            if harga_list:
                y_min = min(harga_list)
                y_max = max(harga_list)
                y_axis = f"{int(y_min)},{int(y_max)}"
            else:
                y_axis = "0,0"  # Default jika tidak ada data harga

            return {
             "tanggal_input": tanggal, 
             "dataGrafik": response, 
             "dataTableAktual": dataTableAktual, 
             "dataTablePrediksi": dataTablePrediksi,
             "YAxis": y_axis
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

