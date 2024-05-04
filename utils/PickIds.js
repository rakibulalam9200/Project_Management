export const getIdsFromArray = (array,arrayName) => {
    if (!array) return {}
    let Ids = {}
    for (let i = 0; i < array.length; i++) {
      let {id} = array[i]
      Ids[`${arrayName}[${i}]`] = id
    }
    return Ids
  }