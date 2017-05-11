import React from "react";
import {LoggerFactory} from "darch/src/utils";

let Logger = new LoggerFactory("lists.detail");

/**
 * Main component class.
 */
export default class Component extends React.Component {
    /** React properties **/
    static displayName = "lists.detail";
    static defaultProps = {};
    static propTypes = {};

    componentDidMount() {
        let logger = Logger.create("componentDidMount");
        logger.info("enter");
    }

    render() {
        return (
            <div>
                List Detail
            </div>
        );
    }
}
