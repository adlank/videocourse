'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Upload, 
  Video, 
  X, 
  CheckCircle, 
  AlertCircle,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface VideoUploadProps {
  onUploadComplete?: (videoUrl: string, fileName: string, fileSize: number) => void
  onUploadError?: (error: string) => void
  maxSizeGB?: number
  acceptedFormats?: string[]
  className?: string
}

interface UploadState {
  status: 'idle' | 'uploading' | 'success' | 'error'
  progress: number
  error?: string
  fileName?: string
  fileSize?: number
  videoUrl?: string
}

export function VideoUpload({ 
  onUploadComplete,
  onUploadError,
  maxSizeGB = 2,
  acceptedFormats = ['mp4', 'mov', 'avi', 'mkv'],
  className = ''
}: VideoUploadProps) {
  const [uploadState, setUploadState] = useState<UploadState>({
    status: 'idle',
    progress: 0
  })
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const supabase = createClient()

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const validateFile = (file: File): string | null => {
    // Dateigröße prüfen
    const maxSizeBytes = maxSizeGB * 1024 * 1024 * 1024
    if (file.size > maxSizeBytes) {
      return `Datei ist zu groß. Maximum: ${maxSizeGB}GB`
    }

    // Dateiformat prüfen
    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    if (!fileExtension || !acceptedFormats.includes(fileExtension)) {
      return `Nicht unterstütztes Format. Erlaubt: ${acceptedFormats.join(', ')}`
    }

    return null
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validierung
    const validationError = validateFile(file)
    if (validationError) {
      setUploadState({
        status: 'error',
        progress: 0,
        error: validationError
      })
      onUploadError?.(validationError)
      return
    }

    // Preview erstellen
    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)

    // Upload starten
    await uploadVideo(file)
  }

  const uploadVideo = async (file: File) => {
    setUploadState({
      status: 'uploading',
      progress: 0,
      fileName: file.name,
      fileSize: file.size
    })

    try {
      // Eindeutigen Dateinamen generieren
      const timestamp = Date.now()
      const fileExtension = file.name.split('.').pop()
      const fileName = `video_${timestamp}.${fileExtension}`
      const filePath = `course-videos/${fileName}`

      // Upload zu Supabase Storage
      const { data, error } = await supabase.storage
        .from('videos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          onUploadProgress: (progress) => {
            const percentage = (progress.loaded / progress.total) * 100
            setUploadState(prev => ({
              ...prev,
              progress: Math.round(percentage)
            }))
          }
        })

      if (error) {
        throw new Error(`Upload-Fehler: ${error.message}`)
      }

      // Öffentliche URL generieren
      const { data: { publicUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(filePath)

      setUploadState({
        status: 'success',
        progress: 100,
        fileName: file.name,
        fileSize: file.size,
        videoUrl: publicUrl
      })

      onUploadComplete?.(publicUrl, file.name, file.size)

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler beim Upload'
      setUploadState({
        status: 'error',
        progress: 0,
        error: errorMessage,
        fileName: file.name,
        fileSize: file.size
      })
      onUploadError?.(errorMessage)
    }
  }

  const resetUpload = () => {
    setUploadState({
      status: 'idle',
      progress: 0
    })
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const triggerFileSelect = () => {
    fileInputRef.current?.click()
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Video className="mr-2 h-5 w-5" />
          Video hochladen
        </CardTitle>
        <CardDescription>
          Unterstützte Formate: {acceptedFormats.join(', ')} | Max. Größe: {maxSizeGB}GB
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFormats.map(format => `.${format}`).join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Upload Area */}
        {uploadState.status === 'idle' && (
          <div 
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
            onClick={triggerFileSelect}
          >
            <Video className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Video auswählen
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Klicken Sie hier oder ziehen Sie eine Videodatei hierher
            </p>
            <Button variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Datei auswählen
            </Button>
          </div>
        )}

        {/* Upload Progress */}
        {uploadState.status === 'uploading' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Video className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">{uploadState.fileName}</p>
                  <p className="text-sm text-gray-500">
                    {uploadState.fileSize && formatFileSize(uploadState.fileSize)}
                  </p>
                </div>
              </div>
              <div className="text-sm font-medium">{uploadState.progress}%</div>
            </div>
            <Progress value={uploadState.progress} className="w-full" />
            <p className="text-sm text-gray-600 text-center">
              Video wird hochgeladen... Bitte nicht die Seite verlassen.
            </p>
          </div>
        )}

        {/* Upload Success */}
        {uploadState.status === 'success' && (
          <div className="space-y-4">
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Video erfolgreich hochgeladen! ({uploadState.fileName})
              </AlertDescription>
            </Alert>
            
            {previewUrl && (
              <div className="space-y-2">
                <h4 className="font-medium">Vorschau:</h4>
                <video
                  ref={videoRef}
                  src={previewUrl}
                  controls
                  className="w-full max-h-64 rounded-lg"
                  onLoadedMetadata={() => {
                    if (videoRef.current) {
                      console.log('Video Dauer:', videoRef.current.duration, 'Sekunden')
                    }
                  }}
                />
              </div>
            )}

            <div className="flex space-x-2">
              <Button variant="outline" onClick={resetUpload}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Neues Video
              </Button>
            </div>
          </div>
        )}

        {/* Upload Error */}
        {uploadState.status === 'error' && (
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {uploadState.error}
              </AlertDescription>
            </Alert>
            
            <div className="flex space-x-2">
              <Button variant="outline" onClick={resetUpload}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Erneut versuchen
              </Button>
            </div>
          </div>
        )}

        {/* Preview (auch bei Error anzeigen falls vorhanden) */}
        {previewUrl && uploadState.status === 'error' && (
          <div className="space-y-2">
            <h4 className="font-medium">Datei-Vorschau:</h4>
            <video
              src={previewUrl}
              controls
              className="w-full max-h-64 rounded-lg opacity-50"
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
