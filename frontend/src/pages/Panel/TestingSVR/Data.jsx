import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { SearchNormal1 } from 'iconsax-react';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import dayjs from 'dayjs';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import axios from 'axios';
import { API_URL } from "../../../helpers/networt";
import { useToast } from '@/hooks/use-toast';



const ITEMS_PER_PAGE = 10;

const Data = ({dataHarga, setdataHarga}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  


  const handleGetData = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(`${API_URL}/prices/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setdataHarga(response.data)
    } catch (error) {
      console.error("Error fetching data", error);
    }

  }

  // Filter data berdasarkan pencarian
  const filteredData = dataHarga.filter(
    (item) =>
      item.tanggal.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.pasar_bandung.toString().includes(searchTerm) ||
      item.pasar_ngunut.toString().includes(searchTerm) ||
      item.pasar_ngemplak.toString().includes(searchTerm)
  );

  // Hitung ulang jumlah halaman berdasarkan data yang sudah difilter
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

  // Hitung data yang akan ditampilkan berdasarkan halaman
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentData = filteredData.slice(startIndex, endIndex);
  return (
    <div className='bg-white w-full  rounded-[16px] '>
      <ScrollArea className="h-full w-full p-5">
        <div className='flex justify-between mb-5'>
          <div className='flex gap-6 items-center'>
            <h1 className='text-[14px] font-semibold'>Data Tomat</h1>
            <Button variant="secondary"   onClick={handleGetData}>Tampilkan data</Button>
          </div>
          <div className="relative w-full md:w-[308px] h-[32px]">
            <SearchNormal1 className="absolute left-[16px] top-1/2 transform -translate-y-1/2" size={16} />
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
        </div>
        <div className="">

          <Table className="border">
            <TableHeader className="bg-gradient-to-r from-[#f2e3c94b] to-[#ffffff00]">
              <TableRow>
                <TableHead className="text-center font-bold text-black">Tanggal</TableHead>
                <TableHead className="text-center font-bold text-black">Pasar Bandung</TableHead>
                <TableHead className="text-center font-bold text-black">Pasar Ngunut</TableHead>
                <TableHead className="text-center font-bold text-black">Pasar Ngemplak</TableHead>
                <TableHead className="text-center font-bold text-black">Rata-Rata Kemarin</TableHead>
                <TableHead className="text-center font-bold text-black">Rata-Rata Sekarang</TableHead>
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
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500 py-4 ">
                    Mohon Tampilkan Data
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
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  )
}

export default Data
