import Api from './defaultApi'

class FilterHistory extends Api {
    constructor(_axios) {
        super(_axios, '/api')
    }

    storeFilterHistory(params) {
        return this.post(`/filter-history`, params)
    }

    updateFilterHistory(params, id) {
        return this.post(`/filter-history/${id}`, params)
      }

    getAllFilterHistory(params) {
        return this.get(`/filter-history`, params)
    }

    deleteFilterHistory(id) {
        return this.delete(`/filter-history/${id}`)
    }


}

export default FilterHistory