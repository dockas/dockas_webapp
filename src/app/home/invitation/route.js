import lodash from "lodash";
import {Redux} from "darch/src/utils";

module.exports = {
    path: "invitation",

    onEnter(nextState, replace, cb) {
        if(lodash.get(Redux.shared.store.getState(), "user.uid")) {
            return replace("/");
        }

        cb();
    },

    getComponent(nextState, cb) {
        require.ensure([], (require) => {
            cb(null, require("./index"));
        });
    }
};
