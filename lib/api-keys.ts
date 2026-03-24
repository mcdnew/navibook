import crypto from 'crypto'

export function generateApiKey(): { rawKey: string; keyHash: string; keyPrefix: string } {
  const random = crypto.randomBytes(24).toString('hex')
  const rawKey = `nb_live_${random}`
  const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex')
  const keyPrefix = rawKey.substring(0, 15)  // "nb_live_" + first 7 chars of random
  return { rawKey, keyHash, keyPrefix }
}

export function hashApiKey(rawKey: string): string {
  return crypto.createHash('sha256').update(rawKey).digest('hex')
}
