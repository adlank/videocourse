'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Upload,
  X,
  File,
  Image as ImageIcon,
  Video,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react'

interface FileUploadProps {
  bucket: 'videos' | 'thumbnails'
  accept: string
  maxSize: number // in MB
  onUploadComplete: (url: string, fileName: string) => void
  onUploadError?: (error: string) => void
  existingFile?: string
  className?: string
  label?: string
  description?: string
}

export function FileUpload({
  bucket,
  accept,
  maxSize,
  onUploadComplete,
  onUploadError,
  existingFile,
  className = '',
  label,
  description
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadedFile, setUploadedFile] = useState<string | null>(existingFile || null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const validateFile = (file: File): string | null => {
    // Überprüfe ob File-Objekt gültig ist
    if (!file || !file.name) {
      return 'Ungültige Datei'
    }

    // Dateigröße prüfen
    if (file.size > maxSize * 1024 * 1024) {
      return `Datei ist zu groß. Maximum: ${maxSize}MB`
    }

    // Dateityp prüfen
    const acceptedTypes = accept.split(',').map(type => type.trim())
    const isValidType = acceptedTypes.some(type => {
      if (type.startsWith('.')) {
        return file.name?.toLowerCase().endsWith(type.toLowerCase()) || false
      } else if (type.includes('/*')) {
        const [mainType] = type.split('/')
        return file.type?.startsWith(mainType) || false
      } else {
        return file.type === type
      }
    })

    if (!isValidType) {
      return `Ungültiger Dateityp. Erlaubt: ${accept}`
    }

    return null
  }

  const uploadFile = async (file: File) => {
    setUploading(true)
    setError(null)
    setUploadProgress(0)

    try {
      // Datei validieren
      const validationError = validateFile(file)
      if (validationError) {
        throw new Error(validationError)
      }

      // Eindeutigen Dateinamen generieren
      const timestamp = Date.now()
      const randomString = Math.random().toString(36).substring(2, 15)
      const fileExtension = file.name?.split('.').pop() || 'bin'
      const fileName = `${timestamp}_${randomString}.${fileExtension}`

      // Upload zu Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        throw new Error(uploadError.message)
      }

      // Öffentliche URL abrufen
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName)

      const publicUrl = urlData.publicUrl
      
      setUploadedFile(publicUrl)
      setUploadProgress(100)
      onUploadComplete(publicUrl, fileName)

    } catch (err: any) {
      let errorMessage = err.message || 'Fehler beim Hochladen'
      
      // Spezielle Behandlung für häufige Fehler
      if (errorMessage.includes('bucket') && errorMessage.includes('not found')) {
        errorMessage = `Storage Bucket "${bucket}" nicht gefunden. Bitte erstellen Sie zuerst die Storage Buckets in den Einstellungen.`
      } else if (errorMessage.includes('permission')) {
        errorMessage = 'Keine Berechtigung zum Hochladen. Bitte als Admin einloggen.'
      } else if (errorMessage.includes('size')) {
        errorMessage = 'Datei ist zu groß für den Upload.'
      }
      
      setError(errorMessage)
      if (onUploadError) {
        onUploadError(errorMessage)
      }
    } finally {
      setUploading(false)
    }
  }

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return

    const file = files[0]
    uploadFile(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }

  const removeFile = async () => {
    if (uploadedFile && !existingFile) {
      try {
        // Dateiname aus URL extrahieren
        const url = new URL(uploadedFile)
        const fileName = url.pathname.split('/').pop()
        
        if (fileName) {
          await supabase.storage
            .from(bucket)
            .remove([fileName])
        }
      } catch (err) {
        console.error('Error removing file:', err)
      }
    }
    
    setUploadedFile(null)
    setError(null)
    setUploadProgress(0)
  }

  const getFileIcon = () => {
    if (bucket === 'videos') {
      return <Video className="h-8 w-8 text-blue-500" />
    } else {
      return <ImageIcon className="h-8 w-8 text-green-500" />
    }
  }

  const getFilePreview = () => {
    if (!uploadedFile) return null

    if (bucket === 'thumbnails') {
      return (
        <div className="relative">
          <img
            src={uploadedFile}
            alt="Uploaded thumbnail"
            className="w-full h-32 object-cover rounded-md"
          />
          <Button
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={removeFile}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )
    } else {
      return (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
          <div className="flex items-center space-x-2">
            <Video className="h-5 w-5 text-blue-500" />
            <span className="text-sm font-medium truncate">Video hochgeladen</span>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={removeFile}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  }

  if (uploadedFile) {
    return (
      <div className={className}>
        {label && <label className="block text-sm font-medium mb-2">{label}</label>}
        {getFilePreview()}
      </div>
    )
  }

  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium mb-2">{label}</label>}
      
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${uploading ? 'pointer-events-none opacity-60' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          disabled={uploading}
        />

        {uploading ? (
          <div className="space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
            <div>
              <p className="text-sm font-medium">Wird hochgeladen...</p>
              <Progress value={uploadProgress} className="mt-2" />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {getFileIcon()}
            <div>
              <p className="text-sm font-medium">
                Klicken Sie hier oder ziehen Sie eine Datei hierher
              </p>
              {description && (
                <p className="text-xs text-gray-500 mt-1">{description}</p>
              )}
              <p className="text-xs text-gray-400 mt-2">
                Erlaubte Formate: {accept} • Max. {maxSize}MB
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <Alert variant="destructive" className="mt-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <p className="font-medium mb-1">Upload-Fehler:</p>
            <p>{error}</p>
            {error.includes('Storage Bucket') && (
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-blue-700">
                <p className="font-medium text-xs">💡 Lösung:</p>
                <ol className="text-xs mt-1 space-y-1">
                  <li>1. Gehen Sie zu Einstellungen → Storage</li>
                  <li>2. Klicken Sie "Buckets einrichten"</li>
                  <li>3. Oder erstellen Sie die Buckets manuell im Supabase Dashboard</li>
                </ol>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
