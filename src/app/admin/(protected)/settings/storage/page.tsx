'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { setupStorageBuckets, checkStorageAccess } from '@/lib/supabase/storage-setup'
import {
  HardDrive,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Database,
  Image,
  Video,
  Settings,
  Info
} from 'lucide-react'

interface StorageStatus {
  videos: boolean
  thumbnails: boolean
  error: string | null
}

export default function StorageSettingsPage() {
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(false)
  const [storageStatus, setStorageStatus] = useState<StorageStatus>({
    videos: false,
    thumbnails: false,
    error: null
  })
  const [message, setMessage] = useState<string | null>(null)
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')

  useEffect(() => {
    checkStatus()
  }, [])

  const checkStatus = async () => {
    setChecking(true)
    try {
      const status = await checkStorageAccess()
      setStorageStatus(status)
    } catch (error: any) {
      setStorageStatus({
        videos: false,
        thumbnails: false,
        error: error.message
      })
    } finally {
      setChecking(false)
    }
  }

  const handleSetupBuckets = async () => {
    setLoading(true)
    setMessage(null)
    
    try {
      const success = await setupStorageBuckets()
      
      if (success) {
        setMessage('Storage Buckets erfolgreich eingerichtet!')
        setMessageType('success')
        // Status nach Setup erneut prüfen
        await checkStatus()
      } else {
        setMessage('Fehler beim Einrichten der Storage Buckets. Überprüfen Sie die Konsole für Details.')
        setMessageType('error')
      }
    } catch (error: any) {
      setMessage(`Fehler: ${error.message}`)
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: boolean, label: string) => {
    if (status) {
      return (
        <Badge className="bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          {label} OK
        </Badge>
      )
    } else {
      return (
        <Badge className="bg-red-100 text-red-800">
          <XCircle className="w-3 h-3 mr-1" />
          {label} Fehler
        </Badge>
      )
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Storage Einstellungen</h1>
          <p className="text-gray-600 mt-2">
            Konfiguration der Supabase Storage Buckets für Video- und Bild-Uploads
          </p>
        </div>
        <Button
          variant="outline"
          onClick={checkStatus}
          disabled={checking}
        >
          {checking ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Status prüfen
        </Button>
      </div>

      {message && (
        <Alert className={messageType === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          {messageType === 'success' ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription className={messageType === 'success' ? 'text-green-800' : 'text-red-800'}>
            {message}
          </AlertDescription>
        </Alert>
      )}

      {storageStatus.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{storageStatus.error}</AlertDescription>
        </Alert>
      )}

      {/* Status Übersicht */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Video className="mr-2 h-5 w-5 text-blue-600" />
              Videos Bucket
            </CardTitle>
            <CardDescription>
              Storage für Kurs-Videos und Lektionen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status:</span>
                {getStatusBadge(storageStatus.videos, 'Videos')}
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <div>• Maximale Dateigröße: 2GB</div>
                <div>• Erlaubte Formate: MP4, MOV, AVI, MKV, WebM</div>
                <div>• Zugriff: Privat (nur für Mitglieder)</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Image className="mr-2 h-5 w-5 text-green-600" />
              Thumbnails Bucket
            </CardTitle>
            <CardDescription>
              Storage für Kurs-Thumbnails und Bilder
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status:</span>
                {getStatusBadge(storageStatus.thumbnails, 'Thumbnails')}
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <div>• Maximale Dateigröße: 5MB</div>
                <div>• Erlaubte Formate: JPG, PNG, WebP, GIF</div>
                <div>• Zugriff: Öffentlich</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Setup Bereich */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="mr-2 h-5 w-5" />
            Storage Setup
          </CardTitle>
          <CardDescription>
            Buckets automatisch erstellen und konfigurieren
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Diese Funktion erstellt automatisch die benötigten Storage Buckets in Supabase.
                Stellen Sie sicher, dass Sie Admin-Rechte haben.
              </AlertDescription>
            </Alert>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Buckets erstellen</h4>
                <p className="text-sm text-gray-600">
                  Erstellt die Buckets "videos" und "thumbnails" mit den korrekten Einstellungen
                </p>
              </div>
              <Button
                onClick={handleSetupBuckets}
                disabled={loading || (storageStatus.videos && storageStatus.thumbnails)}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Einrichten...
                  </>
                ) : (
                  <>
                    <Database className="mr-2 h-4 w-4" />
                    Buckets einrichten
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Anleitung */}
      <Card>
        <CardHeader>
          <CardTitle>Manuelle Einrichtung</CardTitle>
          <CardDescription>
            Falls die automatische Einrichtung nicht funktioniert
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">1. Supabase Dashboard öffnen:</h4>
              <p className="text-gray-600 mb-2">
                Gehen Sie zu Ihrem Supabase Projekt → Storage
              </p>
            </div>

            <div>
              <h4 className="font-medium mb-2">2. Videos Bucket erstellen:</h4>
              <ul className="text-gray-600 space-y-1 ml-4">
                <li>• Name: <code className="bg-gray-100 px-1 rounded">videos</code></li>
                <li>• Public: <strong>Nein</strong> (privat)</li>
                <li>• File size limit: <strong>2GB</strong></li>
                <li>• MIME types: video/mp4, video/mov, video/avi, video/mkv</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">3. Thumbnails Bucket erstellen:</h4>
              <ul className="text-gray-600 space-y-1 ml-4">
                <li>• Name: <code className="bg-gray-100 px-1 rounded">thumbnails</code></li>
                <li>• Public: <strong>Ja</strong> (öffentlich)</li>
                <li>• File size limit: <strong>5MB</strong></li>
                <li>• MIME types: image/jpeg, image/png, image/webp</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">4. RLS Policies:</h4>
              <p className="text-gray-600">
                Führen Sie das SQL-Script <code className="bg-gray-100 px-1 rounded">setup-storage.sql</code> aus,
                um die Row Level Security Policies zu aktivieren.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
