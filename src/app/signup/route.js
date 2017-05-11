import lodash from "lodash";
import {Redux} from "darch/src/utils";
import Toaster from "darch/src/toaster";
import {Api} from "common";
import notAuthPol from "policies/not_auth";
import SignupStore from "./store";

module.exports = {
    path: "signup",

    onEnter(nextState, replace, cb) {
        notAuthPol(nextState,replace).then(() => {
            let invitationId = lodash.get(nextState, "location.query.invitation");

            if(!invitationId) {
                replace("/invitation");
                return cb();
            }

            Api.shared.invitationFindById(invitationId)
            .then((response) => {
                let invitation = response.result;

                console.log("invitation response", invitation);

                if(invitation.status == "closed") {
                    Redux.dispatch(Toaster.actions.push("danger", "_ERROR_INVITATION_CLOSED_"));
                    replace("/signin");
                }
                else {
                    SignupStore.invitation = response.result;
                }

                cb();
            })
            .catch((error) => {
                console.error("invitation response error", error);
                replace("/invitation");
                cb();
            });
        })
        .catch(() => {
            replace("/");
        });
    },

    getComponent(nextState, cb) {
        require.ensure([], (require) => {
            cb(null, require("./index"));
        });
    }
};
