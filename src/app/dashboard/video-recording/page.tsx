'use client';

import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Box, 
  Button, 
  Typography, 
  List, 
  ListItem, 
  Container,
  Paper,
  Stack
} from '@mui/material';
import { styled } from '@mui/material/styles';

export default function VideoRecording() {
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showInstructions, setShowInstructions] = useState(true);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const searchParams = useSearchParams();
  const recordId = searchParams?.get('recordId') || null;

  const bestPractices = [
    'Find a quiet, well-lit location',
    'Position yourself in the center of the frame',
    'Look directly at the camera',
    'Speak clearly and at a moderate pace',
    'Keep your video to 2 minutes or less'
  ];

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startCamera = async () => {
    console.log('Starting camera initialization...');
    try {
      // Check if browser supports mediaDevices API
      console.log('navigator.mediaDevices:', navigator.mediaDevices);
      if (!navigator.mediaDevices) {
        // For older browsers that don't support mediaDevices
        (navigator as any).mediaDevices = {};
      }

      // Some browsers partially implement mediaDevices. We can't just assign an object
      // with getUserMedia as it would overwrite existing properties.
      if (!navigator.mediaDevices.getUserMedia) {
        // Get the vendor-specific getUserMedia implementation
        const getUserMedia = (navigator as any).webkitGetUserMedia ||
          (navigator as any).mozGetUserMedia ||
          (navigator as any).msGetUserMedia;

        if (!getUserMedia) {
          setError('Your browser does not support video recording. Please use a modern browser like Chrome, Firefox, or Edge.');
          return;
        }

        // Wrap the call to the old navigator.getUserMedia with a Promise
        navigator.mediaDevices.getUserMedia = function(constraints) {
          return new Promise((resolve, reject) => {
            getUserMedia.call(navigator, constraints, resolve, reject);
          });
        };
      }

      // Now we can safely use the modern API
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      console.log('Camera access granted successfully');
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        console.log('Video preview initialized');
      }
      setShowInstructions(false);
    } catch (err) {
      console.error('Camera access error:', err);
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError('Camera access was denied. Please allow camera access and try again.');
        } else if (err.name === 'NotFoundError') {
          setError('No camera found. Please ensure you have a camera connected to your device.');
        } else {
          setError('Unable to access camera. Please ensure you have granted camera permissions and try again.');
        }
      } else {
        setError('An unexpected error occurred while accessing the camera.');
      }
    }
  };

  const startRecording = async () => {
    if (!streamRef.current) {
      console.log('No stream available for recording');
      return;
    }

    console.log('Starting video recording...');
    try {
      const mediaRecorder = new MediaRecorder(streamRef.current);
      mediaRecorderRef.current = mediaRecorder;
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
          console.log('Recording chunk received:', e.data.size, 'bytes');
        }
      };

      mediaRecorder.onstop = async () => {
        console.log('Recording stopped, preparing to upload...');
        const blob = new Blob(chunks, { type: 'video/webm' });
        console.log('Video blob created, size:', blob.size, 'bytes');
        await uploadVideo(blob);
      };

      mediaRecorder.start();
      console.log('MediaRecorder started successfully');
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 120) { // 2 minutes
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);

    } catch (err) {
      setError('Failed to start recording. Please try again.');
    }
  };

  const stopRecording = () => {
    console.log('Stopping recording...');
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      console.log('Recording stopped and timer cleared');
    }
  };

  const uploadVideo = async (blob: Blob) => {
    console.log('Starting video upload process...');
    setIsUploading(true);
    try {
      // Create form data for Cloudinary upload
      const formData = new FormData();
      formData.append('file', blob);
      formData.append('upload_preset', 'your_upload_preset');
      console.log('Form data prepared for upload');

      // Upload to Cloudinary
      console.log('Uploading to Cloudinary...');
      const uploadResponse = await fetch(
        'https://api.cloudinary.com/v1_1/your_cloud_name/video/upload',
        {
          method: 'POST',
          body: formData,
        }
      );

      const uploadData = await uploadResponse.json();
      console.log('Cloudinary upload successful:', uploadData.secure_url);

      // Send video URL to backend
      console.log('Sending video URL to backend...');
      await fetch('/api/save-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoUrl: uploadData.secure_url,
          recordId,
        }),
      });
      console.log('Video URL saved to backend successfully');

      setError(null);
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload video. Please try again.');
    } finally {
      setIsUploading(false);
      console.log('Upload process completed');
    }
  };

  if (!recordId) {
    return (
      <Typography color="error" variant="h6" align="center">
        Missing recordId parameter
      </Typography>
    );
  }

  const VideoPreview = styled('video')({
    width: '100%',
    maxWidth: '640px',
    borderRadius: '8px',
    marginBottom: '1rem'
  });

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        {error && (
          <Typography color="error" variant="body1" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        
        {showInstructions ? (
          <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Before You Record
            </Typography>
            <List>
              {bestPractices.map((practice, index) => (
                <ListItem key={index}>
                  <Typography variant="body1">{practice}</Typography>
                </ListItem>
              ))}
            </List>
            <Button 
              variant="contained" 
              color="primary"
              size="large"
              onClick={startCamera}
              sx={{ mt: 2 }}
            >
              Start Recording
            </Button>
          </Paper>
        ) : (
          <Stack spacing={2} alignItems="center">
            <VideoPreview
              ref={videoRef}
              autoPlay
              playsInline
              muted
            />
            
            <Box sx={{ textAlign: 'center' }}>
              {!isRecording ? (
                <Button 
                  variant="contained" 
                  color="primary"
                  size="large"
                  onClick={startRecording}
                  disabled={isUploading}
                >
                  Start Recording
                </Button>
              ) : (
                <Button 
                  variant="contained" 
                  color="error"
                  size="large"
                  onClick={stopRecording}
                >
                  Stop & Submit
                </Button>
              )}
            </Box>

            {isRecording && (
              <Typography variant="body1" color="primary">
                Recording... {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
              </Typography>
            )}
            
            {isUploading && (
              <Typography variant="body1" color="primary">
                Uploading...
              </Typography>
            )}
          </Stack>
        )}
      </Box>
    </Container>
  );
}
