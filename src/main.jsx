import "babel-polyfill";
import config from "config";
import React from "react";
import {render} from "react-dom";
import {Provider} from "react-redux";
import moment from "moment";
import {Router,browserHistory} from "react-router";
import {syncHistoryWithStore,routerReducer} from "react-router-redux";
import {LoggerFactory,Redux} from "darch/src/utils";
import Toaster from "darch/src/toaster";
import i18n from "darch/src/i18n";
import Form from "darch/src/form";
import {
    Api,User,Socket,Product,
    Basket,Order,OrderItem,NotificationAlert,
    Location,Brand,Tag,Wallet,Transfer,
    List,ListSubscription,File,Tracker,Price
} from "common";

let Logger = new LoggerFactory("main", {level: "debug"});

// Id form validator
Form.registerValidator({
    name: "id",
    validate: (value) => {
        return (/^[a-z0-9-]*$/).test(value);
    }
});

// Phone form validator (BR)
Form.registerValidator({
    name: "phone",
    validate: (value) => {
        if(!value){return true;}

        return (/^\d{10,}$/).test(value.replace(/[\(\)_-]/g, ""));
    }
});

// Postal code form validator (BR)
Form.registerValidator({
    name: "cep",
    validate: async (value) => {
        let logger = Logger.create("cep validate");
        logger.debug("enter", {value});

        if(!value){return true;}

        value = value.replace(/[_-]/g, "");

        if(!(/^\d{8}$/).test(value)) {return false;}

        try {
            let response = await Api.shared.addressFindByPostalCode(value, {
                countryCode: "BRA"
            }, {preventErrorInterceptor: true});

            logger.info("api addressFindByPostalCode success", response);

            return {valid: true, data: response.result};
        }
        catch(error) {
            logger.error("api addressFindByPostalCode error", error);

            return {valid: false, error};
        }
    }
});

Form.registerValidator({
    name: "card_exp_date",
    validate: (value) => {
        if(!value){return true;}

        value = value.replace(/[_\/]/g, "");

        return (/^\d{4}$/).test(value);
    }
});

Form.registerValidator({
    name: "document_cpf",
    validate: (value) => {
        let logger = Logger.create("document_cpf validate");
        logger.debug("enter", {value});

        if(!value){return true;}

        value = value.replace(/[\._-]/g, "");

        logger.debug("value replaced", {value});

        if(value.length != 11) { return false; }

        let digits = value.split("");
        let lastDigits = parseInt(digits.slice(-2).join(""));
        let sum1 = 0, sum2 = 0;
        let count = 11;

        logger.debug("data", {digits,lastDigits});

        for(let i = 0; i < 9; i++ ){
            let str = "";

            for(let j=0; j <= 10; j++) {str = `${str}${i}`;}

            logger.debug(`digit[${i}] str`, {str});

            if(value == str) { return false; }

            let num = parseInt(digits[i]);
            sum1 += num * (count-1);
            sum2 += num * count;
            count--;

            logger.debug(`digit[${i}] data`, {num,sum1,sum2,count});
        }

        let digit1 = (sum1%11);
        digit1 = (digit1 < 2 ? 0 : 11 - digit1);

        let digit2 = (sum2 + (digit1 * 2))%11;
        digit2 = (digit2 < 2 ? 0 : 11 - digit2);

        let evalLastDigits = (digit1*10) + digit2;

        logger.debug("evaluated", {digit1,digit2,evalLastDigits});

        if( evalLastDigits != lastDigits ) {
            return false;
        }

        return true;
    }
});

Form.registerValidator({
    name: "birthdate",
    validate: (value, opts) => {
        let logger = Logger.create("birthdate validate");
        logger.debug("enter", {value,opts});

        if(!value){return true;}

        let date = moment(value, opts[0], true);

        if(!date.isValid()) {return false;}

        return true;
    }
});

Form.registerValidator({
    name: "brand_name_id",
    on: "blur",
    validate: async (value) => {
        let logger = Logger.create("brand_name_id validate");
        logger.debug("enter", {value});

        if(!value){return true;}

        try {
            let response = await Api.shared.brandFindByNameId(value, null, {
                preventErrorInterceptor: true
            });

            logger.info("api brandFindByNameId success", response);
        }
        catch(error) {
            logger.error("api brandFindByNameId error", error);

            if(error.code == 1) {return true;}
        }

        return false;
    }
});

Form.registerValidator({
    name: "validity",
    validate: (value, opts) => {
        let logger = Logger.create("validity validate");
        logger.debug("enter", {value,opts});

        if(!value){return true;}

        let date = moment(value, opts[0], true);

        logger.info("isValid", {isValid: date.isValid()});

        if(!date.isValid()) {return false;}

        return true;
    }
});

/****************************************************************
* App Bootstrap
****************************************************************/
(function() {
    let logger = Logger.create("bootstrap");
    logger.info("enter", config);

    // Create new shared api instance.
    new Api({shared: true});

    // Create new shared socket instance.
    new Socket({
        url: config.hostnames.socket,
        shared: true
    });

    // Log on socket events.
    /*Socket.shared.on("alert:created", (data) => {
        console.info("alert:created", data);
    });*/

    Socket.shared.on("sign:success", () => {
        //console.info("sign:success");
    });

    // Create redux store with app reducers
    new Redux({
        routing: routerReducer,
        toaster: Toaster.reducer,
        i18n: i18n.reducer,
        user: User.reducer,
        product: Product.reducer,
        basket: Basket.reducer,
        order: Order.reducer,
        orderItem: OrderItem.reducer,
        notificationAlert: NotificationAlert.reducer,
        location: Location.reducer,
        brand: Brand.reducer,
        tag: Tag.reducer,
        list: List.reducer,
        listSubscription: ListSubscription.reducer,
        file: File.reducer,
        wallet: Wallet.reducer,
        transfer: Transfer.reducer,
        price: Price.reducer
    }, {shared: true});

    // Start listen to socket events
    NotificationAlert.listenSocketEvents();
    Order.listenSocketEvents();
    OrderItem.listenSocketEvents();
    Product.listenSocketEvents();
    User.listenSocketEvents();
    Wallet.listenSocketEvents();
    List.listenSocketEvents();
    ListSubscription.listenSocketEvents();
    Brand.listenSocketEvents();
    Tag.listenSocketEvents();

    // Create an enhanced history that syncs navigation events with the store
    const history = syncHistoryWithStore(browserHistory, Redux.shared.store);

    const rootRoute = {
        childRoutes: [
            require("./app/route")
        ]
    };

    const routes = (
        <Provider store={Redux.shared.store}>
            <Router onUpdate={() => {
                window.scrollTo(0, 0);
            }} history={history} routes={rootRoute} />
        </Provider>
    );

    history.listen( (data) =>  {
        Redux.dispatch(Location.actions.locationChange(data));
        //Redux.dispatch(Basket.actions.basketSetShowCard(true));

        Tracker.pageview();
    });

    render(routes, document.getElementById("main-page"));
})();
