import adminPol from "policies/admin";

module.exports = {
    path: "admin",

    indexRoute: { 
        onEnter: (nextState, replace) => {
            replace("/admin/users");
        }
    },

    onEnter(nextState, replace, cb) {
        adminPol(nextState,replace).then(cb);
    },

    getComponent(nextState, cb) {
        require.ensure([], (require) => {
            cb(null, require("./page"));
        });
    },

    getChildRoutes(partialNextState, cb) {
        require.ensure([], (require) => {
            cb(null, [
                require("./products/route"),
                require("./users/route"),
                require("./orders/route"),
                require("./invitations/route"),
                require("./notifications/route"),
                require("./coupons/route"),
                require("./create/route")
            ]);
        });
    }
};
