"use client";
import UploadAudio from "./UploadAudio";

const Main = () => {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 md:px-6 py-12 md:py-24">
      <div className="max-w-2xl w-full space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
          Audio Cutter
          </h1>
          <p className="text-gray-500 text-lg dark:text-gray-400">
          Free editor to trim and cut any audio file online
          </p>
        </div>

        <div className="w-full flex items-center justify-center">
        <UploadAudio />
        </div>
        
      </div>
    </main>
  );
};

export default Main;
