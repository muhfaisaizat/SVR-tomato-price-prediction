import React, { useState, useEffect } from "react";
import { format, parseISO, isBefore, isAfter, startOfDay } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    CartesianGrid,
    Line,
    LineChart,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Legend
} from "recharts";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import axios from 'axios';
import { API_URL } from "../../helpers/networt";
import { useToast } from '@/hooks/use-toast';

const ViewGrafik = ({ date, setDate, dataYAxis, setDataYAxis, priceType, setPriceType, chartData, setChartData, setTabelDataAktual, setTabelDataPredict }) => {
    const { toast } = useToast();
    const [dateTerbaru, setDateTerbaru] = useState(null);
    const [dateTerlama, setDateTerlama] = useState(null);
    const oldestDate = dateTerlama ? parseISO(dateTerlama) : null;
    const latestDate = dateTerbaru ? parseISO(dateTerbaru) : null;

    const handleDateChange = (selectedDate) => setDate(selectedDate);
    const handlePriceTypeChange = (value) => setPriceType(value);

    const fetchDataDate = async () => {
        try {
            const response = await axios.get(`${API_URL}/predict/date`);

            console.log(response.data.tanggal_old)
            setDateTerbaru(response.data.tanggal_new)
            setDateTerlama(response.data.tanggal_old)
        } catch (error) {
            console.error("Error fetching data", error);
        }
    }

    useEffect(() => {
        fetchDataDate();
    }, []);

    const fetchData = async () => {
        if (!date) {

            toast({
                description: "Pilih tanggal terlebih dahulu!",
                variant: "destructive",
            });
            return;
        }

        const formattedDate = format(date, "yyyy-MM-dd");

        try {
            const response = await axios.get(`${API_URL}/predict/history?tanggal=${formattedDate}&data_type=${priceType}`);
            const formattedData = response.data.dataGrafik.map(item => ({
                date: item.tanggal,
                actual: item.harga_aktual,
                predicted: item.harga_prediksi
            }));

            setDataYAxis(response.data.YAxis);
            setChartData(formattedData);
            setTabelDataAktual(response.data.dataTableAktual);
            setTabelDataPredict(response.data.dataTablePrediksi)
            toast({
                description: "Data berhasil di tampilkan",
            });
        } catch (error) {
            console.error("Error fetching data", error);
        }
    };

    return (
        <div className=' border  rounded-2xl bg-[#ffffff81] shadow-lg'>
            <div className='bg-white py-3 px-5 rounded-t-2xl text-center sm:text-left'>
                <h1 className='text-sm font-bold '>Grafik Harga Tomat Konsumen dari Tanggal Terpilih</h1>
            </div>
            <div className='grid gap-6 mt-6 px-4 sm:px-10'>
                <div className='flex flex-col sm:flex-row sm:justify-between gap-4'>
                    <div className='flex flex-col sm:flex-row gap-4'>
                        <div className='flex items-center gap-2 '>
                            <p className="font-semibold">Tanggal:</p>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full sm:w-[240px] flex items-center justify-start gap-2">
                                        <CalendarIcon className="h-4 w-4" />
                                        {date ? format(date, "yyyy-MM-dd") : <span>Pilih tanggal</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        onSelect={handleDateChange}
                                        initialFocus
                                        defaultMonth={latestDate}
                                        disabled={(day) =>
                                            // Nonaktifkan tanggal SETELAH tanggal terbaru
                                            (latestDate && isAfter(startOfDay(day), latestDate)) ||
                                            // Nonaktifkan tanggal SEBELUM tanggal terlama
                                            (oldestDate && isBefore(startOfDay(day), oldestDate))
                                        }
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className='flex items-center gap-6 sm:gap-2'>
                            <p className="font-semibold">Harga:</p>
                            <Select onValueChange={handlePriceTypeChange}>
                                <SelectTrigger className="w-full sm:w-[180px] bg-white">
                                    <SelectValue placeholder="Pilih" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value="all">Semua</SelectItem>
                                        <SelectItem value="actual">Aktual</SelectItem>
                                        <SelectItem value="predicted">Prediksi</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <Button className='bg-gradient-to-r from-[#402412a8] to-[#9a070790]' onClick={fetchData} >Tampilkan</Button>
                </div>
                <div className='mb-4'>
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                {priceType === "all" ? "Harga Aktual vs Prediksi" : priceType === "actual" ? "Harga Aktual" : "Harga Prediksi"}
                            </CardTitle>
                            <CardDescription>Data harga tomat</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={chartData} margin={{ left: 12, right: 12 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                                        <YAxis domain={dataYAxis} tickFormatter={(value) => `Rp${value}`} />
                                        <Tooltip formatter={(value) => `Rp${value}`} />
                                        {/* <Legend/> */}
                                        {priceType !== "predicted" && (
                                            <Line dataKey="actual" type="monotone" stroke="#ff7300" strokeWidth={2} dot={false} name="Harga Aktual" />
                                        )}
                                        {priceType !== "actual" && (
                                            <Line dataKey="predicted" type="monotone" stroke="#387ef5" strokeWidth={2} dot={false} name="Harga Prediksi" />
                                        )}
                                    </LineChart>
                                </ResponsiveContainer>
                                <ScrollBar orientation="horizontal" />
                            </ScrollArea>
                        </CardContent>
                        <CardFooter className="flex flex-col text-sm">
                            <h5>Tanggal</h5>
                            <div className='flex flex-wrap gap-4'>
                                {priceType !== "predicted" && (
                                    <div className='flex items-center gap-2'>
                                        <p>Harga Aktual</p>
                                        <span className='w-4 h-4 bg-[#ff7300] block' />
                                    </div>
                                )}
                                {priceType !== "actual" && (
                                    <div className='flex items-center gap-2'>
                                        <p>Harga Prediksi</p>
                                        <span className='w-4 h-4 bg-[#387ef5] block' />
                                    </div>
                                )}
                            </div>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ViewGrafik;