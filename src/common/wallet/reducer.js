import {handleActions} from "redux-actions"
import {LoggerFactory} from "darch/src/utils"
import lodash from "lodash"

let Logger = new LoggerFactory("common.wallet.reducer", {level:"debug"})

let initialState = {
    data: {},
    scope: {}
}

export default handleActions({
    brandWalletFind_COMPLETED(state, action) {
        let logger = Logger.create("brandWalletFind_COMPLETED")
        logger.info("enter", {action})

        if(!lodash.get(action, "payload._id")) {return state}

        return Object.assign({}, state, {
            data: Object.assign({}, state.data, {
                [action.payload._id]: action.payload
            })
        })
    },

    walletFindById_COMPLETED(state, action) {
        let logger = Logger.create("walletFindById_COMPLETED")
        logger.info("enter", {action})

        if(!lodash.get(action, "payload._id")) {return state}

        return Object.assign({}, state, {
            data: Object.assign({}, state.data, {
                [action.payload._id]: action.payload
            })
        })
    },

    walletUpdatedEvent_COMPLETED(state, action) {
        let logger = Logger.create("walletUpdatedEvent_COMPLETED")
        logger.info("enter", {state, action})

        return Object.assign({}, state, {
            data: Object.assign({}, state.data, {
                [action.payload._id]: action.payload.data
            })
        })
    },

    signinPageOpened() {
        let logger = Logger.create("signinPageOpened")
        logger.info("enter")

        return {
            data: {},
            scope: {}
        }
    }
}, initialState)
