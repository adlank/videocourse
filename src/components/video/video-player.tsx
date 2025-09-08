'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize,
  SkipBack,
  SkipForward,
  Settings,
  Bookmark,
  Clock,
  AlertCircle
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface VideoPlayerProps {
  lessonId: string
  courseId: string
  videoUrl: string
  thumbnailUrl?: string
  title: string
  duration?: number
  onProgress?: (progress: number) => void
  onComplete?: () => void
  startTime?: number
}

interface VideoProgress {
  currentTime: number
  duration: number
  percentage: number
  lastSaved: number
}

interface Bookmark {
  id: string
  time: number
  title: string
  created_at: string
}

export default function VideoPlayer({ 
  lessonId,
  courseId,
  videoUrl, 
  thumbnailUrl, 
  title,
  duration = 0,
  onProgress,
  onComplete,
  startTime = 0
}: VideoPlayerProps) {
  const [playing, setPlaying] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showControls, setShowControls] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [volume, setVolume] = useState(1)
  const [muted, setMuted] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [progress, setProgress] = useState<VideoProgress>({
    currentTime: startTime,
    duration: duration || 0,
    percentage: 0,
    lastSaved: 0
  })
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [showBookmarks, setShowBookmarks] = useState(false)
  const [watchTime, setWatchTime] = useState(0)
  const [completed, setCompleted] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const controlsTimeoutRef = useRef<NodeJS.Timeout>()
  const progressSaveTimeoutRef = useRef<NodeJS.Timeout>()
  const supabase = createClient()

  // Load initial data
  useEffect(() => {
    if (lessonId && courseId) {
      console.log('VideoPlayer: Initializing with:', {
        lessonId,
        courseId,
        videoUrl,
        hasVideoUrl: !!videoUrl,
        hasThumbUrl: !!thumbnailUrl
      })
      
      loadProgressAndBookmarks()
    }
  }, [lessonId, courseId])

  // Auto-hide controls
  useEffect(() => {
    const resetControlsTimeout = () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
      if (playing) {
        controlsTimeoutRef.current = setTimeout(() => {
          setShowControls(false)
        }, 3000)
      }
    }

    resetControlsTimeout()
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
    }
  }, [playing, showControls])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      switch (e.key) {
        case ' ':
          e.preventDefault()
          togglePlay()
          break
        case 'ArrowLeft':
          e.preventDefault()
          seekTo(Math.max(0, progress.currentTime - 10))
          break
        case 'ArrowRight':
          e.preventDefault()
          seekTo(progress.currentTime + 10)
          break
        case 'ArrowUp':
          e.preventDefault()
          setVolume(prev => Math.min(1, prev + 0.1))
          break
        case 'ArrowDown':
          e.preventDefault()
          setVolume(prev => Math.max(0, prev - 0.1))
          break
        case 'f':
          e.preventDefault()
          toggleFullscreen()
          break
        case 'm':
          e.preventDefault()
          setMuted(prev => !prev)
          break
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [progress.currentTime])

  const loadProgressAndBookmarks = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Load user progress
      const { data: progressData } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('lesson_id', lessonId)
        .single()

      if (progressData) {
        setProgress(prev => ({
          ...prev,
          currentTime: progressData.current_time_seconds || 0,
          percentage: progressData.progress_percentage || 0,
          lastSaved: progressData.current_time_seconds || 0
        }))
        setWatchTime(progressData.total_watch_time || 0)
        setCompleted(progressData.completed || false)
      }

      // Load bookmarks
      const { data: bookmarksData } = await supabase
        .from('lesson_bookmarks')
        .select('*')
        .eq('user_id', user.id)
        .eq('lesson_id', lessonId)
        .order('time_seconds')

      if (bookmarksData) {
        setBookmarks(bookmarksData.map(b => ({
          id: b.id,
          time: b.time_seconds,
          title: b.title || `${Math.floor(b.time_seconds / 60)}:${String(Math.floor(b.time_seconds % 60)).padStart(2, '0')}`,
          created_at: b.created_at
        })))
      }

    } catch (err) {
      console.error('Error loading progress and bookmarks:', err)
    } finally {
      setLoading(false)
    }
  }

  const saveProgress = useCallback(async (currentTime: number, percentage: number, completed = false) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      await supabase
        .from('user_progress')
        .upsert({
          user_id: user.id,
          course_id: courseId,
          lesson_id: lessonId,
          current_time_seconds: currentTime,
          progress_percentage: percentage,
          total_watch_time: watchTime,
          completed,
          last_accessed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      onProgress?.(percentage)
      
      if (completed) {
        onComplete?.()
      }
    } catch (err) {
      console.error('Error saving progress:', err)
    }
  }, [courseId, lessonId, watchTime, onProgress, onComplete])

  const addBookmark = async (time: number, title?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const bookmarkTitle = title || `${Math.floor(time / 60)}:${String(Math.floor(time % 60)).padStart(2, '0')}`
      
      const { data } = await supabase
        .from('lesson_bookmarks')
        .insert({
          user_id: user.id,
          lesson_id: lessonId,
          time_seconds: Math.floor(time),
          title: bookmarkTitle
        })
        .select()
        .single()

      if (data) {
        setBookmarks(prev => [...prev, {
          id: data.id,
          time: data.time_seconds,
          title: data.title,
          created_at: data.created_at
        }].sort((a, b) => a.time - b.time))
      }
    } catch (err) {
      console.error('Error adding bookmark:', err)
    }
  }

  const handleLoadedMetadata = () => {
    console.log('VideoPlayer: Video metadata loaded')
    if (videoRef.current) {
      const duration = videoRef.current.duration
      setProgress(prev => ({ ...prev, duration }))
      setLoading(false)
      setError(null)
      
      // Seek to saved position
      if (progress.currentTime > 0) {
        videoRef.current.currentTime = progress.currentTime
      }
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime
      const duration = videoRef.current.duration
      const percentage = (time / duration) * 100
      
      setProgress(prev => ({
        ...prev,
        currentTime: time,
        percentage
      }))
      
      // Save progress every 30 seconds
      if (Math.abs(time - progress.lastSaved) >= 30) {
        if (progressSaveTimeoutRef.current) {
          clearTimeout(progressSaveTimeoutRef.current)
        }
        
        progressSaveTimeoutRef.current = setTimeout(() => {
          saveProgress(time, percentage)
          setProgress(prev => ({ ...prev, lastSaved: time }))
        }, 1000)
      }
    }
  }

  const handleEnded = () => {
    setPlaying(false)
    setCompleted(true)
    saveProgress(progress.duration, 100, true)
  }

  const handleError = (e: any) => {
    console.error('VideoPlayer: Video error:', e)
    setError(`Video-Fehler: ${e.target?.error?.message || 'Unbekannter Fehler'}`)
    setLoading(false)
  }

  const togglePlay = async () => {
    if (!videoRef.current) return

    try {
      if (playing) {
        videoRef.current.pause()
        setPlaying(false)
      } else {
        await videoRef.current.play()
        setPlaying(true)
      }
    } catch (err) {
      console.error('VideoPlayer: Play failed:', err)
      setError(`Wiedergabe fehlgeschlagen: ${err}`)
    }
  }

  const seekTo = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = seconds
      setProgress(prev => ({ ...prev, currentTime: seconds }))
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !muted
      setMuted(!muted)
    }
  }

  const handleVolumeChange = (newVolume: number) => {
    if (videoRef.current) {
      videoRef.current.volume = newVolume
      setVolume(newVolume)
      if (newVolume === 0) {
        setMuted(true)
      } else if (muted) {
        setMuted(false)
      }
    }
  }

  const handlePlaybackRateChange = (rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate
      setPlaybackRate(rate)
    }
  }

  const toggleFullscreen = async () => {
    if (!containerRef.current) return

    try {
      if (!isFullscreen) {
        await containerRef.current.requestFullscreen()
        setIsFullscreen(true)
      } else {
        await document.exitFullscreen()
        setIsFullscreen(false)
      }
    } catch (err) {
      console.error('Fullscreen failed:', err)
    }
  }

  const formatTime = (seconds: number) => {
    if (!seconds || seconds < 0) return "0:00"
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!videoUrl) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Keine Video-URL verfügbar. Bitte laden Sie ein Video für diese Lektion hoch.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div 
          ref={containerRef}
          className="relative aspect-video bg-black rounded-t-lg overflow-hidden group"
          onMouseMove={() => setShowControls(true)}
          onMouseLeave={() => playing && setShowControls(false)}
        >
          <video
            ref={videoRef}
            className="w-full h-full object-contain"
            poster={thumbnailUrl}
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
            onError={handleError}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            preload="metadata"
            playsInline
            crossOrigin="anonymous"
          >
            <source src={videoUrl} type="video/mp4" />
            <source src={videoUrl} type="video/webm" />
            <source src={videoUrl} type="video/mov" />
            Ihr Browser unterstützt das Video-Element nicht.
          </video>

          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-white">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent mx-auto mb-2" />
                <div>Video wird geladen...</div>
                <div className="text-xs mt-2 opacity-75">
                  Professional Video Player
                </div>
              </div>
            </div>
          )}

          {/* Custom Controls Overlay */}
          <div className={`absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}>
            
            {/* Center Play/Pause Button - Only show when not playing or loading */}
            {(!playing || loading) && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Button
                  variant="ghost"
                  size="lg"
                  className="h-20 w-20 rounded-full bg-black/60 hover:bg-black/80 text-white disabled:opacity-50 transition-all duration-200 shadow-lg"
                  onClick={togglePlay}
                  disabled={loading}
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-10 w-10 border-3 border-white border-t-transparent" />
                  ) : (
                    <Play className="h-10 w-10 ml-1" fill="white" />
                  )}
                </Button>
              </div>
            )}

            {/* Bottom Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              {/* Progress Bar */}
              <div className="mb-4">
                <Progress 
                  value={progress.percentage} 
                  className="h-2 cursor-pointer"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect()
                    const clickX = e.clientX - rect.left
                    const percentage = clickX / rect.width
                    const seekTime = percentage * progress.duration
                    seekTo(seekTime)
                  }}
                />
                
                {/* Bookmarks on progress bar */}
                <div className="relative -mt-2">
                  {bookmarks.map((bookmark) => (
                    <div
                      key={bookmark.id}
                      className="absolute w-2 h-2 bg-yellow-400 rounded-full transform -translate-x-1 cursor-pointer"
                      style={{ left: `${(bookmark.time / progress.duration) * 100}%` }}
                      title={bookmark.title}
                      onClick={() => seekTo(bookmark.time)}
                    />
                  ))}
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20"
                    onClick={() => seekTo(Math.max(0, progress.currentTime - 10))}
                  >
                    <SkipBack className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20 disabled:opacity-50"
                    onClick={togglePlay}
                    disabled={loading}
                  >
                    {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20"
                    onClick={() => seekTo(progress.currentTime + 10)}
                  >
                    <SkipForward className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20"
                    onClick={toggleMute}
                  >
                    {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>

                  <div className="w-20">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={muted ? 0 : volume}
                      onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                      className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div className="text-sm">
                    {formatTime(progress.currentTime)} / {formatTime(progress.duration)}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20"
                    onClick={() => addBookmark(progress.currentTime)}
                  >
                    <Bookmark className="h-4 w-4" />
                  </Button>

                  <select
                    value={playbackRate}
                    onChange={(e) => handlePlaybackRateChange(parseFloat(e.target.value))}
                    className="bg-black/50 text-white text-sm rounded px-2 py-1"
                  >
                    <option value={0.5}>0.5x</option>
                    <option value={0.75}>0.75x</option>
                    <option value={1}>1x</option>
                    <option value={1.25}>1.25x</option>
                    <option value={1.5}>1.5x</option>
                    <option value={2}>2x</option>
                  </select>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20"
                    onClick={toggleFullscreen}
                  >
                    {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Video Info */}
        <div className="p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">{title}</h3>
              <div className="text-sm text-gray-500 mt-1">
                Professional Video Player | 
                Fortschritt: {Math.round(progress.percentage)}% | 
                Angeschaut: {formatTime(watchTime)}
                {completed && <span className="text-green-600 ml-2">✅ Abgeschlossen</span>}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {bookmarks.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowBookmarks(!showBookmarks)}
                >
                  <Bookmark className="h-4 w-4 mr-1" />
                  {bookmarks.length}
                </Button>
              )}
            </div>
          </div>

          {/* Bookmarks List */}
          {showBookmarks && bookmarks.length > 0 && (
            <div className="mt-4 border-t pt-4">
              <h4 className="font-medium text-sm text-gray-700 mb-2">Lesezeichen</h4>
              <div className="space-y-1">
                {bookmarks.map((bookmark) => (
                  <div
                    key={bookmark.id}
                    className="flex items-center justify-between p-2 bg-white rounded cursor-pointer hover:bg-gray-50"
                    onClick={() => seekTo(bookmark.time)}
                  >
                    <div className="flex items-center space-x-2">
                      <Clock className="h-3 w-3 text-gray-400" />
                      <span className="text-sm">{bookmark.title}</span>
                    </div>
                    <span className="text-xs text-gray-500">{formatTime(bookmark.time)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}