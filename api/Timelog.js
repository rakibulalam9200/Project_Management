import Api from './defaultApi'

class Timelog extends Api {
    constructor(_axios) {
        super(_axios, '/api')
    }

    //   getAllTemplate(params) {
    //     return this.get('/template-project', params)
    //   }

    createTimelog(params) {
        return this.postFormData('/timelog', params)
    }

    getTimelog(params) {
        return this.get('/timelog', params)
    }

    getTimelogDetails(id) {
        return this.get(`/timelog/${id}`)
    }


    deleteTimelog(id) {
        return this.delete(`/timelog/${id}`)
    }

    deleteMultipleTimelogs(params) {
        return this.delete('/timelogs-delete', params)
    }

    cloneTimelogs(params) {
        return this.post(`/timelogs-clone`, params)
    }
    orderTimelogs(params) {
        return this.post(`/order-timelog`, params)
    }

    updateTimelog(id, params) {
        return this.postFormData(`/timelog/${id}`, params)
    }


    getChild(id, state,params) {
        return this.get(`/get-child/${id}/${state}`,params)
    }


    approveTimelog(params) {
        return this.post(`/timelogs-approved`, params)
    }

    timelogStatusChange(id, params) {
        return this.post(`/timelog-status-change/${id}`, params)
    }


}

export default Timelog
