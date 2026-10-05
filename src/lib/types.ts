export type Role = 'user' | 'admin' | 'superadmin'
export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'preorder'
export type QuoteStatus = 'new' | 'in_progress' | 'quoted' | 'won' | 'lost' | 'cancelled'

export type Profile = {
  id: string
  email: string | null
  full_name: string | null
  avatar_url: string | null
  phone: string | null
  role: Role
  created_at: string
}

export type BillingProfile = {
  id: string
  user_id: string
  org_name: string
  tax_id: string
  branch: string
  address: string
  subdistrict: string | null
  district: string | null
  province: string | null
  postal_code: string | null
  contact_name: string | null
  contact_phone: string | null
  contact_email: string | null
  updated_at: string
}

export type Category = {
  id: string
  slug: string
  name: string
  description: string | null
  sort_order: number
}

export type Spec = { label: string; value: string }

export type ProductVariant = {
  id: string
  product_id: string
  name: string
  sku: string | null
  stock_status: StockStatus
  sort_order: number
  is_active: boolean
}

export type Product = {
  id: string
  slug: string
  name: string
  brand: string | null
  category_id: string | null
  summary: string | null
  description: string | null
  specs: Spec[]
  image_url: string | null
  images: string[]
  stock_status: StockStatus
  is_featured: boolean
  is_active: boolean
  sort_order: number
  created_at: string
  categories?: Pick<Category, 'id' | 'slug' | 'name'> | null
  product_variants?: ProductVariant[]
}

export type NewsPost = {
  id: string
  slug: string
  title: string
  excerpt: string | null
  content: string | null
  cover_url: string | null
  is_published: boolean
  published_at: string | null
  created_at: string
}

export type QuoteItem = {
  id: string
  request_id: string
  product_id: string | null
  variant_id: string | null
  product_name: string
  variant_name: string | null
  quantity: number
  note: string | null
}

export type QuoteRequest = {
  id: string
  code: string
  user_id: string
  status: QuoteStatus
  note: string | null
  contact_name: string | null
  contact_phone: string | null
  contact_email: string | null
  billing: Record<string, string> | null
  admin_note: string | null
  created_at: string
  updated_at: string
  quote_request_items?: QuoteItem[]
  profiles?: Pick<Profile, 'id' | 'email' | 'full_name'> | null
}
