import React, { useState, useEffect } from 'react'
import { 
  Calendar, 
  MessageCircle, 
  Heart, 
  BookOpen,
  Video,
  Phone,
  MapPin,
  TrendingUp,
  TrendingDown,
  Clock
} from 'lucide-react'
import { useAuth } from '@/features/auth'
import { Card, CardHeader, CardContent } from '../../ui/card/Card'
import { Button } from '../../ui/button/Button'
import { ComponentErrorBoundary } from '@/lib/errors'
import { usePatientByUserId } from '@/lib/state/queries/patients.queries'
import { 
  createMockQuickActions,
  createMockUpcomingAppointment,
  createMockWellnessStats,
  type ValidatedQuickAction,
  type ValidatedUpcomingAppointment,
  type ValidatedWellnessStat
} from './validation'
// import MoodTracker from '../MoodTracker' // TODO: Convert to TypeScript
import type { DashboardProps } from './types'
import './animations.css'

/**
 * Patient Dashboard Component
 * Main dashboard interface for patients with quick actions, appointments, and wellness tracking
 */
export const PatientDashboard: React.FC<DashboardProps> = ({ className }) => {
  const { user } = useAuth()
  const { data: patient, isLoading } = usePatientByUserId(user?.id || '')
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  const getGreeting = (): string => {
    const hour = currentTime.getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const scrollToMoodTracker = () => {
    document.getElementById('mood-tracker')?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'center'
    })
  }

  // Validated data using factory functions with runtime validation
  const quickActions: ValidatedQuickAction[] = React.useMemo(() => {
    try {
      return createMockQuickActions()
    } catch (error) {
      console.error('Failed to load quick actions:', error)
      return []
    }
  }, [])

  const upcomingAppointment: ValidatedUpcomingAppointment | null = React.useMemo(() => {
    try {
      return createMockUpcomingAppointment()
    } catch (error) {
      console.error('Failed to load upcoming appointment:', error)
      return null
    }
  }, [])

  const wellnessStats: ValidatedWellnessStat[] = React.useMemo(() => {
    try {
      return createMockWellnessStats()
    } catch (error) {
      console.error('Failed to load wellness stats:', error)
      return []
    }
  }, [])

  // Action handlers for quick actions
  const handleQuickAction = (actionId: string) => {
    switch (actionId) {
      case 'book-session':
        // TODO: Navigate to booking flow
        console.log('Book session')
        break
      case 'message-provider':
        // TODO: Navigate to messaging
        console.log('Message provider')
        break
      case 'log-mood':
        scrollToMoodTracker()
        break
      case 'resources':
        // TODO: Navigate to resources
        console.log('Resources')
        break
      default:
        console.warn(`Unknown action: ${actionId}`)
    }
  }

  // Icon mapping for quick actions
  const getQuickActionIcon = (actionId: string) => {
    switch (actionId) {
      case 'book-session':
        return <Calendar className="w-6 h-6" />
      case 'message-provider':
        return <MessageCircle className="w-6 h-6" />
      case 'log-mood':
        return <Heart className="w-6 h-6" />
      case 'resources':
        return <BookOpen className="w-6 h-6" />
      default:
        return <Calendar className="w-6 h-6" />
    }
  }

  const getAppointmentIcon = (type: ValidatedUpcomingAppointment['type']) => {
    switch (type) {
      case 'video':
        return <Video className="w-5 h-5" />
      case 'phone':
        return <Phone className="w-5 h-5" />
      case 'in_person':
        return <MapPin className="w-5 h-5" />
      default:
        return <Calendar className="w-5 h-5" />
    }
  }

  const getTrendIcon = (direction: ValidatedWellnessStat['trendDirection']) => {
    switch (direction) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />
      case 'neutral':
        return <div className="w-4 h-4" /> // Empty space for neutral
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <ComponentErrorBoundary name="PatientDashboard">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          
          {/* Welcome Header */}
          <div className="animate-fade-in-up">
            <Card className="shadow-lg">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {getGreeting()}, {patient?.first_name || user?.profile?.firstName || 'Patient'} ✨
                    </h1>
                    <p className="text-gray-600 mt-1">
                      How are you feeling today? Let's check in on your wellness journey.
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-2xl text-white font-bold">
                      {(patient?.first_name || user?.profile?.firstName || 'P')[0]}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="animate-fade-in-up delay-100">
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quickActions.map((action, index) => (
                    <div
                      key={action.id}
                      className={`
                        bg-gradient-to-r ${action.color} 
                        rounded-xl p-4 text-white cursor-pointer
                        hover:shadow-lg hover:scale-105 
                        transition-all duration-200
                        ${action.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                        animate-scale-in
                      `}
                      style={{ animationDelay: `${index * 100}ms` }}
                      onClick={() => !action.disabled && handleQuickAction(action.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-white/90">
                          {getQuickActionIcon(action.id)}
                        </div>
                        <div>
                          <h3 className="font-semibold">{action.title}</h3>
                          <p className="text-white/80 text-sm">{action.subtitle}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Appointment */}
          <div className="animate-fade-in-up delay-200">
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-gray-900">Next Appointment</h2>
              </CardHeader>
              <CardContent>
                {upcomingAppointment ? (
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        {getAppointmentIcon(upcomingAppointment.type)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {upcomingAppointment.providerName}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {upcomingAppointment.providerSpecialty}
                        </p>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <Clock className="w-4 h-4 mr-1" />
                          {upcomingAppointment.date} at {upcomingAppointment.time}
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No upcoming appointments scheduled</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Schedule Appointment
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Wellness Stats */}
          <div className="animate-fade-in-up delay-300">
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-gray-900">Wellness Overview</h2>
              </CardHeader>
              <CardContent>
                {wellnessStats.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {wellnessStats.map((stat) => (
                      <div key={stat.id} className="bg-gray-50 rounded-lg p-4 animate-scale-in">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                          {getTrendIcon(stat.trendDirection)}
                        </div>
                        <div className="flex items-baseline space-x-1">
                          <span className={`text-2xl font-bold ${stat.color || 'text-gray-900'}`}>
                            {stat.value}
                          </span>
                          {stat.unit && (
                            <span className="text-sm text-gray-500">{stat.unit}</span>
                          )}
                        </div>
                        {stat.trend && (
                          <p className="text-xs text-gray-500 mt-1">
                            {stat.trend} from last week
                          </p>
                        )}
                        {stat.description && (
                          <p className="text-xs text-gray-400 mt-2" title={stat.description}>
                            {stat.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    <p>No wellness data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Mood Tracker */}
          <div 
            className="animate-fade-in-up delay-400"
            id="mood-tracker"
          >
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-gray-900">Mood Tracker</h2>
              </CardHeader>
              <CardContent>
                {/* <MoodTracker /> TODO: Convert to TypeScript */}
                <div className="p-8 text-center text-gray-500">
                  <Heart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="mb-2">Mood Tracker component will be integrated here</p>
                  <p className="text-sm text-gray-400">Track your daily mood and wellness patterns</p>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </ComponentErrorBoundary>
  )
}

PatientDashboard.displayName = 'PatientDashboard'