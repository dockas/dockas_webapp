import React from "react";
import {LoggerFactory} from "darch/src";

let Logger = new LoggerFactory("landing.home");

/**
 * Main component class.
 */
export default class Component extends React.Component {
    /** React properties **/
    static displayName = "landing.home";
    static defaultProps = {};
    static propTypes = {};

    componentDidMount() {
        let logger = Logger.create("componentDidMount");
        logger.info("enter");
    }

    render() {
        return (
            <div className="landing-home">
                Home
            </div>
        );
    }
}
