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
        productData: state.product.data,
        brandData: state.brand.data,
        brandNameIdToId: state.brand.nameIdToId,
        productScopeIds: lodash.get(state.product,"scope.brandProducts.ids"),
        productScopeBrandId: lodash.get(state.product,"scope.brandProducts.brand"),
        productScopeQuery: lodash.get(state.product,"scope.brandProducts.query"),
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
    static displayName = "brand.detail.products";
    static defaultProps = {};
    static propTypes = {};

    state = {};

    getScopeData(props=this.props) {
        let result = {},
            nameId = lodash.get(props, "params.id"),
            {productScopeIds,productScopeQuery,
                productScopeBrandId,
                brandData,brandNameIdToId} = props;

        result.brand = brandNameIdToId[nameId] ?
            brandData[brandNameIdToId[nameId]] : 
            null;

        result.productIds = productScopeIds;
        result.productQuery = productScopeQuery;
        result.productBrand = productScopeBrandId;

        return result;
    }

    componentDidMount() {
        let logger = Logger.create("componentDidMount");
        logger.info("enter", this.getScopeData());

        this.scroller = new Scroller({
            onLoad: async (count) => {
                let logger = Logger.create("scroller.onLoad");
                logger.info("enter");

                let {productData} = this.props;
                let {brand,productIds,productBrand} = this.getScopeData();
                productIds = productIds || [];

                if(count===1
                && productIds.length 
                && productBrand == brand._id) {return;}

                let query = {
                    limit: 30,
                    brand: [brand._id],
                    hash: {
                        gt: count===1 ? 
                            "#" :
                            lodash.get(productData,`${lodash.last(productIds)}.hash`)
                    }
                };

                if(this.searchName) {
                    query.name.regex = this.searchName;
                }

                if(this.tags) {
                    query.tags = this.tags;
                }

                await this.loadProducts(query, {
                    concat: count!==1
                });
            },
            offset: 500
        });
    }

    componentWillUnmount() {
        this.scroller.destroy();
    }

    async loadProducts(query, {isSearch=false, concat=true}={}) {
        let {brand} = this.getScopeData(),
            logger = Logger.create("loadProducts");

        logger.info("enter", query);

        this.setState({
            searchLoading: isSearch,
            productsLoading: !isSearch
        });

        let mergedQuery = lodash.assign({}, query, {
            sort: {"hash": 1, "name": 1}
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
                        brand: brand._id
                    },
                    populate: {
                        paths: ["tags","profileImages","brand","brand.company"]
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
        let {brand,productIds,productBrand} = this.getScopeData();
        let {user,productData} = this.props;
        let {productsLoading, priceModalProduct} = this.state;
        let {isApprovedOwner,isAdmin} = Brand.utils.getOwner(user, brand);

        return productBrand == brand._id ? (
            <div>
                <div className={styles.buttonsContainer}>
                    {isAdmin||isApprovedOwner ? (
                        <Button to="/create/product" scale={0.8} textCase="lower">Adicionar</Button>
                    ) : null}
                </div>

                <Grid spots={4} noGap={true} bordered={true}>
                    {productIds ? (
                        productIds.map((productId) => {
                            let product = productData[productId];

                            return (
                                <Grid.Cell key={productId} span={1}>
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

                        this.setState({priceModalProduct: null});
                    }}
                />
            </div>
        ) : (
            <div>loading ...</div>
        );
    }
}

/** Export **/
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Component);
