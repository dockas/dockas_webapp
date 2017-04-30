import React from "react";
import {LoggerFactory} from "darch/src/utils";
import styles from "./styles";

let Logger = new LoggerFactory("product.badge");

/**
 * Main component class.
 */
export default class Component extends React.Component {
    /** React properties **/
    static displayName = "product.badge";
    static defaultProps = {};
    
    static propTypes = {
        count : React.PropTypes.number
    };

    componentDidMount() {
        let logger = Logger.create("componentDidMount");
        logger.info("enter");
    }

    render() {
        return (
            <div className={styles.badge}>
                {this.props.count}
            </div>
        );
    }
}
