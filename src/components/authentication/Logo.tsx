import Link from 'next/link'
import Image from 'next/image'

const Logo = () => {
  return (
    <Link href="/" className="flex items-center gap-2">
      <Image
        src="/logo.png"
        alt="Logo"
        width={40}
        height={40}
        className="object-cover"
      />
      <span className="text-xl font-bold text-gray-800 dark:text-white">
        쌀미 앱
      </span>
    </Link>
  )
}
export default Logo
