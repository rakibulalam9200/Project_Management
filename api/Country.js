import Api from './defaultApi'

class Country extends Api {
    constructor(_axios) {
        super(_axios, '/api')
    }

    getCountries(params) {
        return this.get('/country', params)
    }
}

export default Country
