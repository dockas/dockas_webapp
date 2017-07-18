import React from "react"
import {LoggerFactory} from "darch/src/utils"

let Logger = new LoggerFactory("catalog.item.statistics")

/**
 * Main component class.
 */
export default class Component extends React.Component {
    /** React properties **/
    static displayName = "catalog.item.statistics";
    static defaultProps = {};
    static propTypes = {};

    componentDidMount() {
        let logger = Logger.create("componentDidMount")
        logger.info("enter")
    }

    render() {
        return (
            <div>
                Statistics
            </div>
        )
    }
}
