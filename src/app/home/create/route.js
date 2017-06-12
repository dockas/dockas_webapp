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
                require("./product/route"),
                require("./brand/route")
            ]);
        });
    }
};
