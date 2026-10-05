import { hasSupabase, supabasePublic } from './supabase/public'
import type { Category, NewsPost, Product } from './types'

const PRODUCT_COLUMNS =
  'id, slug, name, brand, category_id, summary, description, specs, image_url, images, stock_status, is_featured, is_active, sort_order, created_at, categories(id, slug, name)'

export async function getCategories(): Promise<Category[]> {
  if (!hasSupabase) return []
  const { data } = await supabasePublic
    .from('categories')
    .select('id, slug, name, description, sort_order')
    .order('sort_order')
  return (data as Category[]) ?? []
}

export async function getProducts(categorySlug?: string): Promise<Product[]> {
  if (!hasSupabase) return []
  let query = supabasePublic
    .from('products')
    .select(PRODUCT_COLUMNS)
    .eq('is_active', true)
    .order('sort_order')
    .order('name')
  if (categorySlug) query = query.eq('categories.slug', categorySlug)

  const { data } = await query
  const rows = (data as unknown as Product[]) ?? []
  // ใช้ !inner ไม่ได้เพราะสินค้าอาจไม่มีหมวด — กรองฝั่งเซิร์ฟเวอร์แทน
  return categorySlug ? rows.filter((p) => p.categories?.slug === categorySlug) : rows
}

export async function getFeaturedProducts(limit = 3): Promise<Product[]> {
  if (!hasSupabase) return []
  const { data } = await supabasePublic
    .from('products')
    .select(PRODUCT_COLUMNS)
    .eq('is_active', true)
    .eq('is_featured', true)
    .order('sort_order')
    .limit(limit)
  return (data as unknown as Product[]) ?? []
}

export async function getProduct(slug: string): Promise<Product | null> {
  if (!hasSupabase) return null
  const { data } = await supabasePublic
    .from('products')
    .select(
      `${PRODUCT_COLUMNS}, product_variants(id, product_id, name, sku, stock_status, sort_order, is_active)`
    )
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle()
  if (!data) return null
  const product = data as unknown as Product
  product.product_variants = (product.product_variants ?? [])
    .filter((v) => v.is_active)
    .sort((a, b) => a.sort_order - b.sort_order)
  return product
}

export async function getProductSlugs(): Promise<string[]> {
  if (!hasSupabase) return []
  const { data } = await supabasePublic.from('products').select('slug').eq('is_active', true)
  return (data ?? []).map((r) => r.slug as string)
}

export async function getNews(limit?: number): Promise<NewsPost[]> {
  if (!hasSupabase) return []
  let query = supabasePublic
    .from('news')
    .select('id, slug, title, excerpt, content, cover_url, is_published, published_at, created_at')
    .eq('is_published', true)
    .order('published_at', { ascending: false, nullsFirst: false })
  if (limit) query = query.limit(limit)
  const { data } = await query
  return (data as NewsPost[]) ?? []
}

export async function getNewsPost(slug: string): Promise<NewsPost | null> {
  if (!hasSupabase) return null
  const { data } = await supabasePublic
    .from('news')
    .select('id, slug, title, excerpt, content, cover_url, is_published, published_at, created_at')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle()
  return (data as NewsPost) ?? null
}

export async function getNewsSlugs(): Promise<string[]> {
  if (!hasSupabase) return []
  const { data } = await supabasePublic.from('news').select('slug').eq('is_published', true)
  return (data ?? []).map((r) => r.slug as string)
}
