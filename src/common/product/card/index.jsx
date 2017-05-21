import React from "react";
import config from "config";
import lodash from "lodash";
import {connect} from "react-redux";
import {withRouter} from "react-router";
import {LoggerFactory,Redux,Style} from "darch/src/utils";
import Button from "darch/src/button";
import i18n from "darch/src/i18n";
import Text from "darch/src/text";
import placeholderImg from "assets/images/placeholder.png";
import {Basket} from "common";
import styles from "./styles";
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
        user: lodash.get(state.user.profiles, state.user.uid),
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
        onChangePrice: () => {}
    };

    static propTypes = {
        onChangePrice: React.PropTypes.func
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

    onChangePriceBtnClicked(evt) {
        evt.preventDefault();
        evt.stopPropagation();
        
        this.props.onChangePrice(this.props.data);
    }

    /**
     * This function is responsible for generating the component's view.
     */
    render() {
        let {data,uid,user} = this.props;
        let {showOverlay,screenSize} = this.state;

        let item = this.props.basket.items[data._id];
        let mainProfileImage = lodash.find(data.profileImages, (image) => {
            return image._id == data.mainProfileImage;
        });

        return (
            <div className={styles.card} 
                onMouseEnter={this.onMouseEnter}
                onMouseLeave={this.onMouseLeave}
                onClick={this.goToProductDetail}>
                {item ? (
                    <Badge className={styles.badge} count={item.count} borderWidth={8} />
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

                    {uid && (showOverlay || screenSize == "phone") ? (
                        <div className={styles.overlay}>
                            {item ? (<Button scale={screenSize == "phone" ? 0.8 : 0.6} color="danger" onClick={this.onRemoveBtnClick}>
                                <span className="icon-minus-strong"></span>
                            </Button>) : null}
                            <Button scale={screenSize == "phone" ? 0.8 : 0.6} color="success" onClick={this.onAddBtnClick}>
                                <span className="icon-plus-strong"></span> <i18n.Translate text="_ADD_" />
                            </Button>
                        </div>
                    ) : null}
                </div>

                <div className={styles.price}>
                    <span className={styles.priceValue}><i18n.Number prefix="R$" value={data.priceValue} numDecimals={2}/></span>

                    {data.priceGroups && data.priceGroups.length > 0 ? (
                        <span style={{marginLeft: "5px"}}>
                            <Text scale={0.7}>
                                (<i18n.Number prefix="R$" sufix={data.priceGroups[0].unity} value={data.priceValue * data.priceGroups[0].count} numDecimals={2}/>)
                            </Text>
                        </span>
                    ) : (
                        null
                    )}

                    {user && user.roles.indexOf("admin") >= 0 ? (
                        <a className={styles.changePriceButton} onClick={this.onChangePriceBtnClicked} title="change price">
                            <span className="icon-price-tag"></span>
                        </a>
                    ) : null}
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


