import lodash from "lodash";
import {Http,LoggerFactory,Redux,Toaster} from "darch/src";
import config from "config";

let Logger = new LoggerFactory("common.utils.api");

/**
 * Main class definition.
 */
export default class Api {
    static idToKey(id) {
        return id.replace(/^.*\/(\d+)$/, "$1");
    }

    constructor({http=new Http(), shared=false} = {}) {
        if(shared){Api.shared = this;}

        this.baseUrl = `//${config.hostnames.api}/${config.apiVersion}`;
        this.http = http;
    }

    /****************************************************************
    * Request method
    ****************************************************************/
    request(method, path, data, opts = {}) {
        let logger = Logger.create("request");
        logger.info("enter", {method, path, data, opts});

        return this.http.request(
            method,
            `${this.baseUrl}/${path}`,
            data
        ).catch((error) => {
            logger.error("catch error", error);

            let data = lodash.get(error, "response.data");

            if(!opts.preventErrorInterceptor) {
                if(data && data.name) {
                    let name = lodash.toUpper(lodash.snakeCase(data.name));
                    let code = data.code;

                    // Let's show error message.
                    Redux.dispatch(
                        Toaster.actions.push("danger", `_${name}_${code}_`, {
                            untranslatedDefault: "_ERROR_UNKNOWN_"
                        })
                    );
                }
                
            }

            throw data;
        });
    }

    /****************************************************************
    * Api methods
    ****************************************************************/
    signin(data, opts) {
        return this.request("POST", "auth/signin", data, opts);
    }

    signed(opts) {
        return this.request("GET", "auth/signed", null, opts);
    }

    signout(opts) {
        return this.request("POST", "auth/signout", null, opts);
    }

    signup(data, opts) {
        return this.request("POST", "user/signup", data, opts);
    }

    userFind(query, opts) {
        return this.request("GET", "user", query, opts);
    }

    userMe(opts) {
        return this.request("GET", "user/me", null, opts);
    }

    userUpdate(data, opts) {
        return this.request("PUT", "user/me", data, opts);
    }

    userAddAddress(data, opts) {
        return this.request("POST", "user/me/address", data, opts);
    }

    userRemoveAddress(id, opts) {
        return this.request("DELETE", `user/me/address/${id}`, null, opts);
    }

    productCreate(data, opts) {
        return this.request("POST", "product", data, opts);
    }

    productCreateFromCSV(data, opts) {
        return this.request("POST", "product/csv", data, opts);
    }

    productUpdate(id, data, opts) {
        return this.request("PUT", `product/${id}`, data, opts);
    }

    productFind(query, opts) {
        return this.request("GET", "product", query, opts);
    }

    productFindByNameId(nameId, query, opts) {
        return this.request("GET", `product/nameId/${nameId}`, query, opts);
    }

    productPriceUpdate(id, data, opts) {
        return this.request("PUT", `product/${id}/price`, data, opts);
    }

    tagCreate(data, opts) {
        return this.request("POST", "tag", data, opts);
    }

    tagCreateFromCSV(data, opts) {
        return this.request("POST", "tag/csv", data, opts);
    }

    tagFind(query, opts) {
        return this.request("GET", "tag", query, opts);
    }

    tagIncFindCount(id, opts) {
        return this.request("PUT", `tag/${Api.idToKey(id)}/find/count`, null, opts);
    }

    priceCreate(data, opts) {
        return this.request("POST", "price", data, opts);
    }

    orderCreate(data, opts) {
        return this.request("POST", "order", data, opts);
    }

    orderCharge(id, data, opts) {
        return this.request("POST", `order/${id}/charge`, data, opts);
    }

    orderFind(query, opts) {
        return this.request("GET", "order", query, opts);
    }

    orderFindById(id, opts) {
        return this.request("GET", `order/${id}`, null, opts);
    }

    orderStatusUpdate(id, status, opts) {
        return this.request("PUT", `order/${id}/status`, {status}, opts);
    }

    invitationCreate(data, opts) {
        return this.request("POST", "invitation", data, opts);
    }

    invitationFind(query, opts) {
        return this.request("GET", "invitation", query, opts);
    }

    invitationFindById(id, opts) {
        return this.request("GET", `invitation/${id}`, null, opts);
    }

    invitationSend(id, opts) {
        return this.request("POST", `invitation/alert/${id}`, null, opts);
    }

    notificationAlertCreate(data, opts) {
        return this.request("POST", "notification/alert", data, opts);
    }

    notificationAlertFind(query, opts) {
        return this.request("GET", "notification/alert", query, opts);
    }

    notificationAlertUpdate(id, data, opts) {
        return this.request("PUT", `notification/alert/${id}`, data, opts);
    }

    notificationAlertCount(query, opts) {
        return this.request("GET", "notification/alert/count", query, opts);
    }

    couponCreate(data, opts) {
        return this.request("POST", "coupon", data, opts);
    }

    couponFind(query, opts) {
        return this.request("GET", "coupon", query, opts);
    }

    couponApplyByNameId(id, opts) {
        return this.request("POST", `coupon/nameId/${id}`, null, opts);
    }

    listCreate(data, opts) {
        return this.request("POST", "list", data, opts);
    }

    listFind(query, opts) {
        return this.request("GET", "list", query, opts);
    }

    listUpdate(id, data, opts) {
        return this.request("PUT", `list/${id}`, data, opts);
    }

    brandCreate(data, opts) {
        return this.request("POST", "brand", data, opts);
    }

    brandCreateFromCSV(data, opts) {
        return this.request("POST", "brand/csv", data, opts);
    }

    brandFind(query, opts) {
        return this.request("GET", "brand", query, opts);
    }

    brandFindByNameId(nameId, query, opts) {
        return this.request("GET", `brand/nameId/${nameId}`, query, opts);
    }

    brandUpdate(id, data, opts) {
        return this.request("PUT", `brand/${id}`, data, opts);
    }

    companyCreate(data, opts) {
        return this.request("POST", "company", data, opts);
    }

    companyCreateFromCSV(data, opts) {
        return this.request("POST", "company/csv", data, opts);
    }

    companyFind(query, opts) {
        return this.request("GET", "company", query, opts);
    }

    companyFindByNameId(nameId, query, opts) {
        return this.request("GET", `company/nameId/${nameId}`, query, opts);
    }

    companyUpdate(id, data, opts) {
        return this.request("PUT", `company/${id}`, data, opts);
    }

    billingSourceAdd(data, opts) {
        return this.request("POST", "billing/source", data, opts);
    }

    billingSourceRemove(id, opts) {
        return this.request("DELETE", `billing/${id}`, null, opts);
    }

    fileFind(query, opts) {
        return this.request("GET", "file", query, opts);
    }

    fileFindById(id, opts) {
        return this.request("GET", `file/${id}`, null, opts);
    }

    configGet(opts) {
        return this.request("GET", "config", null, opts);
    }
}
