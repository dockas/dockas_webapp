/* global mixpanel */

import "babel-polyfill";
import config from "config";
import React from "react";
import {render} from "react-dom";
import {Provider} from "react-redux";
import {Router,browserHistory} from "react-router";
import {syncHistoryWithStore,routerReducer} from "react-router-redux";
import {LoggerFactory,Redux} from "darch/src/utils";
import Toaster from "darch/src/toaster";
import i18n from "darch/src/i18n";
import Form from "darch/src/form";
import {Api,User,Socket,Product,Basket,Order,Notification,Location,Brand} from "common";

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
    name: "postal_code",
    validate: (value) => {
        if(!value){return true;}

        value = value.replace(/[_-]/g, "");

        return (/^\d{8}$/).test(value);
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
        notification: Notification.reducer,
        location: Location.reducer,
        brand: Brand.reducer,

        adminOrders: require("app/home/admin/orders/reducer")
    }, {shared: true});

    // Start listen to socket events
    Notification.listenSocketEvents();
    Order.listenSocketEvents();

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
        
        mixpanel.track("page opened", {
            pathname: window.location.pathname
        });
    });

    render(routes, document.getElementById("main-page"));
})();
