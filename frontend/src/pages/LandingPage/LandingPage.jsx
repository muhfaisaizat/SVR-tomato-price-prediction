import React, { useState, useEffect } from 'react'
import Navbar from '@/components/app-navbar'
import ViewGrafik from './ViewGrafik'
import TableAktual from './TableAktual'
import TablePrediksi from './TablePrediksi'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Toaster } from "@/components/ui/toaster"
import BgTomat from '../../assets/bg-tomat.png'

const LandingPage = () => {
  const [date, setDate] = useState(null);
  const [dataYAxis, setDataYAxis] = useState([11000, 15000]);
  const [priceType, setPriceType] = useState("all");
  const [chartData, setChartData] = useState([]);
  const [tabelDataAktual, setTabelDataAktual] = useState([]);
  const [tabelDataPredict, setTabelDataPredict] = useState([]);

  return (
    <ScrollArea 
    className="h-screen w-full bg-cover bg-center bg-no-repeat relative bg-white bg-opacity-15 " 
    style={{ backgroundImage:  `url(${BgTomat})`  }}
    >
      <div className=' grid gap-7 '>
        <Navbar />
        <div className='px-[10%] pb-6'>
          <ViewGrafik date={date} setDate={setDate} dataYAxis={dataYAxis} setDataYAxis={setDataYAxis} priceType={priceType} setPriceType={setPriceType} chartData={chartData} setChartData={setChartData} setTabelDataAktual={setTabelDataAktual} setTabelDataPredict={setTabelDataPredict} />
        </div>
        {(tabelDataAktual.length > 0 || tabelDataPredict.length > 0) && (
          <div className='py-6 grid gap-2 shadow-lg'>
            <div className='px-[10%]'>
              <h2 className='text-[14px] font-bold text-white '>Tabel Harga Tomat Konsumen 1 bulan dari Tanggal Terpilih</h2>
            </div>
            <div className='px-[10%] '>
              
                <div className=' border  rounded-[20px] bg-[#ffffff81]  px-[10px] py-[10px]'>
                <ScrollArea>
                  <div className='flex gap-[20px] rounded-[18px] bg-white px-[30px] py-[10px]'>
                  {tabelDataAktual.length > 0 && <TableAktual tabelDataAktual={tabelDataAktual} />}
                  {tabelDataPredict.length > 0 && <TablePrediksi tabelDataPredict={tabelDataPredict} />}
                  </div>
                  <ScrollBar orientation="horizontal" />
                  </ScrollArea>
                </div>
              
            </div>
          </div>
        )}
   

      </div>
      <Toaster />
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}

export default LandingPage
