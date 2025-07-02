# Aplikasi Prediksi Harga Tomat
link demo aplikasi : https://predictiontomat.onrender.com/

## Deskripsi  
Repositori ini adalah proyek web aplikasi prediksi harga tomat yang terdiri dari dua bagian utama:  
- **Backend**: Menggunakan FastAPI, memuat API dan logika prediksi menggunakan algoritma Support Vector Regression (SVR).  
- **Frontend**: Antarmuka pengguna berbasis ReactJS dan Vite untuk menampilkan hasil prediksi kepada pengguna.

## Struktur Proyek
├── backend/ # Folder untuk API FastAPI dan model prediksi
└── frontend/ # Folder untuk antarmuka pengguna (Vite + React)


## Prasyarat  
Pastikan sudah menginstal:
- [Python 3.10+](https://www.python.org/)
- [Node.js (versi LTS)](https://nodejs.org/)
- [MySQL](https://www.mysql.com/)
- [npm](https://www.npmjs.com/) atau [yarn](https://yarnpkg.com/)

## Petunjuk Penginstalan dan Menjalankan Proyek  

### 1. Menyiapkan Backend (FastAPI + SVR + MySQL)

1. Buka terminal dan pindah ke direktori backend:
   ```bash
   cd backend
2. Instal dependensi Python: pip install -r requirements.txt
3. Buat database MySQL dengan nama predic.
4. Jalankan server FastAPI: uvicorn index:app --reload
5. Buka dokumentasi API Swagger: http://localhost:8000/docs

### 2. Menyiapkan Frontend (Vite + React)

1. Buka terminal baru dan pindah ke direktori frontend: cd frontend
2. Instal dependensi: npm install atau yarn install
3. Jalankan server frontend: npm run dev atau yarn dev
4. Akses antarmuka pengguna di: http://localhost:5173

### Akun Dummy (Jika Dibutuhkan)
Email    : admin@gmail.com  
Password : Admin123



