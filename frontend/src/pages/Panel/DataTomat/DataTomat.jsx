import React, { useState, useEffect } from "react";
import { SearchNormal1, Trash } from "iconsax-react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import dayjs from "dayjs";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import TambahData from "./TambahData";
import InputFile from "./InputFile";
import { Button } from "@/components/ui/button";
import EditData from "./EditData";
import axios from 'axios';
import { API_URL } from "../../../helpers/networt";
import { useToast } from '@/hooks/use-toast';


const ITEMS_PER_PAGE = 10;

const DataTomat = () => {
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [dataHarga, setDataHarga] = useState([]);
  const [editData, setEditData] = useState(null);

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(`${API_URL}/prices/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // console.log(response.data)
      setDataHarga(response.data)
    } catch (error) {
      console.error("Error fetching data", error);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  // Filter data berdasarkan pencarian
  const filteredData = dataHarga.filter(
    (item) =>
      item.tanggal.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.pasar_bandung.toString().includes(searchTerm) ||
      item.pasar_ngunut.toString().includes(searchTerm) ||
      item.pasar_ngemplak.toString().includes(searchTerm)
  );

  // Hitung jumlah halaman berdasarkan data yang sudah difilter
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

  // Hitung data yang akan ditampilkan berdasarkan halaman
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentData = filteredData.slice(startIndex, endIndex);

  // Fungsi untuk menghapus data
  const handleDelete = async(id) => {
    // setDataHarga((prevData) => prevData.filter((item) => item.id !== id));
    const token = localStorage.getItem("token");
    try {
      const response = await axios.delete(`${API_URL}/prices/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchData();
      toast({
        description: `${response.data.message}`,
      });
      
    } catch (error) {
      toast({
        description: `${error.response.data.detail}`,
        variant: "destructive",
      });
    }
  };

  // Fungsi untuk menangani edit
  const handleEditClick = (item) => {
    setEditData(item); // Simpan data yang akan diedit
  };


  return (
    <div className="w-full px-4 md:px-8 py-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1 className="text-lg font-semibold">Data Harga Tomat</h1>
        <div className="flex gap-6 items-center">
          <TambahData fetchData={fetchData}/>
          <InputFile fetchData={fetchData}/>
          <div className="relative w-full md:w-[308px] h-[40px]">
            <SearchNormal1 className="absolute left-4 top-1/2 transform -translate-y-1/2" size={16} />
            <Input
              placeholder="Cari..."
              className="w-full h-full pl-[40px] text-[14px] font-medium"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl shadow-md w-full p-4">
        <ScrollArea className="w-full overflow-auto">
          <Table className="min-w-[700px] border">
            <TableHeader className="bg-gradient-to-r from-[#f2e3c94b] to-[#ffffff00]">
              <TableRow>
                <TableHead className="text-center font-bold text-black">Tanggal</TableHead>
                <TableHead className="text-center font-bold text-black">Pasar Bandung</TableHead>
                <TableHead className="text-center font-bold text-black">Pasar Ngunut</TableHead>
                <TableHead className="text-center font-bold text-black">Pasar Ngemplak</TableHead>
                <TableHead className="text-center font-bold text-black">Rata-Rata Kemarin</TableHead>
                <TableHead className="text-center font-bold text-black">Rata-Rata Sekarang</TableHead>
                <TableHead className="text-center font-bold text-black">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white">
              {currentData.length > 0 ? (
                currentData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-center">{item.tanggal}</TableCell>
                    <TableCell className="text-center">Rp.{item.pasar_bandung}</TableCell>
                    <TableCell className="text-center">Rp.{item.pasar_ngunut}</TableCell>
                    <TableCell className="text-center">Rp.{item.pasar_ngemplak}</TableCell>
                    <TableCell className="text-center">Rp.{item.ratarata_kemarin ?? "-"}</TableCell>
                    <TableCell className="text-center">Rp.{item.ratarata_sekarang ?? "-"}</TableCell>
                    <TableCell className="text-center flex justify-center gap-2">
                      <EditData data={editData} item={item} handleEditClick={handleEditClick} fetchData={fetchData}/>
                      <Button variant="destructive" size="icon" onClick={() => handleDelete(item.id)}>
                        <Trash size={18} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-gray-500 py-4">
                    Tidak ada data ditemukan
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="mt-4 flex justify-between w-full">
            <h3 className="w-full">Menampilkan {filteredData.length} data</h3>
            <Pagination className="flex justify-end">
              <PaginationContent>
              
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  />
                </PaginationItem>

               
                {(() => {
                  let startPage = Math.max(1, currentPage - 1);
                  let endPage = Math.min(totalPages, currentPage + 1);

                  
                  if (currentPage === 1) {
                    endPage = Math.min(3, totalPages);
                  }

                  
                  if (currentPage === totalPages) {
                    startPage = Math.max(1, totalPages - 2);
                  }

                  return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map(
                    (page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          isActive={currentPage === page}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  );
                })()}

               
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>

          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>


    </div>
  );
};

export default DataTomat;
