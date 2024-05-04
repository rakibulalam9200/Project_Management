import Api from './defaultApi'

class WorkingHour extends Api {
    constructor(_axios) {
        super(_axios, '/api')
    }

    startingHour(params,id) {
        return this.post(`/working-hour-start/${id}`, params)
    }

    declineWorking(params,id) {
        return this.post(`/working-hour-decline/${id}`, params)
    }

    pauseHour(params,id) {
        return this.post(`/working-hour-pause/${id}`, params)
    }

    completeHour(params,id) {
        return this.post(`/working-hour-complete/${id}`, params)
    }

    reviewAccept(params,id) {
        return this.post(`/review-accept/${id}`, params)
    }

    reviewDecline(params,id) {
        return this.post(`/review-decline/${id}`, params)
    }



}

export default WorkingHour