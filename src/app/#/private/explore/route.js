module.exports = {
    path: "explore",
    
    getComponent(nextState, cb) {
        require.ensure([], (require) => {
            cb(null, require("./index"));
        });
    },

    /*getChildRoutes(partialNextState, cb) {
        require.ensure([], (require) => {
            cb(null, [
                require("./room/route")
            ]);
        });
    },*/
};
