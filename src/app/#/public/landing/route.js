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
                require("./home/route")
            ]);
        });
    },

    getIndexRoute(partialNextState, cb) {
        require.ensure([], (require) => {
            cb(null, require("./home/route"));
        });
    }
};
