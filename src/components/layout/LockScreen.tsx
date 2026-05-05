'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'

export function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)

  useEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth)
    }
    
    // Check if user already unlocked in this session
    const isUnlocked = sessionStorage.getItem('contte_unlocked')
    if (isUnlocked === 'true') {
      onUnlock()
    }
  }, [onUnlock])

  const handleDragEnd = (event: any, info: any) => {
    if (info.offset.x > containerWidth * 0.5) {
      sessionStorage.setItem('contte_unlocked', 'true')
      onUnlock()
    }
  }

  return (
    <div className="fade-in" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: '#0a0a0a', zIndex: 9999, display: 'flex', flexDirection: 'column',
      padding: '40px 24px', justifyContent: 'space-between'
    }}>
      {/* Decorative Glow */}
      <div style={{ position: 'absolute', top: '-10%', right: '-20%', width: '300px', height: '300px', background: '#ccff00', borderRadius: '50%', filter: 'blur(150px)', opacity: 0.15 }} />
      
      {/* Abstract Shape / Logo */}
      <div style={{ position: 'absolute', top: '40px', right: '30px' }}>
        <div style={{ position: 'relative', width: '80px', height: '120px' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: '40px', height: '40px', borderRadius: '50%', background: '#ccff00' }} />
          <div style={{ position: 'absolute', top: '40px', right: 0, width: '40px', height: '40px', borderRadius: '50%', background: '#ccff00', borderTopLeftRadius: '20px', borderBottomLeftRadius: '20px' }} />
          <div style={{ position: 'absolute', top: '80px', right: 0, width: '40px', height: '40px', borderRadius: '50%', background: '#ccff00' }} />
          <div style={{ position: 'absolute', top: '40px', left: 0, width: '40px', height: '40px', borderRadius: '50%', background: '#ccff00' }} />
          <div style={{ position: 'absolute', top: '100px', left: '-20px', width: '30px', height: '30px', borderRadius: '50%', background: '#ccff00' }} />
        </div>
      </div>

      <div style={{ marginTop: 'auto', marginBottom: '80px', position: 'relative', zIndex: 10 }}>
        <h1 style={{ fontSize: '44px', fontWeight: 700, color: '#fff', lineHeight: 1.1, letterSpacing: '-1px' }}>
          O controle do<br />
          seu dinheiro,<br />
          a qualquer hora,<br />
          em qualquer lugar.
        </h1>
      </div>
      
      <div 
        ref={containerRef}
        style={{
          width: '100%', height: '64px', borderRadius: '32px',
          background: 'rgba(255,255,255,0.05)', position: 'relative',
          display: 'flex', alignItems: 'center', overflow: 'hidden'
        }}
      >
        <span style={{ position: 'absolute', width: '100%', textAlign: 'center', color: '#71717a', fontSize: '15px', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          Deslize para abrir <ChevronRight size={16} />
        </span>
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: containerWidth > 0 ? containerWidth - 64 : 0 }}
          dragElastic={0.1}
          onDragEnd={handleDragEnd}
          style={{
            width: '52px', height: '52px', borderRadius: '50%',
            background: '#fff', position: 'absolute', left: '6px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'grab', zIndex: 10
          }}
        >
          <ChevronRight size={24} color="#000" />
        </motion.div>
      </div>
    </div>
  )
}
