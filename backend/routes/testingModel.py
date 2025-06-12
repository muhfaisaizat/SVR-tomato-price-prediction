import numpy as np
import pandas as pd
from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from sklearn.svm import SVR
from sklearn.preprocessing import MinMaxScaler, StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, mean_absolute_percentage_error
from config.db import get_db
from models.index import priceTomat
from middleware.index import verify_token

# Inisialisasi Router
testingModel_router = APIRouter(
    prefix="/testing",
    tags=["Testing Model SVR"]
)

@testingModel_router.get("/predict", response_model=dict,dependencies=[Depends(verify_token)])
def predict_price(
    db: Session = Depends(get_db),
    kernel: str = Query("rbf", enum=["linear", "poly", "sigmoid", "rbf"]),
    degree: int = Query(3, description="Degree untuk kernel Polynomial"),
    coef0: float = Query(0.0, description="Coef0 untuk kernel Polynomial dan Sigmoid"),
    C: float = Query(100.0, description="Parameter regulasi C"),
    gamma: float = Query(0.1, description="Parameter gamma untuk kernel RBF, Poly, dan Sigmoid"),
    epsilon: float = Query(0.01, description="Margin kesalahan untuk SVR")
):
    # Ambil data dari database
    data = db.query(priceTomat).all()
    if not data:
        raise HTTPException(status_code=404, detail="Data harga tomat tidak ditemukan")
    
    # Konversi data ke DataFrame
    df = pd.DataFrame([{
        "Tanggal": item.tanggal,
        "Pasar_Bandung": item.pasar_bandung,
        "Pasar_Ngunut": item.pasar_ngunut,
        "Pasar_Ngemplak": item.pasar_ngemplak,
        "Harga_Kemarin": item.ratarata_kemarin,
        "Harga_Sekarang": item.ratarata_sekarang
    } for item in data])

    # Simpan data asli
    data_asli = df.to_dict(orient='records')

    # Cek apakah data cukup untuk diproses
    if df.shape[0] < 3:
        raise HTTPException(status_code=400, detail="Data tidak cukup untuk melakukan prediksi")
    
    # Preprocessing
    # Pastikan semua kolom numerik
    kolom_numerik = ['Pasar_Bandung', 'Pasar_Ngunut', 'Pasar_Ngemplak', 'Harga_Kemarin', 'Harga_Sekarang']
    df[kolom_numerik] = df[kolom_numerik].apply(pd.to_numeric, errors='coerce')
    df[kolom_numerik] = df[kolom_numerik].replace(0, np.nan)
    # Interpolasi nilai kosong (0 yang sudah jadi NaN)
    df[kolom_numerik] = df[kolom_numerik].interpolate(method='linear', limit_direction='both')
    # Drop jika masih ada NaN (misalnya di ujung data)
    df.dropna(inplace=True)

    # df['Tanggal'] = pd.to_datetime(df['Tanggal'])
   
    # df.dropna(inplace=True)

    min_max_per_kolom = {}

    for kolom in kolom_numerik:
        nilai_min = df[kolom].min()
        nilai_max = df[kolom].max()
        min_max_per_kolom[kolom] = {
            'min': nilai_min,
            'max': nilai_max
        }


    # Simpan hasil preprocessing
    hasil_preprocessing = df.to_dict(orient='records')

    # Normalisasi Data
    scaler = MinMaxScaler()
    df[['Pasar_Bandung', 'Pasar_Ngunut', 'Pasar_Ngemplak', 'Harga_Kemarin',  'Harga_Sekarang']] = scaler.fit_transform(df[['Pasar_Bandung', 'Pasar_Ngunut', 'Pasar_Ngemplak', 'Harga_Kemarin', 'Harga_Sekarang']])

    # scaler = StandardScaler()
    # df[['Pasar_Bandung', 'Pasar_Ngunut', 'Pasar_Ngemplak', 'Harga_Kemarin',  'Harga_Sekarang']] = scaler.fit_transform(df[['Pasar_Bandung', 'Pasar_Ngunut', 'Pasar_Ngemplak', 'Harga_Kemarin',  'Harga_Sekarang']])


    # Simpan hasil normalisasi
    hasil_normalisasi = df.to_dict(orient='records')

    # Split Data
    X = df[['Pasar_Bandung', 'Pasar_Ngunut', 'Pasar_Ngemplak', 'Harga_Kemarin']]
    y = df['Harga_Sekarang']
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, shuffle=False)

    # Simpan hasil split data
    hasil_split_data = {
        "X_train": X_train.to_dict(orient='records'),
        "X_test": X_test.to_dict(orient='records'),
        "y_train": y_train.tolist(),
        "y_test": y_test.tolist()
    }

    if kernel == "linear":
        svr = SVR(kernel="linear", C=C,  epsilon=epsilon)

    elif kernel == "rbf":
        svr = SVR(kernel="rbf", C=C, gamma=gamma, epsilon=epsilon)

    elif kernel == "sigmoid":
        svr = SVR(kernel="sigmoid", C=C, gamma=gamma, coef0=coef0, epsilon=epsilon)

    elif kernel == "poly":
        svr = SVR(kernel="poly", C=C, gamma=gamma, coef0=coef0, degree=degree, epsilon=epsilon)

    svr.fit(X_train, y_train)

    # Prediksi Harga
    y_pred = svr.predict(X_test)

    # Evaluasi Model
    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    mape = mean_absolute_percentage_error(y_test, y_pred)  

   # Kembalikan skala data
    df_prediksi = df.iloc[len(X_train):].copy()
    # # df_prediksi['Tanggal'] = df_prediksi['Tanggal'].dt.date
    df_prediksi['Harga_Prediksi'] = y_pred

    # # Daftar kolom yang telah dinormalisasi
    cols_scaled = ['Pasar_Bandung', 'Pasar_Ngunut', 'Pasar_Ngemplak', 'Harga_Kemarin', 'Harga_Sekarang']

    # # Invers scaling satu per satu kolom berdasarkan mean dan std dari StandardScaler
    # feature_names = scaler.feature_names_in_.tolist()

    # # Invers Harga_Prediksi berdasarkan skala 'Harga_Sekarang'
    # index_harga_sekarang = feature_names.index('Harga_Sekarang')
    # mean_sekarang = scaler.mean_[index_harga_sekarang]
    # std_sekarang = np.sqrt(scaler.var_[index_harga_sekarang])
    # df_prediksi['Harga_Prediksi'] = df_prediksi['Harga_Prediksi'] * std_sekarang + mean_sekarang

    # df_prediksi['Harga_Prediksi'] = df_prediksi['Harga_Prediksi'].round(0)

    # # Invers kolom lain yang tersedia di df_prediksi
    # for kolom in cols_scaled:
    #     if kolom in df_prediksi.columns:
    #         index = feature_names.index(kolom)
    #         mean = scaler.mean_[index]
    #         std = np.sqrt(scaler.var_[index])
    #         df_prediksi[kolom] = df_prediksi[kolom] * std + mean

    # # Ambil nilai min dan max dari scaler
   # Inverse semua kolom yang dinormalisasi ke skala asli
    for kolom in cols_scaled:
        if kolom in df_prediksi.columns:
            min_val = min_max_per_kolom[kolom]['min']
            max_val = min_max_per_kolom[kolom]['max']
            df_prediksi[kolom] = df_prediksi[kolom] * (max_val - min_val) + min_val
            df_prediksi[kolom] = df_prediksi[kolom].round(0)  

    # Inverse kolom prediksi (Harga_Prediksi) berdasarkan skala 'Harga_Sekarang'
    min_pred = min_max_per_kolom['Harga_Sekarang']['min']
    max_pred = min_max_per_kolom['Harga_Sekarang']['max']
    df_prediksi['Harga_Prediksi'] = df_prediksi['Harga_Prediksi'] * (max_pred - min_pred) + min_pred
    df_prediksi['Harga_Prediksi'] = df_prediksi['Harga_Prediksi'].round(0)


    # Export atau tampilkan hasil
    hasil_prediksi = df_prediksi[['Tanggal', 'Pasar_Bandung', 'Pasar_Ngunut', 'Pasar_Ngemplak',
                                'Harga_Kemarin', 'Harga_Sekarang', 'Harga_Prediksi']].to_dict(orient='records')





    # Kembalikan semua hasil dalam JSON
    return {
        "Kernel_Digunakan": kernel,
        "Degree": degree if kernel == "poly" else None,
        "Coef0": coef0 if kernel in ["poly", "sigmoid"] else None,
        "C": C,
        "Gamma": gamma,
        "Epsilon": epsilon,
        "Data_Asli": data_asli,
        "Hasil_Preprocessing": hasil_preprocessing,
        "Hasil_Normalisasi": hasil_normalisasi,
        "Hasil_Split_Data": hasil_split_data,
        "Hasil_Prediksi": hasil_prediksi,
        "Evaluasi_Model": {
            "MAE": mae,
            "RMSE": rmse,
            "MAPE": mape
        },
        "min_max_per_kolom": min_max_per_kolom
    }
