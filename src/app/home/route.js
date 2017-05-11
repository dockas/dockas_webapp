module.exports = {
    path: "",

    getComponent(nextState, cb) {
        require.ensure([], (require) => {
            cb(null, require("./page"));
        });
    },

    getChildRoutes(partialNextState, cb) {
        require.ensure([], (require) => {
            cb(null, [
                require("./catalog/route"),
                require("./account/route"),
                require("./orders/route"),
                require("./checkout/route"),
                require("./invitation/route"),
                require("./alerts/route"),
                require("./lists/route"),
                require("./admin/route")
            ]);
        });
    }
};
