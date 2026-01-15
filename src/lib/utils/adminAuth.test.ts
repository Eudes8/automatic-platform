import { describe, it, expect, vi } from 'vitest'
import { requireAdmin } from './adminAuth'

// Mock the getCurrentUser function
vi.mock('../actions/users', () => ({
    getCurrentUser: vi.fn()
}))

import { getCurrentUser } from '../actions/users'

describe('requireAdmin', () => {
    it('should return user if admin', async () => {
        const mockUser = { id: '1', email: 'admin@test.com', role: 'ADMIN' }
        ;(getCurrentUser as any).mockResolvedValue(mockUser)

        const result = await requireAdmin()
        expect(result).toEqual(mockUser)
    })

    it('should throw error if not admin', async () => {
        const mockUser = { id: '1', email: 'user@test.com', role: 'CLIENT' }
        ;(getCurrentUser as any).mockResolvedValue(mockUser)

        await expect(requireAdmin()).rejects.toThrow('Unauthorized: Admin access required')
    })

    it('should throw error if no user', async () => {
        ;(getCurrentUser as any).mockResolvedValue(null)

        await expect(requireAdmin()).rejects.toThrow('Unauthorized: Admin access required')
    })
})