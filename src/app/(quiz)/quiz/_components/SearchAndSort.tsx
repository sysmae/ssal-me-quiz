// _components/SearchAndSort.tsx
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import CreateQuizButton from './CreateQuizButton'

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
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between w-full">
      <form onSubmit={handleSubmit} className="w-full md:w-auto flex-1">
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

      {/* 버튼 그룹: 한 줄 유지, 공간 부족하면 한 번에 다음 줄로 */}
      <div className="w-full md:w-auto">
        <div className="flex flex-nowrap justify-center md:justify-end items-center gap-2 overflow-x-auto">
          <Button
            onClick={() => handleSort('like_count')}
            variant="outline"
            className={cn(
              'px-4 py-2 rounded-lg border transition-colors whitespace-nowrap',
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
              'px-4 py-2 rounded-lg border transition-colors whitespace-nowrap',
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
              'px-4 py-2 rounded-lg border transition-colors whitespace-nowrap',
              activeSort === 'newest'
                ? 'bg-indigo-500 text-white hover:bg-indigo-600'
                : 'bg-white text-gray-700 hover:bg-indigo-100 hover:text-indigo-700 hover:border-indigo-300'
            )}
          >
            최신순
          </Button>
          <div className="whitespace-nowrap">
            <CreateQuizButton />
          </div>
        </div>
      </div>
    </div>
  )
}
