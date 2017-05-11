import lodash from "lodash";
import {handleActions} from "redux-actions";
import {LoggerFactory, Storage} from "darch/src/utils";

let Logger = new LoggerFactory("common.user.reducer", {level:"debug"});
let storage = new Storage();

let initialState = {
    listId: null,
    listName: null,
    totalPrice: 0.00,
    totalDiscount: 0.00,
    items: {},
    address: null,
    coupons: {}
};

function getTotalDiscount(state) {
    let {totalPrice, coupons} = state;
    let totalDiscount = 0;

    lodash.forOwn(coupons, (coupon) => {
        let discount = 0;

        // Update total price with coupon data.
        switch(coupon.valueType) {
            case "percentual": {
                discount = totalPrice * (coupon.value/100);
                break;
            }

            case "monetary": {
                discount = coupon.value;
                break;
            }
        }

        totalDiscount += discount;
    });

    return totalDiscount;
}

export default handleActions({
    basketInit_COMPLETED(state, action) {
        let logger = Logger.create("basketInit_COMPLETED");
        logger.info("enter", action.payload);

        return action.payload ? action.payload : state;
    },

    basketAddProduct(state, action) {
        let logger = Logger.create("basketAddProduct");
        logger.info("enter", {state, action});

        let product = action.payload;
        let {items,address} = state;

        items[product._id] = items[product._id] || {
            count: 0,
            product
        };

        items[product._id].count++;

        // Sum product price to totalPrice.
        let totalPrice = state.totalPrice + product.priceValue;

        logger.info("result", {items, totalPrice});

        // Set new state
        let newState = Object.assign({}, state, {totalPrice, items, address});

        // Set new state total discount
        newState.totalDiscount = getTotalDiscount(newState);

        // Save to localstorage.
        storage.set("basket", JSON.stringify(newState));

        return newState;
    },

    basketRemoveProduct(state, action) {
        let logger = Logger.create("basketRemoveProduct");
        logger.info("enter", {state, action});

        let product = action.payload;
        let {items,totalPrice,address} = state;

        if(items[product._id]) {
            items[product._id].count--;
            totalPrice -= product.priceValue;

            if(items[product._id].count === 0) {
                delete items[product._id];
            }
        }

        // Set new state
        let newState = Object.assign({}, state, {
            totalPrice, 
            items, 
            address
        });

        // Set new state total discount
        newState.totalDiscount = getTotalDiscount(newState);

        // Save to localstorage.
        storage.set("basket", JSON.stringify(newState));

        return newState;
    },

    basketLoadList(state, action) {
        let logger = Logger.create("basketLoadList");
        logger.info("enter", {state, action});

        let list = action.payload,
            newState = {
                listId: list._id,
                listName: list.name,
                totalPrice: 0.00,
                totalDiscount: 0.00,
                items: {},
                coupons: {}
            };

        for(let item of list.items) {
            newState.totalPrice += item.product.priceValue * item.count;
            newState.items[item.product._id] = item;
        }

        newState = Object.assign({}, state, newState);

        // Save to localstorage.
        storage.set("basket", JSON.stringify(newState));

        return newState;
    },

    basketApplyCoupon_COMPLETED(state, action) {
        let logger = Logger.create("basketApplyCoupon_COMPLETED");
        logger.info("enter", {state, action});

        let coupons = state.coupons;
        coupons[action.payload.nameId] = action.payload;

        logger.debug("data", {
            couponValue: action.payload.value,
            couponValueType: action.payload.valueType
        });

        // Set new state.
        let newState = Object.assign({}, state, {coupons});

        // Set new state total discount
        newState.totalDiscount = getTotalDiscount(newState);

        // Save to localstorage.
        storage.set("basket", JSON.stringify(newState));

        return newState;
    },

    basketSelectAddress(state, action) {
        let logger = Logger.create("basketSelectAddress");
        logger.info("enter", {state, action});

        let newState = Object.assign({}, state, {
            address: action.payload
        });

        // Save to localstorage.
        storage.set("basket", JSON.stringify(newState));

        return newState;
    },

    basketClear(state, action) {
        let logger = Logger.create("basketClear");
        logger.info("enter", {state, action});

        let newState = {
            totalPrice: 0,
            totalDiscount: 0,
            items: {},
            coupons: {},
            address: null
        };

        // Save to localstorage.
        storage.set("basket", JSON.stringify(newState));

        return newState;
    }
}, initialState);
