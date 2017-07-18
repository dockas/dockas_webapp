import React from "react"
import {LoggerFactory} from "darch/src/utils"
import styles from "./styles"

let Logger = new LoggerFactory("brand.detail.photos")

/**
 * Main component class.
 */
export default class Component extends React.Component {
    /** React properties **/
    static displayName = "brand.detail.photos";
    static defaultProps = {};
    static propTypes = {};

    componentDidMount() {
        let logger = Logger.create("componentDidMount")
        logger.info("enter")
    }

    render() {
        return (
            <div className={styles.page}>
                Muito em breve você poderá ver aqui diversas fotos sobre esta marca.
            </div>
        )
    }
}
