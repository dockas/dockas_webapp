module.exports = {
    path: "finalize",

    // @TODO : If there are no order count (oc) query string
    // parameter, then prevent user enter this state.
    
    getComponent(nextState, cb) {
        require.ensure([], (require) => {
            cb(null, require("./index"));
        });
    }
};
