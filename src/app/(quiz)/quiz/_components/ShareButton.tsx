import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

interface ShareButtonProps {
  url?: string
}

export default function ShareButton({ url }: ShareButtonProps) {
  const [isCopied, setIsCopied] = useState(false)

  const handleCopyToClipboard = async () => {
    try {
      const urlToCopy = url || window.location.href
      await navigator.clipboard.writeText(urlToCopy)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 3000)
    } catch (error) {
      alert('URL 복사에 실패했습니다. 다시 시도해주세요.')
    }
  }

  return (
    <button
      onClick={handleCopyToClipboard}
      className={`flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer ${
        isCopied ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
      } transition-colors duration-300`}
    >
      {isCopied ? <Check className="w-6 h-6" /> : <Copy className="w-6 h-6" />}
      <span>{isCopied ? '복사됨' : '공유하기'}</span>
    </button>
  )
}
