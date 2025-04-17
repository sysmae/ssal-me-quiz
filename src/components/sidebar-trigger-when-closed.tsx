'use client'
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar'

export default function SidebarTriggerWhenClosed() {
  const { open } = useSidebar()
  return (
    <div
      className={`
        fixed top-4 z-50 transition-all duration-300
        ${open ? 'md:left-56 left-0' : 'left-4'}
      `}
      aria-hidden={false}
    >
      <SidebarTrigger aria-label="사이드바 열기" />
    </div>
  )
}
