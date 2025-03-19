import React,{useState, useEffect} from 'react';
import { PresentionChart, Information, InfoCircle, } from 'iconsax-react';
import axios from 'axios';
import { API_URL } from "../../../helpers/networt";



const Cards = () => {
const [dataHarga, setDataHarga] = useState([]);
const [dataInfo, setDataInfo] = useState([]);
const fetchData = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(`${API_URL}/prices/count`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    //   console.log(response.data)
      setDataHarga(response.data)
    } catch (error) {
      console.error("Error fetching data", error);
    }
  }

const fetchDatainfokernel = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(`${API_URL}/setpredict/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    //   console.log(response.data)
      setDataInfo(response.data)
    } catch (error) {
      console.error("Error fetching data", error);
    }
  }

  useEffect(() => {
    fetchData();
    fetchDatainfokernel();
  }, []);

  const getHyperparameterText = (item) => {
    const hyperparameters = [];

    if (item.nilai_c) hyperparameters.push(`C=${item.nilai_c}`);
    if (item.nilai_gamma) hyperparameters.push(`Gamma=${item.nilai_gamma}`);
    if (item.nilai_epsilon) hyperparameters.push(`Epsilon=${item.nilai_epsilon}`);
    if (item.nilai_degree) hyperparameters.push(`Degree=${item.nilai_degree}`);
    if (item.nilai_coef) hyperparameters.push(`Coef=${item.nilai_coef}`);

    return hyperparameters.join(", ");
  };


    return (
        <div className=" mx-auto">
            <div className="flex flex-wrap -m-4">

                <div className="lg:w-1/3 md:w-1/2 p-4 w-full">
                    <div className=' border-2  bg-gradient-to-r from-[#f2e3c94b] to-[#ffffff00] rounded-[8px] grid gap-[8px] p-[24px] h-full'>
                        <div className='flex justify-between'>
                            <h1 className='text-[14px] font-semibold'>Total Data Tomat</h1>
                            <PresentionChart size="16" color="#3A7D44" />
                        </div>
                        <div className='grid gap-[4px]'>
                            <p className='text-[24px] font-semibold'> {dataHarga.total_data}</p>

                        </div>
                    </div>
                </div>
                <div className="lg:w-1/3 md:w-1/2 p-4 w-full">
                    <div className=' border-2 bg-gradient-to-r from-[#f2e3c94b] to-[#ffffff00] rounded-[8px] grid gap-[8px] p-[24px] h-full'>
                        <div className='flex justify-between'>
                            <h1 className='text-[14px] font-semibold'>Informasi Kernel SVR</h1>
                            <Information size="16" color="#261FB3" />
                        </div>
                        {dataInfo.map((item) => (

                        <div className='flex items-center'>
                            <div className='text-[12] grid gap-3 px-2'>
                                <p>Nama Kernel</p>
                                <p>Nilai Hyperparameter</p>
                            </div>
                            <div className='text-[12] grid gap-3 px-2'>
                            <p>: {item.nama_kernel}</p>
                            <p>: {getHyperparameterText(item)}</p>
                            </div>
                        </div>
                          ))}
                    </div>
                </div>
                <div className="lg:w-1/3 md:w-1/2 p-4 w-full">
                    <div className=' border-2  bg-gradient-to-r from-[#f2e3c94b] to-[#ffffff00] rounded-[8px] grid gap-[8px] p-[24px] h-full'>
                        <div className='flex justify-between'>
                            <h1 className='text-[14px] font-semibold'>Tentang Predict Tomat</h1>
                            <InfoCircle size="16" color="#FFB22C" />
                        </div>
                        <div className='grid gap-[4px]'>
                            <p className='text-[10px]'>Sebuah sistem yang membantu konsumen dan petani untuk memprediksi harga tomat di Tulungagung. Dengan menggunakan metode Support Vector Regression (SVR), aplikasi ini menganalisis data harga sebelumnya untuk memberikan perkiraan harga di masa depan.</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Cards;