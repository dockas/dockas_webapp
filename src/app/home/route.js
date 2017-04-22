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
                require("./checkout/route"),
                require("./admin/route")
            ]);
        });
    },

    getIndexRoute(partialNextState, cb) {
        require.ensure([], (require) => {
            cb(null, require("./catalog/route"));
        });
    }
};
