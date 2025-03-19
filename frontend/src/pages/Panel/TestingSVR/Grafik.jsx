import React, {useState, useEffect} from "react";
import {
    CartesianGrid,
    Line,
    LineChart,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";



const priceType = "all";


const Grafik = ({ result }) => {
    const [chartData, setChartData] = useState([]);
    const [yAxisDomain, setYAxisDomain] = useState([0, 0]);

    useEffect(() => {
        if (result && result.Hasil_Prediksi) {
            const formattedData = result.Hasil_Prediksi.map(item => ({
                date: item.Tanggal,
                actual: item.Harga_Sekarang,
                predicted: item.Harga_Prediksi
            }));

            // Hitung min dan max dari Harga_Sekarang untuk YAxis
            const minPrice = Math.min(...formattedData.map(item => item.actual));
            const maxPrice = Math.max(...formattedData.map(item => item.actual));

            setChartData(formattedData);
            setYAxisDomain([minPrice - 500, maxPrice + 500]); // Tambahkan margin
        }
    }, [result]);
    return (
        <div className='w-full grid-cols-1 lg:grid-cols-2'>
                <Card>
                    <CardHeader>
                        <CardTitle>
                           Grafik
                        </CardTitle>
                        <CardDescription>Menampilkan hasil harga aktual (rata-rata sekarang) dan harga prediksi</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={chartData} margin={{ left: 12, right: 12 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                                    <YAxis domain={yAxisDomain} tickFormatter={(value) => `Rp${value}`} />
                                    <Tooltip formatter={(value) => `${value}`} />
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
    );
};

export default Grafik;
