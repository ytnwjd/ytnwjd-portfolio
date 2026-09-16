import { onBeforeUnmount, onMounted } from 'vue'

// 히어로 배경용 — 점들이 천천히 떠다니다 가까워지면 선으로 연결되는 무채색 네트워크 캔버스.
// "Full-cycle 개발자"라는 정체성에 맞춰 노드-엣지(시스템) 모티프를 개인화된 배경으로 사용한다.
export function useNetworkCanvas(canvasRef, options = {}) {
  const { nodeCount = 46, linkDistance = 130, speed = 0.18, dotColor = '0, 0, 0', lineAlpha = 0.12 } = options

  let ctx = null
  let width = 0
  let height = 0
  let dpr = 1
  let nodes = []
  let rafId = null
  let resizeObserver = null
  let reduceMotion = false

  function createNodes() {
    nodes = Array.from({ length: nodeCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * speed,
      vy: (Math.random() - 0.5) * speed,
    }))
  }

  function resize() {
    const canvas = canvasRef.value
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    width = rect.width
    height = rect.height
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    createNodes()
    if (reduceMotion) draw()
  }

  function step() {
    nodes.forEach((n) => {
      n.x += n.vx
      n.y += n.vy
      if (n.x < 0 || n.x > width) n.vx *= -1
      if (n.y < 0 || n.y > height) n.vy *= -1
    })
  }

  function draw() {
    ctx.clearRect(0, 0, width, height)

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i]
        const b = nodes[j]
        const dist = Math.hypot(a.x - b.x, a.y - b.y)
        if (dist < linkDistance) {
          ctx.strokeStyle = `rgba(${dotColor}, ${lineAlpha * (1 - dist / linkDistance)})`
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          ctx.stroke()
        }
      }
    }

    ctx.fillStyle = `rgba(${dotColor}, 0.4)`
    nodes.forEach((n) => {
      ctx.beginPath()
      ctx.arc(n.x, n.y, 1.6, 0, Math.PI * 2)
      ctx.fill()
    })
  }

  function loop() {
    step()
    draw()
    rafId = requestAnimationFrame(loop)
  }

  onMounted(() => {
    const canvas = canvasRef.value
    if (!canvas) return
    ctx = canvas.getContext('2d')
    reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(canvas)
    resize()

    if (!reduceMotion) {
      rafId = requestAnimationFrame(loop)
    }
  })

  onBeforeUnmount(() => {
    if (rafId) cancelAnimationFrame(rafId)
    resizeObserver?.disconnect()
  })
}
