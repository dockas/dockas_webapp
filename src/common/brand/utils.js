import lodash from "lodash";
import {LoggerFactory,Redux} from "darch/src/utils";

let Logger = new LoggerFactory("common.brand.utils");

export default class Utils {
    static getOwner(user, brand) {
        let brandData = lodash.get(Redux.getState(), "brand.data"),
            companyData = lodash.get(Redux.getState(), "company.data"),
            logger = Logger.create("isOwner");

        logger.info("enter", {user, brand});

        // Get brand
        brand = lodash.isString(brand)?lodash.get(brandData, brand):brand,

        logger.debug("got brand", brand);

        //console.log(["zacumba lele : getOwner", user, brand]);

        if(!user || !brand){
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
        }) || lodash.find(lodash.get(companyData, `${brand.company}.owners`), (o) => {
            let uid = lodash.get(o.user, "_id") || o.user;
            return user._id == uid;
        });

        //console.log(["zacumba lele : getOwner : owner", owner]);

        let data = {
            owner,
            isOwner: !!owner,
            isApprovedOwner: !!owner && owner.status == "approved",
            isAdmin: (user && user.roles.indexOf("admin") >= 0)
        };

        //console.log(["zacumba lele : getOwner : final data", data]);

        return data;
    }
}