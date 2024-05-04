export const getSortingOrderData = (arr) => {
  if (!arr) return []
  return arr.map((item, idx) => {
    return {
      id: item.id,
      order: idx + 1,
    }
  })
}
