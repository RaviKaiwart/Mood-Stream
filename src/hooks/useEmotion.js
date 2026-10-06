import { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';

export function useEmotionAnalyzer() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [mood, setMood] = useState('Neutral');
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [error, setError] = useState(null);

  // Load Models
  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = '/models';
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
        ]);
        setIsModelLoaded(true);
      } catch (err) {
        console.error("Error loading face-api models:", err);
        setError("Failed to load AI models.");
      }
    };
    loadModels();
  }, []);

  // Handle Video Stream
  useEffect(() => {
    let stream = null;
    const startVideo = async () => {
      if (isCameraOn && videoRef.current) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
          videoRef.current.srcObject = stream;
        } catch (err) {
          console.error("Error accessing webcam:", err);
          setError("Failed to access webcam.");
          setIsCameraOn(false);
        }
      }
    };

    startVideo();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCameraOn]);

  // Handle Emotion Detection and Drawing
  useEffect(() => {
    let interval;
    if (isCameraOn && isModelLoaded && videoRef.current) {
      const detectEmotion = async () => {
        if (isPaused) return;
        if (!videoRef.current || videoRef.current.paused || videoRef.current.ended) return;

        const detections = await faceapi.detectSingleFace(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions()
        ).withFaceExpressions();

        if (canvasRef.current && videoRef.current) {
          const displaySize = {
            width: videoRef.current.videoWidth,
            height: videoRef.current.videoHeight
          };
          
          if (displaySize.width > 0 && displaySize.height > 0) {
            faceapi.matchDimensions(canvasRef.current, displaySize);
            
            const context = canvasRef.current.getContext('2d');
            context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

            if (detections) {
              const resizedDetections = faceapi.resizeResults(detections, displaySize);
              
              // Draw the face box
              const box = resizedDetections.detection.box;
              const drawOptions = {
                label: 'Face',
                lineWidth: 2,
                boxColor: '#10b981' // Greenish color
              };
              const drawBox = new faceapi.draw.DrawBox(box, drawOptions);
              drawBox.draw(canvasRef.current);

              const expressions = detections.expressions;
              const highestEmotion = Object.keys(expressions).reduce((a, b) => 
                expressions[a] > expressions[b] ? a : b
              );
              
              const formattedMood = highestEmotion.charAt(0).toUpperCase() + highestEmotion.slice(1);
              setMood(formattedMood);
            }
          }
        }
      };

      interval = setInterval(detectEmotion, 100); // 100ms for smoother rectangle
    }

    return () => {
      if (interval) clearInterval(interval);
      // Clear canvas on cleanup
      if (canvasRef.current) {
        const context = canvasRef.current.getContext('2d');
        context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    };
  }, [isCameraOn, isModelLoaded, isPaused]);

  return {
    videoRef,
    canvasRef,
    mood,
    isModelLoaded,
    isCameraOn,
    setIsCameraOn,
    isPaused,
    setIsPaused,
    error
  };
}
