export function lockScroll() {
  const sbw = window.innerWidth - document.documentElement.clientWidth
  document.documentElement.style.setProperty('--sbw', Math.max(0, sbw) + 'px')
  document.documentElement.classList.add('ws-locked')
}

export function unlockScroll() {
  document.documentElement.style.removeProperty('--sbw')
  document.documentElement.classList.remove('ws-locked')
}
