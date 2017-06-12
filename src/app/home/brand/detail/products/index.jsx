import React from "react";
import {connect} from "react-redux";
import lodash from "lodash";
import {LoggerFactory,Redux} from "darch/src/utils";
import Grid from "darch/src/grid";
import Spinner from "darch/src/spinner";
import Button from "darch/src/button";
import {Scroller,Product,Brand} from "common";
import styles from "./styles";

let Logger = new LoggerFactory("brand.detail.products");

/**
 * Redux map state to props function.
 *
 * @param {object} state
 * @param {object} ownProps
 */
function mapStateToProps(state) {
    return {
        brand: state.brand.selected,
        productsBrand: lodash.get(state.product,"scope.brandProducts.brand"),
        products: lodash.get(state.product,"scope.brandProducts.data"),
        query: lodash.get(state.product,"scope.brandProducts.query"),
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
    static displayName = "brand.detail.products";
    static defaultProps = {};
    static propTypes = {};

    state = {};

    componentDidMount() {
        let logger = Logger.create("componentDidMount");
        logger.info("enter");

        this.scroller = new Scroller({
            onLoad: async (count) => {
                let {products} = this.props;
                products = products || [];

                if(count===1 && products.length) {return;}

                let query = {
                    limit: 30,
                    brand: [this.props.brand._id],
                    hash: {
                        gt: count===1 ? 
                            "#" :
                            products[products.length-1].hash
                    }
                };

                if(this.searchName) {
                    query.name.regex = this.searchName;
                }

                if(this.tags) {
                    query.tags = this.tags;
                }

                /*if(products.length) {
                    query.priority = {
                        lte: products[products.length-1].priority
                    };
                }*/

                await this.loadProducts(query);
            },
            offset: 500
        });
    }

    componentWillUnmount() {
        this.scroller.destroy();
    }

    async loadProducts(query, {isSearch=false, concat=true}={}) {
        let logger = Logger.create("loadProducts");

        logger.info("enter", query);

        this.setState({
            searchLoading: isSearch,
            productsLoading: !isSearch
        });

        let mergedQuery = lodash.assign({}, query, {
            sort: {"hash": 1, "name": 1},
            populate: ["tags","profileImages","brand","brand.company"]
        });

        if(lodash.isEmpty(mergedQuery.name)){
            delete mergedQuery.name;
        }

        if(!query || lodash.isEmpty(query.tags)) {
            delete mergedQuery.tags;
        }

        // Retrieve products
        try {
            await Redux.dispatch(
                Product.actions.productFind(mergedQuery, {
                    concat,
                    scope: {
                        id: "brandProducts", 
                        brand: this.props.brand._id
                    }
                })
            );
        }
        catch(error) {
            logger.error("product actions find error", error);
        }
        
        this.setState({
            searchLoading: false,
            productsLoading: false
        });
    }

    onProductChangePrice(product) {
        this.setState({priceModalProduct: product});
    }

    render() {
        let {user,brand,products} = this.props;
        let {productsLoading, priceModalProduct} = this.state;
        let {isApprovedOwner,isAdmin} = Brand.utils.getOwner(user, brand);

        return (
            <div>
                <div className={styles.buttonsContainer}>
                    {isAdmin||isApprovedOwner ? (
                        <Button to="/create/product" scale={0.8} textCase="lower">Adicionar</Button>
                    ) : null}
                </div>

                <Grid spots={4} noGap={true} bordered={true}>
                    {products ? (
                        products.map((product) => {
                            return (
                                <Grid.Cell key={product._id} span={1}>
                                    <Product.Card data={product} 
                                        onChangePrice={this.onProductChangePrice}
                                    />
                                </Grid.Cell>
                            );
                        })
                    ) : (
                        null
                    )}
                </Grid>

                {productsLoading ? (
                    <div className={styles.loadingContainer}>
                        <Spinner.CircSide color="moody" scale={1.5} />
                    </div>
                ) : null}

                <Product.PriceModal open={!!priceModalProduct}
                    product={priceModalProduct} 
                    onComplete={(result) => {
                        let logger = Logger.create("onPriceModalComplete");
                        logger.info("enter", result);

                        let newState = {
                            priceModalProduct: null,
                            products: this.state.products
                        };

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

/** Export **/
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Component);
