"use client"
import AudioWaveform from '@/components/AudioWaveform'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import React from 'react'

const page = () => {
  return (
    <div className="flex flex-col min-h-[100dvh] bg-gray-100 dark:bg-gray-950">
      <Navbar />  
      <main className="flex-1 flex flex-col items-center justify-center px-4 md:px-6 py-12 md:py-24">
      <div className="max-w-2xl w-full">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
          Edit Your Audio File
          </h1>
          <AudioWaveform />
        </div>
      </div>
    </main>
      <Footer />
    </div>
  )
}

export default page