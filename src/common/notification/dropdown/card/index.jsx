import React from "react";
import lodash from "lodash";
import classNames from "classnames";
import {LoggerFactory,Redux} from "darch/src/utils";
import Button from "darch/src/button";
import i18n from "darch/src/i18n";
import {Api} from "common";
import styles from "./styles";
import getIcon from "./icon";
import optionActions from "../../option_actions";
import actions from "../../actions";

let Logger = new LoggerFactory("notification.card");

/**
 * Main component class.
 */
export default class Component extends React.Component {
    /** React properties **/
    static displayName = "notification.card";
    static defaultProps = {};
    static propTypes = {};

    componentDidMount() {
        let logger = Logger.create("componentDidMount");
        logger.info("enter");
    }

    async componentWillUnmount() {
        let {notification} = this.props,
            logger = Logger.create("componentWillUnmount");

        logger.info("enter");

        // Skip old notifications.
        if(notification.status != 0){return;}

        // Let's mark new notifications as viewd.
        try {
            let result = await Api.shared.notificationUpdate(notification._id, {
                status: 1
            });

            logger.debug("api notificationUpdate success", result);
        }
        catch(error) {
            logger.error("api notificationUpdate error", error);
        }
    }

    selectOption(option) {
        return async () => {
            let logger = Logger.create("selectOption");
            logger.info("enter", {option});

            let {notification} = this.props;
            let notificationOptionActionKey = notification.onOptionSelectedAction;

            // Run notification option action.
            if(notificationOptionActionKey && optionActions[notificationOptionActionKey]) {
                await Redux.dispatch(optionActions[notificationOptionActionKey](option.value, notification));
            }
            
            // Now update notification with the selected option.
            await Redux.dispatch(actions.notificationUpdate(notification._id, {
                selectedOption: option.value,
                status: "clicked"
            }));
        };
    }

    render() {
        let {notification} = this.props;
        let logger = Logger.create("render");

        let selectedOption = lodash.find(notification.options, (option) => {
            return option.value == notification.selectedOption;
        });

        logger.info("enter", {notification});

        return (
            <li className={classNames([
                styles.card,
                styles[`card-status-${notification.status}`]
            ])}>
                <div className={styles.leftView}>
                    <span className={getIcon(notification)}></span>
                </div>
                <div className={styles.body}>
                    <div><i18n.Translate text={notification.message} data={notification.data} /></div>
                    
                    {notification.options && notification.options.length && !notification.selectedOption ? (
                        <div className={styles.optionsRow}>
                            {notification.options.map((option) => {
                                return <Button key={option.value} layout="outline" scale={0.6} color="moody" onClick={this.selectOption(option)}><i18n.Translate text={option.label}/></Button>;
                            })}
                        </div>
                    ) : null}

                    {selectedOption ? (
                        <div className={styles.selectedOptionRow}>
                            <i18n.Translate text="_NOTIFICATION_SELECTED_OPTION_TEXT_" data={{selectedOption: i18n.utils.translate({text: selectedOption.label})}} />
                        </div>
                    ) : null}
                </div>
            </li>
        );
    }
}
