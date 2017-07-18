import lodash from "lodash"
import Product from "../product"
import User from "../user"
import File from "../file"
import {LoggerFactory,Redux} from "darch/src/utils"

let Logger = new LoggerFactory("common.list.populator",{level: "debug"})

export default class Populator {
    static async populateItemsProduct(records, {
        paths=[],
        pathsSet={},
        reload=false
    }={}) {
        let ids = {},
            fetchedRecords = {},
            productData = lodash.get(Redux.getState(), "product.data"),
            logger = Logger.create("populateItemsProduct")

        logger.info("enter", {count: records.length, pathsSet, paths})

        if(!pathsSet["items[].product"]) {return Promise.resolve()}

        // Get not fetched records.
        for(let record of records) {
            for(let item of record.items) {
                if(!reload && productData[item.product]) {
                    fetchedRecords[item.product] = productData[item.product]
                    continue
                }

                ids[item.product] = true
            }
        }

        // Get only keys.
        ids = Object.keys(ids)
        fetchedRecords = Object.values(fetchedRecords)

        // Log
        logger.debug("ids", {ids, fetchedRecords})

        // Build populate paths
        let baseRegex = /^items\[\]\.product\./,
            populatePaths = []

        for(let path of paths) {
            if(baseRegex.test(path)) {
                populatePaths.push(path.replace(baseRegex, ""))
            }
        }

        logger.debug("populatePaths", {populatePaths})

        // Populate fetched records.
        if(fetchedRecords.length) {
            Product.populator.populate(fetchedRecords, {
                paths: populatePaths
            })
        }

        // If no ids to fetch, then resolve right away
        if(ids.length === 0) {
            return Promise.resolve()
        }

        // Fetch non fetched records.
        return await Redux.dispatch(
            Product.actions.productFind({_id: ids}, {
                populate: {paths: populatePaths}
            })
        )
    }

    static async populateOwnersUser(records, {
        paths=[],
        pathsSet={},
        reload=false
    }={}) {
        let ids = {},
            fetchedRecords = {},
            userData = lodash.get(Redux.getState(), "user.data"),
            logger = Logger.create("populateOwnersUser")

        logger.info("enter", {count: records.length, pathsSet, paths})

        if(!pathsSet["owners[].user"]) {return Promise.resolve()}

        // Get not fetched records.
        for(let record of records) {
            for(let owner of record.owners) {
                if(!reload && userData[owner.user]) {
                    fetchedRecords[owner.user] = userData[owner.user]
                    continue
                }

                ids[owner.user] = true
            }
        }

        // Get only keys.
        ids = Object.keys(ids)
        fetchedRecords = Object.values(fetchedRecords)

        // Log
        logger.debug("ids", {ids, fetchedRecords})

        // Build populate paths
        /*let baseRegex = /^items\[\]\.product\./,
            populatePaths = [];

        for(let path of paths) {
            if(baseRegex.test(path)) {
                populatePaths.push(path.replace(baseRegex, ""));
            }
        }

        logger.debug("populatePaths", {populatePaths});*/

        // Populate fetched records.
        /*if(fetchedRecords.length) {
            Product.populator.populate(fetchedRecords, {
                paths: populatePaths
            });
        }*/

        // If no ids to fetch, then resolve right away
        if(ids.length === 0) {
            return Promise.resolve()
        }

        // Fetch non fetched records.
        return await Redux.dispatch(
            User.actions.userFind({_id: ids})
        )
    }

    static async populateBannerImage(records, {
        pathsSet={},
        reload=false
    }={}) {
        let ids = {},
            fileData = lodash.get(Redux.getState(), "file.data"),
            logger = Logger.create("populateBannerImage")

        logger.info("enter", {count: records.length, pathsSet})

        if(!pathsSet["bannerImage"]) {return Promise.resolve()}

        for(let record of records) {
            if(!reload && (!record.bannerImage || fileData[record.bannerImage])) {continue}
            ids[record.bannerImage] = true
        }

        // Get only keys.
        ids = Object.keys(ids)

        // Log
        logger.debug("ids", {ids})

        // If no ids to fetch, then resolve right away.
        if(ids.length === 0) {
            return Promise.resolve()
        }

        return await Redux.dispatch(
            File.actions.fileFind({_id: ids})
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
                Populator.populateItemsProduct(records, opts),
                Populator.populateOwnersUser(records, opts),
                Populator.populateBannerImage(records, opts)
            ])

            logger.info("all populate success")
        }
        catch(error) {
            logger.error("all populate error", error)
        }

        return result
    }
}