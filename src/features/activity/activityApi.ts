import { apiRequest } from '../../core/http'

export async function clickItem(item_id: number) {
  await apiRequest('/activity/click', { method: 'POST', json: { item_id } })
}

export type OrderResponse = { order_id: number; item_id: number; timestamp: string }

export async function orderItem(item_id: number) {
  return await apiRequest<OrderResponse>('/activity/order', {
    method: 'POST',
    json: { item_id },
  })
}

export async function rateOrder(order_id: number, rating: number) {
  await apiRequest('/activity/rate', { method: 'POST', json: { order_id, rating } })
}

