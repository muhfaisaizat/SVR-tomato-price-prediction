import React, { useState, useEffect } from "react";
import { SearchNormal1 } from "iconsax-react";
import { Input } from "@/components/ui/input";
import { Button } from '@/components/ui/button'
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
import axios from 'axios';
import { API_URL } from "../../../helpers/networt";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';



const ITEMS_PER_PAGE = 20;

const Result = () => {
  const [dataHarga, setDataHarga] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(`${API_URL}/result/`, {
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
      item.tanggal.toLowerCase().includes(searchTerm.toLowerCase()) 
     
  );

  // Hitung jumlah halaman berdasarkan data yang sudah difilter
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

  // Hitung data yang akan ditampilkan berdasarkan halaman
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentData = filteredData.slice(startIndex, endIndex);

  const unduhExcel = () => {
    if (dataHarga.length === 0) {
      alert("Tidak ada data untuk diunduh.");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(dataHarga);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Harga");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "hasil_prediksi_seluruh_data_harga_tomat.xlsx");
  };

  return (
    <div className="w-full px-4 md:px-8 py-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1 className="text-lg font-semibold">Hasil Harga Prediksi</h1>
        <div className='xl:flex grid gap-3'>
        <div className="relative w-full md:w-[308px] h-[40px]">
          <SearchNormal1 className="absolute left-4 top-1/2 transform -translate-y-1/2" size={16} />
          <Input
            placeholder="Cari..."
            className="w-full h-full pl-[40px] text-[14px] font-medium"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset ke halaman pertama saat pencarian berubah
            }}
          />
        </div>
        <Button onClick={unduhExcel} className='h-[40px] xl:w-40 md:w-full w-full bg-gradient-to-r from-[#402412a8] to-[#9a070790]'>unduh excel</Button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl shadow-md w-full p-4">
        <ScrollArea className="w-full overflow-auto">
          <Table className="min-w-[700px] border">
            <TableHeader className="bg-gradient-to-r from-[#f2e3c94b] to-[#ffffff00]">
              <TableRow>
                <TableHead className="text-center font-bold text-black">Tanggal</TableHead>
                <TableHead className="text-center font-bold text-black">Harga Aktual</TableHead>
                <TableHead className="text-center font-bold text-black">Harga Prediksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white">
              {currentData.length > 0 ? (
                currentData.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="text-center">{item.tanggal}</TableCell>
                    <TableCell className="text-center">Rp.{item.harga_aktual}</TableCell>
                    <TableCell className="text-center">Rp.{item.harga_prediksi}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500 py-4">
                    Tidak ada data ditemukan
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {/* Pagination */}
          {/* {filteredData.length > 0 && ( */}
          <div className="mt-4 flex justify-between w-full">
            <h3 className='w-full'>menampilkan {dataHarga.length} data</h3>
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
          {/* )} */}
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>


    </div>
  );
};

export default Result;
