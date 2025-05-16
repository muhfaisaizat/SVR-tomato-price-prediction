from fastapi import FastAPI
from fastapi.openapi.models import OAuthFlows as OAuthFlowsModel, SecurityScheme
from fastapi.openapi.utils import get_openapi
from fastapi.security import OAuth2PasswordBearer
from routes.index import api_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

@app.get("/")
def root():
    return {"message": "FastAPI is running on Vercel!"}

# Konfigurasi Swagger agar hanya meminta token (tanpa login ulang)
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title="API Prediction",
        version="1.0.0",
        description="API for Tomato Price Prediction",
        routes=app.routes,
    )
    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
        }
    }
    for path in openapi_schema["paths"].values():
        for method in path.values():
            method["security"] = [{"BearerAuth": []}]
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi  # Pakai custom OpenAPI

app.include_router(api_router)


# Middleware untuk CORS (Opsional, jika API digunakan oleh frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Ganti dengan domain frontend jika perlu
    # allow_origins=["https://svr-tomato-price-prediction-frontend.vercel.app"],  # Ganti dengan domain frontend jika perlu
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
