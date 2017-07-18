import React from "react"
import {LoggerFactory} from "darch/src/utils"
import Separator from "darch/src/separator"
import Text from "darch/src/text"
import Card from "../card"
import styles from "./styles"

let Logger = new LoggerFactory("common.list.carousel", {level:"error"})

/**
 * Main component class.
 */
export default class Component extends React.Component {
    /** React properties **/
    static displayName = "common.list.carousel";
    static defaultProps = {};
    static propTypes = {};

    /**
     * LYFECICLE : This function is called when component
     * got mounted in the view.
     */
    componentDidMount() {
        let logger = Logger.create("componentDidMount")
        logger.info("enter")
    }

    /**
     * This function is responsible for generating the component's view.
     */
    render() {
        let {lists} = this.props

        return (
            <div className={styles.carousel}>
                <Separator.Line lineStyle="dashed" lineColor="#dddddd">
                    <Separator.Info align="left">
                        <Text scale={0.8} color="#bbbbbb">listas</Text>
                    </Separator.Info>

                    <Separator.Info align="right">
                        <span style={{marginLeft: "5px"}}><a><Text scale={1.2} color="moody"><span className="icon-circled-left"></span></Text></a></span>
                        <span style={{marginLeft: "5px"}}><a><Text scale={1.2} color="moody"><span className="icon-circled-right"></span></Text></a></span>
                    </Separator.Info>
                </Separator.Line>

                <div className={styles.body}>
                    {lists && lists.length ? (
                        lists.map((list) => {
                            return (
                                <Card key={list._id} list={list} />
                            )
                        })
                    ) : null}
                </div>
            </div>
        )
    }
}
