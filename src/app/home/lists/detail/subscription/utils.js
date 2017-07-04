import moment from "moment";
import {List} from "common";
import {LoggerFactory} from "darch/src/utils";

let Logger = new LoggerFactory("lists.detail.subscription.utils");

export default class Utils {
    static getNextDeliverDate(recurrence, {
        startDate=moment().toISOString(),
        diff=3  // diff from sunday to wednesday is 3
    }={}) {
        let nextDeliverDate,
            logger = Logger.create("getNextDeliverDate");

        logger.info("enter", {recurrence,diff,startDate});

        // First sunday from which to count.
        let startMoment = moment(startDate);
        let nextSunday = startMoment.clone().endOf("isoWeek").minute(0).hour(12);

        logger.debug("start date", {
            nextSunday: nextSunday.toISOString(),
            start: startMoment.toISOString(),
            diff: nextSunday.diff(startMoment, "days")
        });

        // If next sunday is too close from startMoment, then
        // get the next one.
        if(nextSunday.diff(startMoment, "days") < diff) {
            nextSunday = nextSunday.add(1, "week");
        }

        logger.debug("next right sunday", {
            nextSunday: nextSunday.toISOString()
        });

        switch(recurrence) {
            case List.types.SubscriptionRecurrence.WEEKLY: {
                nextDeliverDate = nextSunday;
                break;
            }

            case List.types.SubscriptionRecurrence.BIWEEKLY: {
                nextDeliverDate = nextSunday.add(1, "week");
                break;
            }

            case List.types.SubscriptionRecurrence.MONTHLY: {
                nextDeliverDate = nextSunday.add(3, "weeks");
                break;
            }
        }

        logger.debug("nextDeliverDate", {
            next: nextDeliverDate.toISOString()
        });

        // Return the iso string.
        return nextDeliverDate.toISOString();
    }
}