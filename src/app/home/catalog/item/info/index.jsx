import React from "react";
import lodash from "lodash";
import {connect} from "react-redux";
import {LoggerFactory,Style,Redux} from "darch/src/utils";
import Field from "darch/src/field";
import Form from "darch/src/form";
import i18n from "darch/src/i18n";
import Button from "darch/src/button";
import Text from "darch/src/text";
import {Product} from "common";
import styles from "./styles";

let Logger = new LoggerFactory("catalog.item.info");

/**
 * Redux map state to props function.
 *
 * @param {object} state
 * @param {object} ownProps
 */
function mapStateToProps(state) {
    return {
        product: state.product.selected,
        basket: state.basket,
        uid: state.user.uid,
        user: state.user.uid?state.user.profiles[state.user.uid]:null
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
    static displayName = "catalog.item.info";
    static defaultProps = {};
    static propTypes = {};

    state = {
        editing: {},
        saving: {}
    };

    componentDidMount() {
        let logger = Logger.create("componentDidMount");
        logger.info("enter");

        // Window resize
        window.addEventListener("resize", this.handleWindowResize);

        this.handleWindowResize();
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.handleWindowResize);
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

    async onSubmit(data, name) {
        this.setState({
            saving: Object.assign(this.state.saving, {
                [name]: true
            })
        });

        // Let's update the product info.
        await this.updateProduct(data);

        this.setState({
            saving: Object.assign(this.state.saving, {
                [name]: false
            }),
            editing: Object.assign(this.state.editing, {
                [name]: false
            })
        });
    }

    async updateProduct(data) {
        let productResponse,
            productId = lodash.get(this.props, "product._id"),
            logger = Logger.create("onUploadComplete");

        if(!productId){return;}

        logger.info("enter", data);

        // Update product.
        try {
            productResponse = await Redux.dispatch(Product.actions.productUpdate(productId, data));
            logger.debug("api productUpdate success", productResponse);
        }
        catch(error) {
            return logger.error("api productUpdate error", error);
        }
    }

    render() {
        let {product,user,uid} = this.props;
        let item, {items} = this.props.basket;
        let {editing,saving,screenSize} = this.state;
        let isOwner = (user && user.roles.indexOf("admin") >= 0) 
            || (uid && product.brand.owners && product.brand.owners.indexOf(uid) >= 0)
            || (uid && product.brand.company && product.brand.company.owners && product.brand.company.owners.indexOf(uid) >= 0);

        if(product) {
            item = lodash.find(items, (item) => {
                return item.product.nameId == product.nameId;
            });
        }

        return (
            <div>
                {screenSize == "phone" ? (
                    <Field.Section>
                        <Text scale={0.8} color="moody">
                            <i18n.Translate text="_CATALOG_ITEM_PAGE_NAME_FIELD_LABEL_" />
                        </Text>
                        
                        <div><Text scale={1.5}>{product.name}</Text></div>
                    </Field.Section>
                ) : (
                    null
                )}

                {screenSize == "phone" ? (
                    <Field.Section>
                        <Text scale={0.8} color="moody">
                            <i18n.Translate text="_CATALOG_ITEM_PAGE_PRICE_FIELD_LABEL_" />
                        </Text>
                        <div className={styles.priceContainerPhone}>
                            <Text scale={2}>
                                <i18n.Number prefix="R$" numDecimals={2} value={product.priceValue} />
                            </Text>
                        </div>
                        {item ? (
                            <div>
                                <Text scale={0.8} color="#999999">
                                    ( <i18n.Translate text="_TOTAL_IN_BASKET_" format="lower"/> = <b><i18n.Number prefix="R$" numDecimals={2} value={item.count * product.priceValue} /></b> )
                                </Text>
                            </div>
                        ) : null}
                    </Field.Section>
                ) : null}

                <Field.Section>
                    <Form name="description" loading={saving.description} onSubmit={this.onSubmit}>
                        <div>
                            <Text scale={0.8} color="moody">
                                <i18n.Translate text="_CATALOG_ITEM_PAGE_DESCRIPTION_FIELD_LABEL_" />
                            </Text>

                            {isOwner ? (
                                !editing.description ? (
                                    <span> • <a style={{fontSize: "0.8em"}} onClick={() => {this.setState({editing: Object.assign(editing, {description: true})});}}><i18n.Translate text="_CATALOG_ITEM_PAGE_EDIT_LABEL_" /></a></span>
                                ) : (
                                    <span> • <Button textCase="lower" scale={0.8} type="submit" layout="link"><i18n.Translate text="_CATALOG_ITEM_PAGE_SAVE_LABEL_" /></Button></span>
                                )
                            ) : null}
                        </div>

                        <div>
                            {editing.description ? (
                                    <Field.TextArea
                                        name="description"
                                        rows={2}
                                        value={product.description}
                                        name="description"
                                        disabled={saving.description}
                                        scale={1} />
                            ) : (
                                <Text scale={1}>{product.description}</Text>
                            )}
                        </div>
                    </Form>
                </Field.Section>
            </div>
        );
    }
}

/** Export **/
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Component);
