import ky, { type KyInstance } from 'ky'

export function createApiClient(baseUrl?: string): KyInstance {
  return ky.create({
    ...(baseUrl === undefined ? {} : { prefix: baseUrl }),
    retry: 0,
  })
}

export const apiClient = createApiClient(process.env.NEXT_PUBLIC_API_BASE_URL)
