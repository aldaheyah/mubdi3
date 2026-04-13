export const revalidate = 0

import { supabase } from '@/lib/supabase'
import { Artwork } from '@/data/artworks'
import GalleryClient from './GalleryClient'

export default async function Gallery() {
  const { data, error } = await supabase
    .from('artworks')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error(error)
  }

  const artworks = (data as Artwork[]) || []

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold text-[#B8892A] mb-8">المعرض</h1>
      <GalleryClient artworks={artworks} />
    </main>
  )
}