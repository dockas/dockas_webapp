import React from "react";
import classNames from "classnames";
import {LoggerFactory,i18n} from "darch/src";
import styles from "./styles";

let Logger = new LoggerFactory("signup.step3.term");

/**
 * Main component class.
 */
export default class Component extends React.Component {
    /** React properties **/
    static displayName = "signup.step3.term";
    static defaultProps = {
        selected: false,
        onSelect: () => {},
        onDeselect: () => {}
    };
    static propTypes = {
        selected: React.PropTypes.bool,
        onSelect: React.PropTypes.func,
        onDeselect: React.PropTypes.func,
        data: React.PropTypes.shape({
            label: React.PropTypes.string,
            value: React.PropTypes.string
        }).isRequired
    };

    /** Instance properties **/
    state = {
        selected: false
    };

    /**
     * LYFECICLE : This function is called when component
     * got mounted in the view.
     */
    componentDidMount() {
        let logger = Logger.create("componentDidMount");
        logger.info("enter");
    }

    onClick() {
        if(this.props.selected) {
            this.props.onDeselect(this.props.data);
        }
        else {
            this.props.onSelect(this.props.data);
        }
    }

    /**
     * This function is responsible for generating the component's view.
     */
    render() {
        let classes = [
            styles.term,
            this.props.selected?styles.selected:""
        ];

        return (
            <div className={classNames(classes)} onClick={this.onClick}>
                <i18n.Translate text={this.props.data.label} />
            </div>
        );
    }
}