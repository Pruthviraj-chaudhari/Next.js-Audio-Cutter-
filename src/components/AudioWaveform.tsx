"use client"
import React, { useState, useEffect, useContext, useRef, RefObject, ChangeEvent } from 'react';
import TimelinePlugin from 'wavesurfer.js/dist/plugins/timeline.esm.js'
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.esm.js'
import { useFileContext } from "@/contexts/fileContext"
import WaveSurfer from 'wavesurfer.js';

const AudioWaveform: React.FC = () => {
  const wavesurferRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const { fileURL } = useFileContext();

  const [wavesurferObj, setWavesurferObj] = useState<any>(null);
  const [playing, setPlaying] = useState(true);
  const [volume, setVolume] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined' && wavesurferRef.current && !wavesurferObj) {
      const WaveSurferInstance = WaveSurfer.create({
        container: wavesurferRef.current,
        scrollParent: true,
        autoCenter: true,
        cursorColor: 'violet',
        loopSelection: true,
        waveColor: '#211027',
        progressColor: '#69207F',
        responsive: true,
        plugins: [
          TimelinePlugin.create({
            container: timelineRef.current,
          }),
          RegionsPlugin.create({}),
        ],
      });
      setWavesurferObj(WaveSurferInstance);
    }
  }, [wavesurferRef, wavesurferObj]);

  useEffect(() => {
    if (fileURL && wavesurferObj) {
      wavesurferObj.load(fileURL);
    }
  }, [fileURL, wavesurferObj]);

  useEffect(() => {
    if (wavesurferObj) {
      wavesurferObj.on('ready', () => {
        wavesurferObj.play();
        wavesurferObj.enableDragSelection({});

        setDuration(Math.floor(wavesurferObj.getDuration()));
      });

      wavesurferObj.on('play', () => {
        setPlaying(true);
      });

      wavesurferObj.on('finish', () => {
        setPlaying(false);
      });

      wavesurferObj.on('region-updated', (region) => {
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

//   useEffect(() => {
//     if (wavesurferObj) wavesurferObj.zoom(zoom);
//   }, [zoom, wavesurferObj]);

  useEffect(() => {
    if (duration && wavesurferObj) {
      wavesurferObj.addRegion({
        start: Math.floor(duration / 2) - Math.floor(duration) / 5,
        end: Math.floor(duration / 2),
        color: 'hsla(265, 100%, 86%, 0.4)',
      });
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

  const handleVolumeSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(Number(e.target.value));
  };

  const handleZoomSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    setZoom(Number(e.target.value));
  };

  const handleTrim = () => {
    if (wavesurferObj) {
      const region = wavesurferObj.regions.list[Object.keys(wavesurferObj.regions.list)[0]];
      if (region) {
        const start = region.start;
        const end = region.end;
        const originalBuffer = wavesurferObj.backend.buffer;
        const newBuffer = wavesurferObj.backend.ac.createBuffer(
          originalBuffer.numberOfChannels,
          originalBuffer.length,
          originalBuffer.sampleRate
        );

        const firstListIndex = start * originalBuffer.sampleRate;
        const secondListIndex = end * originalBuffer.sampleRate;
        const secondListMemAlloc = originalBuffer.length - end * originalBuffer.sampleRate;

        const newList = new Float32Array(parseInt(firstListIndex));
        const secondList = new Float32Array(parseInt(secondListMemAlloc));
        const combined = new Float32Array(originalBuffer.length);

        originalBuffer.copyFromChannel(newList, 0);
        originalBuffer.copyFromChannel(secondList, 0, secondListIndex);

        combined.set(newList);
        combined.set(secondList, firstListIndex);

        newBuffer.copyToChannel(combined, 0);
        wavesurferObj.loadDecodedBuffer(newBuffer);
      }
    }
  };

  return (
    <section className='waveform-container'>
      <div ref={wavesurferRef} id='waveform' />
      <div ref={timelineRef} id='wave-timeline' />
      <div className='all-controls'>
        <div className='left-container'>
          {/* <ToggleButton /> */}
          <button title='play/pause' className='controls' onClick={handlePlayPause}>
            {playing ? (
              <i className='material-icons'>pause</i>
            ) : (
              <i className='material-icons'>play_arrow</i>
            )}
          </button>
          <button title='reload' className='controls' onClick={handleReload}>
            <i className='material-icons'>replay</i>
          </button>
          <button className='trim' onClick={handleTrim}>
            <i
              style={{
                fontSize: '1.2em',
                color: 'white',
              }}
              className='material-icons'>
              content_cut
            </i>
            Trim
          </button>
        </div>
        <div className='right-container'>
          <div className='volume-slide-container'>
            <i className='material-icons zoom-icon'>remove_circle</i>
            <input
              type='range'
              min='1'
              max='1000'
              value={zoom}
              onChange={handleZoomSlider}
              className='slider zoom-slider'
            />
            <i className='material-icons zoom-icon'>add_circle</i>
          </div>
          <div className='volume-slide-container'>
            {volume > 0 ? (
              <i className='material-icons'>volume_up</i>
            ) : (
              <i className='material-icons'>volume_off</i>
            )}
            <input
              type='range'
              min='0'
              max='1'
              step='0.05'
              value={volume}
              onChange={handleVolumeSlider}
              className='slider volume-slider'
			  />
			  </div>
			</div>
		  </div>
		</section>
	  );
	};
	
	export default AudioWaveform;
	
