import lodash from "lodash";
import companyActions from "../company/actions";
import fileActions from "../file/actions";
import {LoggerFactory,Redux} from "darch/src/utils";

let Logger = new LoggerFactory("common.brand.populator");

export default class Populator {
    static async populateCompany(records, {
        pathsSet={},
        reload=false
    }={}) {
        let ids = {},
            companyData = lodash.get(Redux.getState(), "company.data"),
            logger = Logger.create("populateCompany");

        logger.info("enter", {count: records.length, pathsSet});

        if(!pathsSet["company"]) {return Promise.resolve();}

        for(let record of records) {
            if(!record.company
                ||(!reload && lodash.get(companyData, record.company))) {continue;}

            // Use lodash set because record.company might not
            // exist.
            ids[record.company] = true;
        }

        // Get only keys.
        ids = Object.keys(ids);

        // If no ids to fetch, then resolve right away.
        if(ids.length === 0) {
            return Promise.resolve();
        }

        return await Redux.dispatch(
            companyActions.companyFind({_id: ids})
        );
    }

    static async populateProfileImages(records, {
        pathsSet={},
        reload=false
    }={}) {
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
            fileActions.fileFind({_id: ids})
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
                Populator.populateCompany(records, opts),
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