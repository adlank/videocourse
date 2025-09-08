import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: 'URL required' }, { status: 400 })
    }

    console.log('Testing storage URL:', url)

    // Test the URL with a HEAD request
    const response = await fetch(url, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Video-Platform-Debug/1.0'
      }
    })

    const result = {
      url,
      status: response.status,
      statusText: response.statusText,
      accessible: response.ok,
      headers: {
        'content-type': response.headers.get('content-type'),
        'content-length': response.headers.get('content-length'),
        'cache-control': response.headers.get('cache-control'),
        'access-control-allow-origin': response.headers.get('access-control-allow-origin')
      },
      timestamp: new Date().toISOString()
    }

    console.log('Storage URL test result:', result)

    return NextResponse.json(result)

  } catch (error) {
    console.error('Storage URL test error:', error)
    return NextResponse.json({ 
      error: 'Failed to test URL',
      details: error instanceof Error ? error.message : 'Unknown error',
      accessible: false
    }, { status: 500 })
  }
}
