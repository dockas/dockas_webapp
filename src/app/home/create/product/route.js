import adminPol from "policies/admin";

module.exports = {
    path: "product",

    onEnter(nextState, replace, cb) {
        adminPol(nextState,replace).then(cb);
    },

    getComponent(nextState, cb) {
        require.ensure([], (require) => {
            cb(null, require("./index"));
        });
    }
};
