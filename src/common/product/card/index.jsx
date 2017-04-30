import React from "react";
import config from "config";
import {connect} from "react-redux";
import {withRouter} from "react-router";
import {LoggerFactory,Redux,Style} from "darch/src/utils";
import Button from "darch/src/button";
import i18n from "darch/src/i18n";
import {Basket} from "common";
import styles from "./styles";
import Badge from "../badge";

let Logger = new LoggerFactory("common.product.card");

/**
 * Redux map state to props function.
 *
 * @param {object} state
 * @param {object} ownProps
 */
function mapStateToProps(state) {
    return {
        uid: state.user.uid,
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

    onAddBtnClick(evt) {
        let logger = Logger.create("onAddBtnClick");
        logger.info("enter");

        evt.preventDefault();
        evt.stopPropagation();

        Redux.dispatch(
            Basket.actions.basketAddProduct(this.props.data)
        );
    }

    onRemoveBtnClick(evt) {
        let logger = Logger.create("onRemoveBtnClick");
        logger.info("enter");

        evt.preventDefault();
        evt.stopPropagation();

        Redux.dispatch(
            Basket.actions.basketRemoveProduct(this.props.data)
        );
    }

    goToProductDetail() {
        this.props.router.push({
            pathname: `/item/${this.props.data.nameId}`
        });
    }

    renderTags() {
        let {data} = this.props;
        let tags = [];

        for(let i = 0; i < data.tags.length && i < 2; i++) {
            let tag = data.tags[i];

            tags.push(
                <div key={tag._id} className={styles.tag} style={{
                    backgroundColor: tag.color,
                    color: Style.darkness(tag.color) > 40 ? "#ffffff" : "#000000"
                }}>{tag.name}</div>
            );
        }

        return tags;        
    }

    /**
     * This function is responsible for generating the component's view.
     */
    render() {
        let {data,uid} = this.props;
        let {showOverlay} = this.state;

        let item = this.props.basket.items[data._id];

        return (
            <div className={styles.card} 
                onMouseEnter={this.onMouseEnter}
                onMouseLeave={this.onMouseLeave}
                onClick={this.goToProductDetail}>
                {item ? (
                    <Badge count={item.count} />
                ) : null}

                <div className={styles.imageContainer}>
                    <div className={styles.image} style={{
                        backgroundImage: `url(//${config.hostnames.file}/images/${data.mainImage})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center"
                    }}></div>

                    {uid && showOverlay ? (
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
                    <i18n.Number prefix="R$" value={data.priceValue} numDecimals={2}/>
                </div>

                <div className={styles.name}>
                    <textarea disabled rows="2" value={data.name}></textarea>
                </div>

                {data.tags && data.tags.length ? (
                    <div className={styles.tagsContainer}>
                        {this.renderTags()}
                    </div>
                ) : null}
            </div>
        );
    }
}

/** Export **/
export default withRouter(connect(
    mapStateToProps,
    mapDispatchToProps
)(Component));


