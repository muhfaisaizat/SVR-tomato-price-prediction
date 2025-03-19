import React from 'react'
import { Calendar, Home, Inbox, Search, Settings } from "lucide-react"
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Button } from './ui/button'
import { RxDashboard } from "react-icons/rx";
import { BsClipboardData } from "react-icons/bs";
import { GrDocumentTest } from "react-icons/gr";
import { LuFolderCheck } from "react-icons/lu";
// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "/panel/dashboard",
    icon: RxDashboard,
  },
  {
    title: "Data Tomat",
    url: "/panel/data-tomat",
    icon: BsClipboardData,
  },
  {
    title: "Pengujian SVR",
    url: "/panel/testing",
    icon: GrDocumentTest,
  },
  {
    title: "Hasil",
    url: "/panel/hasil",
    icon: LuFolderCheck,
  },
  {
    title: "Pengaturan",
    url: "/panel/pengaturan",
    icon: Settings,
  },
];



const AppSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Hapus data dari localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    localStorage.removeItem("idUser");
  
    // Redirect ke halaman utama
    navigate("/");
  };

  return (
    <Sidebar>
      <SidebarContent className="flex-col justify-between">
        <SidebarGroup>
          <div className=' flex justify-center py-8'>
            <h1 className='text-[20px] font-[900] text-[#6d0404e4]'>PredicTomat</h1>
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = location.pathname === item.url;

                return (
                  <SidebarMenuItem key={item.title} className="p-[6px]">
                    <SidebarMenuButton
                      className={`text-[14px] py-[18px] px-[20px] flex items-center gap-2 
                        ${isActive ? "bg-gradient-to-r from-[#402412] to-[#9a0707] text-white hover:bg-black hover:text-white" : "text-black"}`}
                      asChild
                    >
                      <Link to={item.url} className="flex items-center gap-2">
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>

          </SidebarGroupContent>
        </SidebarGroup>
        <div className='flex justify-center py-10 px-[12px]'>
          <Button className="w-full bg-gradient-to-r from-[#402412a8] to-[#9a070790]" onClick={handleLogout}>
            <Link to="/" className="flex items-center gap-2">
              Log Out
            </Link>
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  )
}

export default AppSidebar
