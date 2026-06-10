import type { User, LoginDTO } from '../../types'
import { storage } from '../../core/helpers/storage'

const MOCK_TOKEN = 'mock-jwt-token-123'
const MOCK_USER: User = {
  id: 'u1',
  name: 'Admin User',
  email: 'admin@cafe.com',
  role: 'admin'
}

export const authRepository = {
  login: async (data: LoginDTO) => {
    return new Promise<{ user: User; token: string }>((resolve, reject) => {
      setTimeout(() => {
        if (data.email === 'admin@cafe.com' && data.password === 'password') {
          storage.setToken(MOCK_TOKEN)
          resolve({ user: MOCK_USER, token: MOCK_TOKEN })
        } else {
          reject(new Error('Invalid credentials. Use admin@cafe.com / password'))
        }
      }, 500)
    })
  },
  logout: async () => new Promise<void>(resolve => setTimeout(() => {
    storage.clearToken()
    resolve()
  }, 300)),
  me: async () => new Promise<User>((resolve, reject) => setTimeout(() => {
    storage.getToken() === MOCK_TOKEN ? resolve(MOCK_USER) : reject(new Error('Not authenticated'))
  }, 300)),
}
