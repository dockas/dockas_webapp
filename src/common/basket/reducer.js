import lodash from "lodash";
import {handleActions} from "redux-actions";
import {LoggerFactory,Storage,Redux} from "darch/src/utils";
import Toaster from "darch/src/toaster";

let Logger = new LoggerFactory("common.basket.reducer", {level:"debug"});
let storage = new Storage();

let initialState = {
    listId: null,
    listName: null,
    totalPrice: 0.00,
    totalDiscount: 0.00,
    items: {},
    address: null,
    coupons: {},
    billingSessionId: null
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
            quantity: 0,
            product
        };

        items[product._id].quantity++;

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
            items[product._id].quantity--;
            totalPrice -= product.priceValue;

            if(items[product._id].quantity === 0) {
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

    basketGetBillingSessionId_COMPLETED(state, action) {
        let logger = Logger.create("basketGetBillingSessionId_COMPLETED");
        logger.info("enter", {state, action});

        return Object.assign({}, state, {billingSessionId: action.payload});
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
            address: null,
            billingSessionId: null
        };

        // Save to localstorage.
        storage.set("basket", JSON.stringify(newState));

        return newState;
    },

    signinPageOpened() {
        let logger = Logger.create("signinPageOpened");
        logger.info("enter");

        let newState = {
            totalPrice: 0,
            totalDiscount: 0,
            items: {},
            coupons: {},
            address: null,
            billingSessionId: null
        };

        // Save to localstorage.
        storage.set("basket", JSON.stringify(newState));

        return newState;
    },

    productPriceUpdate_COMPLETED(state, action) {
        let logger = Logger.create("productPriceUpdate_COMPLETED");
        logger.info("enter", {state, action});

        let {items} = state;
        let item = items[action.payload._id];
        let newState = state;

        logger.debug("item", item);

        if(item) {
            logger.debug("old totalPrice", {totalPrice: state.totalPrice});

            // Remove old price
            let totalPrice = state.totalPrice - item.quantity * item.product.priceValue;

            logger.debug("totalPrice without old price", {totalPrice});

            // Add new price
            totalPrice += item.quantity * action.payload.value;

            logger.debug("new totalPrice", totalPrice);

            // Update price
            item.product.priceValue = action.payload.value;

            // log
            logger.debug("result", {item, totalPrice});

            // Set new state
            newState = Object.assign({}, state, {totalPrice, items});

            // Set new state total discount
            newState.totalDiscount = getTotalDiscount(newState);

            // Save to localstorage.
            storage.set("basket", JSON.stringify(newState));
        }

        return newState;
    },

    productUpdatedEvent_COMPLETED(state, action) {
        let logger = Logger.create("productUpdatedEvent_COMPLETED");
        logger.info("enter", {state, action});

        let {items} = state;
        let item = items[action.payload._id];
        let newState = state;

        if(item) {
            let stock = lodash.get(action, "payload.data.stock");

            // If stock becomes lesser then what user has selected,
            // then truncate it and notify user.
            if(item.quantity > stock) {
                let oldQuantity = item.quantity;
                item.quantity = stock;

                // Remove old price
                let totalPrice = state.totalPrice - oldQuantity * item.product.priceValue;

                // Add new price
                if(stock > 0) {
                    item.quantity = stock;
                    totalPrice += item.quantity * item.product.priceValue;
                }
                // Remove item
                else {
                    delete items[action.payload._id];
                }

                logger.debug("new total price", {totalPrice, item, oldQuantity});

                // Set new state
                newState = Object.assign({}, state, {totalPrice, items});

                // Set new state total discount
                newState.totalDiscount = getTotalDiscount(newState);

                // Save to localstorage.
                storage.set("basket", JSON.stringify(newState));

                // Prevent anti-patern of dispatching action before
                // reducer has finished.
                setTimeout(() => {
                    logger.debug("dispatching toaster action", item.product);

                    Redux.dispatch(Toaster.actions.push("warning", stock?"_WARNING_PRODUCT_STOCK_BECAME_LOWER_THAN_SELECTED_QUANTITY_":"_WARNING_PRODUCT_OUT_OF_STOCK_", {
                        messageData: {product: item.product}
                    }));
                }, 200);
            }
        }

        return newState;
    }
}, initialState);
