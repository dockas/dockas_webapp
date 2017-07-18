import React from "react"
import {LoggerFactory} from "darch/src/utils"
import styles from "./styles"

let Logger = new LoggerFactory("brand.detail.statistics")

/**
 * Main component class.
 */
export default class Component extends React.Component {
    /** React properties **/
    static displayName = "brand.detail.statistics";
    static defaultProps = {};
    static propTypes = {};

    componentDidMount() {
        let logger = Logger.create("componentDidMount")
        logger.info("enter")
    }

    render() {
        return (
            <div className={styles.page}>
                Muito em breve vamos oferecer diversas estatística interessantes sobre sua marca nesta aba. Algumas dessas estatísticas incluem qual de seus produtos tem mais vendas, seu ganho médio na venda dos produtos e um gráfico com a evolução das suas vendas. 
            </div>
        )
    }
}
