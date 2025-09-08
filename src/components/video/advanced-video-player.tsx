'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  RotateCcw, 
  RotateCw,
  Settings,
  Bookmark,
  MessageSquare,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

interface VideoPlayerProps {
  videoUrl: string
  lessonId: string
  courseId: string
  lessonTitle: string
  onProgress?: (watchTime: number, completed: boolean) => void
  onNext?: () => void
  onPrevious?: () => void
  hasNext?: boolean
  hasPrevious?: boolean
  autoplay?: boolean
  startTime?: number
}

interface VideoSettings {
  playbackRate: number
  quality: string
  autoplay: boolean
  showCaptions: boolean
}

export function AdvancedVideoPlayer({
  videoUrl,
  lessonId,
  courseId,
  lessonTitle,
  onProgress,
  onNext,
  onPrevious,
  hasNext = false,
  hasPrevious = false,
  autoplay = false,
  startTime = 0
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [isBuffering, setIsBuffering] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showBookmarks, setShowBookmarks] = useState(false)
  const [bookmarks, setBookmarks] = useState<Array<{id: string, time: number, note: string}>>([])
  
  const [settings, setSettings] = useState<VideoSettings>({
    playbackRate: 1,
    quality: 'auto',
    autoplay: false,
    showCaptions: false
  })
  
  const supabase = createClient()
  const progressUpdateInterval = useRef<NodeJS.Timeout | null>(null)
  const controlsTimeout = useRef<NodeJS.Timeout | null>(null)

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleLoadedMetadata = () => {
      setDuration(video.duration)
      if (startTime > 0) {
        video.currentTime = startTime
        setCurrentTime(startTime)
      }
      if (autoplay) {
        video.play()
        setIsPlaying(true)
      }
    }

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)
      
      // Update progress every 5 seconds
      if (Math.floor(video.currentTime) % 5 === 0) {
        updateProgress(video.currentTime, false)
      }
    }

    const handlePlay = () => {
      setIsPlaying(true)
      setIsBuffering(false)
      startProgressTracking()
    }

    const handlePause = () => {
      setIsPlaying(false)
      stopProgressTracking()
    }

    const handleWaiting = () => setIsBuffering(true)
    const handleCanPlay = () => setIsBuffering(false)

    const handleEnded = () => {
      setIsPlaying(false)
      updateProgress(video.duration, true)
      stopProgressTracking()
    }

    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('waiting', handleWaiting)
    video.addEventListener('canplay', handleCanPlay)
    video.addEventListener('ended', handleEnded)

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('waiting', handleWaiting)
      video.removeEventListener('canplay', handleCanPlay)
      video.removeEventListener('ended', handleEnded)
    }
  }, [videoUrl, autoplay, startTime])

  // Progress tracking
  const startProgressTracking = useCallback(() => {
    if (progressUpdateInterval.current) return
    
    progressUpdateInterval.current = setInterval(() => {
      const video = videoRef.current
      if (video && !video.paused) {
        updateProgress(video.currentTime, false)
      }
    }, 10000) // Update every 10 seconds
  }, [])

  const stopProgressTracking = useCallback(() => {
    if (progressUpdateInterval.current) {
      clearInterval(progressUpdateInterval.current)
      progressUpdateInterval.current = null
    }
  }, [])

  const updateProgress = useCallback(async (watchTime: number, completed: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      await supabase
        .from('user_progress')
        .upsert({
          user_id: user.id,
          lesson_id: lessonId,
          course_id: courseId,
          watch_time_seconds: Math.floor(watchTime),
          last_position_seconds: Math.floor(watchTime),
          completed,
          completed_at: completed ? new Date().toISOString() : null,
        })

      onProgress?.(watchTime, completed)
    } catch (error) {
      console.error('Error updating progress:', error)
    }
  }, [lessonId, courseId, onProgress, supabase])

  // Control handlers
  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
    } else {
      video.play()
    }
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current
    const progressBar = progressRef.current
    if (!video || !progressBar) return

    const rect = progressBar.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const newTime = (clickX / rect.width) * duration
    
    video.currentTime = newTime
    setCurrentTime(newTime)
  }

  const handleVolumeChange = (newVolume: number) => {
    const video = videoRef.current
    if (!video) return

    video.volume = newVolume
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return

    if (isMuted) {
      video.volume = volume
      setIsMuted(false)
    } else {
      video.volume = 0
      setIsMuted(true)
    }
  }

  const toggleFullscreen = () => {
    const container = containerRef.current
    if (!container) return

    if (!isFullscreen) {
      container.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const skip = (seconds: number) => {
    const video = videoRef.current
    if (!video) return

    video.currentTime = Math.max(0, Math.min(duration, video.currentTime + seconds))
  }

  const changePlaybackRate = (rate: number) => {
    const video = videoRef.current
    if (!video) return

    video.playbackRate = rate
    setSettings(prev => ({ ...prev, playbackRate: rate }))
  }

  const addBookmark = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const note = prompt('Notiz für das Lesezeichen (optional):') || ''
      
      const { data } = await supabase
        .from('user_bookmarks')
        .insert({
          user_id: user.id,
          lesson_id: lessonId,
          timestamp_seconds: Math.floor(currentTime),
          note
        })
        .select()
        .single()

      if (data) {
        setBookmarks(prev => [...prev, {
          id: data.id,
          time: data.timestamp_seconds,
          note: data.note || ''
        }])
      }
    } catch (error) {
      console.error('Error adding bookmark:', error)
    }
  }

  // Auto-hide controls
  useEffect(() => {
    const resetControlsTimeout = () => {
      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current)
      }
      
      setShowControls(true)
      
      if (isPlaying) {
        controlsTimeout.current = setTimeout(() => {
          setShowControls(false)
        }, 3000)
      }
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('mousemove', resetControlsTimeout)
      container.addEventListener('mouseenter', resetControlsTimeout)
      
      return () => {
        container.removeEventListener('mousemove', resetControlsTimeout)
        container.removeEventListener('mouseenter', resetControlsTimeout)
      }
    }
  }, [isPlaying])

  // Format time display
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div 
      ref={containerRef}
      className="relative bg-black rounded-lg overflow-hidden group"
    >
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full aspect-video"
        onClick={togglePlay}
        onDoubleClick={toggleFullscreen}
      />

      {/* Loading Spinner */}
      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      )}

      {/* Controls Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 transition-opacity duration-300 ${
        showControls ? 'opacity-100' : 'opacity-0'
      }`}>
        
        {/* Top Controls */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <h3 className="text-white font-medium text-lg">{lessonTitle}</h3>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
              onClick={addBookmark}
            >
              <Bookmark className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Center Play/Pause */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Button
            variant="ghost"
            size="lg"
            className="text-white hover:bg-white/20 w-16 h-16 rounded-full"
            onClick={togglePlay}
          >
            {isPlaying ? 
              <Pause className="h-8 w-8" /> : 
              <Play className="h-8 w-8 ml-1" />
            }
          </Button>
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          {/* Progress Bar */}
          <div 
            ref={progressRef}
            className="w-full h-2 bg-white/30 rounded-full cursor-pointer mb-4 group"
            onClick={handleSeek}
          >
            <div 
              className="h-full bg-blue-500 rounded-full relative"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            >
              <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Previous/Next */}
              {hasPrevious && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                  onClick={onPrevious}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              )}

              {/* Play/Pause */}
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
                onClick={togglePlay}
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>

              {hasNext && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                  onClick={onNext}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              )}

              {/* Skip buttons */}
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
                onClick={() => skip(-10)}
              >
                <RotateCcw className="h-4 w-4" />
                <span className="ml-1 text-xs">10s</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
                onClick={() => skip(10)}
              >
                <RotateCw className="h-4 w-4" />
                <span className="ml-1 text-xs">10s</span>
              </Button>

              {/* Volume */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                  onClick={toggleMute}
                >
                  {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </Button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-20 h-1 bg-white/30 rounded-lg appearance-none slider"
                />
              </div>

              {/* Time */}
              <div className="text-white text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Playback Speed */}
              <select
                value={settings.playbackRate}
                onChange={(e) => changePlaybackRate(parseFloat(e.target.value))}
                className="bg-transparent text-white text-sm border border-white/30 rounded px-2 py-1"
              >
                <option value="0.5" className="text-black">0.5x</option>
                <option value="0.75" className="text-black">0.75x</option>
                <option value="1" className="text-black">Normal</option>
                <option value="1.25" className="text-black">1.25x</option>
                <option value="1.5" className="text-black">1.5x</option>
                <option value="2" className="text-black">2x</option>
              </select>

              {/* Fullscreen */}
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
                onClick={toggleFullscreen}
              >
                {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute top-16 right-4 bg-black/90 text-white rounded-lg p-4 min-w-[200px]">
          <h4 className="font-medium mb-3">Video-Einstellungen</h4>
          <div className="space-y-3">
            <div>
              <label className="text-sm">Geschwindigkeit</label>
              <select
                value={settings.playbackRate}
                onChange={(e) => changePlaybackRate(parseFloat(e.target.value))}
                className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-sm mt-1"
              >
                <option value="0.5">0.5x</option>
                <option value="0.75">0.75x</option>
                <option value="1">Normal</option>
                <option value="1.25">1.25x</option>
                <option value="1.5">1.5x</option>
                <option value="2">2x</option>
              </select>
            </div>
            <div>
              <label className="text-sm">Qualität</label>
              <select
                value={settings.quality}
                onChange={(e) => setSettings(prev => ({ ...prev, quality: e.target.value }))}
                className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-sm mt-1"
              >
                <option value="auto">Auto</option>
                <option value="1080p">1080p</option>
                <option value="720p">720p</option>
                <option value="480p">480p</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
