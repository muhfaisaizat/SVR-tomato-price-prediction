import React,{useState, useEffect} from 'react'
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
    return (
        <div className=" grid gap-[20px] mx-auto  sm:px-6 md:px-8  ">
            <div className='grid gap-[20px]'>
                <h1 className='text-[20px]'>Pengaturan akun</h1>
                <div className="flex flex-wrap -m-4">
                    <div className="xl:w-1/5 md:w-full w-full px-5 py-2">
                        <div className="grid w-full max-w-full items-center gap-1.5">
                            <Label htmlFor="email">Email</Label>
                            <Input readOnly type="email" id="email" value={email} placeholder="Email"  />
                        </div>
                    </div>
                    <div className="xl:w-1/5 md:w-full w-full px-5 py-2">
                        <div className="grid w-full max-w-full items-center gap-1.5">
                            <Label htmlFor="password">Password</Label>
                            <Input type="password" id="password" placeholder="password" value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required/>
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
                                    <Checkbox id="linear" />
                                    <label
                                        htmlFor="linear"
                                        className="text-sm  leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                    >
                                        linear
                                    </label>
                                </div>
                                <div className="flex items-center space-x-2 xl:w-1/4 md:w-full w-full ">
                                    <Checkbox id="Polynomial" />
                                    <label
                                        htmlFor="Polynomial"
                                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                    >
                                        Polynomial
                                    </label>
                                </div>
                                <div className="flex items-center space-x-2 xl:w-1/4 md:w-full w-full ">
                                    <Checkbox id="sigmoid" />
                                    <label
                                        htmlFor="sigmoid"
                                        className="text-sm  leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                    >
                                        Sigmoid
                                    </label>
                                </div>
                                <div className="flex items-center space-x-2 xl:w-1/2 md:w-full w-full ">
                                    <Checkbox id="RBF" />
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
                                    <Input type="text" placeholder="nilai C" />
                                </div>
                                <div className="grid w-full items-center gap-1.5">
                                    <Label>Masukan nilai epsilon</Label>
                                    <Input type="text" placeholder="nilai epsilon" />
                                </div>
                                <div className="grid w-full  items-center gap-1.5">
                                    <Label>Masukan nilai Gamma</Label>
                                    <Input type="text" placeholder="nilai Gamma" />
                                </div>
                                <div className="grid w-full  items-center gap-1.5">
                                    <Label>Masukan nilai degree</Label>
                                    <Input type="text" placeholder="nilai degree" />
                                </div>
                                <div className="grid w-full  items-center gap-1.5">
                                    <Label>Masukan nilai coef0</Label>
                                    <Input type="text" placeholder="nilai coef0" />
                                </div>
                        </div>
                    </div>
                </div>
                <div>
                    <Button className="xl:w-[80px] md:w-full w-full px-5 py-2 bg-gradient-to-r from-[#402412a8] to-[#9a070790]">simpan</Button>
                </div>
            </div>

        </div>
    )
}

export default Setting
