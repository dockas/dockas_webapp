import lodash from "lodash";
import Product from "../product";
import Order from "../order";
import {LoggerFactory,Redux} from "darch/src/utils";

let Logger = new LoggerFactory("common.order_item.populator");

export default class Populator {
    static async populateOrder(records, {
        pathsSet={},
        reload=false
    }={}) {
        let ids = {},
            orderData = lodash.get(Redux.getState(), "order.data"),
            logger = Logger.create("populateOrder");

        logger.info("enter", {count: records.length, pathsSet});

        if(!pathsSet["order"]) {return Promise.resolve();}

        for(let record of records) {
            if(!reload && orderData[record.order]) {continue;}
            ids[record.order] = true;
        }

        // Get only keys.
        ids = Object.keys(ids);

        // If no ids to fetch, then resolve right away.
        if(ids.length === 0) {
            return Promise.resolve();
        }

        return await Redux.dispatch(
            Order.actions.orderFind({_id: ids})
        );
    }

    static async populateProduct(records, {
        paths=[],
        pathsSet={},
        reload=false
    }={}) {
        let ids = {},
            fetchedRecords = {},
            productData = lodash.get(Redux.getState(), "product.data"),
            logger = Logger.create("populateProduct");

        logger.info("enter", {count: records.length, pathsSet, paths});

        if(!pathsSet["product"]) {return Promise.resolve();}

        // Get not fetched records.
        for(let record of records) {
            if(!reload && productData[record.product]) {
                fetchedRecords[record.product] = productData[record.product];
                continue;
            }

            ids[record.product] = true;
        }

        // Get only keys.
        ids = Object.keys(ids);
        fetchedRecords = Object.values(fetchedRecords);

        // Log
        logger.debug("ids", {ids, fetchedRecords});

        // Build populate paths
        let baseRegex = /^product\./,
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
                Populator.populateOrder(records, opts),
                Populator.populateProduct(records, opts)
            ]);

            logger.info("all populate success");
        }
        catch(error) {
            logger.error("all populate error", error);
        }

        return result;
    }
}