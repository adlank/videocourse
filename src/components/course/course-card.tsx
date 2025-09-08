import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { formatDuration } from '@/lib/utils'

interface CourseCardProps {
  course: {
    id: string
    title: string
    description: string | null
    thumbnail_url: string | null
    level: 'beginner' | 'intermediate' | 'advanced'
    duration_minutes: number
    category?: {
      name: string
    }
  }
  progress?: number
  showProgress?: boolean
}

const levelLabels = {
  beginner: 'Anfänger',
  intermediate: 'Fortgeschritten',
  advanced: 'Experte'
}

const levelColors = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-yellow-100 text-yellow-800',
  advanced: 'bg-red-100 text-red-800'
}

export function CourseCard({ course, progress, showProgress = false }: CourseCardProps) {
  return (
    <Link href={`/courses/${course.id}`}>
      <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
        <div className="aspect-video relative overflow-hidden rounded-t-lg">
          {course.thumbnail_url ? (
            <img
              src={course.thumbnail_url}
              alt={course.title}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white text-lg font-semibold">
                {course.title.charAt(0)}
              </span>
            </div>
          )}
        </div>
        
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
            <Badge 
              variant="secondary" 
              className={`text-xs ${levelColors[course.level]} shrink-0`}
            >
              {levelLabels[course.level]}
            </Badge>
          </div>
          
          {course.description && (
            <CardDescription className="line-clamp-2">
              {course.description}
            </CardDescription>
          )}
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
            {course.category && (
              <span>{course.category.name}</span>
            )}
            <span>{formatDuration(course.duration_minutes * 60)}</span>
          </div>
          
          {showProgress && progress !== undefined && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Fortschritt</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}