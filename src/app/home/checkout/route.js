import basketHasItemsPol from "policies/basket_has_items";

module.exports = {
    path: "checkout",

    onEnter(nextState, replace, cb) {
        basketHasItemsPol(nextState,replace).then(cb);
    },
    
    getComponent(nextState, cb) {
        require.ensure([], (require) => {
            cb(null, require("./page"));
        });
    },

    getChildRoutes(partialNextState, cb) {
        require.ensure([], (require) => {
            cb(null, [
                require("./review/route"),
                require("./address/route"),
                require("./payment/route"),
                require("./finalize/route"),
            ]);
        });
    },

    getIndexRoute(partialNextState, cb) {
        require.ensure([], (require) => {
            cb(null, require("./review/route"));
        });
    }
};
