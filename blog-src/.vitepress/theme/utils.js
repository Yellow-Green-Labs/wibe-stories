import { withBase } from 'vitepress'

export function imgSrc(u) {
  if (!u) return u
  return /^https?:\/\//.test(u) ? u : withBase(u)
}