/**
 * 统一请求出口。
 * 现在返回 mock 数据；接真实后端时，把 mockRequest 换成 axios/fetch 即可，
 * 页面与 store 不需要改动。
 */
export function mockRequest(data, delay = 220) {
  const payload = typeof structuredClone === 'function' ? structuredClone(data) : JSON.parse(JSON.stringify(data))
  return new Promise((resolve) => {
    setTimeout(() => resolve(payload), delay)
  })
}

export const API_MODE = 'mock'
