'use client'

import React, { useEffect, useRef } from 'react'

type Vec = { x: number; y: number; z: number }

/** evenly-spread points over a sphere (Fibonacci) — reads as a clean globe */
function buildPoints(): Vec[] {
  const pts: Vec[] = []
  const N = 240
  const golden = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < N; i++) {
    const y = 1 - (i / (N - 1)) * 2
    const ringR = Math.sqrt(Math.max(0, 1 - y * y))
    const theta = golden * i
    pts.push({ x: Math.cos(theta) * ringR, y, z: Math.sin(theta) * ringR })
  }
  return pts
}

/** green connected nodes that ride the globe — echoes the logo mark */
const NODES: Vec[] = [
  { x: 0.05, y: 0.6, z: 0.6 },
  { x: -0.28, y: 0.22, z: 0.78 },
  { x: -0.08, y: -0.15, z: 0.86 },
  { x: -0.5, y: -0.4, z: 0.6 },
  { x: -0.72, y: -0.08, z: 0.42 },
]

export function DotGlobe({ className = '' }: { className?: string }) {
  const dotsRef = useRef<(SVGCircleElement | null)[]>([])
  const nodeRef = useRef<(SVGCircleElement | null)[]>([])
  const lineRef = useRef<(SVGLineElement | null)[]>([])
  const pts = useRef<Vec[]>(buildPoints())
  const mouse = useRef({ x: 0, y: 0, active: 0 })
  const rot = useRef({ a: 0, b: 0.32, aVel: 0.0007 })

  useEffect(() => {
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

    const onMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX / window.innerWidth - 0.5
      mouse.current.y = e.clientY / window.innerHeight - 0.5
      mouse.current.active = 1
    }
    window.addEventListener('mousemove', onMove, { passive: true })

    const CX = 300
    const CY = 300
    const RAD = 248
    const FOV = 720

    const project = (p: Vec, sinA: number, cosA: number, sinB: number, cosB: number) => {
      const x = p.x * cosA - p.z * sinA
      const z = p.x * sinA + p.z * cosA
      const y2 = p.y * cosB - z * sinB
      const z2 = p.y * sinB + z * cosB
      const persp = FOV / (FOV - z2 * RAD)
      return { sx: CX + x * RAD * persp, sy: CY + y2 * RAD * persp, z: z2 }
    }

    let raf = 0
    const frame = () => {
      const m = mouse.current
      const r = rot.current

      const targetVel = 0.0007 + m.x * 0.005 * m.active
      r.aVel += (targetVel - r.aVel) * 0.04
      r.a += r.aVel
      const targetB = 0.32 + m.y * 0.5 * m.active
      r.b += (targetB - r.b) * 0.05
      m.active *= 0.975

      const sinA = Math.sin(r.a)
      const cosA = Math.cos(r.a)
      const sinB = Math.sin(r.b)
      const cosB = Math.cos(r.b)

      const P = pts.current
      for (let i = 0; i < P.length; i++) {
        const el = dotsRef.current[i]
        if (!el) continue
        const q = project(P[i], sinA, cosA, sinB, cosB)
        const depth = (q.z + 1) / 2
        el.setAttribute('cx', q.sx.toFixed(1))
        el.setAttribute('cy', q.sy.toFixed(1))
        el.setAttribute('r', (1.5 + depth * 2.3).toFixed(2))
        el.setAttribute('opacity', (0.28 + depth * 0.42).toFixed(2))
      }

      const proj = NODES.map((n) => project(n, sinA, cosA, sinB, cosB))
      for (let i = 0; i < proj.length; i++) {
        const el = nodeRef.current[i]
        if (el) {
          const depth = (proj[i].z + 1) / 2
          el.setAttribute('cx', proj[i].sx.toFixed(1))
          el.setAttribute('cy', proj[i].sy.toFixed(1))
          el.setAttribute('r', (2.4 + depth * 4).toFixed(2))
          el.setAttribute('opacity', (0.22 + depth * 0.45).toFixed(2))
        }
        if (i < proj.length - 1) {
          const ln = lineRef.current[i]
          if (ln) {
            ln.setAttribute('x1', proj[i].sx.toFixed(1))
            ln.setAttribute('y1', proj[i].sy.toFixed(1))
            ln.setAttribute('x2', proj[i + 1].sx.toFixed(1))
            ln.setAttribute('y2', proj[i + 1].sy.toFixed(1))
            const depth = ((proj[i].z + proj[i + 1].z) / 2 + 1) / 2
            ln.setAttribute('opacity', (0.1 + depth * 0.28).toFixed(2))
          }
        }
      }

      if (!reduce) raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
    }
  }, [])

  return (
    <svg
      viewBox="0 0 600 600"
      className={className}
      aria-hidden
      style={{ overflow: 'visible' }}
    >
      {pts.current.map((_, i) => (
        <circle
          key={i}
          ref={(el) => {
            dotsRef.current[i] = el
          }}
          fill="#10b981"
        />
      ))}
      {NODES.slice(0, -1).map((_, i) => (
        <line
          key={`l${i}`}
          ref={(el) => {
            lineRef.current[i] = el
          }}
          stroke="#34d399"
          strokeWidth={2}
          strokeLinecap="round"
        />
      ))}
      {NODES.map((_, i) => (
        <circle
          key={`n${i}`}
          ref={(el) => {
            nodeRef.current[i] = el
          }}
          fill="#4ade80"
        />
      ))}
    </svg>
  )
}
