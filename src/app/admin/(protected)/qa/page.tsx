'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  BookOpen,
  Filter
} from 'lucide-react'

export default function QAPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  // Mock data - in der echten App würden diese aus der Datenbank kommen
  const questions = [
    {
      id: '1',
      title: 'Wie führe ich einen direkten Schlag richtig aus?',
      content: 'Ich habe Probleme mit der Technik beim direkten Schlag. Könnt ihr mir Tipps geben?',
      author: 'Max Mustermann',
      course: 'Grundlagen der Selbstverteidigung',
      lesson: 'Lektion 3: Grundschläge',
      status: 'open',
      created_at: '2024-01-15T10:30:00Z',
      answers_count: 0
    },
    {
      id: '2', 
      title: 'Wann sollte man sich zur Wehr setzen?',
      content: 'In welchen Situationen ist es angebracht, Krav Maga Techniken anzuwenden?',
      author: 'Anna Schmidt',
      course: 'Krav Maga Philosophie',
      lesson: 'Lektion 1: Ethik und Verantwortung',
      status: 'answered',
      created_at: '2024-01-14T15:45:00Z',
      answers_count: 2
    },
    {
      id: '3',
      title: 'Probleme mit dem Gleichgewicht',
      content: 'Ich verliere oft das Gleichgewicht bei den Tritten. Was mache ich falsch?',
      author: 'Tom Weber',
      course: 'Fortgeschrittene Techniken',
      lesson: 'Lektion 5: Tritttechniken',
      status: 'open',
      created_at: '2024-01-13T09:15:00Z',
      answers_count: 1
    }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-orange-100 text-orange-800"><AlertCircle className="w-3 h-3 mr-1" />Offen</Badge>
      case 'answered':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Beantwortet</Badge>
      case 'closed':
        return <Badge className="bg-gray-100 text-gray-800">Geschlossen</Badge>
      default:
        return <Badge variant="outline">Unbekannt</Badge>
    }
  }

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = 
      question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.course.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = filterStatus === 'all' || question.status === filterStatus

    return matchesSearch && matchesFilter
  })

  const stats = {
    total: questions.length,
    open: questions.filter(q => q.status === 'open').length,
    answered: questions.filter(q => q.status === 'answered').length,
    avgResponseTime: '2.3 Stunden'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Q&A Verwaltung</h1>
        <Button>
          <MessageSquare className="mr-2 h-4 w-4" />
          Neue Antwort erstellen
        </Button>
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
              <MessageSquare className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Offen</p>
                <p className="text-2xl font-bold">{stats.open}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Beantwortet</p>
                <p className="text-2xl font-bold">{stats.answered}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ø Antwortzeit</p>
                <p className="text-2xl font-bold">{stats.avgResponseTime}</p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter und Suche */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Fragen durchsuchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterStatus === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('all')}
          >
            <Filter className="w-4 h-4 mr-1" />
            Alle
          </Button>
          <Button
            variant={filterStatus === 'open' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('open')}
          >
            Offen
          </Button>
          <Button
            variant={filterStatus === 'answered' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('answered')}
          >
            Beantwortet
          </Button>
        </div>
      </div>

      {/* Fragen-Liste */}
      {filteredQuestions.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            {searchTerm ? 'Keine Fragen gefunden' : 'Noch keine Fragen gestellt'}
          </h3>
          <p className="text-gray-500">
            {searchTerm 
              ? 'Versuche einen anderen Suchbegriff.' 
              : 'Fragen von Studenten werden hier angezeigt.'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredQuestions.map((question) => (
            <Card key={question.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-lg">{question.title}</CardTitle>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        {question.author}
                      </div>
                      <div className="flex items-center">
                        <BookOpen className="w-4 h-4 mr-1" />
                        {question.course}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {new Date(question.created_at).toLocaleDateString('de-DE')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(question.status)}
                    {question.answers_count > 0 && (
                      <Badge variant="outline">
                        {question.answers_count} Antwort{question.answers_count !== 1 ? 'en' : ''}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">{question.content}</p>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Lektion: {question.lesson}
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      Antworten
                    </Button>
                    <Button variant="ghost" size="sm">
                      Details
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
