import { describe, it, expect, vi } from 'vitest'
import { createAdminNotification, getAdminNotifications } from './notifications'

// Mock prisma
vi.mock('../prisma', () => ({
    default: {
        notification: {
            findMany: vi.fn(),
            create: vi.fn()
        },
        user: {
            findMany: vi.fn()
        }
    }
}))

import prisma from '../prisma'

// Mock requireAdmin
vi.mock('../utils/adminAuth', () => ({
    requireAdmin: vi.fn()
}))

describe('notifications', () => {
    it('should get admin notifications', async () => {
        const mockNotifications = [
            { id: '1', title: 'Test', message: 'Test message', read: false, createdAt: new Date() }
        ]
        ;(prisma.notification.findMany as any).mockResolvedValue(mockNotifications)

        const result = await getAdminNotifications()
        expect(result).toEqual(mockNotifications)
    })

    it('should create admin notification', async () => {
        const mockAdmins = [{ id: '1', role: 'ADMIN' }]
        const mockNotification = { id: '1', title: 'Test', message: 'Test' }
        
        ;(prisma.user.findMany as any).mockResolvedValue(mockAdmins)
        ;(prisma.notification.create as any).mockResolvedValue(mockNotification)

        const result = await createAdminNotification('Test', 'Test message')
        expect(result.success).toBe(true)
    })
})