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
                require("./create/route"),
                require("./checkout/route")
            ]);
        });
    },

    getIndexRoute(partialNextState, cb) {
        require.ensure([], (require) => {
            cb(null, require("./catalog/route"));
        });
    }
};
