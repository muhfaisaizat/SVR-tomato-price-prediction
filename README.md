# Tomato Price Prediction Application  
Live Demo: https://predictiontomat.onrender.com/

## Description  
This repository is a web-based application for predicting tomato prices, consisting of two main parts:  
- **Backend**: Built with FastAPI, containing APIs and prediction logic using the Support Vector Regression (SVR) algorithm.  
- **Frontend**: A user interface built with ReactJS and Vite to display prediction results to users.

## Project Structure
├── backend/ # Folder for FastAPI backend and prediction model
└── frontend/ # Folder for frontend interface (Vite + React)

## Prerequisites  
Make sure you have installed:
- [Python 3.10+](https://www.python.org/)
- [Node.js (LTS version)](https://nodejs.org/)
- [MySQL](https://www.mysql.com/)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

## Installation and Running Guide  

### Backend Setup (FastAPI + SVR + MySQL)
1. Open terminal and navigate to the backend directory:  
   `cd backend`

2. Install Python dependencies:  
   `pip install -r requirements.txt`

3. Create a MySQL database named `predic`.

4. Run the FastAPI server:  
   `uvicorn index:app --reload`

5. Open Swagger API documentation in your browser:  
   `http://localhost:8000/docs`

### Frontend Setup (Vite + React)
1. Open a new terminal and navigate to the frontend directory:  
   `cd frontend`

2. Install dependencies:  
   `npm install` or `yarn install`

3. Run the frontend development server:  
   `npm run dev` or `yarn dev`

4. The application will be available at:  
   `http://localhost:5173`

### Dummy Account 
```bash
Email    : admin@gmail.com  
Password : Admin123



