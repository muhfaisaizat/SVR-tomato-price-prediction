import React, { useState, useEffect } from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from '@/components/ui/button'
import { Checkbox } from "@/components/ui/checkbox"
import axios from 'axios';
import { API_URL } from "../../../helpers/networt";
import { useToast } from '@/hooks/use-toast';

const Setting = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingGrafik, setIsLoadingGrafik] = useState(false);
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
    const [isChecked, setIsChecked] = useState(false);
    const [isCheckedRBF, setIsCheckedRBF] = useState(false);
    const [isCheckedSigmoid, setIsCheckedSigmoid] = useState(false);
    const [isCheckedPoly, setIsCheckedPoly] = useState(false);
    const [kernelData, setKernelData] = useState([]);

    const handleCheckboxChangeall = (id) => {
        setKernelData(prev =>
            prev.map(item =>
                item.id === id ? { ...item, statuskedepan: !item.statuskedepan } : item
            )
        );
    }


    const handleInputChange = (id, field, value) => {
        const updatedData = kernelData.map((kernel) =>
            kernel.id === id ? { ...kernel, [field]: value } : kernel
        );
        setKernelData(updatedData);
    };




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

    const fetchDataKernelkedepan = async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await axios.get(`${API_URL}/setpredict/all`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log(response.data)
            setKernelData(response.data)

        } catch (error) {
            console.error("Error fetching data", error);
        }
    }

    useEffect(() => {
        fetchDataKernel();
        fetchDataKernelkedepan();
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
        setIsLoading(true);
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
            } else if (selectedKernel === 2) {
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
            } else if (selectedKernel === 3) {
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
            } else if (selectedKernel === 4) {
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

            const hasil = await axios.get(
                `${API_URL}/predict/price`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            toast({
                description: "Pengaturan model berhasil disimpan",
            });

            fetchDataKernel();


        } catch (error) {
            toast({
                description: `${error.response.data.detail}`,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }


    const handleSaveDataKernelGrafik = async () => {
        setIsLoadingGrafik(true);
        const token = localStorage.getItem("token");

        try {
            for (const kernel of kernelData) {
                

                const {
                    id,
                    nilai_c,
                    nilai_epsilon,
                    nilai_gamma,
                    nilai_coef,
                    nilai_degree,
                    statuskedepan
                } = kernel;

                let params = new URLSearchParams();
                if (nilai_c) params.append("nilai_c", nilai_c);
                if (nilai_epsilon) params.append("nilai_epsilon", nilai_epsilon);
                if (nilai_gamma) params.append("nilai_gamma", nilai_gamma);
                if (nilai_coef) params.append("nilai_coef", nilai_coef);
                if (nilai_degree) params.append("nilai_degree", nilai_degree);

                await axios.put(`${API_URL}/setpredict/${id}?${params.toString()}`, null, {
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });

                

                await axios.put(`${API_URL}/setpredict/update-status-kedepan/${id}?statuskedepan=${statuskedepan}`,null, {
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });
            }

            toast({
                description: "Data kernel berhasil disimpan",
                variant: "success",
            });
        } catch (error) {
            toast({
                description: `${error.response?.data?.detail || "Gagal menyimpan data"}`,
                variant: "destructive",
            });
        } finally {
            setIsLoadingGrafik(false);
            fetchDataKernelkedepan();
        }
    };

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
            <div className='grid gap-[20px] mb-10'>
                <h1 className='text-[20px]'>Atur model prediksi history</h1>
                <div className="flex flex-wrap -m-4">
                    <div className="xl:w-[30%] md:w-full w-full px-5 py-2">
                        <div className="grid w-full max-w-full items-center gap-3">
                            <Label >pilih kernel untuk menghasilkan prediksi historynya</Label>
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
                                    value={nilaiC ?? ""}
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
                                    value={epsilon ?? ""}
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
                                    value={gamma ?? ""}
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
                                    value={degree ?? ""}
                                    onChange={(e) => setDegree(e.target.value)}
                                    disabled={selectedKernel !== 2} />
                            </div>
                            <div className="grid w-full  items-center gap-1.5">
                                <Label>Masukan nilai coef0</Label>
                                <Input
                                    type="text"
                                    placeholder="nilai coef0"
                                    value={coef0 ?? ""}
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
                    <Button className="xl:w-[80px] md:w-full w-full px-5 py-2 bg-gradient-to-r from-[#402412a8] to-[#9a070790]" onClick={handleSaveDataKernel} disabled={isLoading}> {isLoading ? "Diproses..." : "Simpan"}</Button>
                </div>
                <span className="block border-t-2 border-gray-200 w-full"></span>
                <h1 className='text-[20px]'>Atur kernel untuk grafik prediksi kedepan</h1>
                {kernelData.map((kernel) => (
                    <div key={kernel.id} className="grid gap-[20px]">
                        <h1 className="text-[14px] capitalize">Kernel {kernel.nama_kernel}</h1>
                        <div className="flex flex-wrap -m-4 px-5 items-center">
                            <div className="flex items-center gap-4 xl:w-1/12 md:w-full w-full justify-end md:justify-start">
                                <Checkbox
                                    id={`${kernel.nama_kernel}Status`}
                                    checked={kernel.statuskedepan}
                                    onCheckedChange={() => handleCheckboxChangeall(kernel.id)}
                                />
                                <label
                                    htmlFor={`${kernel.nama_kernel}Status`}
                                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                >
                                    {kernel.statuskedepan ? "Sudah Aktif" : "Belum Aktif"}
                                </label>
                            </div>

                            {/* Input Nilai C */}
                            <div className="xl:w-1/6 md:w-full w-full px-5 py-2">
                                <Label>Masukan Nilai C</Label>
                                <Input type="text" value={kernel.nilai_c || ""} onChange={(e) => handleInputChange(kernel.id, "nilai_c", e.target.value)} disabled={!kernel.statuskedepan} />
                            </div>

                            {/* Input Nilai Epsilon */}
                            <div className="xl:w-1/6 md:w-full w-full px-5 py-2">
                                <Label>Masukan Nilai Epsilon</Label>
                                <Input type="text" value={kernel.nilai_epsilon || ""} onChange={(e) => handleInputChange(kernel.id, "nilai_epsilon", e.target.value)} disabled={!kernel.statuskedepan} />
                            </div>

                            {/* Input Nilai Gamma */}
                            {kernel.nilai_gamma !== null && (
                                <div className="xl:w-1/6 md:w-full w-full px-5 py-2">
                                    <Label>Masukan Nilai Gamma</Label>
                                    <Input type="text" value={kernel.nilai_gamma || ""} onChange={(e) => handleInputChange(kernel.id, "nilai_gamma", e.target.value)} disabled={!kernel.statuskedepan} />
                                </div>
                            )}

                            {/* Input Nilai Coef */}
                            {kernel.nilai_coef !== null && (
                                <div className="xl:w-1/6 md:w-full w-full px-5 py-2">
                                    <Label>Masukan Nilai Coef()</Label>
                                    <Input type="text" value={kernel.nilai_coef || ""} onChange={(e) => handleInputChange(kernel.id, "nilai_coef", e.target.value)} disabled={!kernel.statuskedepan} />
                                </div>
                            )}

                            {/* Input Nilai Degree */}
                            {kernel.nilai_degree !== null && (
                                <div className="xl:w-1/6 md:w-full w-full px-5 py-2">
                                    <Label>Masukan Nilai Degree</Label>
                                    <Input type="text" value={kernel.nilai_degree || ""} onChange={(e) => handleInputChange(kernel.id, "nilai_degree", e.target.value)} disabled={!kernel.statuskedepan} />
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                <Button className="xl:w-[80px] md:w-full w-full px-5 py-2 bg-gradient-to-r from-[#402412a8] to-[#9a070790]" onClick={handleSaveDataKernelGrafik} disabled={isLoadingGrafik}> {isLoadingGrafik ? "Diproses..." : "Simpan"}</Button>


            </div>

        </div>
    )
}

export default Setting
