import {handleActions} from "redux-actions";
import {LoggerFactory} from "darch/src/utils";
import lodash from "lodash";

let Logger = new LoggerFactory("common.user.reducer", {level:"debug"});

let initialState = {
    uid: null,
    profiles: {}
};

export default handleActions({
    signin_COMPLETED(state, action) {
        let logger = Logger.create("signin_COMPLETED");
        logger.info("enter", {state: state, action: action});

        let newState = lodash.assign(
            {}, 
            state, 
            {
                uid: action.payload._id,
                profiles: lodash.set(
                    state.profiles, 
                    action.payload._id, 
                    action.payload
                )
            }
        );

        logger.debug("newState", newState);

        return newState;
    },

    userInit_COMPLETED(state, action) {
        let logger = Logger.create("userInit_COMPLETED");
        logger.info("enter", {state: state, action: action});

        return lodash.assign(
            {}, 
            state, 
            {
                uid: action.payload._id,
                profiles: lodash.set(
                    state.profiles, 
                    action.payload._id, 
                    action.payload
                )
            }
        );
    },

    userUpdate_COMPLETED(state, action) {
        let logger = Logger.create("userUpdate_COMPLETED");
        logger.info("enter", {state: state, action: action});

        let profile = lodash.assign(
            {}, 
            state.profiles[state.uid], 
            action.payload
        );

        return lodash.assign(
            {},
            state, 
            {
                profiles: lodash.set(
                    state.profiles, 
                    state.uid, 
                    profile
                )
            }
        );
    },

    userAddAddress_COMPLETED(state, action) {
        let logger = Logger.create("userAddAddress_COMPLETED");
        logger.info("enter", {state: state, action: action});

        let profile = state.profiles[state.uid];
        profile.addresses.push(action.payload);

        return lodash.assign(
            {},
            state, 
            {
                profiles: lodash.set(
                    state.profiles, 
                    state.uid, 
                    profile
                )
            }
        );
    },

    userRemoveAddress_COMPLETED(state, action) {
        let logger = Logger.create("userRemoveAddress_COMPLETED");
        logger.info("enter", {state: state, action: action});

        let profile = state.profiles[state.uid];
        lodash.remove(profile.addresses, (a) => { return a.id == action.payload; });

        return lodash.assign(
            {},
            state, 
            {
                profiles: lodash.set(
                    state.profiles, 
                    state.uid, 
                    profile
                )
            }
        );
    },

    userFind_COMPLETED(state, action) {
        let logger = Logger.create("userFind_COMPLETED");
        logger.info("enter", {state: state, action: action});

        let profiles = lodash.reduce(action.payload, (map, profile) => {
            map[profile._id] = profile;
            return map;
        }, {});

        return lodash.assign(
            {},
            state, 
            {
                profiles: lodash.assign(
                    state.profiles, 
                    profiles
                )
            }
        );
    },

    createRoom_COMPLETED(state, action) {
        let logger = Logger.create("createRoom_COMPLETED");
        logger.info("enter", {state: state, action: action});

        let rooms = (state.profiles[state.uid].rooms||[]).concat([action.payload]);
        let profile = lodash.assign({}, state.profiles[state.uid], {rooms});

        return lodash.assign(
            {}, 
            state, 
            {
                profiles: lodash.set(
                    state.profiles, 
                    state.uid, 
                    profile
                )
            }
        );
    }
}, initialState);
