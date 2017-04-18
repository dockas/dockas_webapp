import React from "react";
import config from "config";
import {connect} from "react-redux";
import {LoggerFactory,Redux} from "darch/src/utils";
import Button from "darch/src/button";
import i18n from "darch/src/i18n";
import styles from "./styles";
import {Basket} from "common";

let Logger = new LoggerFactory("common.product.card");

/**
 * Redux map state to props function.
 *
 * @param {object} state
 * @param {object} ownProps
 */
function mapStateToProps(state) {
    return {
        basket: state.basket
    };
}

/**
 * Redux dispatch to props map.
 */
let mapDispatchToProps = {

};

/**
 * Main component class.
 */
class Component extends React.Component {
    /** React properties **/
    static displayName = "common.product.card";
    static defaultProps = {};
    static propTypes = {};

    state = {};

    /**
     * LYFECICLE : This function is called when component
     * got mounted in the view.
     */
    componentDidMount() {
        let logger = Logger.create("componentDidMount");
        logger.info("enter");
    }

    onMouseEnter() {
        this.setState({showOverlay: true});
    }

    onMouseLeave() {
        this.setState({showOverlay: false});
    }

    onAddBtnClick() {
        let logger = Logger.create("onAddBtnClick");
        logger.info("enter");

        Redux.dispatch(
            Basket.actions.basketAddProduct(this.props.data)
        );
    }

    onRemoveBtnClick() {
        let logger = Logger.create("onRemoveBtnClick");
        logger.info("enter");

        Redux.dispatch(
            Basket.actions.basketRemoveProduct(this.props.data)
        );
    }

    /**
     * This function is responsible for generating the component's view.
     */
    render() {
        let {data} = this.props;
        let {showOverlay} = this.state;

        let item = this.props.basket.items[data._id];

        return (
            <div className={styles.card} 
                onMouseEnter={this.onMouseEnter}
                onMouseLeave={this.onMouseLeave}>
                {item ? (
                    <div className={styles.counterBag}>
                        {item.count}
                    </div>
                ) : null}

                <div className={styles.imageContainer}>
                    <div className={styles.image} style={{
                        backgroundImage: `url(http://${config.hostnames.file}/${data.image})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center"
                    }}></div>

                    {showOverlay ? (
                        <div className={styles.overlay}>
                            {item ? (<Button scale={0.6} color="danger" onClick={this.onRemoveBtnClick}>
                                <span className="icon-minus-strong"></span>
                            </Button>) : null}
                            <Button scale={0.6} color="success" onClick={this.onAddBtnClick}>
                                <span className="icon-plus-strong"></span> <i18n.Translate text="_ADD_" />
                            </Button>
                        </div>
                    ) : null}
                </div>

                <div className={styles.price}>
                    <i18n.Number value={data.price} numDecimals={2} currency={true} />
                </div>

                <div className={styles.summary}>{data.summary}</div>
            </div>
        );
    }
}

/** Export **/
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Component);


