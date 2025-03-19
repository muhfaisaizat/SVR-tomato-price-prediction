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
import axios from "axios";
import { API_URL } from "../../../helpers/networt";
import { useToast } from "@/hooks/use-toast";

const InputFile = ({fetchData}) => {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState(null); 
  const { toast } = useToast();

  // 🔹 Menyimpan file yang dipilih ke state
  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  // 🔹 Mengupload file ke API
  const handleFileUpload = async () => {
    if (!file) {
      toast({
        description: "Pilih file terlebih dahulu!",
        variant: "destructive",
      });
      return;
    }

    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("file", file); 

    try {
      const response = await axios.post(`${API_URL}/prices/upload-file/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`, 
        },
      });

      fetchData()

      toast({
        description: "Data berhasil diupload",
      });
      setOpen(false);
    } catch (error) {
      console.error("Upload gagal:", error);
      toast({
        description: error.response?.data?.detail || "Terjadi kesalahan saat upload",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Upload File</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tambah Data Harga Tomat Dengan File</DialogTitle>
          <DialogDescription>Masukkan file CSV</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Input file */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="file">File CSV</Label>
            <Input id="file" type="file" className="col-span-3" onChange={handleFileChange} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Batal
          </Button>
          <Button type="submit" onClick={handleFileUpload}>
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InputFile;
