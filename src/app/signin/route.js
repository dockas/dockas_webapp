import notAuthPol from "policies/not_auth";

module.exports = {
    path: "signin",

    onEnter(nextState, replace, cb) {
        notAuthPol(nextState,replace).then(cb);
    },

    getComponent(nextState, cb) {
        require.ensure([], (require) => {
            cb(null, require("./index"));
        });
    }
};
