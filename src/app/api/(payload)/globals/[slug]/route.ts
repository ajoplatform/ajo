/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
import config from '@payload-config'
import { REST_DELETE, REST_GET, REST_OPTIONS, REST_POST } from '@payloadcms/next/routes'
import { importMap } from '../../../../../importMap'

export const GET = REST_GET(config, importMap)
export const POST = REST_POST(config, importMap)
export const DELETE = REST_DELETE(config)
export const OPTIONS = REST_OPTIONS(config)
