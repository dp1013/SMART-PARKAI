import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RefreshCw, Camera, AlertTriangle, Car, CircleDot, Upload } from 'lucide-react';
import * as tf from '@tensorflow/tfjs';
import { loadYoloModel, detectVehicles, drawDetections } from '../utils/yoloDetection';

const LiveDetection = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedCamera, setSelectedCamera] = useState('camera1');
  const [parkingSpots, setParkingSpots] = useState([]);
  const [detectionTime, setDetectionTime] = useState(new Date());
  const [error, setError] = useState(null);
  const [uploadedVideo, setUploadedVideo] = useState(null);
  const [isVideoMode, setIsVideoMode] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const modelRef = useRef(null);
  const fileInputRef = useRef(null);

  // Mock camera feeds
  const cameraFeeds = {
    camera1: "https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80",
    camera2: "https://images.unsplash.com/photo-1590674899484-13d6c7094a9f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80",
    camera3: "https://images.unsplash.com/photo-1470224114660-3f6686c562eb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80"
  };

  // Parking capacity for each location
  const parkingCapacity = {
    camera1: 11, // City Center - 11 total spots
    camera2: 69, // Mall Complex - 69 total spots
    camera3: 25, // Airport
  };

  // Initialize parking spots
  useEffect(() => {
    const totalSpots = parkingCapacity[selectedCamera];
    const spots = Array.from({ length: totalSpots }, (_, i) => ({
      id: `P${i + 1}`,
      isOccupied: i < (selectedCamera === 'camera1' ? 6 : 
                      selectedCamera === 'camera2' ? 57 : // 69-12=57 occupied
                      Math.floor(totalSpots * 0.6))
    }));
    setParkingSpots(spots);
  }, [selectedCamera]);

  // Calculate parking statistics
  const totalSpots = parkingCapacity[selectedCamera];
  const occupiedSpots = parkingSpots.filter(spot => spot.isOccupied).length;
  const emptySpots = totalSpots - occupiedSpots;
  const occupancyRate = (occupiedSpots / totalSpots) * 100;

  // Handle video upload
  const handleVideoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
  
    try {
      setIsLoading(true);
      setError('');
  
      // Check if file is a video
      if (!file.type.includes('video')) {
        throw new Error('Please upload a video file');
      }
  
      const videoUrl = URL.createObjectURL(file);
      setUploadedVideo(videoUrl);
      setIsVideoMode(true);
      setIsPlaying(false);
      
      if (videoRef.current) {
        videoRef.current.src = videoUrl;
        videoRef.current.load();
        await new Promise((resolve) => {
          videoRef.current.onloadedmetadata = resolve;
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to process video. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load YOLO model
  useEffect(() => {
    const loadModel = async () => {
      try {
        setIsLoading(true);
        const model = await loadYoloModel();
        if (model) {
          modelRef.current = model;
          setIsModelLoaded(true);
          setError(null);
        } else {
          setError('Failed to load detection model');
        }
      } catch (err) {
        setError('Failed to load detection model. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    loadModel();
  }, []);

  // Simulate video playback and detection
  useEffect(() => {
    if (!isPlaying || !isModelLoaded || !modelRef.current) return;

    const interval = setInterval(async () => {
      if (videoRef.current && canvasRef.current) {
        // Perform detection
        const detections = await detectVehicles(modelRef.current, videoRef.current);
        
        // Draw detections
        drawDetections(
          canvasRef.current,
          detections,
          videoRef.current.clientWidth,
          videoRef.current.clientHeight
        );

        // Update parking spots randomly for demo
        setParkingSpots(spots => 
          spots.map(spot => ({
            ...spot,
            isOccupied: Math.random() > 0.6
          }))
        );
        
        setDetectionTime(new Date());
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isPlaying, isModelLoaded, selectedCamera]);

  const handleCameraChange = (camera) => {
    setIsPlaying(false);
    setSelectedCamera(camera);
    setIsVideoMode(false);
    setUploadedVideo(null);
    setTimeout(() => setIsPlaying(true), 500);
  };

  const togglePlayback = () => {
    if (isVideoMode && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Live Parking Detection</h1>
        <p className="text-gray-600">
          Real-time AI-powered detection of available parking spots using YOLO model
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8">
          <div className="flex items-center">
            <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="relative aspect-video bg-gray-900">
              {isLoading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
                  <span className="absolute text-blue-500">Loading model...</span>
                </div>
              ) : (
                <>
                  {isVideoMode ? (
                    <video
                      ref={videoRef}
                      src={uploadedVideo}
                      className="w-full h-full object-contain"
                      controls={false}
                      loop
                    />
                  ) : (
                    <img 
                      ref={videoRef}
                      src={cameraFeeds[selectedCamera]} 
                      alt="Parking Camera Feed"
                      className="w-full h-full object-cover"
                    />
                  )}
                  <canvas 
                    ref={canvasRef}
                    width="800"
                    height="450"
                    className="absolute inset-0 w-full h-full"
                  />
                </>
              )}
            </div>
            
            <div className="p-4 bg-gray-50 border-t border-gray-200">
              <div className="flex flex-wrap items-center justify-between">
                <div className="flex items-center space-x-4 mb-2 sm:mb-0">
                  <button 
                    onClick={togglePlayback}
                    disabled={isLoading || !isModelLoaded}
                    className={`flex items-center justify-center p-2 rounded-full ${
                      isPlaying ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                    } ${(isLoading || !isModelLoaded) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-opacity-80'}`}
                  >
                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                  </button>
                  
                  <button 
                    onClick={() => setIsPlaying(true)}
                    disabled={isLoading || !isModelLoaded}
                    className={`flex items-center justify-center p-2 rounded-full bg-blue-100 text-blue-600 ${
                      (isLoading || !isModelLoaded) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-opacity-80'
                    }`}
                  >
                    <RefreshCw className="h-5 w-5" />
                  </button>

                  <a
                    href="/booking"
                    className="flex items-center justify-center p-2 rounded-full bg-purple-100 text-purple-600 hover:bg-opacity-80"
                  >
                    <span className="text-sm font-medium">Book Now</span>
                  </a>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading || !isModelLoaded}
                    className={`flex items-center justify-center p-2 rounded-full bg-purple-100 text-purple-600 ${
                      (isLoading || !isModelLoaded) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-opacity-80'
                    }`}
                  >
                    <Upload className="h-5 w-5" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="hidden"
                  />
                </div>
                
                <div className="flex items-center">
                  <Camera className="h-5 w-5 text-gray-500 mr-2" />
                  <select
                    value={selectedCamera}
                    onChange={(e) => handleCameraChange(e.target.value)}
                    disabled={isLoading}
                    className="bg-white border border-gray-300 rounded-md py-1 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="camera1">City Center Parking</option>
                    <option value="camera2">Mall Parking Complex</option>
                    <option value="camera3">Airport Parking</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Parking Statistics Cards */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="bg-white rounded-xl shadow-md p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Spots</p>
                  <p className="text-2xl font-bold text-gray-900">{totalSpots}</p>
                </div>
                <Car className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Occupied</p>
                  <p className="text-2xl font-bold text-red-600">{occupiedSpots}</p>
                </div>
                <CircleDot className="h-8 w-8 text-red-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Available</p>
                  <p className="text-2xl font-bold text-green-600">{emptySpots}</p>
                </div>
                <CircleDot className="h-8 w-8 text-green-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Occupancy Rate</p>
                  <p className="text-2xl font-bold text-blue-600">{Math.round(occupancyRate)}%</p>
                </div>
                <div className="h-8 w-8 rounded-full border-4 border-blue-500 flex items-center justify-center">
                  <span className="text-xs font-medium text-blue-500">%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Detection Information</h2>
              
              <div className="space-y-4">
                <div>
                  <span className="text-gray-600 block mb-1">Detection Model</span>
                  <span className="font-medium">YOLOv5 Parking Detection</span>
                </div>
                
                <div>
                  <span className="text-gray-600 block mb-1">Last Updated</span>
                  <span className="font-medium">{detectionTime.toLocaleTimeString()}</span>
                </div>
                
                <div>
                  <span className="text-gray-600 block mb-1">Detection Accuracy</span>
                  <span className="font-medium">98.5%</span>
                </div>
                
                <div>
                  <span className="text-gray-600 block mb-1">Camera Location</span>
                  <span className="font-medium">
                    {selectedCamera === 'camera1' && 'City Center Parking'}
                    {selectedCamera === 'camera2' && 'Mall Parking Complex'}
                    {selectedCamera === 'camera3' && 'Airport Parking'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveDetection;

const handleVideoUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  try {
    setIsLoading(true);
    setError('');

    if (!file.type.includes('video')) {
      throw new Error('Please upload a video file');
    }

    const videoUrl = URL.createObjectURL(file);
    setUploadedVideo(videoUrl);
    setIsVideoMode(true);
    setIsPlaying(false);
    
    if (videoRef.current) {
      videoRef.current.src = videoUrl;
      // Don't use .load() - it's not needed for video elements
      await new Promise((resolve) => {
        videoRef.current.onloadedmetadata = resolve;
      });
    }
  } catch (err) {
    setError(err.message || 'Failed to process video. Please try again.');
    console.error(err);
  } finally {
    setIsLoading(false);
  }
};