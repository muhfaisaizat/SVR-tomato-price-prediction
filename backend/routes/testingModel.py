import numpy as np
import pandas as pd
from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from sklearn.svm import SVR
from sklearn.preprocessing import MinMaxScaler, StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, mean_absolute_percentage_error
import matplotlib.pyplot as plt
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
    df[['Pasar_Bandung', 'Pasar_Ngunut', 'Pasar_Ngemplak', 'Harga_Kemarin', 'Harga_Sekarang']] = df[['Pasar_Bandung', 'Pasar_Ngunut', 'Pasar_Ngemplak', 'Harga_Kemarin', 'Harga_Sekarang']].apply(pd.to_numeric, errors='coerce')
    df.dropna(inplace=True)
    df['Tanggal'] = pd.to_datetime(df['Tanggal'])
    df['Harga_2Hari_Lalu'] = df['Harga_Kemarin'].shift(1)
    # df['Harga_2Hari_Lalu'] = df['Harga_Kemarin'].shift(1).bfill()
    df.dropna(inplace=True)

    # Simpan hasil preprocessing
    hasil_preprocessing = df.to_dict(orient='records')

    # Normalisasi Data
    # scaler = MinMaxScaler()
    # df[['Pasar_Bandung', 'Pasar_Ngunut', 'Pasar_Ngemplak', 'Harga_Kemarin', 'Harga_2Hari_Lalu', 'Harga_Sekarang']] = scaler.fit_transform(df[['Pasar_Bandung', 'Pasar_Ngunut', 'Pasar_Ngemplak', 'Harga_Kemarin', 'Harga_2Hari_Lalu', 'Harga_Sekarang']])

    scaler = StandardScaler()
    df[['Pasar_Bandung', 'Pasar_Ngunut', 'Pasar_Ngemplak', 'Harga_Kemarin', 'Harga_2Hari_Lalu', 'Harga_Sekarang']] = scaler.fit_transform(df[['Pasar_Bandung', 'Pasar_Ngunut', 'Pasar_Ngemplak', 'Harga_Kemarin', 'Harga_2Hari_Lalu', 'Harga_Sekarang']])


    # Simpan hasil normalisasi
    hasil_normalisasi = df.to_dict(orient='records')

    # Split Data
    X = df[['Pasar_Bandung', 'Pasar_Ngunut', 'Pasar_Ngemplak', 'Harga_Kemarin', 'Harga_2Hari_Lalu']]
    y = df['Harga_Sekarang']
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, shuffle=False)

    # Simpan hasil split data
    hasil_split_data = {
        "X_train": X_train.to_dict(orient='records'),
        "X_test": X_test.to_dict(orient='records'),
        "y_train": y_train.tolist(),
        "y_test": y_test.tolist()
    }

    # Inisialisasi Model SVR dengan parameter yang dipilih
    # svr_params = {
    #     "kernel": kernel,
    #     "C": C,
    #     "gamma": gamma,
    #     "epsilon": epsilon
    # }

    # # Jika kernel adalah Polynomial atau Sigmoid, tambahkan coef0
    # if kernel in ["poly", "sigmoid"]:
    #     svr_params["coef0"] = coef0

    # # Jika kernel adalah Polynomial, tambahkan degree
    # if kernel == "poly":
    #     svr_params["degree"] = degree

    # svr = SVR(**svr_params)
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
    df_prediksi['Harga_Prediksi'] = y_pred
    df_prediksi[['Pasar_Bandung', 'Pasar_Ngunut', 'Pasar_Ngemplak', 'Harga_Kemarin', 'Harga_Sekarang', 'Harga_Prediksi']] = scaler.inverse_transform(df_prediksi[['Pasar_Bandung', 'Pasar_Ngunut', 'Pasar_Ngemplak', 'Harga_Kemarin', 'Harga_Sekarang', 'Harga_Prediksi']])

    # Simpan hasil prediksi
    hasil_prediksi = df_prediksi[['Tanggal', 'Pasar_Bandung', 'Pasar_Ngunut', 'Pasar_Ngemplak', 'Harga_Kemarin', 'Harga_Sekarang', 'Harga_Prediksi']].to_dict(orient='records')

    # Cek jumlah data bernilai 0 awal
    zero_data_log = {"Sebelum Preprocessing": (df == 0).sum().to_dict()}

    # Konversi ke numerik dan hitung 0 setelah konversi
    df[['Pasar_Bandung', 'Pasar_Ngunut', 'Pasar_Ngemplak', 'Harga_Kemarin', 'Harga_Sekarang']] = df[['Pasar_Bandung', 'Pasar_Ngunut', 'Pasar_Ngemplak', 'Harga_Kemarin', 'Harga_Sekarang']].apply(pd.to_numeric, errors='coerce')
    zero_data_log["Setelah Konversi Numerik"] = (df == 0).sum().to_dict()

    # Hapus NaN dan hitung 0 setelah drop NaN
    df.dropna(inplace=True)
    zero_data_log["Setelah Drop NaN Pertama"] = (df == 0).sum().to_dict()

    # Konversi tanggal
    df['Tanggal'] = pd.to_datetime(df['Tanggal'], errors='coerce')
    zero_data_log["Setelah Konversi Tanggal"] = (df == 0).sum().to_dict()

    # Tambah fitur Harga_2Hari_Lalu
    df['Harga_2Hari_Lalu'] = df['Harga_Kemarin'].shift(1)
    zero_data_log["Setelah Tambah Harga_2Hari_Lalu"] = (df == 0).sum().to_dict()

    # Drop NaN setelah penambahan fitur dan hitung 0
    df.dropna(inplace=True)
    zero_data_log["Setelah Drop NaN Kedua"] = (df == 0).sum().to_dict()



    # Kembalikan semua hasil dalam JSON
    return {
        "Kernel_Digunakan": kernel,
        "Degree": degree if kernel == "poly" else None,
        "Coef0": coef0 if kernel in ["poly", "sigmoid"] else None,
        "C": C,
        "Gamma": gamma,
        "Epsilon": epsilon,
        "Zero_Data_Log": zero_data_log,
        "Data_Asli": data_asli,
        "Hasil_Preprocessing": hasil_preprocessing,
        "Hasil_Normalisasi": hasil_normalisasi,
        "Hasil_Split_Data": hasil_split_data,
        "Hasil_Prediksi": hasil_prediksi,
        "Evaluasi_Model": {
            "MAE": mae,
            "RMSE": rmse,
            "MAPE": mape
        }
    }
