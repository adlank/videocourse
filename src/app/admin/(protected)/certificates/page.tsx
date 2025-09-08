'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  Trophy,
  Download,
  Eye,
  Plus,
  Calendar,
  User,
  BookOpen,
  Award,
  FileText
} from 'lucide-react'

export default function CertificatesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')

  // Mock data - in der echten App würden diese aus der Datenbank kommen
  const certificates = [
    {
      id: '1',
      student_name: 'Max Mustermann',
      student_email: 'max@example.com',
      course_title: 'Grundlagen der Selbstverteidigung',
      certificate_type: 'completion',
      issued_date: '2024-01-15T10:30:00Z',
      grade: 'A',
      instructor: 'Krav Maga Expert',
      certificate_number: 'KMA-2024-001'
    },
    {
      id: '2',
      student_name: 'Anna Schmidt',
      student_email: 'anna@example.com',
      course_title: 'Fortgeschrittene Techniken',
      certificate_type: 'mastery',
      issued_date: '2024-01-10T15:45:00Z',
      grade: 'A+',
      instructor: 'Krav Maga Expert',
      certificate_number: 'KMA-2024-002'
    },
    {
      id: '3',
      student_name: 'Tom Weber',
      student_email: 'tom@example.com',
      course_title: 'Krav Maga für Fortgeschrittene',
      certificate_type: 'participation',
      issued_date: '2024-01-08T09:15:00Z',
      grade: 'B+',
      instructor: 'Krav Maga Expert',
      certificate_number: 'KMA-2024-003'
    }
  ]

  const getCertificateTypeBadge = (type: string) => {
    switch (type) {
      case 'completion':
        return <Badge className="bg-green-100 text-green-800"><Trophy className="w-3 h-3 mr-1" />Abschluss</Badge>
      case 'mastery':
        return <Badge className="bg-purple-100 text-purple-800"><Award className="w-3 h-3 mr-1" />Meisterschaft</Badge>
      case 'participation':
        return <Badge className="bg-blue-100 text-blue-800"><FileText className="w-3 h-3 mr-1" />Teilnahme</Badge>
      default:
        return <Badge variant="outline">Unbekannt</Badge>
    }
  }

  const getGradeBadge = (grade: string) => {
    const getGradeColor = (grade: string) => {
      if (grade.startsWith('A')) return 'bg-green-100 text-green-800'
      if (grade.startsWith('B')) return 'bg-blue-100 text-blue-800'
      if (grade.startsWith('C')) return 'bg-yellow-100 text-yellow-800'
      return 'bg-gray-100 text-gray-800'
    }

    return <Badge className={getGradeColor(grade)}>{grade}</Badge>
  }

  const filteredCertificates = certificates.filter(cert => {
    const matchesSearch = 
      cert.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.student_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.course_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.certificate_number.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = filterType === 'all' || cert.certificate_type === filterType

    return matchesSearch && matchesFilter
  })

  const stats = {
    total: certificates.length,
    thisMonth: certificates.filter(cert => {
      const issued = new Date(cert.issued_date)
      const now = new Date()
      return issued.getMonth() === now.getMonth() && issued.getFullYear() === now.getFullYear()
    }).length,
    completion: certificates.filter(cert => cert.certificate_type === 'completion').length,
    mastery: certificates.filter(cert => cert.certificate_type === 'mastery').length
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Zertifikate</h1>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportieren
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Zertifikat erstellen
          </Button>
        </div>
      </div>

      {/* Statistiken */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Gesamt</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Trophy className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Diesen Monat</p>
                <p className="text-2xl font-bold">{stats.thisMonth}</p>
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Abschluss</p>
                <p className="text-2xl font-bold">{stats.completion}</p>
              </div>
              <Award className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Meisterschaft</p>
                <p className="text-2xl font-bold">{stats.mastery}</p>
              </div>
              <Trophy className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter und Suche */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Zertifikate durchsuchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterType === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('all')}
          >
            Alle
          </Button>
          <Button
            variant={filterType === 'completion' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('completion')}
          >
            Abschluss
          </Button>
          <Button
            variant={filterType === 'mastery' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('mastery')}
          >
            Meisterschaft
          </Button>
          <Button
            variant={filterType === 'participation' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('participation')}
          >
            Teilnahme
          </Button>
        </div>
      </div>

      {/* Zertifikate-Liste */}
      {filteredCertificates.length === 0 ? (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            {searchTerm ? 'Keine Zertifikate gefunden' : 'Noch keine Zertifikate ausgestellt'}
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm 
              ? 'Versuche einen anderen Suchbegriff.' 
              : 'Zertifikate werden automatisch ausgestellt, wenn Studenten Kurse abschließen.'
            }
          </p>
          {!searchTerm && (
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Erstes Zertifikat erstellen
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredCertificates.map((certificate) => (
            <Card key={certificate.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-white" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-lg">{certificate.student_name}</h3>
                        {getCertificateTypeBadge(certificate.certificate_type)}
                        {getGradeBadge(certificate.grade)}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          {certificate.student_email}
                        </div>
                        <div className="flex items-center">
                          <BookOpen className="w-4 h-4 mr-1" />
                          {certificate.course_title}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(certificate.issued_date).toLocaleDateString('de-DE')}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-400">
                        <span>Zertifikat-Nr.: {certificate.certificate_number}</span>
                        <span>Instruktor: {certificate.instructor}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      Vorschau
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-1" />
                      Download
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
