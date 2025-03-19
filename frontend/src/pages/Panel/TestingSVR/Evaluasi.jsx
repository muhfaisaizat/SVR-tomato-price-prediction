import React, { useEffect, useCallback } from 'react'; 
import axios from 'axios';
import { API_URL } from "../../../helpers/networt";

const Evaluasi = ({ result }) => {
  
  const handleSaveData = useCallback(async () => {
    if (!result) return;

    // Mapping Kernel ke ID
    const kernelMapping = {
      linear: 1,
      sigmoid: 3,
      poly: 2,
      rbf: 4
    };
    
    const id_kernel = kernelMapping[result.Kernel_Digunakan];
    if (!id_kernel) {
      console.error("Kernel tidak ditemukan:", result.Kernel_Digunakan);
      return;
    }

    // Pastikan evaluasi model memiliki nilai yang valid
    if (!result.Evaluasi_Model || !result.Evaluasi_Model.MAE || !result.Evaluasi_Model.RMSE || !result.Evaluasi_Model.MAPE) {
      console.warn("Evaluasi model tidak lengkap, tidak menyimpan data.");
      return;
    }


    // Menyesuaikan format hiperparameter
    let infoHyperparameter = `C=${result.C}, epsilon=${result.Epsilon}`;
    if (result.Kernel_Digunakan === 'rbf' || result.Kernel_Digunakan === 'sigmoid') {
      infoHyperparameter += `, gamma=${result.Gamma}`;
    } else if (result.Kernel_Digunakan === 'poly') {
      infoHyperparameter += `, gamma=${result.Gamma}, degree=${result.Degree}, coef0=${result.Coef0}`;
    }

  }, [result]);

  useEffect(() => {
    if (result) {
      console.log("Kernel:", result.Kernel_Digunakan);
      handleSaveData();
    }
  }, [result, handleSaveData]);

  if (!result) return null;

  // Menyesuaikan tampilan hiperparameter
  let hyperparameters = `C=${result.C}, epsilon=${result.Epsilon}`;
  if (result.Kernel_Digunakan === 'rbf' || result.Kernel_Digunakan === 'sigmoid') {
    hyperparameters += `, gamma=${result.Gamma}`;
  } else if (result.Kernel_Digunakan === 'poly') {
    hyperparameters += `, gamma=${result.Gamma}, degree=${result.Degree}, coef0=${result.Coef0}`;
  }

  return (
    <div className='w-full grid-cols-1 lg:grid-cols-2'>
      <div className='bg-white w-full rounded-[16px] p-6 grid gap-6'>
        <div className='text-[14] font-semibold'>
          <h1>Evaluasi Model</h1>
        </div>
        <div className='flex items-center'>
          <div className='text-[12] grid gap-3 px-2'>
            <p>Nama Kernel</p>
            <p>Nilai Hiperparameter</p>
            <p>Nilai MAE (Mean Absolute Error)</p>
            <p>Nilai RMSE (Root Mean Squared Error)</p>
            <p>Nilai MAPE (Mean Absolute Percentage Error)</p>
          </div>
          <div className='text-[12] grid gap-3 px-2'>
            <p>: {result.Kernel_Digunakan}</p>
            <p>: {hyperparameters}</p>
            <p>: {result.Evaluasi_Model?.MAE}</p>
            <p>: {result.Evaluasi_Model?.RMSE}</p>
            <p>: {result.Evaluasi_Model?.MAPE.toFixed(2)}%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Evaluasi;
