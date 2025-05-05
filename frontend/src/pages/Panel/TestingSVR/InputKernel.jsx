import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from '@/components/ui/button';
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import axios from 'axios';
import { API_URL } from "../../../helpers/networt";

const InputKernel = ({ setShowProses, dataHarga, result, setResult }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [selectedKernel, setSelectedKernel] = useState("");
    const [params, setParams] = useState({ C: "0", epsilon: "0", gamma: "0", degree: "0", coef0: "0" });
    

    const handleCheckboxChange = (kernel) => {
        setSelectedKernel(kernel);
    };

    const handleChange = (e) => {
        setParams({ ...params, [e.target.name]: e.target.value });
    };

    const handleProses = async () => {
        setIsLoading(true);
        setShowProses(false);
        const token = localStorage.getItem("token");
        try {
            const response = await axios.get(`${API_URL}/testing/predict`, {
                params: {
                    kernel: selectedKernel,
                    C: params.C,
                    epsilon: params.epsilon,
                    gamma: params.gamma,
                    degree: params.degree,
                    coef0: params.coef0,
                },
                headers: {
                    'accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log(response.data)
            setResult(response.data);
            setIsLoading(false);
            setShowProses(true);

            if (response.data) {
                const kernelMapping = {
                    linear: 1,
                    sigmoid: 3,
                    poly: 2,
                    rbf: 4
                };
                
                const id_kernel = kernelMapping[selectedKernel];
                if (!id_kernel) {
                    console.error("Kernel tidak ditemukan:", selectedKernel);
                    return;
                }

                const tanggalSekarang = new Date().toISOString().split('T')[0];

                let infoHyperparameter = `C=${params.C}, epsilon=${params.epsilon}`;
                if (selectedKernel === 'rbf' ) {
                    infoHyperparameter += `, gamma=${params.gamma}`;
                } else if (selectedKernel === 'sigmoid') {
                    infoHyperparameter += `, gamma=${params.gamma}, coef()=${params.coef0}`;
                } else if (selectedKernel === 'poly') {
                    infoHyperparameter += `, gamma=${params.gamma}, degree=${params.degree}, coef0=${params.coef0}`;
                }

                const postData = {
                    id_kernel,
                    tanggal: tanggalSekarang,
                    infoHyperparameter,
                    MAE: response.data.Evaluasi_Model?.MAE.toString(),
                    RMSE: response.data.Evaluasi_Model?.RMSE.toString(),
                    MAPE: (response.data.Evaluasi_Model?.MAPE * 100).toFixed(2).toString()
                };

                try {
                    await axios.post(`${API_URL}/riwayat/`, postData, {
                        headers: { 
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                        }
                    });
                    console.log("Data berhasil disimpan ke riwayat");
                } catch (error) {
                    console.error("Error menyimpan data ke riwayat:", error.response ? error.response.data : error.message);
                }
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            setIsLoading(false);
        } 
    };

    return (
        <div className='grid gap-[20px]'>
            <h1 className='text-[20px]'>Uji model peramalan</h1>
            <div className="flex flex-wrap -m-4">
                <div className="xl:w-[30%] md:w-full w-full px-5 py-2">
                    <div className="grid w-full max-w-full items-center gap-3">
                        <Label>Pilih Kernel</Label>
                        <div className="flex flex-wrap gap-3 px-5">
                            {["linear", "poly", "sigmoid", "rbf"].map((kernel) => (
                                <div key={kernel} className="flex items-center space-x-2 xl:w-1/4 md:w-full w-full">
                                    <Checkbox 
                                        id={kernel} 
                                        checked={selectedKernel === kernel} 
                                        onCheckedChange={() => handleCheckboxChange(kernel)}
                                    />
                                    <label htmlFor={kernel} className="text-sm cursor-pointer">
                                        {kernel.toUpperCase()}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="xl:w-[70%] md:w-full w-full px-5 py-2">
                    <div className="grid grid-cols-auto-fit md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {Object.keys(params).map((key) => (
                            <div key={key} className="grid w-full items-center gap-1.5">
                                <Label>Masukan nilai {key}</Label>
                                <Input 
                                    type="text" 
                                    placeholder={`nilai ${key}`} 
                                    name={key}
                                    value={params[key]} 
                                    onChange={handleChange} 
                                    style={{
                                        color: params[key] === 0 || params[key] === "0" ? "gray" : "black"
                                      }}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className='flex justify-center p-3'>
                <Button
                    className="xl:w-auto md:w-full text-[14px] bg-gradient-to-r from-[#402412a8] to-[#9a070790]"
                    onClick={handleProses}
                    disabled={isLoading || dataHarga.length === 0}
                >
                    {isLoading ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
                    {isLoading ? 'Memproses...' : 'Proses'}
                </Button>
            </div>
           
        </div>
    );
};

export default InputKernel;
