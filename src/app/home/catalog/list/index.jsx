/* global mixpanel */

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
import Label from "darch/src/label";
import Text from "darch/src/text";
import Toaster from "darch/src/toaster";
import {Api,Product} from "common";
import styles from "./styles";
import Scroller from "./scroller";
import PriceModal from "../price_modal";

let Logger = new LoggerFactory("catalog.list", {level: "debug"});
let storage = new Storage();

/**
 * This function created a list from the basket data.
 */
function basketToList(basket) {
    let list = {
        items: []
    };

    for(let id of Object.keys(basket.items)) {
        list.items.push({
            product: id,
            count: basket.items[id].count
        });
    }

    return list;
}


/**
 * Redux map state to props function.
 *
 * @param {object} state
 * @param {object} ownProps
 */
function mapStateToProps(state) {
    return {
        user: lodash.get(state.user.profiles, state.user.uid),
        basket: state.basket,
        products: state.product.data,
        productsQuery: state.product.query
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

        let infoModalViewed = await storage.get("infoModalViewed");

        if(!infoModalViewed) {
            this.setState({infoModalOpen: true});
        }

        // Retrieve popular tags
        try {
            let response = await Api.shared.tagFind();

            // Process tags
            let tags = response.results.map((tag) => {
                return {value: tag._id, label: tag.name};
            });

            this.setState({tags});
        }
        catch(error) {
            logger.error("api tagFind error", error);
        }

        window.addEventListener("resize", this.handleWindowResize);
        this.handleWindowResize();

        this.scroller = new Scroller({
            onLoad: async (count) => {
                let {products} = this.props;
                products = products || [];

                let query = {
                    limit: count===1&&products.length?products.length:30,
                    name: {
                        gt: count===1 ? 
                            "#" :
                            products[products.length-1].name
                    }
                };

                if(products.length) {
                    query.priority = {
                        lte: products[products.length-1].priority
                    };
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
        let logger = Logger.create("loadProducts");
        logger.info("enter", query);

        this.setState({
            searchLoading: isSearch,
            productsLoading: !isSearch
        });

        let mergedQuery = lodash.assign({}, query, {
            sort: {"priority": -1, "name": 1},
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
                Product.actions.productFind(mergedQuery, {concat})
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
                return {value: tag._id, label: tag.name};
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

        let {productsQuery} = this.props;
        let query = lodash.cloneDeep(productsQuery);
        query.limit = 30;

        this.searchName = data.name;

        if(!lodash.isEmpty(data.name)) {
            query.name = data.name;
            delete query.priority;

            mixpanel.track("product searched by name", {name: data.name});
        }
        else {
            query.name = {gte: "#"};
        }

        this.loadProducts(query,{isSearch:true, concat: false});
    }

    onSearchTagsChange(values) {
        let logger = Logger.create("onSearchTagsChange");
        logger.info("enter", values);

        if(!lodash.isEqual(values, this.state.selectedTags)) {
            logger.info("fetching new");

            this.setState({selectedTags: values});

            let {productsQuery} = this.props;
            let query = lodash.cloneDeep(productsQuery);
            query.limit = 30;

            if(values && values.length) {
                query.tags = values;
                query.name = this.searchName || {gte: "#"};

                // Send mixpanel event.
                for(let tagValue of values) {
                    let tagOpt = lodash.find(this.state.tags, (tag) => {
                        return tag.value == tagValue;
                    });

                    if(tagOpt) {
                        mixpanel.track("product searched by tag", {name: tagOpt.label});
                    }
                }
            }
            else {delete query.tags;}

            this.loadProducts(query,{isSearch:true, concat: false});
        }
    }

    onProductChangePrice(product) {
        this.setState({priceModalProduct: product});
    }

    async onSaveListButtonClick() {
        let logger = Logger.create("onSaveListButtonClick"),
            {listId} = this.props.basket;

        logger.info("enter", {listId});

        if(listId) {
            let list = basketToList(this.props.basket);

            try {
                let response = await Api.shared.listUpdate(listId, list);

                logger.debug("api listUpdate success", response);

                Redux.dispatch(Toaster.actions.push("success", "_LIST_UPDATE_SUCCESS_TOAST_MESSAGE_"));
            }
            catch(error) {
                logger.error("api listUpdate error", error);
            }
        }
        else {
            this.setState({createListModalOpen: true});
        }
    }

    onCreateListModalDismiss() {
        this.setState({createListModalOpen: false});
    }

    async onCreateListSubmit(data) {
        let {items} = this.props.basket,
            newState = {createListModalLoading: false},
            logger = Logger.create("onCreateListSubmit");

        logger.info("enter", data);

        this.setState({createListModalLoading: true});

        // Build the list up
        let list = {
            name: data.name,
            items: []
        };

        for(let id of Object.keys(items)) {
            list.items.push({
                product: id,
                count: items[id].count
            });
        }

        try {
            let response = await Api.shared.listCreate(list);
            logger.info("api listCreate success", {response});

            // Set list as the loaded list.
            newState.loadedList = Object.assign(list, {"_id": response.result});
            newState.createListModalOpen = false;
        }
        catch(error) {
            logger.error("api listCreate error", error);
        }

        logger.debug("newState", newState);

        this.setState(newState);
    }

    render() {
        let {products,user} = this.props;
        let {listName} = this.props.basket;
        let {tags,loadingTags,selectedTags,filterOnlySelected,priceModalProduct,createListModalLoading,screenSize,searchLoading,productsLoading} = this.state;

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
                                                loadOptions={this.loadTags}
                                                loading={loadingTags}
                                                clearSearchOnSelect={true}
                                                creatable={false}
                                                multi={true}
                                                scale={screenSize == "phone"?1:0.8}
                                                disabled={this.state.searchLoading}
                                                loaderComponent={<Spinner.CircSide color="#555" />}/>
                                        </div>
                                    </Grid.Cell>

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
                                    {user && user.roles.indexOf("admin") >= 0 ? (
                                        <div className="field-gap"><Button to="/admin/create/product" scale={screenSize == "phone"?1:0.8} color="warning"><i18n.Translate text="_CATALOG_LIST_PAGE_CREATE_PRODUCT_BUTTON_LABEL_" /></Button></div>
                                    ) : null}
                                    
                                    {user ? <div className="field-gap"><Button scale={screenSize == "phone"?1:0.8} onClick={this.onSaveListButtonClick}><i18n.Translate text="_CATALOG_LIST_PAGE_SAVE_LIST_BUTTON_LABEL_" /></Button></div> : null}
                                </div>
                            </Grid.Cell>
                        </Grid>
                    </div>

                    <div className={styles.auxContainer}>
                        <Grid noGap={false}>
                            <Grid.Cell span={2}>
                                <div className={styles.filtersContainer}>
                                    {user ? (
                                        <div className="field-gap">
                                            <Label scale={0.8} color={filterOnlySelected?"moody":"#eeeeee"} onClick={() => {this.setState({filterOnlySelected: !filterOnlySelected});}}>
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
                    </div>

                    <Grid spots={10} noGap={true} bordered={true}>
                        {products ? (
                            /*Array(50).fill(products[0]).map((product, idx) => {
                                return (
                                    <Grid.Cell key={idx} span={2}>
                                        <Product.Card data={product} onChangePrice={this.onProductChangePrice} />
                                    </Grid.Cell>
                                );
                            })*/

                            products.map((product) => {
                                return (
                                    <Grid.Cell key={product._id} span={2}>
                                        <Product.Card data={product} onChangePrice={this.onProductChangePrice} />
                                    </Grid.Cell>
                                );
                            })
                        ) : null}
                    </Grid>

                    {productsLoading ? (
                        <div className={styles.loadingContainer}>
                            <Spinner.CircSide color="moody" scale={1.5} />
                        </div>
                    ) : null}
                </Container>

                <Modal open={this.state.createListModalOpen} onDismiss={this.onCreateListModalDismiss}>
                    <Modal.Header>
                        <h3 style={{margin: 0}}>
                            <i18n.Translate text="_CREATE_LIST_MODAL_TITLE_" />
                        </h3>
                    </Modal.Header>

                    <Form onSubmit={this.onCreateListSubmit} loading={createListModalLoading}>
                        <Modal.Body>
                            <Field.Section>
                                <Text scale={screenSize == "phone" ? 1 : 0.8}>
                                    <i18n.Translate text="_CREATE_LIST_MODAL_NAME_FIELD_LABEL_" />
                                </Text>
                                <div>
                                    <Field.Text name="name"
                                        placeholder="_CREATE_LIST_MODAL_NAME_FIELD_PLACEHOLDER_"
                                        validators="$required"/>
                                    <Field.Error for="name"
                                        validator="$required"
                                        message="_FIELD_ERROR_REQUIRED_"/>
                                </div>
                            </Field.Section>
                        </Modal.Body>

                        <Modal.Footer align="right">
                            <div className="field-gap">
                                <Button scale={1} color="danger" onClick={this.onCreateListModalDismiss}>
                                    <i18n.Translate text="_CANCEL_" />
                                </Button>
                            </div>

                            <div className="field-gap">
                                <Button type="submit"scale={1}
                                    loadingComponent={
                                        <span>
                                            <i18n.Translate text="_SAVING_" format="lower" />
                                            <span style={{marginLeft: "5px"}}>
                                                <Spinner.Bars color="#fff" />
                                            </span>
                                        </span>
                                    }>
                                    <i18n.Translate text="_SAVE_" />
                                </Button>
                            </div>
                        </Modal.Footer>
                    </Form>
                </Modal>

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

                <PriceModal open={!!priceModalProduct}
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

