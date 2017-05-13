import lodash from "lodash";

let defaultIcon = "icon-circled-play";

function getOrderStatusUpdatedIcon(alert) {
    switch(lodash.get(alert, "data.updated.status")) {
        case "awaiting_user_availability": return "icon-circled-question";
        case "confirmed": return "icon-circled-ok";
        case "boxed": return "icon-circled-box";
        case "delivering": return "icon-circled-truck";
        case "closed": return "icon-circled-thumbs-up";
        default: return defaultIcon;
    }
}

export default function getIcon(alert) {
    switch(alert.type) {
        case "ORDER_STATUS_UPDATED": return getOrderStatusUpdatedIcon(alert);
        default: return defaultIcon;
    }
}