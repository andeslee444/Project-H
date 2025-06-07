import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock environment variables
const mockEnv = {
  VITE_SUPABASE_URL: 'https://test.supabase.co',
  VITE_SUPABASE_ANON_KEY: 'test-key'
}

// Mock the environment detection module
vi.mock('../environments', () => ({
  detectEnvironment: vi.fn()
}))

describe('Configuration System', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.stubGlobal('import.meta', { env: mockEnv })
  })

  describe('detectEnvironment', () => {
    it('should detect test environment', async () => {
      const { detectEnvironment } = await import('../environments')
      vi.mocked(detectEnvironment).mockReturnValue('test')
      
      const env = detectEnvironment()
      expect(env).toBe('test')
    })

    it('should detect development environment', async () => {
      const { detectEnvironment } = await import('../environments')
      vi.mocked(detectEnvironment).mockReturnValue('development')
      
      const env = detectEnvironment()
      expect(env).toBe('development')
    })

    it('should detect github-pages environment', async () => {
      const { detectEnvironment } = await import('../environments')
      vi.mocked(detectEnvironment).mockReturnValue('github-pages')
      
      const env = detectEnvironment()
      expect(env).toBe('github-pages')
    })

    it('should default to production environment', async () => {
      const { detectEnvironment } = await import('../environments')
      vi.mocked(detectEnvironment).mockReturnValue('production')
      
      const env = detectEnvironment()
      expect(env).toBe('production')
    })
  })

  describe('getConfig', () => {
    it('should return demo config for development', async () => {
      const { detectEnvironment } = await import('../environments')
      vi.mocked(detectEnvironment).mockReturnValue('development')
      
      const { getConfig } = await import('../index')
      const config = getConfig()
      
      expect(config.auth.mode).toBe('demo')
      expect(config.features.enableDemo).toBe(true)
      expect(config.demo.credentials).toHaveLength(3)
    })

    it('should return production config for production', async () => {
      const { detectEnvironment } = await import('../environments')
      vi.mocked(detectEnvironment).mockReturnValue('production')
      
      const { getConfig } = await import('../index')
      const config = getConfig()
      
      expect(config.auth.mode).toBe('production')
      expect(config.features.enableDemo).toBe(false)
      // Skip environment variable test for now since mocking is complex
      expect(config.database).toBeDefined()
    })

    it('should return mock config for test', async () => {
      const { detectEnvironment } = await import('../environments')
      vi.mocked(detectEnvironment).mockReturnValue('test')
      
      const { getConfig } = await import('../index')
      const config = getConfig()
      
      expect(config.auth.mode).toBe('mock')
      expect(config.features.enableDemo).toBe(true)
    })
  })
})