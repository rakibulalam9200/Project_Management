import { useEffect, useState } from 'react'

export default function useDelayedSearch(initialValue = '') {
  const [search, setSearch] = useState(initialValue)
  const [query, setQuery] = useState(initialValue)
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setQuery(search)
    }, 700)

    return () => clearTimeout(delayDebounceFn)
  }, [search])

  return {
    search,
    setSearch,
    delayedSearch: query,
  }
}
