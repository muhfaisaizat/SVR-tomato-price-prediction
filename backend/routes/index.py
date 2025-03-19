from fastapi import APIRouter
from routes.user import user_router
from routes.priceTomat import priceTomat_router
from routes.testingModel import testingModel_router
from routes.settingPredict import settingPredict_router
from routes.predictTomat import predict_router
from routes.resultPredict import resultPredict_router
from routes.auth import auth_router
from routes.riwayatPengujian import riwayat_router

api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(user_router)
api_router.include_router(priceTomat_router)
api_router.include_router(testingModel_router)
api_router.include_router(settingPredict_router)
api_router.include_router(predict_router)
api_router.include_router(resultPredict_router)
api_router.include_router(riwayat_router)

