import React from "react"
import {connect} from "react-redux"
import lodash from "lodash"
import classNames from "classnames"
//import config from "config";
import {LoggerFactory,Redux,Style} from "darch/src/utils"
import Label from "darch/src/label"
import Grid from "darch/src/grid"
import Form from "darch/src/form"
import Field from "darch/src/field"
import Spinner from "darch/src/spinner"
import i18n from "darch/src/i18n"
//import Tabs from "darch/src/tabs";
import {Product,List,Scroller,Api,Tracker} from "common"
import DetailBar from "../bar"
import styles from "./styles"

let Logger = new LoggerFactory("lists.detail.products")

/**
 * Redux map state to props function.
 *
 * @param {object} state
 * @param {object} ownProps
 */
function mapStateToProps(state) {
    return {
        fileData: state.file.data,
        productData: state.product.data,
        productScopeIds: lodash.get(state.product,"scope.listDetail.ids"),
        productScopeQuery: lodash.get(state.product,"scope.listDetail.query"),
        listData: state.list.data,
        listNameIdToId: state.list.nameIdToId,
        tagsDropdown: state.tag.dropdown,
        uid: state.user.uid,
        user: state.user.uid?state.user.data[state.user.uid]:null
    }
}

/**
 * Redux dispatch to props map.
 */
let mapDispatchToProps = {

}

/**
 * Main component class.
 */
class Component extends React.Component {
    /** React properties **/
    static displayName = "lists.detail.products";
    static defaultProps = {};
    static propTypes = {};

    state = {
        itemsMap: {},
        isSelectingProducts: false
    };

    getScopeData(props=this.props) {
        let result = {},
            {listData,listNameIdToId} = props,
            nameId = lodash.get(props, "match.params.id")

        result.list = listNameIdToId[nameId] ?
            listData[listNameIdToId[nameId]] :
            null

        return result
    }

    async componentDidMount() {
        let logger = Logger.create("componentDidMount")
        logger.info("enter")

        let {list} = this.getScopeData()
        
        // Ensure that list is populated with necessary data.
        if(list) {
            List.populator.populate([list], {
                paths: [
                    "items[].product",
                    "items[].product.mainProfileImage",
                    "items[].product.tags"
                ]
            })

            this.createItemsMap()
        }

        // Handlers
        window.addEventListener("resize", this.handleWindowResize)
        this.handleWindowResize()

        // Scroller
        this.scroller = new Scroller({
            /*isDisabled: () => {
                return !this.state.isSelectingProducts;
            },*/

            onLoad: async (count) => {
                let logger = Logger.create("scroller.onLoad")
                logger.info("enter")

                if(!this.state.isSelectingProducts){return Promise.resolve()}

                let {productData,productScopeIds} = this.props
                productScopeIds = productScopeIds || []

                if(count===1 && productScopeIds.length) {return}

                let query = {
                    limit: 30,
                    hash: {
                        gt: count===1 ?
                            "#" :
                            lodash.get(productData,`${lodash.last(productScopeIds)}.hash`)
                    }
                }

                if(this.searchName) {
                    query.name.regex = this.searchName
                }

                if(this.tags) {
                    query.tags = this.tags
                }

                await this.loadProducts(query)
            },
            offset: 500
        })
    }

    componentDidUpdate(prevProps, prevState) {
        let items = lodash.get(this.getScopeData().list, "items")
        let prevItems = lodash.get(this.getScopeData(prevProps).list, "items")
        let stateItems = lodash.get(this.state, "items")

        // Set items when list items has changed and is different of
        // what we already have in state.
        if(!lodash.isEqual(items, prevItems)
        && !lodash.isEqual(items, stateItems)) {
            this.createItemsMap()
        }

        // Go to selecting products
        if(!prevState.isSelectingProducts && this.state.isSelectingProducts) {
            this.scroller.load(0)

            if(!lodash.isEqual(this.selectingProductSearchName, this.searchName)) {
                this.onSearchFormSubmit({name: this.searchName})
            }

            console.log(["check tags equal", this.selectingProductsTags, this.tags])

            if(!lodash.isEqual(this.selectingProductsTags, this.tags)) {
                this.onSearchTagsChange(this.tags, {force: true})
            }
        }
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.handleWindowResize)
        this.scroller.destroy()
    }

    handleWindowResize() {
        let logger = Logger.create("handleWindowResize")

        let {screenSize} = this.state
        let currentScreenSize = Style.screenForWindowWidth(window.innerWidth)

        if(currentScreenSize != screenSize) {
            logger.info("enter", {screenSize, currentScreenSize})
            this.setState({screenSize: currentScreenSize})
        }
    }

    createItemsMap() {
        let productIdToItemIdx = {},
            {list} = this.getScopeData(),
            items = lodash.cloneDeep(list.items)

        for(let i = 0; i < items.length; i++) {
            productIdToItemIdx[items[i].product] = i
        }

        this.setState({
            items,
            productIdToItemIdx
        })
    }

    async loadProducts(query, {isSearch=false, concat=true}={}) {
        let {user} = this.props,
            logger = Logger.create("loadProducts")

        logger.info("enter", query)

        this.setState({
            searchLoading: isSearch,
            productsLoading: !isSearch
        })

        let mergedQuery = lodash.assign({}, query, {
            sort: {"hash": 1, "name": 1},
            stock: {gt: 0}
        })

        if(!user||user.roles.indexOf("admin") < 0) {
            mergedQuery.status = ["public"]
        }

        if(lodash.isEmpty(mergedQuery.name)){
            delete mergedQuery.name
        }

        if(!query || lodash.isEmpty(query.tags)) {
            delete mergedQuery.tags
        }

        // Retrieve products
        await Redux.dispatch(
            Product.actions.productFind(mergedQuery, {
                concat,
                scope: {id: "listDetail"},
                populate: {paths: ["tags","profileImages","brand","brand.company"]}
            })
        )

        /*try {
            
        }
        catch(error) {
            logger.error("action productFind error", error);
        }*/

        this.setState({
            searchLoading: false,
            productsLoading: false
        })
    }

    onSearchFormSubmit(data) {
        let {productData} = this.props,
            {isSelectingProducts,items} = this.state,
            logger = Logger.create("onSearchFormSubmit")

        logger.info("enter", data)

        if(isSelectingProducts) {
            let {productScopeQuery} = this.props
            let query = lodash.cloneDeep(productScopeQuery)
            query.limit = 30
            query.hash = {gt: "#"}

            logger.debug("new query", query)

            if(!lodash.isEmpty(data.name)) {
                query.name = data.name
                delete query.priority

                Tracker.track("product searched by name", {name: data.name, location: "list.detail"})
            }
            else {
                delete query.name
            }

            // Store last searched name.
            this.selectingProductSearchName = data.name

            // Load products
            this.loadProducts(query,{isSearch:true, concat: false})
        }

        this.searchName = data.name

        // Filter list products.
        if( (this.tags && this.tags.length) || !lodash.isEmpty(data.name)) {
            let filteredItems = lodash.filter(items, (item) => {
                let product = productData[item.product]

                if(product) {
                    if(!lodash.isEmpty(this.searchName)) {
                        let nameRegex = new RegExp(this.searchName, "g")
                        if(!nameRegex.test(product.name)) {return false}
                    }
                    
                    if(this.tags && this.tags.length) {
                        for(let tag of product.tags) {
                            if(this.tags.indexOf(tag) >= 0) {return true}
                        }
                    }
                    else {return true}
                }

                return false
            })

            this.setState({filteredItems})
        }
        else {
            this.setState({filteredItems: null})
        }
        /*if(!lodash.isEmpty(data.name)) {
            let nameRegex = new RegExp(data.name, "g");

            let filteredItems = lodash.filter(items, (item) => {
                let product = productData[item.product];
                return product && nameRegex.test(product.name);
            });

            this.setState({filteredItems});
        }
        else {
            this.setState({filteredItems: null});
        }*/
    }

    onSearchTagsChange(values, {loadTag=null,force=false} = {}) {
        let {productData} = this.props,
            {isSelectingProducts,items} = this.state,
            logger = Logger.create("onSearchTagsChange")

        logger.info("enter", values)

        if(force || !lodash.isEqual(values, this.state.selectedTags)) {
            logger.info("fetching new")

            this.setState({
                selectedTags: values,
                tags: loadTag ? [loadTag] : this.state.tags
            })

            // Let's increment findCount of new tags.
            let newTags = lodash.difference(values, this.state.selectedTags)

            logger.debug("new tags", newTags)

            for(let newTag of newTags) {
                Api.shared.tagIncFindCount(newTag)
            }

            // If selecting products, then fetch from server.
            if(isSelectingProducts) {
                let {productScopeQuery} = this.props
                let query = lodash.cloneDeep(productScopeQuery)
                query.limit = 30
                query.hash = {gt: "#"}

                this.selectingProductsTags = values

                if(values && values.length) {
                    query.tags = values

                    if(this.searchName) {
                        query.name = this.searchName
                    }
                    else {
                        delete query.name
                    }

                    // Send mixpanel event.
                    for(let tagValue of values) {
                        let tagOpt = lodash.find(this.state.tags, (tag) => {
                            return tag.value == tagValue
                        })

                        if(tagOpt) {
                            Tracker.track("product searched by tag", {name: tagOpt.label, location: "list.detail"})
                        }
                    }
                }
                else {
                    delete query.tags
                    this.tags = null
                }

                // Load products
                this.loadProducts(query,{isSearch:true, concat: false})
            }

            // Store tags for next
            this.tags = lodash.cloneDeep(values)

            // Filter list by hand.
            if((values && values.length)||!lodash.isEmpty(this.searchName)) {
                let filteredItems = lodash.filter(items, (item) => {
                    let product = productData[item.product]

                    if(product) {
                        if(!lodash.isEmpty(this.searchName)) {
                            let nameRegex = new RegExp(this.searchName, "g")
                            if(!nameRegex.test(product.name)) {return false}
                        }

                        if(values && values.length) {
                            for(let tag of product.tags) {
                                if(values.indexOf(tag) >= 0) {return true}
                            }
                        }
                        else {return true}
                    }

                    return false
                })

                this.setState({filteredItems})
            }
            else {
                this.setState({filteredItems: null})
            }
        }
    }

    async onIncProduct(product, inc) {
        let logger = Logger.create("onIncProduct")
        logger.info("enter", {product})

        let {list} = this.getScopeData()
        let {items,productIdToItemIdx} = this.state
        let item = productIdToItemIdx[product._id] >= 0 ?
            items[productIdToItemIdx[product._id]] : 
            null

        logger.debug("data", {productIdToItemIdx, items, item})

        if(item) {
            // Increment quantity
            item.quantity += inc

            // Just in case
            if(item.quantity < 0) {
                item.quantity = 0
            }
        }
        else if(inc >= 0) {
            items.push({
                product: product._id,
                quantity: inc
            })

            productIdToItemIdx[product._id] = items.length-1
        }

        // Update state right away
        this.setState({items,productIdToItemIdx})

        // Update list on the server
        try {
            await Redux.dispatch(
                List.actions.listUpdate(
                    list._id,
                    {items},
                    {preventToaster: true}
                )
            )

            logger.info("action listUpdate success")
        }
        catch(error) {
            logger.error("action listUpdate error", error)
        }
    }

    async onClearProduct(product) {
        let logger = Logger.create("onClearProduct")
        logger.info("enter", {product})

        let {list} = this.getScopeData()
        let {items,productIdToItemIdx} = this.state
        let itemIdx = productIdToItemIdx[product._id]

        logger.debug("data", {productIdToItemIdx, items, itemIdx})

        if(itemIdx >= 0) {
            items.splice(itemIdx, 1)

            // Regenerate productIdToItemIdx
            productIdToItemIdx = {}

            for(let i = 0; i < items.length; i++) {
                productIdToItemIdx[items[i].product] = i
            }

            // Update state right away
            this.setState({items,productIdToItemIdx})

            // Update list on the server
            try {
                await Redux.dispatch(
                    List.actions.listUpdate(
                        list._id,
                        {items},
                        {preventToaster: true}
                    )
                )

                logger.info("action listUpdate success")
            }
            catch(error) {
                logger.error("action listUpdate error", error)
            }
        }
    }

    onMoreProductsLabelClick() {

    }

    render() {
        let {list} = this.getScopeData()
        let {productData,productScopeIds,user,tagsDropdown} = this.props
        let {
            screenSize,searchLoading,selectedTags,
            items,productIdToItemIdx,isSelectingProducts,
            filteredItems
        } = this.state

        let isOwner = user && list && lodash.findIndex(list.owners, (owner) => {
            return owner.user == user._id
        }) >= 0

        filteredItems = filteredItems || items

        /*let items = [];

        let productsMap = lodash.reduce(products, (result, product) => {
            result[product._id] = product;
            return result;
        }, {});

        for(let item of list.items||[]) {
            if(lodash.isObject(item.product)){
                items.push(item);
            }
            else if(lodash.isObject(productsMap[item.product])) {
                items.push(Object.assign({}, item, {product: productsMap[item.product]}));
            }
        }*/

        //console.log(["processed items", items]);

        return (
            <div>
                <DetailBar list={list} />

                <div className={styles.searchContainer}>
                    <Grid noGap={true}>
                        <Grid.Cell span={1}>
                            <Grid noGap={false}>
                                <Grid.Cell span={2}>
                                    <div className={classNames([styles.fieldContainer,styles.searchFieldContainer])}>
                                        <Form loading={searchLoading}
                                            onSubmit={this.onSearchFormSubmit}>
                                            <Field.Text
                                                name="name"
                                                placeholder="_CATALOG_LIST_PAGE_SEARCH_NAME_FIELD_PLACEHOLDER_"
                                                scale={screenSize == "phone"?1:0.8}
                                                disabled={searchLoading}/>
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
                                            options={tagsDropdown}
                                            clearSearchOnSelect={true}
                                            creatable={false}
                                            multi={true}
                                            scale={screenSize == "phone"?1:0.8}
                                            disabled={searchLoading}
                                            loaderComponent={<Spinner.CircSide color="#555" />}/>
                                    </div>
                                </Grid.Cell>

                                <Grid.Cell>
                                    {searchLoading ? (
                                        <div className={classNames([styles.fieldContainer,styles.searchLoadingContainer])}>
                                            <Spinner.CircSide color="moody" />
                                        </div>
                                    ) : null}
                                </Grid.Cell>
                            </Grid>
                        </Grid.Cell>

                        <Grid.Cell>
                            <div className={classNames([styles.fieldContainer,styles.actionButtonsContainer])}>
                                {isOwner ? (
                                    <div className="field-gap">
                                        <Label scale={screenSize == "phone"?1:0.8} color={isSelectingProducts?"moody":"#eeeeee"} 
                                            onClick={() => {this.setState({isSelectingProducts: !isSelectingProducts})}}>
                                            <i18n.Translate text="_LIST_DETAIL_PRODUCTS_PAGE_MORE_PRODUCTS_LABEL_" />
                                        </Label>
                                    </div> 
                                ) : null}
                            </div>
                        </Grid.Cell>
                    </Grid>
                </div>
                
                <div className={styles.productsContainer}>
                    {!isSelectingProducts ? (
                        <Grid spots={4} noGap={true} bordered={true}>
                            {filteredItems && filteredItems.length ? (
                                filteredItems.map((item) => {
                                    let product = productData[item.product]

                                    return product && product.stock > 0 ? (
                                        <Grid.Cell key={product._id} span={1}>
                                            <Product.Card data={product} 
                                                quantity={item.quantity}
                                                canEditQuantity={isOwner}
                                                showBasketQuantity={false}
                                                onAdd={(product) => {this.onIncProduct(product, 1)}}
                                                onRemove={(product) => {this.onIncProduct(product, -1)}}
                                                onClear={this.onClearProduct}
                                            />
                                        </Grid.Cell>
                                    ) : <span key={item.product}></span>
                                })
                            ) : null}
                        </Grid>
                    ) : (
                        <Grid spots={4} noGap={true} bordered={true}>
                            {productScopeIds ? (
                                productScopeIds.map((productId) => {
                                    let product = productData[productId]
                                    let item = productIdToItemIdx[productId] >= 0 ?
                                        items[productIdToItemIdx[productId]] :
                                        {}

                                    console.log(["rapaz malucoooo", 
                                        product, 
                                        productIdToItemIdx,
                                        items,
                                        item
                                    ])

                                    return product && product.stock > 0 ? (
                                        <Grid.Cell key={product._id} span={1}>
                                            <Product.Card data={product}
                                                quantity={item.quantity}
                                                showBasketQuantity={false}
                                                onAdd={(product) => {this.onIncProduct(product, 1)}}
                                                onRemove={(product) => {this.onIncProduct(product, -1)}}
                                                onClear={this.onClearProduct}
                                                onTagClick={(tag) => {
                                                    let values = (this.state.selectedTags||[]).concat([tag._id])
                                                    let loadTag = {
                                                        value: tag._id,
                                                        label: tag.name
                                                    }

                                                    return this.onSearchTagsChange(values, {loadTag})
                                                }}
                                            />
                                        </Grid.Cell>
                                    ) : <span key={productId}></span>
                                })
                            ) : null}
                        </Grid>
                    )}
                </div>
            </div>
        )
    }
}

/** Export **/
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Component)
