import {handleActions} from "redux-actions";
import {LoggerFactory} from "darch/src/utils";
import lodash from "lodash";

let Logger = new LoggerFactory("common.brand.reducer", {level:"debug"});

let initialState = {
    data: null,
    selected: null,
    query: null
};

export default handleActions({
    brandSelect(state, action) {
        var logger = Logger.create("brandSelect");
        logger.info("enter", {state,action});

        return Object.assign({}, state, {
            selected: action.payload
        });
    },

    brandFind_COMPLETED(state, action) {
        let logger = Logger.create("brandFind_COMPLETED");
        logger.info("enter", {state, action});

        return {
            data: action.payload.data,
            query: action.payload.query
        };
    },

    brandUpdate_COMPLETED(state, action) {
        let logger = Logger.create("brandUpdate_COMPLETED");
        logger.info("enter", {state, action});

        let {selected,data} = state;
        let idx = lodash.findIndex(data, (brand) => {
            return brand._id = action.payload._id;
        });

        if(idx >= 0) {
            data.splice(idx, 1, action.payload);
        }

        if(selected && selected._id == action.payload._id) {
            selected = Object.assign({}, selected, action.payload);
        }

        return {
            data,
            selected,
            query: state.query
        };
    }
}, initialState);
