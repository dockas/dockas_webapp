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
        logger.info("enter", {action});

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
        logger.info("enter", {action});

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

    /*userUpdate_COMPLETED(state, action) {
        let logger = Logger.create("userUpdate_COMPLETED");
        logger.info("enter", {action});

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
    },*/

    /*userAddAddress_COMPLETED(state, action) {
        let logger = Logger.create("userAddAddress_COMPLETED");
        logger.info("enter", {action});

        let profile = state.profiles[state.uid];
        profile.addresses = action.payload.addresses;
        profile.phones = action.payload.phones;

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
        logger.info("enter", {action});

        let profile = state.profiles[state.uid];
        profile.addresses = action.payload.addresses;

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
    },*/

    /*userAddBillingSource_COMPLETED(state, action) {
        let logger = Logger.create("userAddBillingSource_COMPLETED");
        logger.info("enter", {action});

        let profile = state.profiles[state.uid];
        profile.billingSources = profile.billingSources || [];
        profile.billingSources.push(action.payload);

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

    userRemoveBillingSource_COMPLETED(state, action) {
        let logger = Logger.create("userRemoveBillingSource_COMPLETED");
        logger.info("enter", {action});

        let profile = state.profiles[state.uid];
        lodash.remove(profile.billingSources, (source) => {
            return source._id == action.payload._id;
        });
        
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
    },*/

    userFind_COMPLETED(state, action) {
        let logger = Logger.create("userFind_COMPLETED");
        logger.info("enter", {action});

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

    userUpdatedEvent(state, action) {
        let logger = Logger.create("userUpdatedEvent");
        logger.info("enter", {action});

        return lodash.assign(
            {},
            state, 
            {
                profiles: lodash.reduce(state.profiles, (result, profile, uid) => {
                    if(action.payload._id == uid) {
                        profile = Object.assign({}, profile, action.payload.data);
                    }

                    return Object.assign(result, {
                        [uid]: profile
                    });
                },{})
            }
        );
    },

    signout_COMPLETED() {
        let logger = Logger.create("signout_COMPLETED");
        logger.info("enter");

        return {
            uid: null,
            profiles: []
        };
    }
}, initialState);
