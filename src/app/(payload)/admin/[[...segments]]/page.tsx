/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
import config from '@payload-config'
import { RootPage, generatePageMetadata } from '@payloadcms/next/views'

type Args = {
  params: Promise<{
    segments: string[]
  }>
  searchParams: Promise<{
    [key: string]: string | string[]
  }>
}

export const generateMetadata = ({ params, searchParams }: Args) =>
  generatePageMetadata({ config, params, searchParams })

const PayloadAdmin = async ({ params, searchParams }: Args) => {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  return (
    <RootPage
      config={config}
      params={resolvedParams}
      searchParams={resolvedSearchParams}
    />
  )
}

export default PayloadAdmin
