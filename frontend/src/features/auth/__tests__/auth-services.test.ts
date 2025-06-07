import { describe, it, expect, beforeEach, vi } from 'vitest'
import { DemoAuthService } from '../services/DemoAuthService'
import { MockAuthService } from '../services/MockAuthService'
import { AuthServiceFactory } from '../services/AuthService'
import { DEMO_CREDENTIALS } from '@config/features/demo.config'

describe('Authentication Services', () => {
  describe('DemoAuthService', () => {
    let demoAuth: DemoAuthService
    
    beforeEach(() => {
      demoAuth = new DemoAuthService({
        credentials: [...DEMO_CREDENTIALS],
        practiceData: {
          name: 'Test Practice',
          address: {
            street: '123 Test St',
            city: 'Test City',
            state: 'TS',
            zipCode: '12345'
          },
          phone: '555-1234'
        },
        options: {
          simulateNetworkDelay: false // Disable delay for tests
        }
      })
    })

    it('should authenticate valid demo credentials', async () => {
      const result = await demoAuth.signIn('patient@example.com', 'demopassword123')
      
      expect(result.success).toBe(true)
      expect(result.user).toBeDefined()
      expect(result.user.email).toBe('patient@example.com')
      expect(result.user.role).toBe('patient')
      expect(result.user.isDemo).toBe(true)
    })

    it('should reject invalid credentials', async () => {
      await expect(
        demoAuth.signIn('invalid@example.com', 'wrongpassword')
      ).rejects.toThrow('Invalid demo credentials')
    })

    it('should sign out successfully', async () => {
      await demoAuth.signIn('patient@example.com', 'demopassword123')
      
      const userBefore = await demoAuth.getCurrentUser()
      expect(userBefore).not.toBeNull()
      
      await demoAuth.signOut()
      
      const userAfter = await demoAuth.getCurrentUser()
      expect(userAfter).toBeNull()
    })

    it('should maintain session state', async () => {
      await demoAuth.signIn('provider@example.com', 'demopassword123')
      
      const user = await demoAuth.getCurrentUser()
      const session = await demoAuth.getCurrentSession()
      
      expect(user).not.toBeNull()
      expect(session).not.toBeNull()
      expect(user?.role).toBe('provider')
      expect(session?.user.id).toBe(user?.id)
    })

    it('should handle auth state change callbacks', async () => {
      const callback = vi.fn()
      
      const unsubscribe = demoAuth.onAuthStateChange(callback)
      
      // Should call immediately with current state (signed out)
      expect(callback).toHaveBeenCalledWith('SIGNED_OUT', { user: null, session: null })
      
      await demoAuth.signIn('admin@example.com', 'demopassword123')
      
      // Should call with signed in state
      expect(callback).toHaveBeenCalledWith('SIGNED_IN', expect.objectContaining({
        user: expect.objectContaining({ email: 'admin@example.com' }),
        session: expect.any(Object)
      }))
      
      unsubscribe()
    })
  })

  describe('MockAuthService', () => {
    let mockAuth: MockAuthService
    
    beforeEach(() => {
      mockAuth = new MockAuthService()
    })

    it('should accept any credentials by default', async () => {
      const result = await mockAuth.signIn('any@email.com', 'anypassword')
      
      expect(result.success).toBe(true)
      expect(result.user).toBeDefined()
      expect(result.user.email).toBe('any@email.com')
    })

    it('should fail when configured to fail', async () => {
      mockAuth.setShouldFailSignIn(true)
      
      await expect(
        mockAuth.signIn('test@example.com', 'password')
      ).rejects.toThrow('Mock authentication failure')
    })

    it('should determine role from email', async () => {
      const patientResult = await mockAuth.signIn('patient@test.com', 'password')
      expect(patientResult.user.role).toBe('patient')
      
      const providerResult = await mockAuth.signIn('provider@test.com', 'password')
      expect(providerResult.user.role).toBe('provider')
      
      const adminResult = await mockAuth.signIn('admin@test.com', 'password')
      expect(adminResult.user.role).toBe('admin')
    })

    it('should allow setting mock user directly', async () => {
      const mockUser = {
        id: 'test-user',
        email: 'test@example.com',
        role: 'patient' as const,
        profile: { id: 'test-profile', firstName: 'Test', lastName: 'User' },
        permissions: ['read:own_profile'],
        isDemo: false,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      }
      
      mockAuth.setMockUser(mockUser)
      
      const currentUser = await mockAuth.getCurrentUser()
      expect(currentUser).toEqual(mockUser)
      
      const session = await mockAuth.getCurrentSession()
      expect(session?.user).toEqual(mockUser)
    })
  })

  describe('AuthServiceFactory', () => {
    beforeEach(() => {
      AuthServiceFactory.resetInstance()
    })

    it('should create DemoAuthService for demo mode', () => {
      const service = AuthServiceFactory.create({
        mode: 'demo',
        demo: {
          credentials: [...DEMO_CREDENTIALS],
          practiceData: {
            name: 'Test Practice',
            address: {
              street: '123 Test St',
              city: 'Test City',
              state: 'TS',
              zipCode: '12345'
            },
            phone: '555-1234'
          }
        }
      })
      
      expect(service).toBeInstanceOf(DemoAuthService)
    })

    it('should create MockAuthService for mock mode', () => {
      const service = AuthServiceFactory.create({ mode: 'mock' })
      
      expect(service).toBeInstanceOf(MockAuthService)
    })

    it('should throw error for unsupported mode', () => {
      expect(() => {
        AuthServiceFactory.create({ mode: 'unsupported' as any })
      }).toThrow('Unsupported auth mode: unsupported')
    })

    it('should return singleton instance', () => {
      const config = { mode: 'mock' as const }
      
      const instance1 = AuthServiceFactory.getInstance(config)
      const instance2 = AuthServiceFactory.getInstance(config)
      
      expect(instance1).toBe(instance2)
    })
  })
})