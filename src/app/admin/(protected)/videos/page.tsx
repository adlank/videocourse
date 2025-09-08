'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Search,
  Upload,
  Play,
  Trash2,
  Eye,
  Download,
  AlertCircle,
  Video,
  Clock,
  FileVideo,
  HardDrive
} from 'lucide-react'

interface VideoFile {
  id: string
  name: string
  size: number
  created_at: string
  updated_at: string
  metadata?: {
    duration?: number
    resolution?: string
    format?: string
  }
}

export default function VideosPage() {
  const supabase = createClient()
  
  const [videos, setVideos] = useState<VideoFile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadVideos()
  }, [])

  const loadVideos = async () => {
    try {
      setLoading(true)
      setError(null)

      // Videos aus Supabase Storage laden
      const { data: videoFiles, error: videosError } = await supabase.storage
        .from('videos')
        .list('', {
          limit: 100,
          offset: 0,
        })

      if (videosError) throw videosError

      const formattedVideos: VideoFile[] = videoFiles?.map(file => ({
        id: file.name,
        name: file.name,
        size: file.metadata?.size || 0,
        created_at: file.created_at || new Date().toISOString(),
        updated_at: file.updated_at || new Date().toISOString(),
        metadata: file.metadata
      })) || []

      setVideos(formattedVideos)
    } catch (err: any) {
      console.error('Error loading videos:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteVideo = async (videoName: string) => {
    if (!confirm('Sind Sie sicher, dass Sie dieses Video löschen möchten?')) {
      return
    }

    try {
      const { error } = await supabase.storage
        .from('videos')
        .remove([videoName])

      if (error) throw error

      setVideos(prev => prev.filter(v => v.name !== videoName))
    } catch (err: any) {
      setError(err.message)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const filteredVideos = videos.filter(video =>
    video.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalSize = videos.reduce((sum, video) => sum + video.size, 0)
  const totalDuration = videos.reduce((sum, video) => sum + (video.metadata?.duration || 0), 0)

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Videos</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <div className="aspect-video bg-gray-200 animate-pulse" />
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Videos</h1>
        <Button>
          <Upload className="mr-2 h-4 w-4" />
          Video hochladen
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Statistiken */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Videos gesamt</p>
                <p className="text-2xl font-bold">{videos.length}</p>
              </div>
              <Video className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Gesamtgröße</p>
                <p className="text-2xl font-bold">{formatFileSize(totalSize)}</p>
              </div>
              <HardDrive className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Gesamtdauer</p>
                <p className="text-2xl font-bold">{Math.round(totalDuration / 60)} Min</p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Durchschnitt</p>
                <p className="text-2xl font-bold">
                  {videos.length > 0 ? formatFileSize(totalSize / videos.length) : '0 MB'}
                </p>
              </div>
              <FileVideo className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Suchleiste */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Videos durchsuchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" onClick={loadVideos}>
          Aktualisieren
        </Button>
      </div>

      {/* Video-Liste */}
      {filteredVideos.length === 0 ? (
        <div className="text-center py-12">
          <Video className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            {searchTerm ? 'Keine Videos gefunden' : 'Noch keine Videos hochgeladen'}
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm 
              ? 'Versuche einen anderen Suchbegriff.' 
              : 'Lade dein erstes Video hoch, um loszulegen.'
            }
          </p>
          {!searchTerm && (
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Erstes Video hochladen
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video) => (
            <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-gray-900 flex items-center justify-center">
                <Play className="h-12 w-12 text-white opacity-80" />
              </div>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold truncate" title={video.name}>
                      {video.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(video.size)}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>
                      {new Date(video.created_at).toLocaleDateString('de-DE')}
                    </span>
                    {video.metadata?.duration && (
                      <Badge variant="outline">
                        {Math.round(video.metadata.duration / 60)} Min
                      </Badge>
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="sm" title="Vorschau">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" title="Herunterladen">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      title="Löschen"
                      onClick={() => handleDeleteVideo(video.name)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
