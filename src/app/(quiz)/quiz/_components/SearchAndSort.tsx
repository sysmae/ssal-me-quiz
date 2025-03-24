import React, { useState } from 'react'

type SearchAndSortProps = {
  onSearch: (term: string) => void
  onSort: (sortBy: string) => void
}

const SearchAndSort: React.FC<SearchAndSortProps> = ({ onSearch, onSort }) => {
  const [searchTerm, setSearchTerm] = useState('')

  const handleSearch = () => {
    onSearch(searchTerm)
  }

  return (
    <div className="flex space-x-4">
      <input
        type="text"
        placeholder="검색..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="border p-2 rounded-lg"
      />
      <button
        onClick={handleSearch}
        className="bg-blue-500 text-white px-4 py-2 rounded-lg"
      >
        검색
      </button>
      <select
        onChange={(e) => onSort(e.target.value)}
        className="border p-2 rounded-lg"
      >
        <option value="popular">인기순</option>
        <option value="recent">최신순</option>
      </select>
    </div>
  )
}

export default SearchAndSort
