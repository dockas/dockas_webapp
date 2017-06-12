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
                require("./brand/route"),
                require("./account/route"),
                require("./orders/route"),
                require("./checkout/route"),
                require("./invitation/route"),
                require("./notifications/route"),
                require("./lists/route"),
                require("./create/route"),
                require("./admin/route")
            ]);
        });
    }
};
