import Api from './defaultApi'

class GlobalSearch extends Api {
    constructor(_axios) {
        super(_axios, '/api')
    }
    getAllSearchData(params) {
        return this.get('/global-search', params)
    }

    
}

export default GlobalSearch
