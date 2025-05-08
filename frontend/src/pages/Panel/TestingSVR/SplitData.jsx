import React, { useState, useEffect } from 'react'
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

// Generate data selama satu bulan
const dataHarga = Array.from({ length: 30 }, (_, index) => ({
  tanggal: dayjs().subtract(30 - index, 'day').format('DD/MM/YYYY'),
  harga: `Rp ${Math.floor(Math.random() * 10000) + 5000}`,
}));

// const dataHarga =[];

const ITEMS_PER_PAGE = 10;

const SplitData = ({ result }) => {
  const [dataXlatih, setdataXlatih] = useState([]);
  const [dataXuji, setdataXuji] = useState([]);
  const [dataY, setdataY] = useState([]);
  const [dataYuji, setdataYuji] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageXlatih, setCurrentPageXlatih] = useState(1);
  const [currentPageXuji, setCurrentPageXuji] = useState(1);
  const [currentPageY, setCurrentPageY] = useState(1);
  const [currentPageYuji, setCurrentPageYuji] = useState(1);


  useEffect(() => {
    if (result) {
      // console.log(result.Hasil_Split_Data.X_train)
      setdataXlatih(result.Hasil_Split_Data.X_train)
      setdataXuji(result.Hasil_Split_Data.X_test)
      setdataY(result.Hasil_Split_Data.y_train)
      setdataYuji(result.Hasil_Split_Data.y_test)
    }
  }, [result]);



  // Hitung ulang jumlah halaman berdasarkan data
  const totalPages = Math.ceil(dataHarga.length / ITEMS_PER_PAGE);
  const totalPagesXlatih = Math.ceil(dataXlatih.length / ITEMS_PER_PAGE);
  const totalPagesXuji = Math.ceil(dataXuji.length / ITEMS_PER_PAGE);
  const totalPagesY = Math.ceil(dataY.length / ITEMS_PER_PAGE);
  const totalPagesYuji = Math.ceil(dataYuji.length / ITEMS_PER_PAGE);

  // Hitung data yang akan ditampilkan berdasarkan halaman
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const startIndexXlatih = (currentPageXlatih - 1) * ITEMS_PER_PAGE;
  const startIndexXuji = (currentPageXuji - 1) * ITEMS_PER_PAGE;
  const startIndexY = (currentPageY - 1) * ITEMS_PER_PAGE;
  const startIndexYuji = (currentPageYuji - 1) * ITEMS_PER_PAGE;

  const endIndex = startIndex + ITEMS_PER_PAGE;
  const endIndexXlatih = startIndexXlatih + ITEMS_PER_PAGE;
  const endIndexXuji = startIndexXuji + ITEMS_PER_PAGE;
  const endIndexY = startIndexY + ITEMS_PER_PAGE;
  const endIndexYuji = startIndexYuji + ITEMS_PER_PAGE;

  const currentData = dataHarga.slice(startIndex, endIndex);
  const currentDataXlatih = dataXlatih.slice(startIndexXlatih, endIndexXlatih);
  const currentDataXuji = dataXuji.slice(startIndexXuji, endIndexXuji);
  const currentDataY = dataY.slice(startIndexY, endIndexY);
  const currentDataYuji = dataY.slice(startIndexYuji, endIndexYuji);

  return (
    <div className='bg-white w-full  rounded-[16px] '>
      <ScrollArea className="h-full w-full p-5">
        <div className='flex justify-between items-center mb-5'>
          <div className='grid gap-3 items-center'>
            <h1 className='text-[14px] font-semibold'>Memisahkan Data Latih dan Uji</h1>
            <p className='pr-[30px] text-[10px]'>Data dibagi menjadi dua bagian:</p>
            <p className='pr-[30px] text-[10px]'>X: Fitur yang digunakan untuk memprediksi (Pasar Bandung, Pasar Ngunut, Pasar Ngemplak, Harga Rata Rata Kemarin).</p>
            <p className='pr-[30px] text-[10px]'>y: Target yang akan diprediksi (Harga Rata Rata Sekarang).</p>
          </div>

        </div>
        <div className="py-3">
          <h3>Tabel X latih</h3>
          <Table className="border">
            <TableHeader className="bg-gradient-to-r from-[#f2e3c94b] to-[#ffffff00]">
              <TableRow>
                <TableHead className="text-center font-bold text-black">Pasar Bandung</TableHead>
                <TableHead className="text-center font-bold text-black">Pasar Ngunut</TableHead>
                <TableHead className="text-center font-bold text-black">Pasar Ngemplak</TableHead>
                <TableHead className="text-center font-bold text-black">Rata-Rata Kemarin</TableHead>
                {/* <TableHead className="text-center font-bold text-black">Harga 2Hari Lalu</TableHead> */}
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white">
              {currentDataXlatih.length > 0 ? (
                currentDataXlatih.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="text-center">{item.Pasar_Bandung}</TableCell>
                    <TableCell className="text-center">{item.Pasar_Ngunut}</TableCell>
                    <TableCell className="text-center">{item.Pasar_Ngemplak}</TableCell>
                    <TableCell className="text-center">{item.Harga_Kemarin}</TableCell>
                    {/* <TableCell className="text-center">{item.Harga_2Hari_Lalu}</TableCell> */}
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
            <h3 className='w-full'>menampilkan {dataXlatih.length} data</h3>
            <Pagination className="flex justify-end">
              <PaginationContent>

                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={() => setCurrentPageXlatih((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPageXlatih === 1}
                  />
                </PaginationItem>


                {(() => {
                  let startPageXlatih = Math.max(1, currentPageXlatih - 1);
                  let endPageXlatih = Math.min(totalPagesXlatih, currentPageXlatih + 1);


                  if (currentPageXlatih === 1) {
                    endPageXlatih = Math.min(3, totalPagesXlatih);
                  }


                  if (currentPageXlatih === totalPagesXlatih) {
                    startPageXlatih = Math.max(1, totalPagesXlatih - 2);
                  }

                  return Array.from({ length: endPageXlatih - startPageXlatih + 1 }, (_, i) => startPageXlatih + i).map(
                    (page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          isActive={currentPageXlatih === page}
                          onClick={() => setCurrentPageXlatih(page)}
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
                    onClick={() => setCurrentPageXlatih((prev) => Math.min(prev + 1, totalPagesXlatih))}
                    disabled={currentPageXlatih === totalPagesXlatih}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
          {/* )} */}
        </div>
        <div className="py-3">
          <h3>Tabel X Uji</h3>
          <Table className="border">
            <TableHeader className="bg-gradient-to-r from-[#f2e3c94b] to-[#ffffff00]">
              <TableRow>
                <TableHead className="text-center font-bold text-black">Pasar Bandung</TableHead>
                <TableHead className="text-center font-bold text-black">Pasar Ngunut</TableHead>
                <TableHead className="text-center font-bold text-black">Pasar Ngemplak</TableHead>
                <TableHead className="text-center font-bold text-black">Rata-Rata Kemarin</TableHead>
                {/* <TableHead className="text-center font-bold text-black">Harga 2Hari Lalu</TableHead> */}
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white">
              {currentDataXuji.length > 0 ? (
                currentDataXuji.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="text-center">{item.Pasar_Bandung}</TableCell>
                    <TableCell className="text-center">{item.Pasar_Ngunut}</TableCell>
                    <TableCell className="text-center">{item.Pasar_Ngemplak}</TableCell>
                    <TableCell className="text-center">{item.Harga_Kemarin}</TableCell>
                    {/* <TableCell className="text-center">{item.Harga_2Hari_Lalu}</TableCell> */}
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
            <h3 className='w-full'>menampilkan {dataXuji.length} data</h3>
            <Pagination className="flex justify-end">
              <PaginationContent>

                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={() => setCurrentPageXuji((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPageXuji === 1}
                  />
                </PaginationItem>


                {(() => {
                  let startPageXuji = Math.max(1, currentPageXuji - 1);
                  let endPageXuji = Math.min(totalPagesXuji, currentPageXuji + 1);


                  if (currentPageXuji === 1) {
                    endPageXuji = Math.min(3, totalPagesXuji);
                  }


                  if (currentPageXuji === totalPagesXuji) {
                    startPageXuji = Math.max(1, totalPagesXuji - 2);
                  }

                  return Array.from({ length: endPageXuji - startPageXuji + 1 }, (_, i) => startPageXuji + i).map(
                    (page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          isActive={currentPageXuji === page}
                          onClick={() => setCurrentPageXuji(page)}
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
                    onClick={() => setCurrentPageXuji((prev) => Math.min(prev + 1, totalPagesXuji))}
                    disabled={currentPageXuji === totalPagesXuji}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
          {/* )} */}
        </div>
        <div className="py-3 flex gap-6">
          <div className='w-full'>          
            <h1>Tabel Y Latih</h1>
            <Table className="border">
              <TableHeader className="bg-gradient-to-r from-[#f2e3c94b] to-[#ffffff00]">
                <TableRow>
                  <TableHead className="text-center font-bold text-black">y_latih</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-white">
                {currentDataY.length > 0 ? (
                  currentDataY.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="text-center">{item}</TableCell>
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
              <h3 className='w-full'>menampilkan {dataY.length} data</h3>
              <Pagination className="flex justify-end">
                <PaginationContent>

                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={() => setCurrentPageY((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPageY === 1}
                    />
                  </PaginationItem>


                  {(() => {
                    let startPage = Math.max(1, currentPageY - 1);
                    let endPage = Math.min(totalPagesY, currentPageY + 1);


                    if (currentPageY === 1) {
                      endPage = Math.min(3, totalPagesY);
                    }


                    if (currentPageY === totalPagesY) {
                      startPage = Math.max(1, totalPagesY - 2);
                    }

                    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map(
                      (page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            href="#"
                            isActive={currentPageY === page}
                            onClick={() => setCurrentPageY(page)}
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
                      onClick={() => setCurrentPageY((prev) => Math.min(prev + 1, totalPagesY))}
                      disabled={currentPageY === totalPagesY}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
            {/* )} */}
          </div>
          <div className='w-full'>
          <h1>Tabel Y Uji</h1>
            <Table className="border">
              <TableHeader className="bg-gradient-to-r from-[#f2e3c94b] to-[#ffffff00]">
                <TableRow>
                  <TableHead className="text-center font-bold text-black">y_uji</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-white">
                {currentDataYuji.length > 0 ? (
                  currentDataYuji.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="text-center">{item}</TableCell>
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
              <h3 className='w-full'>menampilkan {dataYuji.length} data</h3>
              <Pagination className="flex justify-end">
                <PaginationContent>

                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={() => setCurrentPageYuji((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPageYuji === 1}
                    />
                  </PaginationItem>


                  {(() => {
                    let startPage = Math.max(1, currentPageYuji - 1);
                    let endPage = Math.min(totalPagesYuji, currentPageYuji + 1);


                    if (currentPageYuji === 1) {
                      endPage = Math.min(3, totalPagesYuji);
                    }


                    if (currentPageYuji === totalPagesYuji) {
                      startPage = Math.max(1, totalPagesYuji - 2);
                    }

                    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map(
                      (page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            href="#"
                            isActive={currentPageYuji === page}
                            onClick={() => setCurrentPageYuji(page)}
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
                      onClick={() => setCurrentPageYuji((prev) => Math.min(prev + 1, totalPagesYuji))}
                      disabled={currentPageYuji === totalPagesYuji}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
            {/* )} */}
          </div>

        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  )
}

export default SplitData
