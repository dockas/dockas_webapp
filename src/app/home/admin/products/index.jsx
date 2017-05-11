import React from "react";
import config from "config";
import lodash from "lodash";
import {LoggerFactory} from "darch/src/utils";
import Container from "darch/src/container";
import Tabs from "darch/src/tabs";
import i18n from "darch/src/i18n";
import {Api} from "common";
import Bar from "../bar";
import PriceModal from "./price_modal";
import styles from "./styles";

let Logger = new LoggerFactory("admin.products.list");

/**
 * Main component class.
 */
export default class Component extends React.Component {
    /** React properties **/
    static displayName = "admin.products.list";
    static defaultProps = {};
    static propTypes = {};

    state = {};

    async componentDidMount() {
        let logger = Logger.create("componentDidMount");
        logger.info("enter");

        let findResponse = await Api.shared.productFind({populate: ["tags","creator","images"]});

        this.setState({
            products: findResponse.results
        });
    }

    onChangePriceBtnClicked(product) {
        let logger = Logger.create("onChangePriceBtnClicked");
        logger.info("enter");

        return () => {
            this.setState({priceModalProduct: product});
        };
    }

    render() {
        return (
            <div>
                <Bar>
                    <Tabs.Item align="right" color="moody" to="/admin/create/product">
                        {/*<span className="icon-squared-plus"></span> */}<i18n.Translate text="_ADMIN_BAR_PRODUCTS_ADD_ACTION_LABEL_" />
                    </Tabs.Item>
                </Bar>

                <Container>
                    <table>
                        <thead>
                            <tr>
                                <th></th>
                                <th><i18n.Translate text="_ADMIN_PRODUCTS_PAGE_NAME_TH_" /></th>
                                <th><i18n.Translate text="_ADMIN_PRODUCTS_PAGE_PRICE_VALUE_TH_" /></th>
                                <th><i18n.Translate text="_ADMIN_PRODUCTS_PAGE_CREATOR_TH_" /></th>
                                <th><i18n.Translate text="_ADMIN_PRODUCTS_PAGE_CREATED_AT_TH_" /></th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.state.products && this.state.products.length ? (
                                this.state.products.map((product) => {
                                    let mainImage = lodash.find(product.images, (image) => {
                                        return image._id == product.mainImage;
                                    });

                                    return (
                                        <tr key={product._id}>
                                            <td>
                                                {mainImage ? (
                                                    <div className={styles.image} style={{
                                                        backgroundImage: `url(//${config.hostnames.file}/images/${mainImage.path})`,
                                                        backgroundSize: "cover",
                                                        backgroundPosition: "center"
                                                    }}></div>
                                                ) : null}
                                            </td>

                                            <td>{product.name}</td>
                                            <td><i18n.Number prefix="R$" numDecimals={2} value={product.priceValue} /></td>
                                            <td>{product.creator.fullName}</td>
                                            <td><i18n.Moment date={product.createdAt} /></td>
                                            <td className={styles.actionButtonsContainer}>
                                                <a onClick={this.onChangePriceBtnClicked(product)} title="change price">
                                                    <span className="icon-price-tag"></span>
                                                </a>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="6"><i18n.Translate text="_ADMIN_PRODUCTS_PAGE_NO_PRODUCTS_" /></td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </Container>

                <PriceModal open={!!this.state.priceModalProduct}
                    product={this.state.priceModalProduct} 
                    onComplete={(result) => {
                        let logger = Logger.create("onPriceModalComplete");
                        logger.info("enter", result);

                        let newState = {priceModalProduct: null};

                        if(result) {
                            // Next setState gonna trigger the ui change for this.
                            this.state.priceModalProduct.priceValue = result.value;
                        }

                        this.setState(newState);
                    }}
                />
            </div>
        );
    }
}
