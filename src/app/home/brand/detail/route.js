module.exports = {
    path: ":id",

    getComponent(nextState, cb) {
        require.ensure([], (require) => {
            cb(null, require("./page"));
        });
    },

    getChildRoutes(partialNextState, cb) {
        require.ensure([], (require) => {
            cb(null, [
                require("./products/route"),
                require("./info/route"),
                require("./statistics/route"),
                require("./photos/route"),
                require("./orders/route")
            ]);
        });
    },

    getIndexRoute(partialNextState, cb) {
        require.ensure([], (require) => {
            cb(null, require("./products/route"));
        });
    }
};
