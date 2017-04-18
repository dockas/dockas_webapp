import lodash from "lodash";
import {handleActions} from "redux-actions";
import {LoggerFactory, Storage} from "darch/src/utils";

let Logger = new LoggerFactory("common.user.reducer", {level:"debug"});
let storage = new Storage();

let initialState = {
    totalPrice: 0.00,
    items: {},
    address: null
};

export default handleActions({
    basketInit_COMPLETED(state, action) {
        let logger = Logger.create("basketInit_COMPLETED");
        logger.info("enter", action.payload);

        return action.payload ? action.payload : state;
    },

    basketAddProduct(state, action) {
        let logger = Logger.create("basketAddProduct");
        logger.info("enter", {state: state, action: action});

        let product = action.payload;
        let {items,address} = state;

        items[product._id] = items[product._id] || {
            count: 0,
            product
        };

        items[product._id].count++;

        // Sum product price to totalPrice.
        let totalPrice = state.totalPrice + product.price;

        logger.info("result", {items, totalPrice});

        let newState = {totalPrice, items, address};

        // Save to localstorage.
        storage.set("basket", JSON.stringify(newState));

        return newState;
    },

    basketRemoveProduct(state, action) {
        let logger = Logger.create("basketRemoveProduct");
        logger.info("enter", {state: state, action: action});

        let product = action.payload;
        let {items,totalPrice,address} = state;

        if(items[product._id]) {
            items[product._id].count--;
            totalPrice -= product.price;

            if(items[product._id].count === 0) {
                delete items[product._id];
            }
        }

        let newState = {totalPrice, items, address};

        // Save to localstorage.
        storage.set("basket", JSON.stringify(newState));

        return newState;
    },

    basketSelectAddress(state, action) {
        let logger = Logger.create("basketSelectAddress");
        logger.info("enter", {state: state, action: action});

        let newState = lodash.assign({}, state, {
            address: action.payload
        });

        // Save to localstorage.
        storage.set("basket", JSON.stringify(newState));

        return newState;
    },

    basketClear(state, action) {
        let logger = Logger.create("basketClear");
        logger.info("enter", {state: state, action: action});

        let newState = {
            totalPrice: 0,
            items: {}
        };

        // Save to localstorage.
        storage.set("basket", JSON.stringify(newState));

        return newState;
    }
}, initialState);
