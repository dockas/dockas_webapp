import React from "react";
import {LoggerFactory} from "darch/src/utils";
import Container from "darch/src/container";
import i18n from "darch/src/i18n";

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
                <Container size="sm">
                    <h3 className="headline"><i18n.Translate text="_ALERTS_PAGE_TITLE_" /></h3>
                </Container>
            </div>
        );
    }
}
