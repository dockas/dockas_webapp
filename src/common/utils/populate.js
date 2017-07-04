import {LoggerFactory,Redux} from "darch/src/utils";

let Logger = new LoggerFactory("common.utils.populate");

export default function(records, paths, pathToFindActionMap) {
    let logger = Logger.create("populate");
    logger.info("enter", {recordsCount: count, paths});

    
}