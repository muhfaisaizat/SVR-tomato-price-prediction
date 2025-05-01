import React, { useState, useEffect } from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from '@/components/ui/button'
import { Checkbox } from "@/components/ui/checkbox"
import axios from 'axios';
import { API_URL } from "../../../helpers/networt";
import { useToast } from '@/hooks/use-toast';

const Setting = () => {
    const { toast } = useToast();
    const getemail = localStorage.getItem("email");
    const idUser = localStorage.getItem("idUser");
    const [email, setEmail] = useState(getemail);
    const [password, setPassword] = useState("");
    const [selectedKernel, setSelectedKernel] = useState("");
    const [selectedKernelfalse, setSelectedKernelfalse] = useState("");
    const [nilaiC, setNilaiC] = useState("");
    const [epsilon, setEpsilon] = useState("");
    const [gamma, setGamma] = useState("");
    const [degree, setDegree] = useState("");
    const [coef0, setCoef0] = useState("");


    const fetchDataKernel = async () => {
        const token = localStorage.getItem("token");
        try {
          const response = await axios.get(`${API_URL}/setpredict/`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          console.log(response.data)
          if (response.data.length > 0) {
          setSelectedKernel(response.data[0].id)
          setSelectedKernelfalse(response.data[0].id)
          setNilaiC(response.data[0].nilai_c)
          setEpsilon(response.data[0].nilai_epsilon)
          setGamma(response.data[0].nilai_gamma)
          setDegree(response.data[0].nilai_degree)
          setCoef0(response.data[0].nilai_coef)
          }
        //   setDataHarga(response.data)
        } catch (error) {
          console.error("Error fetching data", error);
        }
      }

    useEffect(() => {
        fetchDataKernel();
      }, []);

    const handleCheckboxChange = (kernel) => {
        setSelectedKernel(kernel === selectedKernel ? "" : kernel);
    };


    const handleSaveData = async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await axios.put(
                `${API_URL}/auth/forgot-password`,
                {
                    email: email,
                    new_password: password
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );


            toast({
                description: "Pengaturan akun berhasil disimpan",
            });
        } catch (error) {
            // console.log(error.response.data.detail)
            toast({
                description: `${error.response.data.detail}`,
                variant: "destructive",
            });
        }
    }

    const handleSaveDataKernel = async () => {
        const token = localStorage.getItem("token");
        console.log(selectedKernelfalse)
        console.log(selectedKernel)
        try {

            const updateStatus = await axios.put(
                `${API_URL}/setpredict/update-status/${selectedKernelfalse}?status=false`,
                null,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const updateStatusnew = await axios.put(
                `${API_URL}/setpredict/update-status/${selectedKernel}?status=true`,
                null,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (selectedKernel === 1) {
                const linear = await axios.put(
                    `${API_URL}/setpredict/1?nilai_c=${nilaiC}&nilai_epsilon=${epsilon}`,
                    null,
                    {
                        headers: {
                            "Content-Type": "application/json",
                            Accept: "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
            } else if (selectedKernel ===2 ){
                const poly = await axios.put(
                    `${API_URL}/setpredict/2?nilai_c=${nilaiC}&nilai_gamma=${gamma}&nilai_epsilon=${epsilon}&nilai_degree=${degree}&nilai_coef=${coef0}`,
                    null,
                    {
                        headers: {
                            "Content-Type": "application/json",
                            Accept: "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
            } else if (selectedKernel ===3 ){
                const sigmoid = await axios.put(
                    `${API_URL}/setpredict/3?nilai_c=${nilaiC}&nilai_gamma=${gamma}&nilai_epsilon=${epsilon}&nilai_coef=${coef0}`,
                    null,
                    {
                        headers: {
                            "Content-Type": "application/json",
                            Accept: "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
            } else if (selectedKernel ===4 ){
                const rbf = await axios.put(
                    `${API_URL}/setpredict/4?nilai_c=${nilaiC}&nilai_gamma=${gamma}&nilai_epsilon=${epsilon}`,
                    null,
                    {
                        headers: {
                            "Content-Type": "application/json",
                            Accept: "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
            }

            toast({
                description: "Pengaturan model berhasil disimpan",
            });
            
           fetchDataKernel();

            
        } catch (error) {
            toast({
                description: `${error.response.data.detail}`,
                variant: "destructive",
            });
        }
    }
    return (
        <div className=" grid gap-[20px] mx-auto  sm:px-6 md:px-8  ">
            <div className='grid gap-[20px]'>
                <h1 className='text-[20px]'>Pengaturan akun</h1>
                <div className="flex flex-wrap -m-4">
                    <div className="xl:w-1/5 md:w-full w-full px-5 py-2">
                        <div className="grid w-full max-w-full items-center gap-1.5">
                            <Label htmlFor="email">Email</Label>
                            <Input readOnly type="email" id="email" value={email} placeholder="Email" />
                        </div>
                    </div>
                    <div className="xl:w-1/5 md:w-full w-full px-5 py-2">
                        <div className="grid w-full max-w-full items-center gap-1.5">
                            <Label htmlFor="password">Password</Label>
                            <Input type="password" id="password" placeholder="password" value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required />
                        </div>
                    </div>
                </div>
                <div>
                    <Button className="xl:w-[80px] md:w-full w-full px-5 py-2 bg-gradient-to-r from-[#402412a8] to-[#9a070790]" onClick={handleSaveData}>simpan</Button>
                </div>
            </div>
            <span className="block border-t-2 border-gray-200 w-full"></span>
            <div className='grid gap-[20px]'>
                <h1 className='text-[20px]'>Atur model peramalan</h1>
                <div className="flex flex-wrap -m-4">
                    <div className="xl:w-[30%] md:w-full w-full px-5 py-2">
                        <div className="grid w-full max-w-full items-center gap-3">
                            <Label >pilih kernel</Label>
                            <div className="flex flex-wrap gap-3 px-5">
                                <div className="flex items-center space-x-2 xl:w-1/4 md:w-full w-full ">
                                    <Checkbox
                                        id="linear"
                                        checked={selectedKernel === 1}
                                        onCheckedChange={() => handleCheckboxChange(1)}
                                    />
                                    <label
                                        htmlFor="linear"
                                        className="text-sm  leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                    >
                                        linear
                                    </label>
                                </div>
                                <div className="flex items-center space-x-2 xl:w-1/4 md:w-full w-full ">
                                    <Checkbox
                                        id="Polynomial"
                                        checked={selectedKernel === 2}
                                        onCheckedChange={() => handleCheckboxChange(2)}
                                    />
                                    <label
                                        htmlFor="Polynomial"
                                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                    >
                                        Polynomial
                                    </label>
                                </div>
                                <div className="flex items-center space-x-2 xl:w-1/4 md:w-full w-full ">
                                    <Checkbox
                                        id="sigmoid"
                                        checked={selectedKernel === 3}
                                        onCheckedChange={() => handleCheckboxChange(3)}
                                    />
                                    <label
                                        htmlFor="sigmoid"
                                        className="text-sm  leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                    >
                                        Sigmoid
                                    </label>
                                </div>
                                <div className="flex items-center space-x-2 xl:w-1/2 md:w-full w-full ">
                                    <Checkbox
                                        id="RBF"
                                        checked={selectedKernel === 4}
                                        onCheckedChange={() => handleCheckboxChange(4)}
                                    />
                                    <label
                                        htmlFor="RBF"
                                        className="text-sm  leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                    >
                                        Radial Basis Function (RBF)
                                    </label>
                                </div>

                            </div>
                        </div>
                    </div>
                    <div className="xl:w-[70%] md:w-full w-full px-5 py-2">
                        <div className="grid grid-cols-auto-fit md:grid-cols-2 xl:grid-cols-3 gap-4">
                            <div className="grid w-full  items-center gap-1.5">
                                <Label>Masukan nilai C</Label>
                                <Input 
                                type="text" 
                                placeholder="nilai C" 
                                value={nilaiC  ?? ""}
                                onChange={(e) => setNilaiC(e.target.value)}
                                disabled={
                                    selectedKernel !== 1 &&
                                    selectedKernel !== 2 &&
                                    selectedKernel !== 3 &&
                                    selectedKernel !== 4
                                }

                                />
                            </div>
                            <div className="grid w-full items-center gap-1.5">
                                <Label>Masukan nilai epsilon</Label>
                                <Input 
                                type="text" 
                                placeholder="nilai epsilon" 
                                value={epsilon  ?? ""}
                                onChange={(e) => setEpsilon(e.target.value)}
                                disabled={
                                    selectedKernel !== 1 &&
                                    selectedKernel !== 2 &&
                                    selectedKernel !== 3 &&
                                    selectedKernel !== 4
                                }
                                />
                            </div>
                            <div className="grid w-full  items-center gap-1.5">
                                <Label>Masukan nilai Gamma</Label>
                                <Input
                                    type="text"
                                    placeholder="nilai Gamma"
                                    value={gamma  ?? ""}
                                    onChange={(e) => setGamma(e.target.value)}
                                    disabled={
                                        selectedKernel !== 2 &&
                                        selectedKernel !== 3 &&
                                        selectedKernel !== 4
                                    }
                                />
                            </div>
                            <div className="grid w-full  items-center gap-1.5">
                                <Label>Masukan nilai degree</Label>
                                <Input 
                                type="text" 
                                placeholder="nilai degree" 
                                value={degree  ?? ""}
                                onChange={(e) => setDegree(e.target.value)}
                                disabled={selectedKernel !== 2} />
                            </div>
                            <div className="grid w-full  items-center gap-1.5">
                                <Label>Masukan nilai coef0</Label>
                                <Input
                                    type="text"
                                    placeholder="nilai coef0"
                                    value={coef0  ?? ""}
                                    onChange={(e) => setCoef0(e.target.value)}
                                    disabled={
                                        selectedKernel !== 2 && selectedKernel !== 3
                                    }
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <Button className="xl:w-[80px] md:w-full w-full px-5 py-2 bg-gradient-to-r from-[#402412a8] to-[#9a070790]" onClick={handleSaveDataKernel}>simpan</Button>
                </div>
            </div>

        </div>
    )
}

export default Setting
