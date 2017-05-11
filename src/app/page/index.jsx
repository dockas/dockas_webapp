import React from "react";
import {LoggerFactory} from "darch/src/utils";
import Toaster from "darch/src/toaster";
import styles from "./styles";

let Logger = new LoggerFactory("app.page");

/**
 * Main component class.
 */
export default class Component extends React.Component {
    /** React properties **/
    static displayName = "app.page";
    static defaultProps = {};
    static propTypes = {};

    componentDidMount() {
        let logger = Logger.create("componentDidMount");
        logger.info("enter");

        // Set app as ready.
        window.appReady = true;

        // If all resources are also ready, then remove loader.
        if(window.resourcesReady) {
            var loader = document.getElementById("loader-overlay");
            if(loader){ loader.style.display = "none"; }

            window.appLoaded = true;
        }

        // Test toaster
        /*Redux.shared.store.dispatch(
            Toaster.actions.push("moody", "Message 1")
        );

        setTimeout(() => {
            Redux.shared.store.dispatch(
                Toaster.actions.push("moody", "Message 2")
            );
        }, 1000);*/
    }

    render() {
        return (
            <div className={styles.page}>
                {this.props.children}

                <Toaster position="top-center"/>
            </div>
        );
    }
}
