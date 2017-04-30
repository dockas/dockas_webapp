/* global mixpanel */

import React from "react";
import lodash from "lodash";
import {LoggerFactory,Redux,Storage} from "darch/src/utils";
import {connect} from "react-redux";
import Container from "darch/src/container";
import Grid from "darch/src/grid";
import Modal from "darch/src/modal";
import i18n from "darch/src/i18n";
import Button from "darch/src/button";
import Form from "darch/src/form";
import Field from "darch/src/field";
import Spinner from "darch/src/spinner";
import {Api,Product} from "common";
import styles from "./styles";

let Logger = new LoggerFactory("catalog.list");
let storage = new Storage();

/**
 * Redux map state to props function.
 *
 * @param {object} state
 * @param {object} ownProps
 */
function mapStateToProps(state) {
    return {
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

        // Retrieve products
        this.loadProducts();

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
    }

    async loadProducts(query) {
        let logger = Logger.create("loadProducts");
        logger.info("enter", query);

        this.setState({searchLoading: true});

        let mergedQuery = lodash.assign({}, query, {
            populate: ["tags"]
        });

        if(lodash.isEmpty(mergedQuery.name)){
            delete mergedQuery.name;
        }

        if(!query || lodash.isEmpty(query.tags)) {
            delete mergedQuery.tags;
        }

        console.log([
            "mergedQuery", 
            this.props.productsQuery,
            query,
            mergedQuery
        ]);

        // Retrieve products
        try {
            await Redux.dispatch(
                Product.actions.productFind(mergedQuery)
            );
        }
        catch(error) {
            logger.error("product actions find error", error);
        }
        
        this.setState({searchLoading: false});
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

        let query = {tags: lodash.get(this.props,"productsQuery.tags")};

        if(!lodash.isEmpty(data.name)) {
            query.name = data.name;

            mixpanel.track("product searched by name", {name: data.name});
        }

        this.loadProducts(query);
    }

    onSearchTagsChange(values) {
        let logger = Logger.create("onSearchTagsChange");
        logger.info("enter", values);

        if(!lodash.isEqual(values, this.state.selectedTags)) {
            logger.info("fetching new");

            this.setState({selectedTags: values});

            let query = {name: lodash.get(this.props,"productsQuery.name")};

            if(values && values.length) {
                query.tags = values;

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

            this.loadProducts(query);
        }
    }

    render() {
        let {products} = this.props;
        let {tags,loadingTags,selectedTags} = this.state;

        return (
            <div className={styles.page}>
                <Container>
                    <div className={styles.searchContainer}>
                        <Grid noGap={false}>
                            <Grid.Cell>
                                <div className={styles.searchFieldContainer}>
                                    <Form loading={this.state.searchLoading}
                                        onSubmit={this.onSearchFormSubmit}>
                                        <Field.Text
                                            name="name"
                                            placeholder="_CATALOG_LIST_PAGE_SEARCH_NAME_FIELD_PLACEHOLDER_"
                                            scale={0.8}
                                            disabled={this.state.searchLoading}/>
                                    </Form>
                                </div>
                            </Grid.Cell>
                            <Grid.Cell span={2}>
                                <div className={styles.searchFieldContainer}>
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
                                        scale={0.8}
                                        disabled={this.state.searchLoading}
                                        loaderComponent={<Spinner.CircSide color="#555" />}/>
                                </div>
                            </Grid.Cell>
                            <Grid.Cell>
                                <div className={styles.searchFieldContainer}>
                                    {this.state.searchLoading ? (
                                        <Spinner.CircSide color="moody" />
                                    ) : null}
                                </div>

                                {/*<Button type="submit"
                                    loadingComponent={
                                        <span>
                                            <i18n.Translate text="_LOADING_" />
                                            <span className={styles.spinnerContainer}>
                                                <Spinner.Bars color="#fff" />
                                            </span>
                                        </span>
                                    }
                                    scale={0.8}>
                                    <i18n.Translate text="_CATALOG_LIST_PAGE_SEARCH_BUTTON_TEXT_" />
                                </Button>*/}
                            </Grid.Cell>
                            <Grid.Cell></Grid.Cell>
                            <Grid.Cell></Grid.Cell>
                        </Grid>
                    </div>

                    <Grid spots={10} noGap={true} bordered={true}>
                        {products ? (
                            products.map((product) => {
                                return (
                                    <Grid.Cell key={product._id} span={2}>
                                        <Product.Card data={product} />
                                    </Grid.Cell>
                                );
                            })
                        ) : (
                            <span>Loading ...</span>
                        )}
                    </Grid>
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
            </div>
        );
    }
}

/** Export **/
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Component);

