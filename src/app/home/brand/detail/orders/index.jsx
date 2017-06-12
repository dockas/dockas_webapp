import React from "react";
import {LoggerFactory} from "darch/src/utils";

let Logger = new LoggerFactory("brand.detail.orders");

/**
 * Main component class.
 */
export default class Component extends React.Component {
    /** React properties **/
    static displayName = "brand.detail.orders";
    static defaultProps = {};
    static propTypes = {};

    componentDidMount() {
        let logger = Logger.create("componentDidMount");
        logger.info("enter");
    }

    render() {
        return (
            <div>
                Orders
            </div>
        );
    }
}
