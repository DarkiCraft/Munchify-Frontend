import { apiRequest } from '../../core/http'

export type RecommendationsSingle = { recommendations: number[] }
export type RecommendationsMulti = { recommendations_by_k: Record<string, number[]> }

export async function getRecommendations(ks: number[]) {
  const params = new URLSearchParams()
  for (const k of ks) params.append('k', String(k))
  const data = await apiRequest<RecommendationsSingle | RecommendationsMulti>(
    `/recommendations?${params.toString()}`,
  )
  return data
}

