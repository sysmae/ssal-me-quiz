'use client'
import React, { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'

const ThemeChanger = () => {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  return (
    <div className="flex items-center justify-center w-full py-2">
      <button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className={`
          flex items-center justify-center
          h-10 w-10 rounded-full
          border border-border
          bg-muted
          transition
          hover:bg-accent hover:text-accent-foreground
          focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40
          shadow
        `}
        aria-label={
          theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'
        }
      >
        {theme === 'dark' ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="5" />
            <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
          </svg>
        )}
      </button>
    </div>
  )
}

export default ThemeChanger
