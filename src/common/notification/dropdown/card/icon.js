import lodash from "lodash";

let defaultIcon = "icon-circled-play";

function getOrderStatusUpdatedIcon(notification) {
    switch(lodash.get(notification, "data.updated.status")) {
        case "awaiting_user_availability": return "icon-circled-question";
        case "confirmed": return "icon-circled-ok";
        case "boxed": return "icon-circled-box";
        case "delivering": return "icon-circled-truck";
        case "closed": return "icon-circled-thumbs-up";
        default: return defaultIcon;
    }
}

export default function getIcon(notification) {
    switch(notification.type) {
        case "ORDER_STATUS_UPDATED": return getOrderStatusUpdatedIcon(notification);
        default: return defaultIcon;
    }
}