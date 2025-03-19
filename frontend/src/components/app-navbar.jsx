import React from 'react'
import { Button } from './ui/button'
import { Link, useLocation } from 'react-router-dom';
import Login from '@/pages/Auth/Login';

const Navbar = () => {
  return (
    <div className=' flex justify-between px-8 pt-5 pb-5 bg-gradient-to-r from-[#402412a8] to-[#9a070790] shadow-lg'>
      <h1 className='text-center font-black text-[20px] text-white'>PredicTomat</h1>
      <Login/>
    </div>
  )
}

export default Navbar
