import Api from './defaultApi'

class DashboardListView extends Api {
    constructor(_axios) {
        super(_axios, '/api')
    }

    getDashbarodListViewData(params) {
        return this.get('/get-mobile-dashboard', params)
    }
    getDirectoryDashboard(params){
        return this.get('/directory-dashboard', params)
    }

}

export default DashboardListView