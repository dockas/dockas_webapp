module.exports = {
    path: "create",

    getComponent(nextState, cb) {
        require.ensure([], (require) => {
            cb(null, require("./page"));
        });
    },

    getChildRoutes(partialNextState, cb) {
        require.ensure([], (require) => {
            cb(null, [
                require("./room/route")
            ]);
        });
    },

    /*getIndexRoute(partialNextState, cb) {
        require.ensure([], (require) => {
            cb(null, require("./room/route"));
        });
    }*/
};
