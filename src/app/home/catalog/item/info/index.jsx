import React from "react";
import lodash from "lodash";
//import classNames from "classnames";
import {connect} from "react-redux";
import {Converter} from "showdown";
import {Link} from "react-router";
import {LoggerFactory,Style,Redux} from "darch/src/utils";
import Field from "darch/src/field";
//import Form from "darch/src/form";
import i18n from "darch/src/i18n";
//import Button from "darch/src/button";
import Text from "darch/src/text";
import {Product,Brand,Panel} from "common";
import styles from "./styles";

let Logger = new LoggerFactory("catalog.item.info");
let converter = new Converter({
    headerLevelStart: 5
});

converter.setFlavor("github");

/**
 * Redux map state to props function.
 *
 * @param {object} state
 * @param {object} ownProps
 */
function mapStateToProps(state) {
    return {
        productData: state.product.data,
        productNameIdToId: state.product.nameIdToId,
        brandData: state.brand.data,
        basket: state.basket,
        uid: state.user.uid,
        user: state.user.uid?state.user.data[state.user.uid]:null
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

    fieldRefs = {};

    getScopeData(props=this.props) {
        let product,
            brand,
            nameId = lodash.get(props, "params.id");

        let {
            productData,
            productNameIdToId,
            brandData
        } = props;
        
        // Get product
        product = productNameIdToId[nameId]?
            productData[productNameIdToId[nameId]] :
            null;

        // Get brand
        if(product) {
            brand = brandData[product.brand];
        }

        return {product, brand};
    }

    componentDidMount() {
        let logger = Logger.create("componentDidMount");
        logger.info("enter");

        console.log("ola balofo loco", {
            nameId: lodash.get(this.props, "params.id")
        });

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

    async onSubmit(data, {name=null}={}) {
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
        let response,
            {product} = this.getScopeData(),
            logger = Logger.create("onUploadComplete");

        if(!product){return;}

        logger.info("enter", data);

        // Update product.
        try {
            response = await Redux.dispatch(Product.actions.productUpdate(product._id, data));
            logger.debug("api productUpdate success", response);
        }
        catch(error) {
            return logger.error("api productUpdate error", error);
        }
    }

    render() {
        let {product,brand} = this.getScopeData();
        let {user} = this.props;
        let {items} = this.props.basket;
        let {editing,saving,screenSize} = this.state;
        let {isApprovedOwner,isAdmin} = Brand.utils.getOwner(user, lodash.get(product,"brand"));

        let item = lodash.find(items, (item) => {
            return item.product == product._id;
        });

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
                                <i18n.Number prefix="R$" numDecimals={2} value={product.priceValue/100} />
                            </Text>
                        </div>
                        {item ? (
                            <div>
                                <Text scale={0.8} color="#999999">
                                    ( <i18n.Translate text="_TOTAL_IN_BASKET_" format="lower"/> = <b><i18n.Number prefix="R$" numDecimals={2} value={(item.quantity * product.priceValue)/100} /></b> )
                                </Text>
                            </div>
                        ) : null}
                    </Field.Section>
                ) : null}

                <div className={styles.panelRow}>
                    {brand ? (
                        <Panel id="brand"
                            canEdit={false}
                            labelText="_CATALOG_ITEM_PAGE_BRAND_LABEL">

                            <Link to={`/brand/${brand.nameId}`}>{brand.name}</Link>  
                        </Panel>
                    ) : null}

                    {isAdmin||isApprovedOwner ? (
                        <Panel id="stock"
                            canEdit={true}
                            editing={editing.stock}
                            loading={saving.stock}
                            labelText="_CATALOG_ITEM_PAGE_STOCK_FIELD_LABEL_"
                            saveText="_CATALOG_ITEM_PAGE_SAVE_LABEL_"
                            editText="_CATALOG_ITEM_PAGE_EDIT_LABEL_"
                            cancelText="_CATALOG_ITEM_PAGE_CANCEL_LABEL_"
                            onEditStart={() => { this.setState({editing: Object.assign(editing, {stock: true})}); }}
                            onCancel={() => { this.setState({editing: Object.assign(editing, {stock: false})}); }}
                            onEditEnd={this.onSubmit}>
                            <div style={{minWidth: "100px"}}>
                                {editing.stock ? (
                                    <Field.Number
                                        name="stock"
                                        value={product.stock}
                                        numDecimals={0}
                                        focus={true}
                                        validators="$required"
                                    />
                                ) : (
                                    <div>{product.stock}</div>
                                )}
                            </div>
                        </Panel>
                    ) : null}
                </div>

                <div className={styles.panelRow}>
                    <Panel id="description"
                        display="block"
                        canEdit={isAdmin||isApprovedOwner}
                        editing={editing.description}
                        loading={saving.description}
                        labelText="_CATALOG_ITEM_PAGE_DESCRIPTION_FIELD_LABEL_"
                        saveText="_CATALOG_ITEM_PAGE_SAVE_LABEL_"
                        editText="_CATALOG_ITEM_PAGE_EDIT_LABEL_"
                        cancelText="_CATALOG_ITEM_PAGE_CANCEL_LABEL_"
                        onEditStart={() => { this.setState({editing: Object.assign(editing, {description: true})}); }}
                        onEditEnd={this.onSubmit}
                        onCancel={() => { this.setState({editing: Object.assign(editing, {description: false})}); }}>
                        
                        {editing.description ? (
                            <Field.TextArea
                                name="description"
                                rows={2}
                                value={product.description}
                                name="description"
                                disabled={saving.description}
                                scale={1}
                                focus={true}/>
                        ) : (
                            <div dangerouslySetInnerHTML={{
                                __html: product.description ? 
                                    converter.makeHtml(product.description) :
                                    ""
                            }}></div>
                        )}
                    </Panel>
                </div>
            </div>
        );
    }
}

/** Export **/
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Component);
