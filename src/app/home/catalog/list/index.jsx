import React from "react";
import lodash from "lodash";
import classNames from "classnames";
import {LoggerFactory,Redux,Storage,Style} from "darch/src/utils";
import {connect} from "react-redux";
import Container from "darch/src/container";
import Grid from "darch/src/grid";
import Modal from "darch/src/modal";
import i18n from "darch/src/i18n";
import Button from "darch/src/button";
import Form from "darch/src/form";
import Field from "darch/src/field";
import Spinner from "darch/src/spinner";
//import Label from "darch/src/label";
//import Text from "darch/src/text";
//import Separator from "darch/src/separator";
//import Toaster from "darch/src/toaster";
import {Api,Product,Scroller,Tracker} from "common";
import styles from "./styles";

let Logger = new LoggerFactory("catalog.list", {level: "debug"});
let storage = new Storage();

/**
 * This function created a list from the basket data.
 */
/*function basketToList(basket) {
    let list = {
        items: []
    };

    for(let id of Object.keys(basket.items)) {
        list.items.push({
            product: id,
            quantity: basket.items[id].quantity
        });
    }

    return list;
}*/


/**
 * Redux map state to props function.
 *
 * @param {object} state
 * @param {object} ownProps
 */
function mapStateToProps(state) {
    return {
        user: lodash.get(state.user.data, state.user.uid),
        basket: state.basket,
        productData: state.product.data,
        productScopeIds: lodash.get(state.product,"scope.catalogList.ids"),
        productScopeQuery: lodash.get(state.product,"scope.catalogList.query"),
        lists: lodash.get(state.list, "scope.catalogList.data"),
        tags: lodash.get(state.tag, "scope.global.dropdown")
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
    static displayName = "catalog.list";
    static defaultProps = {};
    static propTypes = {};

    state = {
        selectedTags: null
    };

    async componentDidMount() {
        let logger = Logger.create("componentDidMount");
        logger.info("enter");

        /*let infoModalViewed = await storage.get("infoModalViewed");

        if(!infoModalViewed) {
            this.setState({infoModalOpen: true});
        }*/

        window.addEventListener("resize", this.handleWindowResize);
        this.handleWindowResize();

        this.scroller = new Scroller({
            onLoad: async (count) => {
                let logger = Logger.create("scroller.onLoad");
                logger.info("enter");

                let {productData,productScopeIds} = this.props;
                productScopeIds = productScopeIds || [];

                if(count===1 && productScopeIds.length) {return;}

                let query = {
                    limit: 30,
                    hash: {
                        gt: count===1 ?
                            "#" :
                            lodash.get(productData,`${lodash.last(productScopeIds)}.hash`)
                    }
                };

                if(this.searchName) {
                    query.name.regex = this.searchName;
                }

                if(this.tags) {
                    query.tags = this.tags;
                }

                await this.loadProducts(query);
            },
            offset: 500
        });
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.handleWindowResize);
        this.scroller.destroy();
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

    async loadProducts(query, {isSearch=false, concat=true}={}) {
        let {user} = this.props,
            logger = Logger.create("loadProducts");

        logger.info("enter", query);

        this.setState({
            searchLoading: isSearch,
            productsLoading: !isSearch
        });

        let mergedQuery = lodash.assign({}, query, {
            sort: {"hash": 1, "name": 1},
            stock: {gt: 0}
        });

        if(!user||user.roles.indexOf("admin") < 0) {
            mergedQuery.status = ["public"];
        }

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
                    scope: {id: "catalogList"},
                    populate: {paths: ["tags","profileImages","brand","brand.company"]}
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

    onInfoModalDismiss() {
        storage.set("infoModalViewed", "true");
        this.setState({infoModalOpen: false});
    }

    async loadTags(value) {
        let logger = Logger.create("loadTags");
        logger.info("enter", {value});

        if(lodash.isEmpty(value)) {return;}

        this.setState({loadingTags: true});

        try {
            let response = await Api.shared.tagFind({
                name: value
            });

            logger.debug("Api tagFind success", response);

            // Process tags
            let tags = response.results.map((tag) => {
                return {value: tag._id, label: tag.name, color: tag.color};
            });

            this.setState({tags, loadingTags: false});
        }
        catch(error) {
            logger.error("Api tagFind error", error);
            this.setState({loadingTags: false});
        }
    }

    onSearchFormSubmit(data) {
        let logger = Logger.create("onSearchFormSubmit");
        logger.info("enter", data);

        let {productScopeQuery} = this.props;
        let query = lodash.cloneDeep(productScopeQuery);
        query.limit = 30;
        query.hash = {gt: "#"};

        logger.debug("new query", query);

        this.searchName = data.name;

        if(!lodash.isEmpty(data.name)) {
            query.name = data.name;
            delete query.priority;

            Tracker.track("product searched by name", {name: data.name, location: "catalog.list"});
        }
        else {
            delete query.name;
        }

        this.loadProducts(query,{isSearch:true, concat: false});
    }

    onSearchTagsChange(values, {loadTag=null} = {}) {
        let logger = Logger.create("onSearchTagsChange");
        logger.info("enter", values);

        if(!lodash.isEqual(values, this.state.selectedTags)) {
            logger.info("fetching new");

            this.setState({
                selectedTags: values,
                tags: loadTag ? [loadTag] : this.state.tags
            });

            let {productScopeQuery} = this.props;
            let query = lodash.cloneDeep(productScopeQuery);
            query.limit = 30;
            query.hash = {gt: "#"};

            if(values && values.length) {
                this.tags = values;

                query.tags = values;

                if(this.searchName) {
                    query.name = this.searchName;
                }
                else {
                    delete query.name;
                }

                // Send tracker event.
                for(let tagValue of values) {
                    let tagOpt = lodash.find(this.state.tags, (tag) => {
                        return tag.value == tagValue;
                    });

                    if(tagOpt) {
                        Tracker.track("product searched by tag", {name: tagOpt.label, location: "catalog.list"});
                    }
                }
            }
            else {
                delete query.tags;
                this.tags = null;
            }

            // Let's increment findCount of new tags.
            let newTags = lodash.difference(values, this.state.selectedTags);

            logger.debug("new tags", newTags);

            for(let newTag of newTags) {
                Api.shared.tagIncFindCount(newTag);
            }

            // Load products
            return this.loadProducts(query,{isSearch:true, concat: false});
        }
    }

    async showOnlySelected() {
        let logger = Logger.create("showOnlySelected");
        logger.info("enter");

        let {filterOnlySelected} = this.state;
        let newState = {
            filterOnlySelected: !filterOnlySelected
        };

        if(filterOnlySelected) {
            newState.filteredProducts = null;
        }
        else {
            let {items} = this.props.basket;
            let products = [];

            for(let id of Object.keys(items)) {
                products.push(items[id].product);
            }

            newState.filteredProducts = products;
        }

        this.setState(newState);
    }

    onProductChangePrice(product) {
        this.setState({priceModalProduct: product});
    }

    render() {
        let {
            tags,productScopeIds,user,
            productData
        } = this.props;
        
        let {
            selectedTags,priceModalProduct,
            screenSize,productsLoading,
            filteredProductScopeIds
        } = this.state;

        productScopeIds = filteredProductScopeIds || productScopeIds;

        return (
            <div className={styles.page}>
                <Container>
                    <div className={styles.searchContainer}>
                        <Grid noGap={true}>
                            <Grid.Cell span={1}>
                                <Grid noGap={false}>
                                    <Grid.Cell span={2}>
                                        <div className={classNames([styles.fieldContainer,styles.searchFieldContainer])}>
                                            <Form loading={this.state.searchLoading}
                                                onSubmit={this.onSearchFormSubmit}>
                                                <Field.Text
                                                    name="name"
                                                    placeholder="_CATALOG_LIST_PAGE_SEARCH_NAME_FIELD_PLACEHOLDER_"
                                                    scale={screenSize == "phone"?1:0.8}
                                                    disabled={this.state.searchLoading}/>
                                            </Form>
                                        </div>
                                    </Grid.Cell>

                                    <Grid.Cell span={3}>
                                        <div className={classNames([styles.fieldContainer,styles.searchFieldContainer])}>
                                            <Field.Select
                                                name="tags"
                                                value={selectedTags}
                                                onChange={this.onSearchTagsChange}
                                                placeholder="_CATALOG_LIST_PAGE_SEARCH_TAGS_FIELD_PLACEHOLDER_"
                                                options={tags}
                                                clearSearchOnSelect={true}
                                                creatable={false}
                                                multi={true}
                                                scale={screenSize == "phone"?1:0.8}
                                                disabled={this.state.searchLoading}
                                                loaderComponent={<Spinner.CircSide color="#555" />}/>
                                        </div>
                                    </Grid.Cell>
                                    {/*<Grid.Cell span={1}>
                                        <Button scale={screenSize == "phone"?1:0.8} onClick={ ()=> {

                                        }}>
                                            pesquisar
                                        </Button>
                                    </Grid.Cell>*/}

                                    {/*this.state.searchLoading ? (
                                        <Grid.Cell>
                                            <div className={classNames([styles.fieldContainer,styles.searchLoadingContainer])}>
                                                <Spinner.CircSide color="moody" />
                                            </div>
                                        </Grid.Cell>
                                    ) : <span></span>*/}
                                </Grid>
                            </Grid.Cell>

                            <Grid.Cell>
                                <div className={classNames([styles.fieldContainer,styles.actionButtonsContainer])}>
                                    {/*user && user.roles.indexOf("admin") >= 0 ? (
                                        <div className="field-gap"><Button to="/admin/create/product" scale={screenSize == "phone"?1:0.8} color="warning"><i18n.Translate text="_CATALOG_LIST_PAGE_CREATE_PRODUCT_BUTTON_LABEL_" /></Button></div>
                                    ) : null*/}

                                    {user ? <div className="field-gap"><Button scale={screenSize == "phone"?1:0.8} to="/create/list"><i18n.Translate text="_CATALOG_LIST_PAGE_CREATE_LIST_BUTTON_LABEL_" /></Button></div> : null}
                                </div>
                            </Grid.Cell>
                        </Grid>
                    </div>

                    {/*<div className={styles.auxContainer}>
                        <Grid noGap={false}>
                            <Grid.Cell span={2}>
                                <div className={styles.filtersContainer}>
                                    {user ? (
                                        <div className="field-gap">
                                            <Label scale={0.8} color={filterOnlySelected?"moody":"#eeeeee"} onClick={this.showOnlySelected}>
                                                <i18n.Translate text="_CATALOG_LIST_PAGE_FILTER_ONLY_SELECTED_" />
                                            </Label>
                                        </div>
                                    ) : null}

                                    {searchLoading ? (
                                        <div className={classNames(["field-gap",styles.fieldContainer,styles.searchLoadingContainer])}>
                                            <Spinner.CircSide color="moody" />
                                        </div>
                                    ) : null}
                                </div>
                            </Grid.Cell>

                            <Grid.Cell>
                                {listName ? (
                                    <div className={styles.listNameContainer}>
                                        <Label layout="outline" color="moody" scale={0.8}>{listName}</Label>
                                    </div>
                                ) : null}
                            </Grid.Cell>
                        </Grid>
                    </div>*/}

                    {/*lists && lists.length ? (
                        <div className={styles.listCarouselContainer}>
                            <List.Carousel lists={lists} />
                        </div>
                    ) : null*/}

                    <div className={styles.productsContainer}>
                        {/*<div style={{marginBottom: "30px"}}>
                            <Separator.Line lineStyle="dashed" lineColor="#dddddd">
                                <Separator.Info align="left">
                                    <Text scale={0.8} color="#bbbbbb">produtos</Text>
                                </Separator.Info>
                            </Separator.Line>
                        </div>*/}
                        
                        <Grid spots={10} noGap={true} bordered={true}>
                            {productScopeIds ? (
                                productScopeIds.map((productId) => {
                                    let product = productData[productId];

                                    return product.stock > 0 ? (
                                        <Grid.Cell key={product._id} span={2}>
                                            <Product.Card data={product}
                                                onChangePrice={this.onProductChangePrice}
                                                onTagClick={(tag) => {
                                                    let values = (this.state.selectedTags||[]).concat([tag._id]);
                                                    let loadTag = {
                                                        value: tag._id,
                                                        label: tag.name
                                                    };

                                                    return this.onSearchTagsChange(values, {loadTag});
                                                }}
                                            />
                                        </Grid.Cell>
                                    ) : <span key={product._id}></span>;
                                })
                            ) : null}
                        </Grid>

                        {productsLoading ? (
                            <div className={styles.loadingContainer}>
                                <Spinner.CircSide color="moody" scale={1.5} />
                            </div>
                        ) : null}
                    </div>
                </Container>

                <Modal open={this.state.infoModalOpen}>
                    <Modal.Header>
                        <h3 style={{margin: 0}}>
                            <i18n.Translate text="_INFO_MODAL_TITLE_" />
                        </h3>
                    </Modal.Header>

                    <Modal.Body>
                        <i18n.Translate text="_INFO_MODAL_BODY_" />
                    </Modal.Body>

                    <Modal.Footer align="right">
                        <Button type="submit"
                            scale={1} onClick={this.onInfoModalDismiss}>
                            <i18n.Translate text="_OK_" />
                        </Button>
                    </Modal.Footer>
                </Modal>

                <Product.PriceModal open={!!priceModalProduct}
                    product={priceModalProduct}
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

/** Export **/
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Component);
