import React from "react";
import {LoggerFactory,Redux} from "darch/src/utils";
import {Basket} from "common";

let Logger = new LoggerFactory("create.page");

/**
 * Main component class.
 */
export default class Component extends React.Component {
    /** React properties **/
    static displayName = "create.page";
    static defaultProps = {};
    static propTypes = {};

    componentDidMount() {
        let logger = Logger.create("componentDidMount");
        logger.info("enter");

        Redux.dispatch(Basket.actions.basketSetShowCard(false));
    }

    render() {
        return (
            <div>{this.props.children}</div>
        );
    }
}
