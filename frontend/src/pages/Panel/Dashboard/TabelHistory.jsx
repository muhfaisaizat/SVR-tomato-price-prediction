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
import { Button } from "@/components/ui/button";
import axios from 'axios';
import { API_URL } from "../../../helpers/networt";
import { useToast } from '@/hooks/use-toast';



const ITEMS_PER_PAGE = 8;

const TabelHistory = () => {
  const { toast } = useToast();
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(`${API_URL}/riwayat/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // console.log(response.data)
      setData(response.data)
    } catch (error) {
      console.error("Error fetching data", error);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);



  

  // Filter data berdasarkan pencarian
  const filteredData = data.filter(
    (item) =>
      item.tanggal.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nama_kernel.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Hitung jumlah halaman berdasarkan data yang sudah difilter
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

  // Hitung data yang akan ditampilkan berdasarkan halaman
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentData = filteredData.slice(startIndex, endIndex);


  const handleDelete = async(id) => {
    // setDataHarga((prevData) => prevData.filter((item) => item.id !== id));
    const token = localStorage.getItem("token");
    try {
      const response = await axios.delete(`${API_URL}/riwayat/${id}`, {
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

  return (
    <div className="w-full py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1 className="text-lg font-semibold">Riwayat Pengujian SVR</h1>
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

      {/* Table Container */}
      <div className="bg-white rounded-xl shadow-md w-full p-4">
        <ScrollArea className="w-full overflow-auto">
          <Table className="min-w-[700px] border">
            <TableHeader className="bg-gradient-to-r from-[#f2e3c94b] to-[#ffffff00]">
              <TableRow>
                <TableHead className="text-center font-bold text-black">Tanggal</TableHead>
                <TableHead className="text-center font-bold text-black">Nama Kernel</TableHead>
                <TableHead className="text-center font-bold text-black">Nilai Hyperparameter</TableHead>
                <TableHead className="text-center font-bold text-black">Nilai MAE</TableHead>
                <TableHead className="text-center font-bold text-black">Nilai RMSE</TableHead>
                <TableHead className="text-center font-bold text-black">Nilai MAPE</TableHead>
                <TableHead className="text-center font-bold text-black">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white">
              {currentData.length > 0 ? (
                currentData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-center">{item.tanggal}</TableCell>
                    <TableCell className="text-center">{item.nama_kernel}</TableCell>
                    <TableCell className="text-center">{item.infoHyperparameter}</TableCell>
                    <TableCell className="text-center">{item.MAE}</TableCell>
                    <TableCell className="text-center">{item.RMSE}</TableCell>
                    <TableCell className="text-center">{item.MAPE}%</TableCell>
                    <TableCell className="text-center">
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(item.id)}>
                        <Trash size={16}/>
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
          {filteredData.length > 0 && (
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

                  {Array.from({ length: totalPages }, (_, index) => (
                    <PaginationItem key={index}>
                      <PaginationLink
                        href="#"
                        isActive={currentPage === index + 1}
                        onClick={() => setCurrentPage(index + 1)}
                      >
                        {index + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

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
          )}
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
};

export default TabelHistory;
