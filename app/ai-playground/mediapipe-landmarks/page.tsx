'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Eye, Camera, ArrowLeft, Play, Square, Settings, AlertCircle, CheckCircle } from 'lucide-react'
import Link from 'next/link'
// MediaPipe types (will be loaded from CDN)
declare global {
  interface Window {
    FaceMesh: any
    Hands: any
    drawConnectors: any
    drawLandmarks: any
    FACEMESH_CONTOURS: any
    FACEMESH_TESSELATION: any
    HAND_CONNECTIONS: any
  }
}

interface DetectionState {
  face: boolean
  hands: boolean
  isRunning: boolean
  hasCamera: boolean
  hasPermission: boolean
}

export default function MediaPipeLandmarksPage() {
  const [detectionState, setDetectionState] = useState<DetectionState>({
    face: true,
    hands: true,
    isRunning: false,
    hasCamera: false,
    hasPermission: false
  })
  const [error, setError] = useState<string | null>(null)
  const [landmarkCount, setLandmarkCount] = useState({ face: 0, hands: 0, faceCount: 0, handCount: 0 })
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const faceMeshRef = useRef<any>(null)
  const handsRef = useRef<any>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animationRef = useRef<number | null>(null)
  const [mediaPipeLoaded, setMediaPipeLoaded] = useState(false)

  // Store latest hand results for integrated drawing
  const latestHandResults = useRef<any>(null)

  // Draw hand landmarks function
  const drawHandLandmarks = useCallback((canvasCtx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    if (!detectionState.hands || !latestHandResults.current?.multiHandLandmarks) {
      return
    }

    const results = latestHandResults.current
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const handColors = ['#FF0000', '#FF8800', '#8800FF', '#FF0088'] // 赤、オレンジ、紫、ピンク
      const handConnectionColors = ['#00FF00', '#00FF88', '#8800FF', '#FF0088'] // 接続線の色
      
      results.multiHandLandmarks.forEach((landmarks: any, handIndex: number) => {
        // 手ごとに異なる色を使用
        const dotColor = handColors[handIndex % handColors.length]
        const lineColor = handConnectionColors[handIndex % handConnectionColors.length]
        
        // ドット描画
        canvasCtx.fillStyle = dotColor
        canvasCtx.strokeStyle = '#FFFFFF'
        canvasCtx.lineWidth = 2
        
        for (let i = 0; i < landmarks.length; i++) {
          const x = landmarks[i].x * canvas.width
          const y = landmarks[i].y * canvas.height
          
          // メインのドット（手ごとの色、少し大きめ）
          canvasCtx.beginPath()
          canvasCtx.arc(x, y, 5, 0, 2 * Math.PI)
          canvasCtx.fill()
          
          // 縁取り（白色）で見やすくする
          canvasCtx.beginPath()
          canvasCtx.arc(x, y, 5, 0, 2 * Math.PI)
          canvasCtx.stroke()
        }
        
        // 手の接続線も手ごとに異なる色で描画
        if (window.drawConnectors && window.HAND_CONNECTIONS) {
          canvasCtx.strokeStyle = lineColor
          canvasCtx.lineWidth = 2
          window.drawConnectors(canvasCtx, landmarks, window.HAND_CONNECTIONS, {
            color: lineColor,
            lineWidth: 2
          })
        }
      })
    }
  }, [detectionState.hands])

  const onFaceResults = useCallback((results: any) => {
    
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const canvasCtx = canvas.getContext('2d')
    if (!canvasCtx) return

    // キャンバスを完全にクリアして画像を描画
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height)
    if (results.image) {
      canvasCtx.drawImage(results.image, 0, 0, canvas.width, canvas.height)
    }

    // 顔のランドマーク処理（顔検出が有効な場合のみ）
    if (detectionState.face && results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
      setLandmarkCount(prev => ({ 
        ...prev, 
        face: results.multiFaceLandmarks.length * 468,
        faceCount: results.multiFaceLandmarks.length
      }))
      
      const faceColors = ['#00FF00', '#00FFFF', '#FF00FF', '#FFFF00'] // 緑、シアン、マゼンタ、黄
      
      results.multiFaceLandmarks.forEach((landmarks: any, faceIndex: number) => {
        // 顔ごとに異なる色を使用
        const color = faceColors[faceIndex % faceColors.length]
        canvasCtx.fillStyle = color
        canvasCtx.strokeStyle = '#FFFFFF'
        canvasCtx.lineWidth = 1
        
        for (let i = 0; i < landmarks.length; i++) {
          const x = landmarks[i].x * canvas.width
          const y = landmarks[i].y * canvas.height
          
          // メインのドット（顔ごとの色、小さめ）
          canvasCtx.beginPath()
          canvasCtx.arc(x, y, 1.5, 0, 2 * Math.PI)
          canvasCtx.fill()
          
          // 縁取り（白色）で見やすくする
          canvasCtx.beginPath()
          canvasCtx.arc(x, y, 1.5, 0, 2 * Math.PI)
          canvasCtx.stroke()
        }
      })
    } else if (!detectionState.face) {
      // 顔検出が無効の場合はカウントをクリア
      setLandmarkCount(prev => ({ ...prev, face: 0, faceCount: 0 }))
    }

    // 手のランドマークも同じCanvasに描画（手検出が有効な場合のみ）
    drawHandLandmarks(canvasCtx, canvas)

  }, [detectionState.face, detectionState.hands, drawHandLandmarks])

  const onHandsResults = useCallback((results: any) => {
    latestHandResults.current = results
    
    // Update hand count
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      setLandmarkCount(prev => ({ 
        ...prev, 
        hands: results.multiHandLandmarks.length * 21,
        handCount: results.multiHandLandmarks.length
      }))
    } else {
      setLandmarkCount(prev => ({ ...prev, hands: 0, handCount: 0 }))
    }

    // If only hands detection is enabled (face disabled), draw directly on canvas
    if (!detectionState.face && detectionState.hands && canvasRef.current) {
      const canvas = canvasRef.current
      const canvasCtx = canvas.getContext('2d')
      if (canvasCtx && results.image) {
        // Clear canvas and draw video image
        canvasCtx.clearRect(0, 0, canvas.width, canvas.height)
        canvasCtx.drawImage(results.image, 0, 0, canvas.width, canvas.height)
        
        // Draw hand landmarks directly with the current results
        if (detectionState.hands && results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
          const handColors = ['#FF0000', '#FF8800', '#8800FF', '#FF0088'] // 赤、オレンジ、紫、ピンク
          const handConnectionColors = ['#00FF00', '#00FF88', '#8800FF', '#FF0088'] // 接続線の色
          
          results.multiHandLandmarks.forEach((landmarks: any, handIndex: number) => {
            // 手ごとに異なる色を使用
            const dotColor = handColors[handIndex % handColors.length]
            const lineColor = handConnectionColors[handIndex % handConnectionColors.length]
            
            // ドット描画
            canvasCtx.fillStyle = dotColor
            canvasCtx.strokeStyle = '#FFFFFF'
            canvasCtx.lineWidth = 2
            
            for (let i = 0; i < landmarks.length; i++) {
              const x = landmarks[i].x * canvas.width
              const y = landmarks[i].y * canvas.height
              
              // メインのドット（手ごとの色、少し大きめ）
              canvasCtx.beginPath()
              canvasCtx.arc(x, y, 5, 0, 2 * Math.PI)
              canvasCtx.fill()
              
              // 縁取り（白色）で見やすくする
              canvasCtx.beginPath()
              canvasCtx.arc(x, y, 5, 0, 2 * Math.PI)
              canvasCtx.stroke()
            }
            
            // 手の接続線も手ごとに異なる色で描画
            if (window.drawConnectors && window.HAND_CONNECTIONS) {
              canvasCtx.strokeStyle = lineColor
              canvasCtx.lineWidth = 2
              window.drawConnectors(canvasCtx, landmarks, window.HAND_CONNECTIONS, {
                color: lineColor,
                lineWidth: 2
              })
            }
          })
        }
      }
    }
  }, [detectionState.face, detectionState.hands])

  // Load MediaPipe scripts from CDN
  useEffect(() => {
    const loadMediaPipe = async () => {
      try {
        console.log('Starting MediaPipe script loading...')
        
        // Load MediaPipe scripts
        const scripts = [
          'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js',
          'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js',
          'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js'
        ]

        for (const src of scripts) {
          console.log('Loading script:', src)
          await new Promise<void>((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`)) {
              console.log('Script already loaded:', src)
              resolve()
              return
            }
            
            const script = document.createElement('script')
            script.src = src
            script.onload = () => {
              console.log('Script loaded successfully:', src)
              resolve()
            }
            script.onerror = (err) => {
              console.error('Script loading failed:', src, err)
              reject(err)
            }
            document.head.appendChild(script)
          })
        }

        console.log('All scripts loaded, waiting for initialization...')
        
        // Wait a bit for all scripts to initialize
        setTimeout(() => {
          console.log('Setting MediaPipe as loaded')
          console.log('Available globals:', {
            FaceMesh: typeof window.FaceMesh,
            Hands: typeof window.Hands,
            drawConnectors: typeof window.drawConnectors
          })
          setMediaPipeLoaded(true)
        }, 2000) // 2秒に延長

      } catch (err) {
        console.error('MediaPipe loading error:', err)
        setError('MediaPipe スクリプトの読み込みに失敗しました: ' + (err instanceof Error ? err.message : '不明なエラー'))
      }
    }

    loadMediaPipe()
  }, [])

  // Initialize MediaPipe solutions after scripts are loaded
  useEffect(() => {
    if (!mediaPipeLoaded) return

    const initializeMediaPipe = async () => {
      try {
        console.log('Initializing MediaPipe solutions...')

        // Initialize Face Mesh
        if (window.FaceMesh) {
          console.log('Creating FaceMesh instance...')
          const faceMesh = new window.FaceMesh({
            locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
          })
          
          faceMesh.setOptions({
            maxNumFaces: 4, // 最大4つの顔を検出
            refineLandmarks: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
          })

          faceMesh.onResults((results: any) => {
            console.log('FaceMesh onResults called')
            onFaceResults(results)
          })
          faceMeshRef.current = faceMesh
          console.log('FaceMesh initialized successfully')
        } else {
          console.error('window.FaceMesh is not available')
        }

        // Initialize Hands with error handling
        if (window.Hands) {
          try {
            console.log('Creating Hands instance...')
            const hands = new window.Hands({
              locateFile: (file: string) => {
                const url = `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
                console.log('Hands loading file:', url)
                return url
              }
            })
            
            // 複数の手を検出する設定
            hands.setOptions({
              maxNumHands: 4, // 最大4つの手を検出（複数人対応）
              modelComplexity: 0, // 軽量モデルで安定性重視
              minDetectionConfidence: 0.5,
              minTrackingConfidence: 0.5
            })

            hands.onResults((results: any) => {
              console.log('Hands onResults called with:', results)
              onHandsResults(results)
            })
            
            handsRef.current = hands
            console.log('Hands initialized successfully')
            
            // 初期化後の遅延テスト
            setTimeout(() => {
              console.log('Hands ready for processing')
            }, 2000)
            
          } catch (handError) {
            console.error('Hands initialization failed:', handError)
            // 手検出を無効化
            setDetectionState(prev => ({ ...prev, hands: false }))
          }
        } else {
          console.error('window.Hands is not available')
        }

        console.log('MediaPipe initialization complete')

      } catch (err) {
        console.error('MediaPipe initialization error:', err)
        setError('MediaPipe の初期化に失敗しました: ' + (err instanceof Error ? err.message : '不明なエラー'))
      }
    }

    initializeMediaPipe()
  }, [mediaPipeLoaded])

  // Process frame for MediaPipe
  const processFrame = useCallback(async () => {
    if (!videoRef.current || !detectionState.isRunning) return

    try {
      // Process face detection ONLY if enabled
      if (faceMeshRef.current && detectionState.face) {
        await faceMeshRef.current.send({ image: videoRef.current })
      } else if (!detectionState.face) {
        // Clear face landmarks when face detection is disabled
        setLandmarkCount(prev => ({ ...prev, face: 0, faceCount: 0 }))
      }
      
      // Process hands detection ONLY if enabled
      if (handsRef.current && detectionState.hands) {
        await handsRef.current.send({ image: videoRef.current })
      } else if (!detectionState.hands) {
        // Clear hand landmarks when hand detection is disabled
        latestHandResults.current = null
        setLandmarkCount(prev => ({ ...prev, hands: 0, handCount: 0 }))
      }

      // If both detections are disabled, just show plain video
      if (!detectionState.face && !detectionState.hands && canvasRef.current) {
        const canvas = canvasRef.current
        const canvasCtx = canvas.getContext('2d')
        if (canvasCtx) {
          canvasCtx.clearRect(0, 0, canvas.width, canvas.height)
          canvasCtx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)
        }
      }
    } catch (err) {
      console.error('Frame processing error:', err)
    }

    // Continue animation loop
    if (detectionState.isRunning) {
      animationRef.current = requestAnimationFrame(processFrame)
    }
  }, [detectionState.isRunning, detectionState.face, detectionState.hands])

  const startCamera = async () => {
    try {
      setError(null)
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        }
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play()
            
            setDetectionState(prev => ({
              ...prev,
              hasCamera: true,
              hasPermission: true,
              isRunning: true
            }))

            console.log('Camera ready, starting frame processing...')
            // Start processing frames
            setTimeout(() => {
              console.log('Starting animation loop')
              processFrame()
            }, 100)
          }
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '不明なエラー'
      if (errorMessage.includes('Permission denied') || errorMessage.includes('NotAllowedError')) {
        setError('カメラのアクセス許可が必要です。ブラウザの設定を確認してください。')
      } else if (errorMessage.includes('NotFoundError')) {
        setError('カメラが見つかりません。カメラが接続されていることを確認してください。')
      } else {
        setError('カメラの起動に失敗しました: ' + errorMessage)
      }
      setDetectionState(prev => ({ ...prev, hasCamera: false, hasPermission: false }))
    }
  }

  const stopCamera = () => {
    // Stop animation frame
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    setDetectionState(prev => ({
      ...prev,
      isRunning: false
    }))

    // Clear canvas
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      }
    }
  }

  const toggleDetection = (type: 'face' | 'hands') => {
    setDetectionState(prev => ({
      ...prev,
      [type]: !prev[type]
    }))
  }

  const toggleCamera = () => {
    if (detectionState.isRunning) {
      stopCamera()
    } else {
      startCamera()
    }
  }

  // Update animation loop when detection state changes
  useEffect(() => {
    if (detectionState.isRunning && !animationRef.current) {
      console.log('Starting animation loop from useEffect')
      processFrame()
    } else if (!detectionState.isRunning && animationRef.current) {
      console.log('Stopping animation loop')
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
  }, [detectionState.isRunning, processFrame])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="relative py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <Link 
            href="/ai-playground" 
            className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>AI Playgroundに戻る</span>
          </Link>
          
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 mb-6">
              <Eye className="w-4 h-4 text-green-400" />
              <span className="text-sm text-green-300">MediaPipe ランドマーク検出</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-thin text-white mb-4 tracking-tight">
              リアルタイム検出
            </h1>
            
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-8 font-light">
              カメラを使って顔や手のランドマークをリアルタイムで検出・表示します
            </p>
          </div>
        </div>

        {/* Animated background */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-green-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Control Panel */}
          <div className="mb-8">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
              <div className="flex flex-wrap items-center justify-between gap-4">
                {/* Camera Control */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={toggleCamera}
                    disabled={!mediaPipeLoaded}
                    className={`inline-flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                      detectionState.isRunning
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white'
                    }`}
                  >
                    {detectionState.isRunning ? (
                      <>
                        <Square className="w-5 h-5" />
                        <span>停止</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5" />
                        <span>{mediaPipeLoaded ? '開始' : '読み込み中...'}</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      detectionState.isRunning ? 'bg-green-400 animate-pulse' : 'bg-gray-500'
                    }`}></div>
                    <span className="text-sm text-gray-400">
                      {detectionState.isRunning ? 'カメラ稼働中' : 'カメラ停止中'}
                    </span>
                  </div>
                </div>

                {/* Detection Controls */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-400">検出機能:</span>
                  </div>
                  
                  <button
                    onClick={() => toggleDetection('face')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      detectionState.face
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    顔検出
                  </button>

                  <button
                    onClick={() => toggleDetection('hands')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      detectionState.hands
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    手検出
                  </button>
                </div>
              </div>

              {/* Landmark Count Display */}
              {detectionState.isRunning && (
                <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-gray-700">
                  <div className="text-center">
                    <div className="text-2xl font-light text-blue-400">{landmarkCount.face}</div>
                    <div className="text-xs text-gray-400">顔ランドマーク</div>
                    <div className="text-xs text-gray-500">({landmarkCount.faceCount}個の顔)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-light text-green-400">{landmarkCount.hands}</div>
                    <div className="text-xs text-gray-400">手ランドマーク</div>
                    <div className="text-xs text-gray-500">({landmarkCount.handCount}個の手)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-light text-purple-400">{landmarkCount.face + landmarkCount.hands}</div>
                    <div className="text-xs text-gray-400">合計</div>
                    <div className="text-xs text-gray-500">({landmarkCount.faceCount + landmarkCount.handCount}個)</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-8">
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <p className="text-red-400">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Camera Feed */}
          <div className="relative">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
              <div className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden">
                <video
                  ref={videoRef}
                  className="absolute inset-0 w-full h-full object-cover"
                  autoPlay
                  playsInline
                  muted
                  style={{ transform: 'scaleX(-1)' }}
                />
                <canvas
                  ref={canvasRef}
                  width={1280}
                  height={720}
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ transform: 'scaleX(-1)' }}
                />
                
                {!detectionState.isRunning && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80">
                    <div className="text-center">
                      <Camera className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-xl font-thin text-white mb-2">カメラを開始してください</h3>
                      <p className="text-gray-400">
                        「開始」ボタンをクリックしてランドマーク検出を始めましょう
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Feature Info */}
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/20 text-blue-400 mb-4">
                  <Eye className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-light text-white mb-2">顔ランドマーク</h3>
                <p className="text-gray-400 text-sm">
                  468点の詳細な顔の特徴点を検出し、輪郭とメッシュを表示
                </p>
              </div>
            </div>

            <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500/20 text-green-400 mb-4">
                  <Settings className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-light text-white mb-2">手の検出</h3>
                <p className="text-gray-400 text-sm">
                  最大2つの手を検出し、21点のランドマークと接続線を表示
                </p>
              </div>
            </div>

            <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-500/20 text-purple-400 mb-4">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-light text-white mb-2">リアルタイム</h3>
                <p className="text-gray-400 text-sm">
                  MediaPipeの高性能な機械学習モデルで高速処理を実現
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}