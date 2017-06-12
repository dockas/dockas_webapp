import lodash from "lodash";
import {LoggerFactory} from "darch/src/utils";

let Logger = new LoggerFactory("common.brand.utils");

export default class Utils {
    static getOwner(user, brand) {
        let logger = Logger.create("isOwner");

        logger.info("enter", {user, brand});

        if(!user || !brand || !lodash.isObject(brand)){
            return {
                isOwner: false,
                isApprovedOwner: false,
                isAdmin: (user && user.roles.indexOf("admin") >= 0)
            };
        }

        // Find onwer profile among brand and company.
        let owner = lodash.find(brand.owners, (o) => {
            let uid = lodash.get(o.user, "_id") || o.user;
            return user._id == uid;
        }) || lodash.find(lodash.get(brand, "company.owners"), (o) => {
            let uid = lodash.get(o.user, "_id") || o.user;
            return user._id == uid;
        });

        return {
            owner,
            isOwner: !!owner,
            isApprovedOwner: owner && owner.status == "approved",
            isAdmin: (user && user.roles.indexOf("admin") >= 0)
        };
    }
}