import { SupabaseClient } from '@supabase/supabase-js'

/**
 * Cleanup expired booking holds
 * This can be called from pages/components to ensure expired holds are removed
 * Returns the number of holds cleaned up
 */
export async function cleanupExpiredHolds(
  supabase: SupabaseClient
): Promise<number> {
  try {
    const { data, error } = await supabase.rpc('cleanup_expired_holds')

    if (error) {
      console.error('Error cleaning up expired holds:', error)
      return 0
    }

    if (data && data > 0) {
      console.log(`Cleaned up ${data} expired hold(s)`)
    }

    return data || 0
  } catch (error) {
    console.error('Exception cleaning up expired holds:', error)
    return 0
  }
}
