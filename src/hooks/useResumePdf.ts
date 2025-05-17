import { useQuery } from '@tanstack/react-query'
import { get } from '@/lib/api'

/**
 * Fetches the resume PDF (as ArrayBuffer) by first getting a JSON
 * Base64 payload and decoding it client‑side.
 */
export function useResumePdf() {
  return useQuery<Blob, Error>({
    queryKey: ['pdf-preview'],
    queryFn: () =>
      get('/get-pdf', { responseType: 'blob' }).then(res => res as Blob),
    refetchOnWindowFocus: false,
    staleTime: 0,
    retry: 1,
  })
}