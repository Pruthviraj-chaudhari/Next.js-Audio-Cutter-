"use client"
import React, { useState, useEffect, useRef } from 'react';
import TimelinePlugin from 'wavesurfer.js/dist/plugins/timeline.esm.js'
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.esm.js'
import ZoomPlugin from 'wavesurfer.js/dist/plugins/zoom.esm.js'
import { useFileContext } from "@/contexts/fileContext"
import WaveSurfer from 'wavesurfer.js';
import { Button } from './ui/button';
import { FaPlay } from "react-icons/fa";
import { FaPause } from "react-icons/fa";
import { MdOutlineReplay } from "react-icons/md";
import { FaCut } from "react-icons/fa";
import { Slider } from './ui/slider';
import { FaVolumeUp, FaVolumeDown } from "react-icons/fa";
import { useRouter } from 'next/navigation';

const AudioWaveform: React.FC = () => {

  const router = useRouter();

  const wavesurferRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const { fileURL } = useFileContext();

  const [wavesurferObj, setWavesurferObj] = useState<any>(null);
  const [regionsPlugin, setRegionsPlugin] = useState<any>(null);
  const [playing, setPlaying] = useState(true);
  const [volume, setVolume] = useState(0.5);
  const [zoom, setZoom] = useState(1);
  const [duration, setDuration] = useState(0);

  let wsRegions: any;

  useEffect(() => {
    if (typeof window !== 'undefined' && wavesurferRef.current && !wavesurferObj) {
      const WaveSurferInstance = WaveSurfer.create({
        container: wavesurferRef.current,
        backend: 'MediaElement',
        autoCenter: true,
        cursorColor: "white",
        waveColor: "#00FF8E",
        progressColor: "#144735",
        plugins: [
          // RegionsPlugin.create({}),
          TimelinePlugin.create({
            container: timelineRef.current!,
          }),
          ZoomPlugin.create(),
        ]
      });

      setWavesurferObj(WaveSurferInstance);
    }
  }, [wavesurferRef, wavesurferObj]);

  useEffect(() => {
    if (fileURL && wavesurferObj) {
      wavesurferObj.load(fileURL);
    }

    if (!fileURL) {
      router.push('/');
    }
  }, [fileURL, wavesurferObj]);

  useEffect(() => {
    if (wavesurferObj) {
      wavesurferObj.on('ready', () => {
        wavesurferObj.play();
        // wavesurferObj.enableDragSelection({});

        setDuration(Math.floor(wavesurferObj.getDuration()));
      });

      wavesurferObj.on('play', () => {
        setPlaying(true);
      });

      wavesurferObj.on('finish', () => {
        setPlaying(false);
      });

      wavesurferObj.on('region-updated', (region: any) => {
        const regions = region.wavesurfer.regions.list;
        const keys = Object.keys(regions);
        if (keys.length > 1) {
          regions[keys[0]].remove();
        }
      });
    }
  }, [wavesurferObj]);

  useEffect(() => {
    if (wavesurferObj) wavesurferObj.setVolume(volume);
  }, [volume, wavesurferObj]);

  useEffect(() => {
    if (wavesurferObj && wavesurferObj.isReady) {
      wavesurferObj.zoom(zoom);
    }
  }, [zoom, wavesurferObj]);


  useEffect(() => {
    if (duration && wavesurferObj) {
      const regionsPlugin = wavesurferObj.registerPlugin(RegionsPlugin.create());
      setRegionsPlugin(regionsPlugin);
      regionsPlugin.addRegion({
        start: Math.floor(duration / 2) - Math.floor(duration) / 5,
        end: Math.floor(duration / 2),
        color: "hsla(265, 100%, 86%, 0.4)",
      });

      console.log("REGION OBJECT: ", regionsPlugin)
    }
  }, [duration, wavesurferObj]);

  const handlePlayPause = () => {
    if (wavesurferObj) {
      wavesurferObj.playPause();
      setPlaying(!playing);
    }
  };

  const handleReload = () => {
    if (wavesurferObj) {
      wavesurferObj.stop();
      wavesurferObj.play();
      setPlaying(true);
    }
  };

  const handleVolumeSlider = (value: number[]) => {
    setVolume(value[0]);
  };

  // const handleZoomSlider = (value: number[]) => {
  //   setZoom(value[0]);
  // };


  // function to convert buffer to blob
  function audioBufferToWav(buffer: any) {
    const numOfChan = buffer.numberOfChannels;
    const length = buffer.length * numOfChan * 2 + 44;
    const bufferArr = new ArrayBuffer(length);
    const view = new DataView(bufferArr);
    const channels = [];
    let i;
    let sample;
    let offset = 0;
    let pos = 0;

    setUint32(0x46464952);
    setUint32(length - 8);
    setUint32(0x45564157);

    setUint32(0x20746d66);
    setUint32(16);
    setUint16(1);
    setUint16(numOfChan);
    setUint32(buffer.sampleRate);
    setUint32(buffer.sampleRate * 2 * numOfChan);
    setUint16(numOfChan * 2);
    setUint16(16);

    setUint32(0x61746164);
    setUint32(length - pos - 4);

    for (i = 0; i < buffer.numberOfChannels; i++)
      channels.push(buffer.getChannelData(i));

    while (pos < length) {
      for (i = 0; i < numOfChan; i++) {

        sample = Math.max(-1, Math.min(1, channels[i][offset]));
        sample =
          sample < 0 ? sample * 0x8000 : sample * 0x7fff;
        view.setInt16(pos, sample, true);
        pos += 2;
      }
      offset++;
    }

    return new Blob([view], { type: "audio/wav" });

    function setUint16(data: any) {
      view.setUint16(pos, data, true);
      pos += 2;
    }

    function setUint32(data: any) {
      view.setUint32(pos, data, true);
      pos += 4;
    }
  }


  const handleTrim = async () => {
    if (regionsPlugin && wavesurferObj) {
      const regionsList = regionsPlugin.regions;
      const regionKeys = Object.keys(regionsList);

      if (regionKeys.length > 0) {
        const firstRegion = regionsList[regionKeys[0]];

        console.log("FIRST REGION: ", firstRegion);

        if (firstRegion) {
          const start = firstRegion.start;
          const end = firstRegion.end;
          const waveKeys = Object.keys(wavesurferObj);
          const originalBuffer = wavesurferObj[waveKeys[4]];

          console.log(originalBuffer)

          if (originalBuffer) {
            // Trim the buffer
            const startSample = Math.floor(start * originalBuffer.sampleRate);
            const endSample = Math.ceil(end * originalBuffer.sampleRate);

            console.log(`Region start time: ${start}, end time: ${end}`);

            const trimmedBuffer = new AudioContext().createBuffer(originalBuffer.numberOfChannels, endSample - startSample, originalBuffer.sampleRate)

            for (let i = 0; i < originalBuffer.numberOfChannels; i++) {
              trimmedBuffer.copyToChannel(
                originalBuffer.getChannelData(i).slice(startSample, endSample),
                i
              );
            }

            // Convert trimmed buffer to a Blob
            const trimmedBlob = audioBufferToWav(trimmedBuffer);

            // Load the Blob into WaveSurfer
            wavesurferObj.loadBlob(trimmedBlob);

            firstRegion.remove();
          }
        }
      } else {
        console.warn('No regions found to trim.');
      }
    }
  };

  const handleDownload = () => {
    if (wavesurferObj) {
      const regionsList = regionsPlugin.regions;
      const regionKeys = Object.keys(regionsList);
      const firstRegion = regionsList[regionKeys[0]];

      console.log("FIRST REGION: ", firstRegion);



      const waveKeys = Object.keys(wavesurferObj);
      const originalBuffer = wavesurferObj[waveKeys[4]];


      if (originalBuffer) {
        const wavBlob = audioBufferToWav(originalBuffer);
        const url = URL.createObjectURL(wavBlob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'current-audio.wav';
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
      }
    }
  };

  return (
    <section>
      <div ref={wavesurferRef} id='waveform' />
      <div ref={timelineRef} id='wave-timeline' />

      <div className='flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mt-10'>
        <div className='lg:mr-2 flex gap-2 justify-center'>
          {/* <ToggleButton /> */}
          <Button title='play/pause' className='controls' onClick={handlePlayPause}>
            {playing ? (
              <FaPause />
            ) : (
              <FaPlay />
            )}
          </Button>
          <Button title='reload' className='controls' onClick={handleReload}>
            <MdOutlineReplay />
          </Button>
          <Button className='trim' onClick={handleTrim}>
            <FaCut />
            <span className="ml-1">Trim</span>
          </Button>
          <Button className='download' onClick={handleDownload}>
            <span>Download</span>
          </Button>
        </div>

        <div className='flex items-center justify-center gap-2 mt-2 lg:mt-0'>
          {/* <span className="text-sm text-gray-500">Zoom</span>
          <div className='flex items-center space-x-1 w-1/2'>
            <AiOutlineMinusCircle />
            <Slider
              min={1}
              max={1000}
              value={[zoom]}
              onValueChange={handleZoomSlider}
              className='w-full lg:w-32'
            />
            <AiOutlinePlusCircle />
          </div> */}
          <span className="text-sm text-gray-500">Volume</span>
          <div className='flex items-center space-x-1 w-1/2'>
            {volume > 0 ? (
              <FaVolumeUp />
            ) : (
              <FaVolumeDown />
            )}
            <Slider
              min={0}
              max={1}
              step={0.05}
              value={[volume]}
              onValueChange={handleVolumeSlider}
              className='w-full lg:w-32'
            />
          </div>
        </div>
      </div>


    </section>
  );
};

export default AudioWaveform;

