"use client"
import React, { useState, useEffect, useRef, ChangeEvent } from 'react';

import { useFileContext } from '@/contexts/fileContext';
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';

const UploadAudio: React.FC = () => {
	const router = useRouter();
	const inputFile = useRef<HTMLInputElement>(null);
	const { setFileURL } = useFileContext();
	const [file, setFile] = useState<string | null>(null);


	useEffect(() => {
		if (file) {
			setFileURL(file);
			router.push('/edit');
		}
	}, [file, setFileURL, router]);

	const handleButtonClick = () => {
		if (inputFile.current) {
			inputFile.current.click();
		}
	};

	const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			setFile(URL.createObjectURL(e.target.files[0]));
		}
	};

	return (
		<>
			<Button className="whitespace-nowrap" onClick={handleButtonClick}>
				Browse my files
			</Button>
			<input
				type="file"
				id="file"
				ref={inputFile}
				style={{ display: 'none' }}
				accept="audio/*"
				onChange={handleFileUpload}
			/>
		</>
	);
};

export default UploadAudio;
