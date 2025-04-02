// _components/SearchAndSort.tsx
import { useState } from 'react'

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
            className="w-full md:w-80 px-4 py-2 border rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2"
          >
            🔍
          </button>
        </div>
      </form>

      <div className="flex gap-2">
        <button
          onClick={() => handleSort('like_count')}
          className={`px-4 py-2 rounded-lg ${
            activeSort === 'like_count'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          인기순
        </button>
        <button
          onClick={() => handleSort('view_count')}
          className={`px-4 py-2 rounded-lg ${
            activeSort === 'view_count'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          조회수순
        </button>
        <button
          onClick={() => handleSort('newest')}
          className={`px-4 py-2 rounded-lg ${
            activeSort === 'newest'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          최신순
        </button>
      </div>
    </div>
  )
}
