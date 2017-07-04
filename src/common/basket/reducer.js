import lodash from "lodash";
import config from "config";
import moment from "moment";
import {handleActions} from "redux-actions";
import {LoggerFactory,Storage,Redux} from "darch/src/utils";
import Toaster from "darch/src/toaster";

let Logger = new LoggerFactory("common.basket.reducer", {level:"debug"});
let storage = new Storage();

let initialState = {
    listId: null,
    listName: null,
    grossTotalPrice: 0,
    totalPrice: 0,
    totalDiscount: 0,
    totalFee: 0,
    appliedFees: [],
    items: {},
    address: null,
    deliverDate: null,
    billingSource: null,
    coupons: {},
    isPaying: false,
    showCard: true
};

function getTotalDiscount(state) {
    let logger = Logger.create("getTotalDiscount");
    let {grossTotalPrice, coupons} = state;
    let totalDiscount = 0;

    logger.info("enter", {grossTotalPrice,coupons});

    lodash.forOwn(coupons, (coupon) => {
        let discount = 0;

        // Update total price with coupon data.
        switch(coupon.valueType) {
            case "percentual": {
                discount = grossTotalPrice * (coupon.value/100);
                break;
            }

            case "monetary": {
                discount = coupon.value;
                break;
            }
        }

        totalDiscount += discount;
    });

    return totalDiscount > grossTotalPrice ? grossTotalPrice : totalDiscount;
}

function getTotalFee(state) {
    let logger = Logger.create("getTotalFee");
    let {deliverDate,grossTotalPrice} = state;
    let fees = lodash.get(config, "shared.order.fees")||{};
    let appliedFees = [];
    let totalFee = 0;

    logger.info("enter", {deliverDate,grossTotalPrice,fees});

    // Deliver fee
    let {priceRange,weekdays} = lodash.get(fees, "deliver.rules")||{};

    let priceRangePass = (priceRange
        && grossTotalPrice < (priceRange.lt||(grossTotalPrice+1))
        && grossTotalPrice <= (priceRange.lte||grossTotalPrice)
        && grossTotalPrice >= (priceRange.gte||grossTotalPrice)
        && grossTotalPrice > (priceRange.gt||(grossTotalPrice-1)));

    let weekdaysPass = (weekdays 
        && deliverDate
        && weekdays.indexOf(moment.weekdays(moment(deliverDate).isoWeekday())) >= 0);

    logger.info("pass", {priceRangePass,weekdaysPass});

    // Apply on pass
    if(priceRangePass || weekdaysPass) {
        totalFee += lodash.get(fees, "deliver.value")||0;
        
        appliedFees.push({
            value: lodash.get(fees, "deliver.value")||0,
            type: "deliver"
        });
    }

    return {appliedFees, totalFee};
}

function evalTotalPrice(state) {
    let logger = Logger.create("evalTotalPrice");

    // Get fees
    let {totalFee, appliedFees} = getTotalFee(state);

    // Set new state total discount & fees
    state.totalDiscount = getTotalDiscount(state);
    state.totalFee = totalFee;
    state.appliedFees = appliedFees;
    state.totalPrice = state.grossTotalPrice - state.totalDiscount + state.totalFee;

    logger.info("discount && fee", {
        totalDiscount: state.totalDiscount,
        totalFee, appliedFees,
        totalPrice: state.totalPrice,
        grossTotalPrice: state.grossTotalPrice
    });

    return state;
}

export default handleActions({
    basketInit_COMPLETED(state, action) {
        let logger = Logger.create("basketInit_COMPLETED");
        logger.info("enter", action.payload);

        return action.payload ? action.payload : state;
    },

    basketSetShowCard(state, action) {
        let logger = Logger.create("basketSetShowCard");
        logger.info("enter", {action});

        return Object.assign({}, state, action.payload);
    },

    basketSetIsPaying(state, action) {
        let logger = Logger.create("basketSetIsPaying");
        logger.info("enter", {action});

        return Object.assign({}, state, action.payload);
    },

    basketAddProduct(state, action) {
        let logger = Logger.create("basketAddProduct");
        logger.info("enter", {action});

        let product = action.payload;
        let {items,address} = state;

        items[product._id] = items[product._id] || {
            quantity: 0,
            product: product._id
        };

        items[product._id].quantity++;

        // Sum product price to totalPrice.
        let grossTotalPrice = state.grossTotalPrice + product.priceValue;

        logger.info("result", {items, grossTotalPrice});

        // Set new state
        let newState = Object.assign({}, state, {grossTotalPrice, items, address});
        newState = evalTotalPrice(newState);

        // Save to localstorage.
        storage.set("basket", JSON.stringify(newState));

        return newState;
    },

    basketRemoveProduct(state, action) {
        let logger = Logger.create("basketRemoveProduct");
        logger.info("enter", {action});

        let product = action.payload;
        let {items,grossTotalPrice,address} = state;

        if(items[product._id]) {
            items[product._id].quantity--;
            grossTotalPrice -= product.priceValue;

            if(items[product._id].quantity === 0) {
                delete items[product._id];
            }
        }

        // Set new state
        let newState = Object.assign({}, state, {
            grossTotalPrice,
            items,
            address
        });

        newState = evalTotalPrice(newState);

        // Save to localstorage.
        storage.set("basket", JSON.stringify(newState));

        return newState;
    },

    basketLoadList(state, action) {
        let logger = Logger.create("basketLoadList");
        logger.info("enter", {action});

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
        newState = evalTotalPrice(newState);

        // Save to localstorage.
        storage.set("basket", JSON.stringify(newState));

        return newState;
    },

    basketSelectAddress(state, action) {
        let logger = Logger.create("basketSelectAddress");
        logger.info("enter", {action});

        let newState = Object.assign({}, state, {
            address: action.payload
        });

        // Save to localstorage.
        storage.set("basket", JSON.stringify(newState));

        return newState;
    },

    basketSelectBillingSource(state, action) {
        let logger = Logger.create("basketSelectBillingSource");
        logger.info("enter", {action});

        let newState = Object.assign({}, state, {
            billingSource: action.payload
        });

        // Save to localstorage.
        storage.set("basket", JSON.stringify(newState));

        return newState;
    },

    basketSelectDeliverDate(state, action) {
        let logger = Logger.create("basketSelectDeliverDate");
        logger.info("enter", {action});

        let newState = Object.assign({}, state, {
            deliverDate: action.payload
        });

        newState = evalTotalPrice(newState);

        // Save to localstorage.
        storage.set("basket", JSON.stringify(newState));

        return newState;
    },

    basketClear(state, action) {
        let logger = Logger.create("basketClear");
        logger.info("enter", {action});

        let newState = {
            totalPrice: 0,
            grossTotalPrice: 0,
            totalDiscount: 0,
            totalFee: 0,
            appliedFees: [],
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
            grossTotalPrice: 0,
            totalPrice: 0,
            totalDiscount: 0,
            totalFee: 0,
            appliedFees: [],
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
        logger.info("enter", {action});

        let {items} = state;
        let item = items[action.payload._id];
        let newState = state;

        logger.debug("item", item);

        if(item) {
            logger.debug("old totalPrice", {totalPrice: state.totalPrice});

            // Remove old price
            let grossTotalPrice = state.grossTotalPrice - item.quantity * item.product.priceValue;

            logger.debug("totalPrice without old price", {grossTotalPrice});

            // Add new price
            grossTotalPrice += item.quantity * action.payload.value;

            logger.debug("new totalPrice", grossTotalPrice);

            // Update price
            item.product.priceValue = action.payload.value;

            // log
            logger.debug("result", {item, grossTotalPrice});

            // Set new state
            newState = Object.assign({}, state, {grossTotalPrice, items});

            // Get fees
            let {totalFee, appliedFees} = getTotalFee(newState);

            // Set new state total discount & fees
            newState.totalDiscount = getTotalDiscount(newState);
            newState.totalFee = totalFee;
            newState.appliedFees = appliedFees;
            newState.totalPrice = newState.grossTotalPrice - newState.totalDiscount + newState.totalFee;

            // Save to localstorage.
            storage.set("basket", JSON.stringify(newState));
        }

        return newState;
    },

    productUpdatedEvent_COMPLETED(state, action) {
        let logger = Logger.create("productUpdatedEvent_COMPLETED");
        logger.info("enter", {action});

        let {items} = state;
        let item = items[action.payload._id];
        let newState = state;

        if(item) {
            let stock = lodash.get(action, "payload.data.stock");

            // If stock becomes lesser then what user has selected,
            // then truncate it and notify user.
            //
            // @WARNING : When this order is getting paid, no other
            // user can be paying an order (none overlaping order
            // payment).
            if(!state.isPaying && item.quantity > stock) {
                let oldQuantity = item.quantity;
                item.quantity = stock;

                // Remove old price
                let grossTotalPrice = state.grossTotalPrice - oldQuantity * item.product.priceValue;

                // Add new price
                if(stock > 0) {
                    item.quantity = stock;
                    grossTotalPrice += item.quantity * item.product.priceValue;
                }
                // Remove item
                else {
                    delete items[action.payload._id];
                }

                logger.debug("new total price", {grossTotalPrice, item, oldQuantity});

                // Set new state
                newState = Object.assign({}, state, {grossTotalPrice, items});

                // Get fees
                let {totalFee, appliedFees} = getTotalFee(newState);

                // Set new state total discount & fees
                newState.totalDiscount = getTotalDiscount(newState);
                newState.totalFee = totalFee;
                newState.appliedFees = appliedFees;
                newState.totalPrice = newState.grossTotalPrice - newState.totalDiscount + newState.totalFee;

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
