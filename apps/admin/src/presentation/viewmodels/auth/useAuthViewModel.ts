import { defineStore } from 'pinia'
import type { User, LoginDTO } from '../../../types'
import { authRepository } from '../../../data/repositories/auth.repository'
export const useAuthStore = defineStore('auth', () => {
  const user    = ref<User | null>(null)
  const loading = ref(false)
  const error   = ref<string | null>(null)
  const isLoggedIn = computed(() => !!user.value)
  const login = async (data: LoginDTO) => {
    loading.value = true; error.value = null
    try { const res = await authRepository.login(data); user.value = res.user; return res }
    catch (e: unknown) { error.value = e instanceof Error ? e.message : 'Login failed'; throw e }
    finally { loading.value = false }
  }
  const logout  = async () => { await authRepository.logout().catch(() => {}); user.value = null }
  const fetchMe = async () => { try { user.value = await authRepository.me() } catch { user.value = null } }
  return { user, loading, error, isLoggedIn, login, logout, fetchMe }
})
