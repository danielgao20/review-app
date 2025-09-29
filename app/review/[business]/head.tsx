import type { Metadata } from 'next'

type Props = {
  params: { business: string }
}

async function getBusinessName(slug: string): Promise<string | null> {
  try {
    const res = await fetch(`/api/business/${slug}`, { cache: 'no-store' })
    if (!res.ok) return null
    const data = await res.json()
    return data?.business?.name ?? null
  } catch {
    return null
  }
}

export default async function Head({ params }: Props) {
  const businessName = await getBusinessName(params.business)
  const title = businessName ? `Leave Rating for ${businessName}` : 'Leave Rating'

  return (
    <>
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta property="og:title" content={title} />
      <meta name="twitter:title" content={title} />
    </>
  )
}


