import authPol from "policies/auth";

module.exports = {
    onEnter(nextState, replace, cb) {
        authPol(nextState,replace).then(cb);
    },

    getComponent(nextState, cb) {
        require.ensure([], (require) => {
            cb(null, require("./index"));
        });
    }
};
