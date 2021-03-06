import React from "react";
import config from "config";
import lodash from "lodash";
import {connect} from "react-redux";
import {withRouter} from "react-router";
import classNames from "classnames";
import {LoggerFactory,Redux,Style} from "darch/src/utils";
import Button from "darch/src/button";
import i18n from "darch/src/i18n";
import Text from "darch/src/text";
import Spinner from "darch/src/spinner";
import Label from "darch/src/label";
import placeholderImg from "assets/images/placeholder.png";
import {Basket,Brand} from "common";
import styles from "./styles";
import types from "../types";
import Badge from "../../badge";

let Logger = new LoggerFactory("common.product.card");

/**
 * Redux map state to props function.
 *
 * @param {object} state
 * @param {object} ownProps
 */
function mapStateToProps(state) {
    return {
        brandData: state.brand.data,
        tagData: state.tag.data,
        fileData: state.file.data,
        user: lodash.get(state.user.data, state.user.uid),
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

    static defaultProps = {
        onChangePrice: () => {},
        showBasketQuantity: true,
        showClearButton: true,
        canEditQuantity: true
    };

    static propTypes = {
        quantity: React.PropTypes.number,
        onChangePrice: React.PropTypes.func,
        showBasketQuantity: React.PropTypes.bool,
        showClearButton: React.PropTypes.bool,
        canEditQuantity: React.PropTypes.bool,
        onAdd: React.PropTypes.func,
        onRemove: React.PropTypes.func,
        onClear: React.PropTypes.func
    };

    state = {
        screenSize: "desktop"
    };

    /**
     * LYFECICLE : This function is called when component
     * got mounted in the view.
     */
    componentDidMount() {
        let logger = Logger.create("componentDidMount");
        logger.info("enter");

        this.handleWindowResize();
    }

    handleWindowResize() {
        let logger = Logger.create("handleWindowResize");

        let {screenSize} = this.state;
        let currentScreenSize = Style.screenForWindowWidth(window.innerWidth);

        if(currentScreenSize != screenSize) {
            logger.info("enter", {screenSize, currentScreenSize});
            this.setState({screenSize: currentScreenSize});
        }
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

        if(this.props.onAdd) {
            this.props.onAdd(this.props.data);
        }
        else {
            Redux.dispatch(
                Basket.actions.basketAddProduct(this.props.data)
            );
        }
    }

    onRemoveBtnClick(evt) {
        let logger = Logger.create("onRemoveBtnClick");
        logger.info("enter");

        evt.preventDefault();
        evt.stopPropagation();

        if(this.props.onRemove) {
            this.props.onRemove(this.props.data);
        }
        else {
            Redux.dispatch(
                Basket.actions.basketRemoveProduct(this.props.data)
            );
        }
    }

    onClearBtnClick(evt) {
        let logger = Logger.create("onClearBtnClick");
        logger.info("enter");

        evt.preventDefault();
        evt.stopPropagation();

        if(this.props.onClear) {
            this.props.onClear(this.props.data);
        }
    }

    goToProductDetail() {
        this.props.router.push({
            pathname: `/item/${this.props.data.nameId}`
        });
    }

    onTagClick(tag) {
        return (evt) => {
            evt.preventDefault();
            evt.stopPropagation();

            if(this.state.loadingTag) {return;}

            this.setState({loadingTag: tag});

            Promise.resolve(this.props.onTagClick(tag)).then(() => {
                this.setState({loadingTag: null});
            });
        };
    }

    renderTags() {
        let {data,tagData} = this.props;
        let {loadingTag} = this.state;
        let tags = [];

        for(let i = 0; i < data.tags.length && i < 2; i++) {
            if(!tagData[data.tags[i]]) {continue;}

            let tag = tagData[data.tags[i]];
            let color = Style.darkness(tag.color) > 40 ? "#ffffff" : "#000000";

            tags.push(
                <div key={tag._id} className={styles.tag} style={{
                    backgroundColor: tag.color,
                    cursor: "pointer",
                    color: color
                }} onClick={this.onTagClick(tag)}>

                    {tag == loadingTag ? (
                        <Spinner.CircSide color={color} />
                    ) : (
                        <span>{tag.name}</span>
                    )}
                </div>
            );
        }

        // No tags...so let's render a "no tags tag".
        if(!tags.length) {
            tags.push(
                <div key={0} className={styles.tag} style={{
                    backgroundColor: "#eeeeee",
                    color: "#777777"
                }}>
                    <i18n.Translate text="_NO_TAGS_" />
                </div>
            );
        }

        return tags;
    }

    onChangePriceBtnClicked(evt) {
        evt.preventDefault();
        evt.stopPropagation();

        this.props.onChangePrice(this.props.data);
    }

    /**
     * This function is responsible for generating the component's view.
     */
    render() {
        let {
            data,uid,user,quantity,showClearButton,
            showBasketQuantity,canEditQuantity,
            brandData,fileData
        } = this.props;
        let {showOverlay,screenSize} = this.state;
        let {isApprovedOwner,isAdmin} = Brand.utils.getOwner(user, lodash.get(brandData, data.brand));

        let item = this.props.basket.items[data._id];
        let mainProfileImage = lodash.get(fileData, data.mainProfileImage);

        return (
            <div className={classNames([
                styles.card,
                data.stock <= 0 ? styles.outOfStock : ""
            ])}
                onMouseEnter={this.onMouseEnter}
                onMouseLeave={this.onMouseLeave}
                onClick={this.goToProductDetail}>
                <div className={styles.badgesContainer}>
                    {quantity >= 0 ? (
                        <Badge className={styles.quantityBadge} color="#eeeeee" count={quantity} borderWidth={8} />
                    ) : null}

                    {showBasketQuantity && item ? (
                        <Badge className={classNames([
                            styles.badge
                        ])} count={item.quantity} borderWidth={8} />
                    ) : null}
                </div>

                {["not_approved"].indexOf(data.status) >= 0 ? (
                    <div style={{position: "absolute", top: "18px", left: "10px", zIndex: "1", padding: "2px", backgroundColor: "white", borderRadius: "0.3em"}}>
                        <Label scale={0.7} color="#F9690E" layout="outlined"><i18n.Translate text={`_PRODUCT_STATUS_${lodash.toUpper(data.status)}_`}/></Label>
                    </div>
                ) : null}

                <div className={styles.imageContainer}>
                    {mainProfileImage ? (
                        <div className={styles.image} style={{
                            backgroundImage: mainProfileImage.url ? `url(${mainProfileImage.url})` : `url(//${config.hostnames.file}/images/${mainProfileImage.path})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center"
                        }}></div>
                    ) : (
                        <div className={styles.image} style={{
                            backgroundImage: `url(${placeholderImg})`,
                            backgroundColor: "#f9f9f9",
                            backgroundSize: "cover",
                            backgroundPosition: "center"
                        }}></div>
                    )}

                    {data.stock <= 0 || (uid && data.status != types.Status.NOT_APPROVED && canEditQuantity && (showOverlay || screenSize == "phone")) ? (
                        <div className={styles.overlay}>
                            {quantity == 0 && showClearButton ? (<Button scale={screenSize == "phone" ? 0.8 : 0.6} color="danger" onClick={this.onClearBtnClick}>
                                <i18n.Translate text="_PRODUCT_CARD_CLEAR_BUTTONT_LABEL_" />
                            </Button>) : null}

                            {quantity > 0 || (showBasketQuantity && item && data.stock > 0) ? (<Button scale={screenSize == "phone" ? 0.8 : 0.6} color="danger" onClick={this.onRemoveBtnClick}>
                                <span className="icon-minus-strong"></span>
                            </Button>) : null}

                            <Button scale={screenSize == "phone" ? 0.8 : 0.6} color="success" onClick={this.onAddBtnClick} disabled={data.stock <= 0 || item && item.quantity == data.stock}>
                                {data.stock <= 0 || item && item.quantity == data.stock ? (
                                    <i18n.Translate text="_OUT_OF_STOCK_" />
                                ) : (
                                    <span><span className="icon-plus-strong"></span> <i18n.Translate text="_ADD_" /></span>
                                )}
                            </Button>
                        </div>
                    ) : null}
                </div>

                <div className={styles.price}>
                    <span className={styles.priceValue}><i18n.Number prefix="R$" value={data.priceValue/100} numDecimals={2}/></span>

                    {data.priceGroups && data.priceGroups.length > 0 ? (
                        <span style={{marginLeft: "5px"}}>
                            <Text scale={0.7}>
                                (<i18n.Number prefix="R$" sufix={data.priceGroups[0].unity} value={data.priceValue/100 * data.priceGroups[0].quantity} numDecimals={2}/>)
                            </Text>
                        </span>
                    ) : (
                        null
                    )}

                    {isAdmin||isApprovedOwner ? (
                        <a className={styles.changePriceButton} onClick={this.onChangePriceBtnClicked} title="change price">
                            <span className="icon-price-tag"></span>
                        </a>
                    ) : null}
                </div>

                <div className={styles.name}>
                    <textarea disabled rows="2" value={data.name}></textarea>
                </div>

                {data.tags ? (
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
