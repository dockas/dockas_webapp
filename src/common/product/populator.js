import lodash from "lodash";
import Tag from "../tag";
import Brand from "../brand";
import File from "../file";
import {LoggerFactory,Redux} from "darch/src/utils";

let Logger = new LoggerFactory("common.product.populator");

export default class Populator {
    static async populateTags(records, {
        pathsSet={},
        reload=false
    }={}) {
        let ids = {},
            tagData = lodash.get(Redux.getState(), "tag.data"),
            logger = Logger.create("populateTags");

        logger.info("enter", {count: records.length, pathsSet});

        if(!pathsSet["tags"]) {return Promise.resolve();}

        for(let record of records) {
            for(let tag of record.tags) {
                if(!reload && tagData[tag]) {continue;}
                ids[tag] = true;
            }
        }

        // Get only keys.
        ids = Object.keys(ids);

        // If no ids to fetch, then resolve right away.
        if(ids.length === 0) {
            return Promise.resolve();
        }

        return await Redux.dispatch(
            Tag.actions.tagFind({_id: ids})
        );
    }

    static async populateBrand(records, {
        paths=[],
        pathsSet={},
        reload=false
    }={}) {
        let ids = {},
            fetchedRecords = {},
            brandData = lodash.get(Redux.getState(), "brand.data"),
            logger = Logger.create("populateBrand");

        logger.info("enter", {count: records.length, pathsSet});

        if(!pathsSet["brand"]) {return Promise.resolve();}

        for(let record of records) {
            if(!reload && brandData[record.brand]) {
                fetchedRecords[record.brand] = brandData[record.brand];
                continue;
            }
            ids[record.brand] = true;
        }

        // Get only keys.
        ids = Object.keys(ids);
        fetchedRecords = Object.values(fetchedRecords);

        // Build populate paths
        let baseRegex = /^brand\./,
            populatePaths = [];

        for(let path of paths) {
            if(baseRegex.test(path)) {
                populatePaths.push(path.replace(baseRegex, ""));
            }
        }

        logger.debug("populatePaths", {populatePaths});

        // Populate fetched records.
        if(fetchedRecords.length) {
            Brand.populator.populate(fetchedRecords, {
                paths: populatePaths
            });
        }

        // If no ids to fetch, then resolve right away.
        if(ids.length === 0) {
            return Promise.resolve();
        }

        return await Redux.dispatch(
            Brand.actions.brandFind({_id: ids}, {
                populate: {paths: populatePaths}
            })
        );
    }

    static async populateMainProfileImage(records, {
        pathsSet={},
        reload=false
    }={}) {
        let ids = {},
            fileData = lodash.get(Redux.getState(), "file.data"),
            logger = Logger.create("populateMainProfileImage");

        logger.info("enter", {count: records.length, pathsSet});

        if(!pathsSet["mainProfileImage"]) {return Promise.resolve();}

        for(let record of records) {
            if(!reload && fileData[record.mainProfileImage]) {continue;}
            ids[record.mainProfileImage] = true;
        }

        // Get only keys.
        ids = Object.keys(ids);

        // If no ids to fetch, then resolve right away.
        if(ids.length === 0) {
            return Promise.resolve();
        }

        return await Redux.dispatch(
            File.actions.fileFind({_id: ids})
        );
    }

    static async populateProfileImages(records, {
        pathsSet={},
        reload=false
    }) {
        let ids = {},
            fileData = lodash.get(Redux.getState(), "file.data"),
            logger = Logger.create("populateProfileImages");

        logger.info("enter", {count: records.length, pathsSet});

        if(!pathsSet["profileImages"]) {return Promise.resolve();}

        for(let record of records) {
            for(let profileImage of record.profileImages) {
                if(!reload && fileData[profileImage]) {continue;}
                ids[profileImage] = true;
            }
        }

        // Get only keys.
        ids = Object.keys(ids);

        // If no ids to fetch, then resolve right away.
        if(ids.length === 0) {
            return Promise.resolve();
        }

        return await Redux.dispatch(
            File.actions.fileFind({_id: ids})
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
                Populator.populateTags(records, opts),
                Populator.populateBrand(records, opts),
                Populator.populateMainProfileImage(records, opts),
                Populator.populateProfileImages(records, opts)
            ]);

            logger.info("all populate success");
        }
        catch(error) {
            logger.error("all populate error", error);
        }

        return result;
    }
}