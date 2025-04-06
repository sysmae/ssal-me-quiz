// _components/SearchAndSort.tsx
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface SearchAndSortProps {
  onSearch: (term: string) => void
  onSort: (sort: string) => void
}

export default function SearchAndSort({
  onSearch,
  onSort,
}: SearchAndSortProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeSort, setActiveSort] = useState('like_count')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(searchTerm)
  }

  const handleSort = (sort: string) => {
    setActiveSort(sort)
    onSort(sort)
  }

  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
      <form onSubmit={handleSubmit} className="w-full md:w-auto">
        <div className="relative">
          <input
            type="text"
            placeholder="퀴즈 검색..."
            className="w-full md:w-80 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button
            type="submit"
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 hover:bg-indigo-100"
          >
            🔍
          </Button>
        </div>
      </form>

      <div className="flex gap-2">
        <Button
          onClick={() => handleSort('like_count')}
          variant="outline"
          className={cn(
            'px-4 py-2 rounded-lg border transition-colors',
            activeSort === 'like_count'
              ? 'bg-indigo-500 text-white hover:bg-indigo-600'
              : 'bg-white text-gray-700 hover:bg-indigo-100 hover:text-indigo-700 hover:border-indigo-300'
          )}
        >
          인기순
        </Button>
        <Button
          onClick={() => handleSort('view_count')}
          variant="outline"
          className={cn(
            'px-4 py-2 rounded-lg border transition-colors',
            activeSort === 'view_count'
              ? 'bg-indigo-500 text-white hover:bg-indigo-600'
              : 'bg-white text-gray-700 hover:bg-indigo-100 hover:text-indigo-700 hover:border-indigo-300'
          )}
        >
          조회수순
        </Button>
        <Button
          onClick={() => handleSort('newest')}
          variant="outline"
          className={cn(
            'px-4 py-2 rounded-lg border transition-colors',
            activeSort === 'newest'
              ? 'bg-indigo-500 text-white hover:bg-indigo-600'
              : 'bg-white text-gray-700 hover:bg-indigo-100 hover:text-indigo-700 hover:border-indigo-300'
          )}
        >
          최신순
        </Button>
      </div>
    </div>
  )
}
