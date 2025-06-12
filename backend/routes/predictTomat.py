import numpy as np
import pandas as pd
from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import select, insert, text, join, delete
from sklearn.svm import SVR
from sklearn.preprocessing import MinMaxScaler, StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, mean_absolute_percentage_error  
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
            query = text("""
                SELECT 
                (SELECT pt.tanggal 
                FROM price_tomat AS pt 
                JOIN result_predict AS rp ON pt.id = rp.id 
                ORDER BY rp.id ASC 
                LIMIT 1 OFFSET 29) AS tanggal_old,

                (SELECT tanggal 
                FROM price_tomat 
                ORDER BY tanggal DESC 
                LIMIT 1) AS tanggal_new;
            """)
            result = db.execute(query).fetchone()
            
            if result:
                return {
                    "tanggal_old": result[0],  
                    "tanggal_new": result[1]
                }
            else:
                return {"message": "No data found"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    

@predict_router.get("/price", response_model=dict, dependencies=[Depends(verify_token)])
def predict_price(db: Session = Depends(get_db)):
    try:
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
        kolom_numerik = ['Pasar_Bandung', 'Pasar_Ngunut', 'Pasar_Ngemplak', 'RataRata_Kemarin', 'RataRata_Sekarang']
        df[kolom_numerik] = df[kolom_numerik].apply(pd.to_numeric, errors='coerce')
        df[kolom_numerik] = df[kolom_numerik].replace(0, np.nan)
        # Interpolasi nilai kosong (0 yang sudah jadi NaN)
        df[kolom_numerik] = df[kolom_numerik].interpolate(method='linear', limit_direction='both')
        # Drop jika masih ada NaN (misalnya di ujung data)
        df.dropna(inplace=True)

        df['Tanggal'] = pd.to_datetime(df['Tanggal'])
        # df['Harga_2Hari_Lalu'] = df['Harga_Kemarin'].shift(1)
        df.dropna(inplace=True)

        min_max_per_kolom = {}

        for kolom in kolom_numerik:
            nilai_min = df[kolom].min()
            nilai_max = df[kolom].max()
            min_max_per_kolom[kolom] = {
                'min': nilai_min,
                'max': nilai_max
            }
        
        # Normalisasi Data
        # scaler = StandardScaler()
        scaler = MinMaxScaler()
        df[['Pasar_Bandung', 'Pasar_Ngunut', 'Pasar_Ngemplak', 'RataRata_Kemarin',  'RataRata_Sekarang']] = scaler.fit_transform(
            df[['Pasar_Bandung', 'Pasar_Ngunut', 'Pasar_Ngemplak', 'RataRata_Kemarin',  'RataRata_Sekarang']]
        )

        X = df[['Pasar_Bandung', 'Pasar_Ngunut', 'Pasar_Ngemplak', 'RataRata_Kemarin', ]].values
        y = df['RataRata_Sekarang'].values
        ids = df['id'].values
        tanggal = df['Tanggal'].values

        X_train, X_test, y_train, y_test, id_train, id_test, tanggal_train, tanggal_test = train_test_split(
            X, y, ids, tanggal, test_size=0.2, shuffle=False
        )

        # Ambil parameter model dari database
        kernel = settings.nama_kernel
        C = float(settings.nilai_c) if settings.nilai_c is not None else 1.0
        gamma = float(settings.nilai_gamma) if settings.nilai_gamma not in [None, "auto", "scale"] else settings.nilai_gamma
        epsilon = float(settings.nilai_epsilon) if settings.nilai_epsilon is not None else 0.1
        degree = int(settings.nilai_degree) if settings.nilai_degree is not None else 3
        coef0 = float(settings.nilai_coef) if settings.nilai_coef is not None else 0.0

        if kernel == "linear":
            svr = SVR(kernel="linear", C=C,  epsilon=epsilon)

        elif kernel == "rbf":
            svr = SVR(kernel="rbf", C=C, gamma=gamma, epsilon=epsilon)

        elif kernel == "sigmoid":
            svr = SVR(kernel="sigmoid", C=C, gamma=gamma, coef0=coef0, epsilon=epsilon)

        elif kernel == "poly":
            svr = SVR(kernel="poly", C=C, gamma=gamma, coef0=coef0, degree=degree, epsilon=epsilon)
        

        # Latih model dengan data latih
        svr.fit(X_train, y_train)

        # Prediksi untuk data uji
        y_pred = svr.predict(X_test)
        
        # Evaluasi Model
        mae = mean_absolute_error(y_test, y_pred)
        rmse = np.sqrt(mean_squared_error(y_test, y_pred))
        mape = mean_absolute_percentage_error(y_test, y_pred)  

        jumlah_data_dikirim = 0
        
        # Gabungkan hasil prediksi ke data uji
        # for i in range(len(y_pred)):
        #     id_tomat = id_test[i]
        #     hasil = y_pred[i]

        #     # Invers hasil prediksi
        #     dummy_row = np.zeros((1, 5))  # [0, 0, 0, 0, 0, hasil_prediksi]
        #     dummy_row[0][4] = hasil
        #     prediksi_asli = float(scaler.inverse_transform(dummy_row)[0][4])

        #     existing = db.execute(select(resultPredict).where(resultPredict.c.id == id_tomat)).fetchone()
        #     if existing:
        #         db.execute(
        #             resultPredict.update()
        #             .where(resultPredict.c.id == id_tomat)
        #             .values(hasil_prediksi=prediksi_asli)
        #         )
        #     else:
        #         db.execute(insert(resultPredict).values(id=id_tomat, hasil_prediksi=prediksi_asli))

        #     jumlah_data_dikirim += 1

        insert_data = []
        update_data = []

        for i in range(len(y_pred)):
            
            id_tomat = id_test[i]
            hasil = y_pred[i]
            # hasil = float(y_pred[i])
            # print("start prediction", id_tomat, hasil)

            # Invers hasil prediksi
            # dummy_row = np.zeros((1, 5))
            # dummy_row[0][4] = hasil
            # prediksi_asli = float(scaler.inverse_transform(dummy_row)[0][4])

            min_pred = min_max_per_kolom['RataRata_Sekarang']['min']
            max_pred = min_max_per_kolom['RataRata_Sekarang']['max']
            prediksi_asli1 = hasil * (max_pred - min_pred) + min_pred
            prediksi_asli = int(round(prediksi_asli1, 0))
            # print("start prediction", id_tomat, prediksi_asli)

            
            insert_data.append({
                "id": id_tomat,
                "hasil_prediksi": prediksi_asli
            })

        print("print data keseluruhan", insert_data)
        # Bulk insert
        if insert_data:
            db.execute(insert(resultPredict), insert_data)

        # Bulk update (looped, karena SQLAlchemy core tidak punya bulk update langsung)
        for item in update_data:
            db.execute(
                resultPredict.update()
                .where(resultPredict.c.id == item["id"])
                .values(hasil_prediksi=item["hasil_prediksi"])
            )

        jumlah_data_dikirim += len(insert_data) + len(update_data)

        db.commit()
        
        return {
            "Kernel": kernel,
            "Evaluasi": { "MAE": mae, "RMSE": rmse, "MAPE": mape },
            "Jumlah_data_dikirim": jumlah_data_dikirim,
            "Pesan": "Prediksi seluruh data berhasil disimpan ke database"
        }

    except Exception as e:
        db.rollback()  # penting!
        print(f"Error: {e}")
    finally:
        db.close()





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
            # **Melakukan Prediksi 7 Hari ke Depan**
            settings = db.execute(select(settingPredict).where(settingPredict.c.statuskedepan == True)).mappings().all()
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
            kolom_numerik = ['Pasar_Bandung', 'Pasar_Ngunut', 'Pasar_Ngemplak', 'RataRata_Kemarin', 'RataRata_Sekarang']
            df[kolom_numerik] = df[kolom_numerik].apply(pd.to_numeric, errors='coerce')
            df[kolom_numerik] = df[kolom_numerik].replace(0, np.nan)
            # Interpolasi nilai kosong (0 yang sudah jadi NaN)
            df[kolom_numerik] = df[kolom_numerik].interpolate(method='linear', limit_direction='both')
            # Drop jika masih ada NaN (misalnya di ujung data)
            df.dropna(inplace=True)

            df['Tanggal'] = pd.to_datetime(df['Tanggal'])
            # df['Harga_2Hari_Lalu'] = df['Harga_Kemarin'].shift(1)
            df.dropna(inplace=True)

            min_max_per_kolom = {}

            for kolom in kolom_numerik:
                nilai_min = df[kolom].min()
                nilai_max = df[kolom].max()
                min_max_per_kolom[kolom] = {
                    'min': nilai_min,
                    'max': nilai_max
                }

           # 6. Normalisasi Data
            scaler = MinMaxScaler()
            # scaler = StandardScaler()
            df[['Pasar_Bandung', 'Pasar_Ngunut', 'Pasar_Ngemplak', 'RataRata_Kemarin', 'RataRata_Sekarang']] = scaler.fit_transform(
                df[['Pasar_Bandung', 'Pasar_Ngunut', 'Pasar_Ngemplak', 'RataRata_Kemarin', 'RataRata_Sekarang']]
            )


            # 7. Siapkan Data untuk Pelatihan Model
            X = df[['Pasar_Bandung', 'Pasar_Ngunut', 'Pasar_Ngemplak', 'RataRata_Kemarin']]
            y = df['RataRata_Sekarang']

            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, shuffle=False)

            # # Inisialisasi SVR
            # # kernel = settings.nama_kernel
            # kernel = settings["nama_kernel"]
            # C = float(settings.nilai_c) if settings.nilai_c is not None else 1.0
            # gamma = float(settings.nilai_gamma) if settings.nilai_gamma not in [None, "auto", "scale"] else settings.nilai_gamma
            # epsilon = float(settings.nilai_epsilon) if settings.nilai_epsilon is not None else 0.1
            # degree = int(settings.nilai_degree) if settings.nilai_degree is not None else 3
            # coef0 = float(settings.nilai_coef) if settings.nilai_coef is not None else 0.0

            # if kernel == "linear":
            #     svr = SVR(kernel="linear", C=C,  epsilon=epsilon)

            # elif kernel == "rbf":
            #     svr = SVR(kernel="rbf", C=C, gamma=gamma, epsilon=epsilon)

            # elif kernel == "sigmoid":
            #     svr = SVR(kernel="sigmoid", C=C, gamma=gamma, coef0=coef0, epsilon=epsilon)

            # elif kernel == "poly":
            #     svr = SVR(kernel="poly", C=C, gamma=gamma, coef0=coef0, degree=degree, epsilon=epsilon)

            # svr.fit(X_train, y_train)

            # # # 9. Lakukan Prediksi pada Data Uji
            # # y_pred = svr.predict(X_test)

            # # # 10. Evaluasi Model
            # # mae = mean_absolute_error(y_test, y_pred)
            # # rmse = np.sqrt(mean_squared_error(y_test, y_pred))
            # # mape = mape = mean_absolute_percentage_error(y_test, y_pred)


            # # 11. Prediksi 7 Hari ke Depan
            # last_data = pd.DataFrame([X.iloc[-1].values], columns=X.columns) 

            # predictions = []
            # for _ in range(7):
            #     pred = svr.predict(last_data)[0]
            #     predictions.append(pred)

            #     #  Update input dengan DataFrame, bukan NumPy array
            #     last_data = pd.DataFrame([[last_data.iloc[0, 1], last_data.iloc[0, 2], last_data.iloc[0, 3], pred]], columns=X.columns)

            # # 12. Konversi hasil prediksi ke skala asli
            # # predictions = scaler.inverse_transform([[0, 0, 0, 0, p] for p in predictions])[:, 4]
            # predictions = np.array(predictions)
            # min_pred = min_max_per_kolom['RataRata_Sekarang']['min']
            # max_pred = min_max_per_kolom['RataRata_Sekarang']['max']
            # prediksi_asli1 = predictions * (max_pred - min_pred) + min_pred
            # predictions = prediksi_asli1

            # # 13. Tampilkan hasil prediksi
            # hasil_prediksi_semua_kernel = []
            # prediksi_harga = []
            # harga_list = []  # Menyimpan harga untuk mencari min dan max

            # for i, pred in enumerate(predictions, start=1):
            #     tanggal_prediksi = latest_date + timedelta(days=i)
            #     tanggal_str = tanggal_prediksi.strftime("%Y-%m-%d")  # Format tanggal YYYY-MM-DD
            #     harga_bulat = round(pred, 0)
                
            #     # print(f"Tanggal {tanggal_str}: {harga_bulat}")
                
            #     prediksi_harga.append({"tanggal": tanggal_str, "harga_prediksi": harga_bulat})
            #     harga_list.append(harga_bulat)

            # hasil_prediksi_semua_kernel.append({
            #     "kernel": kernel,
            #     "hasil_prediksi": prediksi_harga,
            #     "min": min(harga_list),
            #     "max": max(harga_list)
            # })

            # # Dapatkan nilai min dan max
            # harga_min = min(harga_list)
            # harga_max = max(harga_list)
            # y_axis = f"{harga_min},{harga_max}"

            dataTableAktual = []
            dataTablePrediksi = []
            prediksi_per_hari = {}

            hasil_prediksi_semua_kernel = []
            y_axis = f"{int(min_max_per_kolom['RataRata_Sekarang']['min'])},{int(min_max_per_kolom['RataRata_Sekarang']['max'])}"

            # Loop setiap kernel aktif
            for setting in settings:
                
                
                kernel = setting["nama_kernel"]
                C = float(setting["nilai_c"]) if setting["nilai_c"] is not None else 1.0
                gamma = setting["nilai_gamma"]
                gamma = float(gamma) if gamma not in [None, "auto", "scale"] else gamma
                epsilon = float(setting["nilai_epsilon"]) if setting["nilai_epsilon"] is not None else 0.1
                degree = int(setting["nilai_degree"]) if setting["nilai_degree"] is not None else 3
                coef0 = float(setting["nilai_coef"]) if setting["nilai_coef"] is not None else 0.0

                # Inisialisasi model SVR sesuai kernel
                if kernel == "linear":
                    svr = SVR(kernel="linear", C=C, epsilon=epsilon)
                elif kernel == "rbf":
                    svr = SVR(kernel="rbf", C=C, gamma=gamma, epsilon=epsilon)
                elif kernel == "sigmoid":
                    svr = SVR(kernel="sigmoid", C=C, gamma=gamma, coef0=coef0, epsilon=epsilon)
                elif kernel == "poly":
                    svr = SVR(kernel="poly", C=C, gamma=gamma, coef0=coef0, degree=degree, epsilon=epsilon)
                else:
                    continue  # Lewati jika kernel tidak valid

                svr.fit(X_train, y_train)

                # Prediksi 7 hari ke depan
                last_data = pd.DataFrame([X.iloc[-1].values], columns=X.columns)
                predictions = []
                for _ in range(7):
                    pred = svr.predict(last_data)[0]
                    predictions.append(pred)
                    last_data = pd.DataFrame([[last_data.iloc[0, 1], last_data.iloc[0, 2], last_data.iloc[0, 3], pred]], columns=X.columns)

                # Konversi skala prediksi ke harga asli
                predictions = np.array(predictions)
                min_pred = min_max_per_kolom['RataRata_Sekarang']['min']
                max_pred = min_max_per_kolom['RataRata_Sekarang']['max']
                prediksi_asli = predictions * (max_pred - min_pred) + min_pred

                # Format hasil
                prediksi_harga = []
                harga_list = []
                for i, pred in enumerate(prediksi_asli, start=1):
                    tanggal_prediksi = latest_date + timedelta(days=i)
                    tanggal_str = tanggal_prediksi.strftime("%Y-%m-%d")
                    harga_bulat = round(pred, 0)
                    prediksi_harga.append({"tanggal": tanggal_str, "harga_prediksi": harga_bulat})
                    harga_list.append(harga_bulat)

                hasil_prediksi_semua_kernel.append({
                    "kernel": kernel,
                    "hasil_prediksi": prediksi_harga,
                })

                for i, pred in enumerate(prediksi_asli, start=1):
                    tanggal_prediksi = latest_date + timedelta(days=i)
                    tanggal_str = tanggal_prediksi.strftime("%Y-%m-%d")
                    harga_bulat = round(pred, 0)

                    if tanggal_str not in prediksi_per_hari:
                        prediksi_per_hari[tanggal_str] = {"tanggal": tanggal_str}

                    prediksi_per_hari[tanggal_str][kernel] = harga_bulat

            dataTablePrediksi = list(prediksi_per_hari.values())

            

            return {
                # "Mean Absolute Error (MAE)": mae,
                # "Root Mean Squared Error (RMSE)": rmse,
                # "Mean Absolute Percentage Error (MAPE)": mape,
                "dataTableAktual": dataTableAktual, 
                "dataTablePrediksi": dataTablePrediksi,
                "tanggal_input": tanggal,
                "dataGrafik": dataTablePrediksi,
                "YAxis": y_axis
            }


        else:
            # Ambil data historis jika tanggal bukan yang terbaru
            start_date = tanggal_input - timedelta(days=29)
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
    

