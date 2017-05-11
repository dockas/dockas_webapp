import lodash from "lodash";

let defaultIcon = "icon-circled-play";

function getOrderStatusUpdatedIcon(alert) {
    switch(lodash.get(alert, "data.updated.status")) {
        case "awaiting_user_availability": return "icon-circled-question";
        default: return defaultIcon;
    }
}

export default function getIcon(alert) {
    switch(alert.type) {
        case "ORDER_STATUS_UPDATED": return getOrderStatusUpdatedIcon(alert);
        default: return defaultIcon;
    }
}