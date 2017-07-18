import lodash from "lodash"
import User from "../user"
import {LoggerFactory,Redux} from "darch/src/utils"

let Logger = new LoggerFactory("common.tag.populator")

export default class Populator {
    static async populateCreator(records, {
        pathsSet={},
        reload=false
    }={}) {
        let ids = {},
            userData = lodash.get(Redux.getState(), "user.data"),
            logger = Logger.create("populateOrder")

        logger.info("enter", {count: records.length, pathsSet})

        if(!pathsSet["creator"]) {return Promise.resolve()}

        for(let record of records) {
            if(!reload && userData[record.creator]) {continue}
            ids[record.creator] = true
        }

        // Get only keys.
        ids = Object.keys(ids)

        console.log(["macumba maluca", ids, userData])

        // If no ids to fetch, then resolve right away.
        if(ids.length === 0) {
            return Promise.resolve()
        }

        return await Redux.dispatch(
            User.actions.userFind({_id: ids})
        )
    }

    static async populate(records, opts={}) {
        let result,
            {paths} = opts,
            pathsSet = {},
            logger = Logger.create("populate")
        
        logger.info("enter", {count: records.length, paths})

        // Build populate paths set
        for(let path of paths||[]) {
            pathsSet[path] = true
        }

        // New modified opts.
        opts = Object.assign({}, opts, {pathsSet})

        try {
            result = await Promise.all([
                Populator.populateCreator(records, opts)
            ])

            logger.info("all populate success")
        }
        catch(error) {
            logger.error("all populate error", error)
        }

        return result
    }
}