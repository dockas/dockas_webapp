import {handleActions} from "redux-actions";
import {LoggerFactory} from "darch/src/utils";
import lodash from "lodash";

let Logger = new LoggerFactory("common.product.reducer", {level:"debug"});

let initialState = {
    data: null,
    selected: null,
    query: null
};

export default handleActions({
    productSelect(state, action) {
        var logger = Logger.create("productSelect");
        logger.info("enter", {state,action});

        return Object.assign({}, state, {
            selected: action.payload
        });
    },

    productCreate_COMPLETED(state, action) {
        let logger = Logger.create("productCreate_COMPLETED");
        logger.info("enter", {state, action});

        return state;
    },

    productFind_COMPLETED(state, action) {
        let data,logger = Logger.create("productFind_COMPLETED");
        logger.info("enter", {state, action});

        if(action.payload.opts.concat) {
            data = (state.data||[]).concat(action.payload.data);
        }
        else {
            data = action.payload.data;
        }

        return {
            data,
            query: action.payload.query
        };
    },

    productUpdate_COMPLETED(state, action) {
        let logger = Logger.create("productUpdate_COMPLETED");
        logger.info("enter", {state, action});

        let {selected,data} = state;
        let idx = lodash.findIndex(data, (product) => {
            return product._id = action.payload.data._id;
        });

        if(idx >= 0) {
            data.splice(idx, 1, lodash.merge({}, action.payload.data, action.payload.opts.data));
        }

        if(selected && selected._id == action.payload.data._id) {
            selected = lodash.merge({}, selected, action.payload.data, action.payload.opts.data);
        }

        return {
            data,
            selected,
            query: state.query
        };
    }
}, initialState);
