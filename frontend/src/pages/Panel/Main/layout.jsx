import React from "react";
import { Routes, Route, useLocation } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/app-sidebar";
import Dashboard from "../Dashboard/Dashboard";
import Setting from "../Setting/Setting";
import Result from "../Result/Result";
import DataTomat from "../DataTomat/DataTomat";
import TestingSVR from "../TestingSVR/TestingSVR";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Toaster } from "@/components/ui/toaster"

const items = [
  { title: "Dashboard", url: "/panel/dashboard" },
  { title: "Data Tomat", url: "/panel/data-tomat" },
  { title: "Pengujian SVR", url: "/panel/testing" },
  { title: "Hasil", url: "/panel/hasil" },
  { title: "Pengaturan", url: "/panel/pengaturan" },
];

const Layout = () => {
  const location = useLocation();
  const currentPage = items.find((item) => location.pathname === item.url);
  const pageTitle = currentPage ? currentPage.title : "Dashboard";

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full h-screen flex flex-col">
        {/* Header */}
        <div className="p-6">
          <div className="border rounded-2xl px-4 py-3 flex gap-3 font-semibold text-[20px] items-center bg-gradient-to-r from-[#402412] to-[#9a0707] text-white">
            <SidebarTrigger />
            <h1 >{pageTitle}</h1>
          </div>
        </div>

        {/* Scrollable Content */}
        <ScrollArea className="h-full  px-6">
          <Routes>
            <Route path="*" element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="data-tomat" element={<DataTomat />} />
            <Route path="testing" element={<TestingSVR />} />
            <Route path="hasil" element={<Result />} />
            <Route path="pengaturan" element={<Setting />} />
          </Routes>
        </ScrollArea>
        <Toaster />
      </main>
    </SidebarProvider>
  );
};

export default Layout;
