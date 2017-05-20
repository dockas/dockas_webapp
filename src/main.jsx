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
import {Api,User,Socket,Product,Basket,Order,Alert,Location,Brand} from "common";

let Logger = new LoggerFactory("main");

// Id form validator
Form.registerValidator({
    name: "id",
    validate: (value) => {
        return (/^[a-z0-9-]*$/).test(value);
    }
});

// Phone form validator
Form.registerValidator({
    name: "phone",
    validate: (value) => {
        if(!value){return true;}

        return (/^\d{10,}$/).test(`${value}`);
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
        alert: Alert.reducer,
        location: Location.reducer,
        brand: Brand.reducer,

        adminOrders: require("app/home/admin/orders/reducer")
    }, {shared: true});

    // Start listen to socket events
    Alert.listenSocketEvents();
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
