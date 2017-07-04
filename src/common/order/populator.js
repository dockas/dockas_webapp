import lodash from "lodash";
import Product from "../product";
import User from "../user";
import {LoggerFactory,Redux} from "darch/src/utils";

let Logger = new LoggerFactory("common.order.populator");

export default class Populator {
    static async populateUser(records, {
        pathsSet={},
        reload=false
    }={}) {
        let ids = {},
            userData = lodash.get(Redux.getState(), "user.data"),
            logger = Logger.create("populateUser");

        logger.info("enter", {count: records.length, pathsSet});

        if(!pathsSet["user"]) {return Promise.resolve();}

        for(let record of records) {
            if(!reload && userData[record.user]) {continue;}
            ids[record.user] = true;
        }

        // Get only keys.
        ids = Object.keys(ids);

        // If no ids to fetch, then resolve right away.
        if(ids.length === 0) {
            return Promise.resolve();
        }

        return await Redux.dispatch(
            User.actions.userFind({_id: ids})
        );
    }

    static async populateItemsProduct(records, {
        paths=[],
        pathsSet={},
        reload=false
    }={}) {
        let ids = {},
            fetchedRecords = {},
            productData = lodash.get(Redux.getState(), "product.data"),
            logger = Logger.create("populateItemsProduct");

        logger.info("enter", {count: records.length, pathsSet, paths});

        if(!pathsSet["items[].product"]) {return Promise.resolve();}

        // Get not fetched records.
        for(let record of records) {
            for(let item of record.items) {
                if(!reload && productData[item.product]) {
                    fetchedRecords[item.product] = productData[item.product];
                    continue;
                }

                ids[item.product] = true;
            }
        }

        // Get only keys.
        ids = Object.keys(ids);
        fetchedRecords = Object.values(fetchedRecords);

        // Log
        logger.debug("ids", {ids, fetchedRecords});

        // Build populate paths
        let baseRegex = /^items\[\]\.product\./,
            populatePaths = [];

        for(let path of paths) {
            if(baseRegex.test(path)) {
                populatePaths.push(path.replace(baseRegex, ""));
            }
        }

        logger.debug("populatePaths", {populatePaths});

        // Populate fetched records.
        if(fetchedRecords.length) {
            Product.populator.populate(fetchedRecords, {
                paths: populatePaths
            });
        }

        // If no ids to fetch, then resolve right away
        if(ids.length === 0) {
            return Promise.resolve();
        }

        // Fetch non fetched records.
        return await Redux.dispatch(
            Product.actions.productFind({_id: ids}, {
                populate: {paths: populatePaths}
            })
        );
    }

    static async populate(records, opts={}) {
        let result,
            {paths} = opts,
            pathsSet = {},
            logger = Logger.create("populate");
        
        logger.info("enter", {count: records.length, paths});

        // Build populate paths set
        for(let path of paths||[]) {
            pathsSet[path] = true;
        }

        // New modified opts.
        opts = Object.assign({}, opts, {pathsSet});

        try {
            result = await Promise.all([
                Populator.populateUser(records, opts),
                Populator.populateItemsProduct(records, opts)
            ]);

            logger.info("all populate success");
        }
        catch(error) {
            logger.error("all populate error", error);
        }

        return result;
    }
}