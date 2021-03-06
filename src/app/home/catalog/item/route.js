module.exports = {
    path: "item/:id",
    
    getComponent(nextState, cb) {
        require.ensure([], (require) => {
            cb(null, require("./page"));
        });
    },

    getChildRoutes(partialNextState, cb) {
        require.ensure([], (require) => {
            cb(null, [
                require("./info/route"),
                require("./statistics/route")
            ]);
        });
    },

    getIndexRoute(partialNextState, cb) {
        require.ensure([], (require) => {
            cb(null, require("./info/route"));
        });
    }
};
