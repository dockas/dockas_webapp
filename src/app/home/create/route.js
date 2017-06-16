import authPol from "policies/auth";

module.exports = {
    path: "create",

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
                require("./product/route"),
                require("./brand/route")
            ]);
        });
    }
};
