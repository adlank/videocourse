import { createClient } from './client'

export async function setupStorageBuckets() {
  const supabase = createClient()
  
  try {
    // Überprüfen ob Buckets bereits existieren
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      console.error('Error listing buckets:', listError)
      return false
    }

    const existingBuckets = buckets?.map(bucket => bucket.name) || []
    
    // Videos Bucket erstellen falls nicht vorhanden
    if (!existingBuckets.includes('videos')) {
      const { data: videosBucket, error: videosError } = await supabase.storage.createBucket('videos', {
        public: false, // Private für Premium-Inhalte
        allowedMimeTypes: [
          'video/mp4',
          'video/mov',
          'video/avi',
          'video/mkv',
          'video/webm',
          'video/quicktime'
        ],
        fileSizeLimit: 2147483648 // 2GB in bytes
      })
      
      if (videosError) {
        console.error('Error creating videos bucket:', videosError)
        return false
      }
      
      console.log('Videos bucket created successfully')
    } else {
      console.log('Videos bucket already exists')
    }

    // Thumbnails Bucket erstellen falls nicht vorhanden  
    if (!existingBuckets.includes('thumbnails')) {
      const { data: thumbnailsBucket, error: thumbnailsError } = await supabase.storage.createBucket('thumbnails', {
        public: true, // Öffentlich für Kurs-Thumbnails
        allowedMimeTypes: [
          'image/jpeg',
          'image/jpg', 
          'image/png',
          'image/webp',
          'image/gif'
        ],
        fileSizeLimit: 5242880 // 5MB in bytes
      })
      
      if (thumbnailsError) {
        console.error('Error creating thumbnails bucket:', thumbnailsError)
        return false
      }
      
      console.log('Thumbnails bucket created successfully')
    } else {
      console.log('Thumbnails bucket already exists')
    }

    return true
  } catch (error) {
    console.error('Error setting up storage buckets:', error)
    return false
  }
}

export async function checkStorageAccess() {
  const supabase = createClient()
  
  try {
    // Test Upload zu videos bucket
    const testVideoFile = new Blob(['test'], { type: 'video/mp4' })
    const { data: videoUpload, error: videoError } = await supabase.storage
      .from('videos')
      .upload('test-video.mp4', testVideoFile)
    
    if (videoError) {
      console.error('Videos bucket access error:', videoError)
      return { videos: false, thumbnails: false, error: videoError.message }
    }

    // Test Upload zu thumbnails bucket
    const testImageFile = new Blob(['test'], { type: 'image/jpeg' })
    const { data: imageUpload, error: imageError } = await supabase.storage
      .from('thumbnails')
      .upload('test-image.jpg', testImageFile)
    
    if (imageError) {
      console.error('Thumbnails bucket access error:', imageError)
      return { videos: true, thumbnails: false, error: imageError.message }
    }

    // Test-Dateien wieder löschen
    await supabase.storage.from('videos').remove(['test-video.mp4'])
    await supabase.storage.from('thumbnails').remove(['test-image.jpg'])

    return { videos: true, thumbnails: true, error: null }
  } catch (error: any) {
    return { videos: false, thumbnails: false, error: error.message }
  }
}
