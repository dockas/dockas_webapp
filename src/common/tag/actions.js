//import lodash from "lodash";
import {createActions} from "redux-actions";
import {LoggerFactory} from "darch/src/utils";
import Api from "../utils/api";

let Logger = new LoggerFactory("common.tag.actions");

export default createActions({
    async tagFind(query, {
        scope="",
        concat=false,
        opts=null
    }) {
        var logger = Logger.create("tagFind");
        logger.info("enter", {query,scope,concat,opts});

        let response = await Api.shared.tagFind(query, opts);

        logger.debug("api tagFind success", response);

        // Build the dropdown version
        let dropdown = [];

        for(let tag of response.results) {
            dropdown.push({
                label: tag.name,
                value: tag._id,
                color: tag.color
            });
        }

        // Return data.
        return {data: response.results, dropdown, query, scope, concat};
    },

    /*orderUpdatedEvent(data) {
        let logger = Logger.create("orderUpdatedEvent");
        logger.info("enter", {data});

        let {result, updatedKeys} = data;
        data = lodash.pick(result, updatedKeys);

        logger.debug("updated data", data);

        // @TODO : If any items has changed, then we must
        // populate it.

        return {data, _id: result._id};
    }*/
});
