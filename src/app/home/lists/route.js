import authPol from "policies/auth";

module.exports = {
    path: "lists",

    onEnter(nextState, replace, cb) {
        authPol(nextState,replace).then(cb);
    },

    getComponent(nextState, cb) {
        require.ensure([], (require) => {
            cb(null, require("./page"));
        });
    },

    getChildRoutes(partialNextState, cb) {
        require.ensure([], (require) => {
            cb(null, [
                require("./list/route"),
                require("./detail/route")
            ]);
        });
    },

    getIndexRoute(partialNextState, cb) {
        require.ensure([], (require) => {
            cb(null, require("./list/route"));
        });
    }
};
