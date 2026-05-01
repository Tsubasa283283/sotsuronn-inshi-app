import { notFound } from 'next/navigation'
import SchoolPageContent from '@/components/schools/SchoolPageContent'
import type { SchoolId } from '@/lib/types'

const SCHOOL_MAP: Record<string, SchoolId> = {
  aoyama: 'aoyama',
  meiji: 'meiji',
  'chiba-shoka': 'chiba_shoka',
}

export default async function SchoolPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const schoolId = SCHOOL_MAP[id]
  if (!schoolId) notFound()

  return <SchoolPageContent schoolId={schoolId} />
}

export function generateStaticParams() {
  return [
    { id: 'aoyama' },
    { id: 'meiji' },
    { id: 'chiba-shoka' },
  ]
}
