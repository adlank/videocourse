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
  CreditCard,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  MoreHorizontal,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react'

interface Subscription {
  id: string
  user_id: string
  email: string
  full_name?: string
  subscription_status: string
  subscription_plan?: string
  subscription_id?: string
  stripe_customer_id?: string
  subscription_current_period_start?: string
  subscription_current_period_end?: string
  created_at: string
}

export default function SubscriptionsPage() {
  const supabase = createClient()
  
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')

  useEffect(() => {
    loadSubscriptions()
  }, [])

  const loadSubscriptions = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: subscriptionsData, error: subscriptionsError } = await supabase
        .from('profiles')
        .select('*')
        .not('subscription_status', 'is', null)
        .order('created_at', { ascending: false })

      if (subscriptionsError) throw subscriptionsError

      setSubscriptions(subscriptionsData || [])
    } catch (err: any) {
      console.error('Error loading subscriptions:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Aktiv</Badge>
      case 'trialing':
        return <Badge className="bg-blue-100 text-blue-800"><Calendar className="w-3 h-3 mr-1" />Testphase</Badge>
      case 'past_due':
        return <Badge className="bg-yellow-100 text-yellow-800"><AlertCircle className="w-3 h-3 mr-1" />Überfällig</Badge>
      case 'canceled':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Gekündigt</Badge>
      case 'incomplete':
        return <Badge className="bg-gray-100 text-gray-800">Unvollständig</Badge>
      default:
        return <Badge variant="outline">Unbekannt</Badge>
    }
  }

  const getPlanBadge = (plan?: string) => {
    switch (plan) {
      case 'monthly':
        return <Badge variant="outline">Monatlich</Badge>
      case 'yearly':
        return <Badge variant="outline">Jährlich</Badge>
      default:
        return null
    }
  }

  const formatPrice = (plan?: string) => {
    switch (plan) {
      case 'monthly':
        return 'CHF 29.00/Monat'
      case 'yearly':
        return 'CHF 290.00/Jahr'
      default:
        return 'Kostenlos'
    }
  }

  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = 
      sub.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.full_name?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = filterStatus === 'all' || sub.subscription_status === filterStatus

    return matchesSearch && matchesFilter
  })

  const stats = {
    total: subscriptions.length,
    active: subscriptions.filter(s => s.subscription_status === 'active').length,
    revenue: subscriptions.filter(s => s.subscription_status === 'active').reduce((sum, s) => {
      return sum + (s.subscription_plan === 'yearly' ? 290 : s.subscription_plan === 'monthly' ? 29 : 0)
    }, 0),
    churn: subscriptions.filter(s => s.subscription_status === 'canceled').length
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Abonnements</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="h-8 bg-gray-200 rounded animate-pulse" />
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
        <h1 className="text-3xl font-bold">Abonnements</h1>
        <Button variant="outline">
          <TrendingUp className="mr-2 h-4 w-4" />
          Berichte exportieren
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
                <p className="text-sm text-muted-foreground">Gesamt</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aktive Abos</p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monatsumsatz</p>
                <p className="text-2xl font-bold">CHF {stats.revenue}</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Kündigungen</p>
                <p className="text-2xl font-bold">{stats.churn}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter und Suche */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Abonnements durchsuchen..."
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
            Alle
          </Button>
          <Button
            variant={filterStatus === 'active' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('active')}
          >
            Aktiv
          </Button>
          <Button
            variant={filterStatus === 'trialing' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('trialing')}
          >
            Testphase
          </Button>
          <Button
            variant={filterStatus === 'canceled' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('canceled')}
          >
            Gekündigt
          </Button>
        </div>
      </div>

      {/* Abonnement-Liste */}
      {filteredSubscriptions.length === 0 ? (
        <div className="text-center py-12">
          <CreditCard className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            {searchTerm ? 'Keine Abonnements gefunden' : 'Noch keine Abonnements'}
          </h3>
          <p className="text-gray-500">
            {searchTerm 
              ? 'Versuche einen anderen Suchbegriff.' 
              : 'Abonnements werden hier angezeigt, sobald Kunden sich anmelden.'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredSubscriptions.map((subscription) => (
            <Card key={subscription.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-lg font-semibold text-gray-600">
                        {(subscription.full_name || subscription.email).charAt(0).toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">
                          {subscription.full_name || 'Unbekannt'}
                        </h3>
                        {getStatusBadge(subscription.subscription_status)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {subscription.email}
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>
                          Seit: {new Date(subscription.created_at).toLocaleDateString('de-DE')}
                        </span>
                        {subscription.subscription_id && (
                          <span>
                            Stripe ID: {subscription.subscription_id.substring(0, 12)}...
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right space-y-1">
                      <div className="flex items-center space-x-2">
                        {getPlanBadge(subscription.subscription_plan)}
                        <span className="font-semibold">
                          {formatPrice(subscription.subscription_plan)}
                        </span>
                      </div>
                      
                      {subscription.subscription_current_period_end && (
                        <div className="text-xs text-gray-500">
                          Läuft ab: {new Date(subscription.subscription_current_period_end).toLocaleDateString('de-DE')}
                        </div>
                      )}
                    </div>
                    
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
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
