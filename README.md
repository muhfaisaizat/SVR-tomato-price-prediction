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
2. Instal dependensi Python:
   ```bash
   pip install -r requirements.txt
4. Buat database MySQL dengan nama predic.
5. Jalankan server FastAPI:
   ```bash
   uvicorn index:app --reload
7. Buka dokumentasi API Swagger:
   ```bash
   http://localhost:8000/docs

### 2. Menyiapkan Frontend (Vite + React)

1. Buka terminal baru dan pindah ke direktori frontend:
   ```bash
   cd frontend
3. Instal dependensi:
   ```bash
   npm install atau yarn install
5. Jalankan server frontend:
   ```bash
   npm run dev atau yarn dev
7. Akses antarmuka pengguna di:
   ```bash
   http://localhost:5173

### Akun Dummy (Jika Dibutuhkan)
```bash
Email    : admin@gmail.com  
Password : Admin123



