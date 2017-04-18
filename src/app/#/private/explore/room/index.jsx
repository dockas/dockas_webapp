import React from "react";
import {withRouter} from "react-router";
import {LoggerFactory} from "darch/src/utils";
import styles from "./styles";

let Logger = new LoggerFactory("explore.room", {level:"error"});

/**
 * Main component class.
 */
class Component extends React.Component {
    /** React properties **/
    static displayName = "explore.room";
    static defaultProps = {};
    static propTypes = {};

    /**
     * LYFECICLE : This function is called when component
     * got mounted in the view.
     */
    componentDidMount() {
        let logger = Logger.create("componentDidMount");
        logger.info("enter");
    }

    /**
     * This function is responsible for generating the component's view.
     */
    render() {
        return (
            <div className={styles.page}>
                Room
            </div>
        );
    }
}

/** Export **/
export default withRouter(Component);
