import React from 'react'
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table";
  import dayjs from "dayjs";
  
  // Generate data selama satu bulan
  const dataHarga = Array.from({ length: 30 }, (_, index) => ({
    no: index + 1,
    tanggal: dayjs().subtract(30 - index, "day").format("DD/MM/YYYY"),
    harga: `Rp ${Math.floor(Math.random() * 10000) + 5000}`,
  }));

const TableAktual = ({tabelDataAktual}) => {
  return (
    <div className='w-[100%]'>
      <h3 className='text-[14px] font-bold mb-6'>Harga Aktual</h3>
      <Table className='border'>

      <TableHeader className='bg-[#F5F5F5]'>
        <TableRow >
          <TableHead className="w-[50px] font-bold text-black">No</TableHead>
          <TableHead className='text-center font-bold text-black'>Tanggal</TableHead>
          <TableHead className="text-center font-bold text-black">Harga</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className='bg-white'>
      {tabelDataAktual.length > 0 ? (
            tabelDataAktual.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{index + 1}</TableCell>
                <TableCell className="text-center">{item.tanggal}</TableCell>
                <TableCell className="text-center">Rp.{item.harga_aktual}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan="3" className="text-center text-gray-500">
                Tidak ada data
              </TableCell>
            </TableRow>
          )}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={2}>Total Data</TableCell>
          <TableCell className="text-right">{tabelDataAktual.length} Hari</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
    </div>
  )
}

export default TableAktual
