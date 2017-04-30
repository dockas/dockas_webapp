import React from "react";
import {LoggerFactory} from "darch/src/utils";

let Logger = new LoggerFactory("catalog.page");

/**
 * Main component class.
 */
export default class Component extends React.Component {
    /** React properties **/
    static displayName = "catalog.page";
    static defaultProps = {};
    static propTypes = {};

    componentDidMount() {
        let logger = Logger.create("componentDidMount");
        logger.info("enter");
    }

    render() {
        return (
            <div>
                {this.props.children}
            </div>
        );
    }
}
