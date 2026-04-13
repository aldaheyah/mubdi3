import { supabase } from '@/lib/supabase'
import { Artwork } from '@/data/artworks'
import HomeClient from './HomeClient'

export const revalidate = 0

export default async function Home() {
  const { data } = await supabase
    .from('artworks')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(6)

  const artworks = (data as Artwork[]) || []

  return <HomeClient artworks={artworks} />
}