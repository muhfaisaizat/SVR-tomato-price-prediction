"use client";

import React, { useState, useEffect } from "react";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SearchNormal1, Edit, Trash } from "iconsax-react";
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { API_URL } from "../../../helpers/networt";

const EditData = ({ data, handleEditClick, item, fetchData }) => {
  const { toast } = useToast();
   const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
      id:"",
      tanggal: "",
      pasarBandung: "",
      pasarNgunut: "",
      pasarNgemplak: "",
      rataKemarin: "",
      rataSekarang: "",
    });
  
    // Update state saat menerima data baru
    useEffect(() => {
      if (data) {
        setFormData({
          id: data.id,
          tanggal: data.tanggal || "",
          pasarBandung: data.pasar_bandung || "",
          pasarNgunut: data.pasar_ngunut || "",
          pasarNgemplak: data.pasar_ngemplak || "",
          rataKemarin: data.ratarata_kemarin || "",
          rataSekarang: data.ratarata_sekarang || "",
        });
      }
    }, [data]);


    const handleChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    };
  
    const handleEditData = async () => {
      const token = localStorage.getItem("token");
  
      try {
        const response = await axios.put(
          `${API_URL}/prices/${formData.id}`, // Gunakan id dalam URL
          {
            tanggal: formData.tanggal,
            pasar_bandung: parseFloat(formData.pasarBandung),
            pasar_ngunut: parseFloat(formData.pasarNgunut),
            pasar_ngemplak: parseFloat(formData.pasarNgemplak),
            ratarata_kemarin: parseFloat(formData.rataKemarin),
            ratarata_sekarang: parseFloat(formData.rataSekarang),
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        fetchData();
  
        toast({
          description: "Data berhasil diperbarui",
        });
        setOpen(false);
      } catch (error) {
        console.log(error)
        toast({
          description: error.response?.data?.detail || "Terjadi kesalahan",
          variant: "destructive",
        });
        setOpen(false);
      }
    };
  
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" onClick={() => handleEditClick(item)}>
            <Edit size={18} />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Data Harga Tomat</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tanggal" className="text-right">
                Tanggal
              </Label>
              <Input id="tanggal" name="tanggal" value={formData.tanggal} readOnly className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="pasarBandung" className="text-right">
                Pasar Bandung
              </Label>
              <Input id="pasarBandung" name="pasarBandung" value={formData.pasarBandung} onChange={handleChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="pasarNgunut" className="text-right">
                Pasar Ngunut
              </Label>
              <Input id="pasarNgunut" name="pasarNgunut" value={formData.pasarNgunut} onChange={handleChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="pasarNgemplak" className="text-right">
                Pasar Ngemplak
              </Label>
              <Input id="pasarNgemplak" name="pasarNgemplak" value={formData.pasarNgemplak} onChange={handleChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="rataKemarin" className="text-right">
                Rata-Rata Kemarin
              </Label>
              <Input id="rataKemarin" name="rataKemarin" value={formData.rataKemarin} onChange={handleChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="rataSekarang" className="text-right">
                Rata-Rata Sekarang
              </Label>
              <Input id="rataSekarang" name="rataSekarang" value={formData.rataSekarang} onChange={handleChange} className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleEditData}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };
  
  export default EditData;
  
  
