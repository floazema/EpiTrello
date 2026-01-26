import { hashPassword, comparePassword, generateToken, verifyToken } from '@/lib/auth.js'

describe('auth helpers', () => {
  it('hashes and compares passwords correctly', async () => {
    const pwd = 'S3cureP@ss!'
    const hash = await hashPassword(pwd)
    expect(hash).not.toBe(pwd)
    expect(await comparePassword(pwd, hash)).toBe(true)
    expect(await comparePassword('wrong', hash)).toBe(false)
  })

  it('generates and verifies JWT tokens', () => {
    const payload = { id: 123, email: 'test@example.com' }
    const token = generateToken(payload)
    const decoded = verifyToken(token)
    expect(decoded.id).toBe(123)
    expect(decoded.email).toBe('test@example.com')
  })

  it('returns null for invalid token', () => {
    expect(verifyToken('not.a.valid.token')).toBeNull()
  })
})