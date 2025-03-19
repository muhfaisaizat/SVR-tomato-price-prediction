"use client";

import React, { useState } from "react";
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
import { Calendar } from "@/components/ui/calendar";
import { FiCalendar } from "react-icons/fi";
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { API_URL } from "../../../helpers/networt";

const TambahData = ({fetchData}) => {
  const [open, setOpen] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split("T")[0],
    pasarBandung: "",
    pasarNgunut: "",
    pasarNgemplak: "",
    rataKemarin: "",
    rataSekarang: "",
  });

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleDateSelect = (date) => {
    const formattedDate = date.toLocaleDateString("fr-CA");
    setFormData((prev) => ({ ...prev, tanggal: formattedDate }));
    setShowCalendar(false);
  };

  const handleSaveData = async () => {
    const isEmpty = Object.values(formData).some((value) => value.trim() === "");

    if (isEmpty) {
      toast({
        description: "Semua kolom harus diisi sebelum menyimpan.",
        variant: "destructive",
      });
      return;
    }


    try {

      const token = localStorage.getItem("token");


      const response = await axios.post(
        `${API_URL}/prices/`,
        {
          tanggal: formData.tanggal,
          pasar_bandung: Number(formData.pasarBandung),
          pasar_ngunut: Number(formData.pasarNgunut),
          pasar_ngemplak: Number(formData.pasarNgemplak),
          ratarata_kemarin: Number(formData.rataKemarin),
          ratarata_sekarang: Number(formData.rataSekarang),
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
        description: "Data berhasil disimpan",
      });
      setFormData({
        tanggal: new Date().toISOString().split("T")[0],
        pasarBandung: "",
        pasarNgunut: "",
        pasarNgemplak: "",
        rataKemarin: "",
        rataSekarang: "",
      });
      fetchData();
      setOpen(false);
      
    } catch (error) {
      // console.log(error.response.data.detail)
      toast({
        description: `${error.response.data.detail}`,
        variant: "destructive",
      });
      setFormData({
        tanggal: new Date().toISOString().split("T")[0],
        pasarBandung: "",
        pasarNgunut: "",
        pasarNgemplak: "",
        rataKemarin: "",
        rataSekarang: "",
      });
      setOpen(false);
    }



  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Tambah Data</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tambah Data Harga Tomat</DialogTitle>
          <DialogDescription>Isi semua kolom lalu klik simpan.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4 relative">
            <Label htmlFor="tanggal" className="text-right">
              Tanggal
            </Label>
            <div className="relative col-span-3">
              <Input
                type="text"
                id="tanggal"
                value={formData.tanggal}
                onChange={handleInputChange}
                readOnly
                className="pr-10"
              />
              <FiCalendar
                className="absolute right-3 top-1 text-gray-500 cursor-pointer"
                size={20}
                onClick={() => setShowCalendar(!showCalendar)}
              />
              {showCalendar && (
                <div className="absolute z-10 bg-white border rounded-lg shadow-lg">
                  <Calendar mode="single" selected={new Date(formData.tanggal)} onSelect={handleDateSelect} />
                </div>
              )}
            </div>
          </div>

          {[
            { id: "pasarBandung", label: "Pasar Bandung" },
            { id: "pasarNgunut", label: "Pasar Ngunut" },
            { id: "pasarNgemplak", label: "Pasar Ngemplak" },
            { id: "rataKemarin", label: "Rata-Rata Kemarin" },
            { id: "rataSekarang", label: "Rata-Rata Sekarang" },
          ].map(({ id, label }) => (
            <div key={id} className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor={id} className="text-right">
                {label}
              </Label>
              <Input id={id} value={formData[id]} onChange={handleInputChange} className="col-span-3" />
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Batal
          </Button>
          <Button type="button" onClick={handleSaveData}>
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TambahData;
