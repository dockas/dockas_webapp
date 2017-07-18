import React from "react"
import lodash from "lodash"
import config from "config"
import {Link} from "react-router-dom"
import {connect} from "react-redux"
import {LoggerFactory} from "darch/src/utils"
import i18n from "darch/src/i18n"
import styles from "./styles"

let Logger = new LoggerFactory("list.card_2")

/**
 * Redux map state to props function.
 *
 * @param {object} state
 * @param {object} ownProps
 */
function mapStateToProps(state) {
    return {
        uid: state.user.uid,
        user: state.user.uid?state.user.data[state.user.uid]:null,
        fileData: state.file.data,
        productData: state.product.data
    }
}

/**
 * Redux dispatch to props map.
 */
let mapDispatchToProps = {

}

/**
 * Main component class.
 */
class Component extends React.Component {
    /** React properties **/
    static displayName = "list.card_2";
    static defaultProps = {};
    static propTypes = {};

    componentDidMount() {
        let logger = Logger.create("componentDidMount")
        logger.info("enter")
    }

    render() {
        let {list,fileData,productData} = this.props
        let totalPrice = 0
        let bannerPath = lodash.get(fileData, `${list.bannerImage}.path`)

        let style = {
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat"
        }

        if(bannerPath) {
            style.backgroundImage = `url(//${config.hostnames.file}/images/${bannerPath})`
        }

        // Eval list total price.
        for(let item of list.items) {
            if(!productData[item.product]) {continue}

            let product = productData[item.product]
            totalPrice += product.priceValue * item.quantity
        }

        return (
            <Link className={styles.card} to={`/lists/${list.nameId}`}>
                <div className={styles.header}>
                    <div className={styles.overlay}>
                        {/*<div className={styles.content}>
                            <div className={styles.title}>{list.name}</div>
                        </div>*/}
                    </div>

                    <div className={styles.bannerImage} style={style}></div>
                </div>

                <div className={styles.body}>
                    <span className={styles.price}>
                        <i18n.Number prefix="R$" value={totalPrice/100} numDecimals={2}/>
                    </span>

                    <span className={styles.name}>{list.name}</span>
                </div>
            </Link>
        )
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Component)

