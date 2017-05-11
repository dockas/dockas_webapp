import React from "react";
import lodash from "lodash";
import {LoggerFactory,Redux} from "darch/src/utils";
import Button from "darch/src/button";
import i18n from "darch/src/i18n";
import styles from "./styles";
import getIcon from "./icon";
import optionActions from "../../option_actions";
import actions from "../../actions";

let Logger = new LoggerFactory("alert.card");

/**
 * Main component class.
 */
export default class Component extends React.Component {
    /** React properties **/
    static displayName = "alert.card";
    static defaultProps = {};
    static propTypes = {};

    componentDidMount() {
        let logger = Logger.create("componentDidMount");
        logger.info("enter");
    }

    selectOption(option) {
        return async () => {
            let logger = Logger.create("selectOption");
            logger.info("enter", {option});

            let {alert} = this.props;
            let alertOptionActionKey = alert.onOptionSelectedAction;

            // Run alert option action.
            if(alertOptionActionKey && optionActions[alertOptionActionKey]) {
                await Redux.dispatch(optionActions[alertOptionActionKey](option.value, alert));
            }
            
            // Now update alert with the selected option.
            await Redux.dispatch(actions.alertUpdate(alert._id, {
                selectedOption: option.value,
                status: "clicked"
            }));
        };
    }

    render() {
        let {alert} = this.props;
        let logger = Logger.create("render");

        let selectedOption = lodash.find(alert.options, (option) => {
            return option.value == alert.selectedOption;
        });

        logger.info("enter", {alert});

        return (
            <li className={styles.card}>
                <div className={styles.leftView}>
                    <span className={getIcon(alert)}></span>
                </div>
                <div className={styles.body}>
                    <div><i18n.Translate text={alert.message} data={alert.data} /></div>
                    
                    {alert.options && alert.options.length && !alert.selectedOption ? (
                        <div className={styles.optionsRow}>
                            {alert.options.map((option) => {
                                return <Button key={option.value} layout="outline" scale={0.6} color="moody" onClick={this.selectOption(option)}><i18n.Translate text={option.label}/></Button>;
                            })}
                        </div>
                    ) : null}

                    {selectedOption ? (
                        <div className={styles.selectedOptionRow}>
                            <i18n.Translate text="_ALERT_SELECTED_OPTION_TEXT_" data={{selectedOption: i18n.utils.translate({text: selectedOption.label})}} />
                        </div>
                    ) : null}
                </div>
            </li>
        );
    }
}
