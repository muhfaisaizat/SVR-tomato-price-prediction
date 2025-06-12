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

const TablePrediksi = ({ tabelDataPredict }) => {
  const isHargaAvailable = tabelDataPredict.some(item => item.harga_prediksi !== undefined);
  const isLinearAvailable = tabelDataPredict.some(item => item.linear !== undefined);
  const isRbfAvailable = tabelDataPredict.some(item => item.rbf !== undefined);
  const isSigmoidAvailable = tabelDataPredict.some(item => item.sigmoid !== undefined);
  const isPolyAvailable = tabelDataPredict.some(item => item.poly !== undefined);

  const totalColSpan =
    2 + // kolom No dan Tanggal
    (isHargaAvailable ? 1 : 0) +
    (isLinearAvailable ? 1 : 0) +
    (isRbfAvailable ? 1 : 0) +
    (isSigmoidAvailable ? 1 : 0) +
    (isPolyAvailable ? 1 : 0);
  return (
    <div className='w-[100%]'>
      <h3 className='text-[14px] font-bold mb-6' >Harga Prediksi</h3>
      <Table className='border'>

        <TableHeader className='bg-[#F5F5F5]'>
          <TableRow >
            <TableHead className="w-[50px] font-bold text-black">No</TableHead>
            <TableHead className='text-center font-bold text-black'>Tanggal</TableHead>
            {isHargaAvailable && (
              <TableHead className="text-center font-bold text-black">Harga</TableHead>
            )}
            {isLinearAvailable && (
              <TableHead className="text-center font-bold text-black">Prediksi Linear</TableHead>
            )}
            {isRbfAvailable && (
              <TableHead className="text-center font-bold text-black">Prediksi RBF</TableHead>
            )}
            {isSigmoidAvailable && (
              <TableHead className="text-center font-bold text-black">Prediksi Sigmoid</TableHead>
            )}
            {isPolyAvailable && (
              <TableHead className="text-center font-bold text-black">Prediksi Polynomial</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody className='bg-white'>
          {tabelDataPredict.length > 0 ? (
            tabelDataPredict.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{index + 1}</TableCell>
                <TableCell className="text-center">{item.tanggal}</TableCell>
                {item.harga_prediksi !== undefined && (
                  <TableCell className="text-center">Rp.{item.harga_prediksi}</TableCell>
                )}
                {item.linear !== undefined && (
                  <TableCell className="text-center">Rp.{item.linear}</TableCell>
                )}
                {item.rbf !== undefined && (
                  <TableCell className="text-center">Rp.{item.rbf}</TableCell>
                )}
                {item.sigmoid !== undefined && (
                  <TableCell className="text-center">Rp.{item.sigmoid}</TableCell>
                )}
                {item.poly !== undefined && (
                  <TableCell className="text-center">Rp.{item.poly}</TableCell>
                )}

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
            <TableCell colSpan={totalColSpan - 1}>Total Data</TableCell>
            <TableCell className="text-right">{tabelDataPredict.length} Hari</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  )
}

export default TablePrediksi
