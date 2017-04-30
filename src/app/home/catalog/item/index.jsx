import React from "react";
import lodash from "lodash";
import config from "config";
import {connect} from "react-redux";
import Container from "darch/src/container";
import Grid from "darch/src/grid";
import Field from "darch/src/field";
import Text from "darch/src/text";
import i18n from "darch/src/i18n";
import Button from "darch/src/button";
import {LoggerFactory,Redux} from "darch/src/utils";
import {Api,Product,Basket} from "common";
import styles from "./styles";

let Logger = new LoggerFactory("catalog.item");

/**
 * Redux map state to props function.
 *
 * @param {object} state
 * @param {object} ownProps
 */
function mapStateToProps(state) {
    return {
        products: state.product.data,
        basket: state.basket,
        uid: state.user.uid
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
    static displayName = "catalog.item";
    static defaultProps = {};
    static propTypes = {};

    state = {};

    async componentDidMount() {
        let logger = Logger.create("componentDidMount");
        logger.info("enter", {location: this.props});

        let nameId = lodash.get(this.props, "params.id");

        // Try to get product from products store.
        let product = lodash.find(this.props.products, (product) => {
            console.log(["product", product, nameId]);
            return product.nameId == nameId;
        });

        // If nothing was found, then get it directly from the server.
        if(!product) {
            this.setState({initializing: true});

            try {
                let findResponse = await Api.shared.productFindByNameId(nameId);
                product = findResponse.result;
            }
            catch(error) {
                logger.error("api productFindByNameId error", error);
            }
        }

        this.setState({
            initializing: false,
            product
        });
    }

    render() {
        let {uid} = this.props;
        let {initializing,product} = this.state;
        let nameId = lodash.get(this.props, "params.id");
        
        let item = lodash.find(this.props.basket.items, (item) => {
            return item.product.nameId == nameId;
        });

        console.log(["product item", item, this.props.basket]);

        return (
            <div>
                <Container>
                    {product ? (
                        <Grid>
                            <Grid.Cell>
                                {item ? <Product.Badge count={item.count} /> : null}

                                <div className={styles.mainImageContainer}>
                                    <div className={styles.mainImage} style={{
                                        backgroundImage: `url(//${config.hostnames.file}/images/${product.mainImage})`,
                                        backgroundSize: "cover",
                                        backgroundPosition: "center"
                                    }}></div>
                                </div>

                                <div className={styles.priceContainer}>
                                    <Text scale={2}>
                                        <b><i18n.Number prefix="R$" numDecimals={2} value={product.priceValue} /></b>
                                    </Text>
                                </div>

                                <div className={styles.totalPriceContainer}>
                                    {item ? (
                                        <Text scale={0.8} color="#999999">
                                            ( <i18n.Translate text="_TOTAL_IN_BASKET_" format="lower"/> = <b><i18n.Number prefix="R$" numDecimals={2} value={item.count * product.priceValue} /></b> )
                                        </Text>
                                    ) : (
                                        <Text scale={0.8} color="#999999">••••</Text>
                                    )}
                                </div>

                                {uid ? (
                                    <div className={styles.addBtnContainer}>
                                        <Grid noGap={true}>
                                            {item? (
                                                <Grid.Cell span={0.3}>
                                                    <div className={styles.removeBtnContainer}>
                                                        <Button scale={1} color="danger" onClick={() => {
                                                            Redux.dispatch(Basket.actions.basketRemoveProduct(product));
                                                        }}>-</Button>
                                                    </div>
                                                </Grid.Cell>
                                            ) : (<span></span>)}

                                            <Grid.Cell>
                                                <Button scale={1} color="success" onClick={() => {
                                                    Redux.dispatch(Basket.actions.basketAddProduct(product));
                                                }}>+ Adicionar</Button>
                                            </Grid.Cell>
                                        </Grid>
                                    </div>
                                ) : null}
                            </Grid.Cell>
                            
                            <Grid.Cell span={4}>
                                <div className={styles.bodyContainer}>
                                    <Field.Section>
                                        <Text scale={0.8} color="moody">
                                            <i18n.Translate text="_CATALOG_ITEM_PAGE_NAME_FIELD_LABEL_" />
                                        </Text>
                                        
                                        <div><Text scale={1.5}>{product.name}</Text></div>
                                    </Field.Section>

                                    <Field.Section>
                                        <Text scale={0.8} color="moody">
                                            <i18n.Translate text="_CATALOG_ITEM_PAGE_DESCRIPTION_FIELD_LABEL_" />
                                        </Text>
                                        
                                        <div><Text scale={1}>{product.description}</Text></div>
                                    </Field.Section>
                                </div>
                            </Grid.Cell>
                        </Grid>
                    ) : initializing ? (
                        <div>Carregando ...</div>
                    ) : (
                        <div>Ops... Esse produto não está cadastrado em nosso catálogo! :(</div>
                    )}
                </Container>
            </div>
        );
    }
}

/** Export **/
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Component);
