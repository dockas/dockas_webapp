import React from "react";
import config from "config";
import lodash from "lodash";
import classNames from "classnames";
import {withRouter} from "react-router";
import {connect} from "react-redux";
import {LoggerFactory,Redux} from "darch/src/utils";
import Container from "darch/src/container";
import Grid from "darch/src/grid";
import i18n from "darch/src/i18n";
import Form from "darch/src/form";
import Field from "darch/src/field";
import Button from "darch/src/button";
import Spinner from "darch/src/spinner";
import Text from "darch/src/text";
import Modal from "darch/src/modal";
import Uploader from "darch/src/uploader";
import Toaster from "darch/src/toaster";
import NumberUtils from "darch/src/field/number/utils";
import styles from "./styles";
import {Api,Product} from "common";

let Logger = new LoggerFactory("create.product");

/**
 * Redux map state to props function.
 *
 * @param {object} state
 * @param {object} ownProps
 */
function mapStateToProps(state) {
    return {
        spec: state.i18n.spec
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
    static displayName = "create.product";
    static defaultProps = {};
    static propTypes = {};

    /** Instance properties */
    state = {};
    tagsToCreate = [];

    tagColors = [
        "#446CB3",
        "#52B3D9",
        "#22313F",
        "#EC644B",
        "#96281B",
        "#674172",
        "#336E7B",
        "#3A539B",
        "#26A65B",
        "#F7CA18",
        "#D35400",
        "#6C7A89"
    ];

    async componentDidMount() {
        let logger = Logger.create("componentDidMount");
        logger.info("enter");

        let authToken = await Api.shared.http.getAuthToken();
        this.setState({authToken});
    }

    /**
     * This function submits the create form.
     */
    onFormSubmit(data) {
        let logger = Logger.create("onSubmit");
        logger.info("enter", data);
        //console.log("onFormSubmit", data);

        // Register data
        this.data = lodash.clone(data);

        // Bug with NumberFormat
        // https://github.com/s-yadav/react-number-format/issues/45
        this.data.priceValue = NumberUtils.parseViewToModel(this.props.spec, this.data.priceValue);

        // Start uploading photo.
        this.flow.upload();
    }

    onFlowInit(flow) {
        let logger = Logger.create("onFlowInit");
        logger.info("enter");

        this.flow = flow;
    }

    async onUploadSuccess(fileId) {
        let productResponse,
            logger = Logger.create("onUploadSuccess");

        logger.info("enter", fileId);

        this.data.image = fileId;

        // Handle creation of new tags.
        /*let promises = [];

        let tagsToCreateMap = lodash.reduce(this.data.tags, (map, tag, idx) => {
            logger.debug("tagsToCreateMap reduce", {map,tag,idx});

            let idx2 = this.tagsToCreate.indexOf(tag);
            if(idx2 >= 0) {map[tag] = idx;}
            return map;
        }, {});

        logger.debug("tagsToCreateMap", {tagsToCreateMap});

        if(lodash.size(tagsToCreateMap)) {

            lodash.forOwn(tagsToCreateMap, (val, name) => {
                promises.push(
                    Api.shared.tagCreate({name}).then((response) => {
                        return {name, id: response.result};
                    })
                );
            });

            try {
                let tags = await Promise.all(promises);
                logger.debug("api tagCreate all success", tags);

                // Replace tags by it's ids.
                tags.forEach((tag) => {
                    logger.debug("tagsToCreateMap replace by id", {tag});

                    this.data.tags[tagsToCreateMap[tag.name]] = tag.id;
                });
            }
            catch(error) {
                return logger.error("api tagCreate all error", error);
            }
        }*/

        // Save product.
        try {
            productResponse = await Redux.dispatch(Product.actions.productCreate(this.data));

            console.log("productResponse", productResponse);
        }
        catch(error) {
            return logger.error("api productCreate error", error);
        }

        // Create the price.
        try {
            await Api.shared.priceCreate({
                value: this.data.priceValue,
                product: productResponse.action.payload
            });
        }
        catch(error) {
            return logger.error("api priceCreate error", error);
        }

        // Everithing is done... go to admin
        this.props.router.replace("/admin");
    }

    /**
     * This function load tags.
     */
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


    /**
     * This function open the add tag modal.
     */
    openNewTagModal() {
        let logger = Logger.create("openAddTagModal");
        logger.info("enter");

        let min = 0, max = this.tagColors.length-1;
        let randomIdx = Math.floor(Math.random() * (max - min)) + min;
        let randomColor = this.tagColors[randomIdx];

        console.log(["RANDOM COLOR", min, max, randomIdx, randomColor]);

        this.setState({
            newTagModalOpen: true,
            selectedTagColor: randomColor
        });
    }

    /**
     * This function handle tag creation.
     */
    onCreateTag(value) {
        let logger = Logger.create("onCreateTag");
        logger.info("enter", {value});

        this.tagsToCreate.push(value);

        return {value, label: value};
    }

    selectTagColor(color) {
        return () => {
            this.setState({selectedTagColor: color});
        };
    }

    async onTagFormSubmit(data) {
        data.color = this.state.selectedTagColor;

        await Api.shared.tagCreate(data);

        this.setState({
            newTagModalLoading: false, 
            newTagModalOpen: false
        });

        Redux.dispatch(
            Toaster.actions.push("success", "_TAG_CREATE_SUCCESS_")
        );
    }

    render() {
        let {tags,loadingTags,newTagModalOpen} = this.state;

        console.log("STATETAO", this.state);

        return (
            <div className={styles.page}>
                <Container size="md">
                    <h3 className="headline"><i18n.Translate text="_CREATE_PRODUCT_PAGE_TITLE_" /></h3>

                    {/*<Button type="submit"
                        scale={1}
                        color="danger"
                        onClick={() => {
                            this.flow.upload();
                        }}>
                        Test
                    </Button>*/}

                    <Grid>
                        <Grid.Cell>
                            {this.state.authToken ? (
                                <Uploader token={this.state.authToken} targetUrl={`//${config.hostnames.file}/upload`} 
                                    onFlowInit={this.onFlowInit}
                                    onUploadSuccess={this.onUploadSuccess}/>
                            ) : null}

                            {/*<div className={styles.image}>
                                <img src="http://placehold.it/300x300/f1f1f1?text=image" />
                            </div>*/}
                        </Grid.Cell>
                        <Grid.Cell span={4}>
                            <div className={styles.formContainer}>
                                <Form loading={this.state.loading}
                                    onSubmit={this.onFormSubmit}>

                                    <Field.Section>
                                        <Text scale={0.8}>
                                            <i18n.Translate text="_CREATE_PRODUCT_PAGE_NAME_FIELD_LABEL_" />
                                        </Text>
                                        <div>
                                            <Field.Text
                                                name="name"
                                                placeholder="_CREATE_PRODUCT_PAGE_NAME_FIELD_PLACEHOLDER_"
                                                scale={1}
                                                validators="$required"/>
                                            <Field.Error
                                                for="name"
                                                validator="$required"
                                                message="_FIELD_ERROR_REQUIRED_"/>
                                        </div>
                                    </Field.Section>

                                    <Field.Section>
                                        <Text scale={0.8}>
                                            <i18n.Translate text="_CREATE_PRODUCT_PAGE_DESCRIPTION_FIELD_LABEL_" />
                                        </Text>
                                        <div>
                                            <Field.Text
                                                name="description"
                                                placeholder="_CREATE_PRODUCT_PAGE_DESCRIPTION_FIELD_PLACEHOLDER_"
                                                scale={1}
                                                validators="$required"/>
                                            <Field.Error
                                                for="description"
                                                validator="$required"
                                                message="_FIELD_ERROR_REQUIRED_"/>
                                        </div>
                                    </Field.Section>

                                    <Field.Section>
                                        <Grid>
                                            <Grid.Cell>
                                                <Field.Section>
                                                    <Text scale={0.8}>
                                                        <i18n.Translate text="_CREATE_PRODUCT_PAGE_PRICE_VALUE_FIELD_LABEL_" />
                                                    </Text>
                                                    <div>
                                                        <Field.Number
                                                            name="priceValue"
                                                            placeholder="_CREATE_PRODUCT_PAGE_PRICE_VALUE_FIELD_PLACEHOLDER_"
                                                            scale={1}
                                                            validators="$required"/>
                                                    </div>
                                                </Field.Section>
                                            </Grid.Cell>

                                            <Grid.Cell>
                                                <Field.Section>
                                                    <Text scale={0.8}>
                                                        <i18n.Translate text="_CREATE_PRODUCT_PAGE_STOCK_FIELD_LABEL_" />
                                                    </Text>
                                                    <div>
                                                        <Field.Text
                                                            name="stock"
                                                            placeholder="_CREATE_PRODUCT_PAGE_STOCK_FIELD_PLACEHOLDER_"
                                                            scale={1}/>
                                                    </div>
                                                </Field.Section>
                                            </Grid.Cell>
                                        </Grid>
                                    </Field.Section>

                                    <Field.Section>
                                        <Text width="100%" scale={0.8}>
                                            <i18n.Translate text="_CREATE_PRODUCT_PAGE_TAGS_FIELD_LABEL_" />

                                            <a onClick={this.openNewTagModal} style={{float: "right", cursor: "pointer"}}>Adicionar</a>
                                        </Text>
                                        <div>
                                            <Field.Select
                                                name="tags"
                                                placeholder="_CREATE_PRODUCT_PAGE_TAGS_FIELD_PLACEHOLDER_"
                                                options={tags}
                                                loadOptions={this.loadTags}
                                                loading={loadingTags}
                                                onCreateOption={this.onCreateTag}
                                                clearSearchOnSelect={true}
                                                creatable={false}
                                                multi={true}
                                                scale={1}
                                                loaderComponent={<Spinner.CircSide color="#555" />}
                                                validators="$required"/>
                                            <Field.Error
                                                for="tags"
                                                validator="$required"
                                                message="_FIELD_ERROR_REQUIRED_"/>
                                        </div>
                                    </Field.Section>

                                    <Field.Section>
                                        <div className={styles.buttonContainer}>
                                            <Button type="submit"
                                                loadingComponent={
                                                    <span>
                                                        <i18n.Translate text="_LOADING_" />
                                                        <span className={styles.spinnerContainer}>
                                                            <Spinner.Bars color="#fff" />
                                                        </span>
                                                    </span>
                                                }
                                                scale={1}>
                                                <i18n.Translate text="_CREATE_PRODUCT_PAGE_SUBMIT_BUTTON_TEXT_" />
                                            </Button>
                                        </div>
                                    </Field.Section>
                                </Form>
                            </div>
                        </Grid.Cell>
                    </Grid>
                </Container>

                <Modal open={newTagModalOpen} onDismiss={() => {
                    this.setState({newTagModalOpen: false});
                }}>
                    <Modal.Header>
                        <h3 style={{margin: 0}}>
                            <i18n.Translate text="_NEW_TAG_MODAL_TITLE_" />
                        </h3>
                    </Modal.Header>

                    <Form loading={this.state.newTagModalLoading}
                        onSubmit={this.onTagFormSubmit}>
                        
                        <Modal.Body>
                            <Field.Section>
                                <Text scale={0.8}>
                                    <i18n.Translate text="_NEW_TAG_MODAL_NAME_FIELD_LABEL_" />
                                </Text>
                                <div>
                                    <Field.Text
                                        name="name"
                                        placeholder="_NEW_TAG_MODAL_NAME_FIELD_PLACEHOLDER_"
                                        scale={1}
                                        validators="$required"/>
                                    <Field.Error
                                        for="name"
                                        validator="$required"
                                        message="_FIELD_ERROR_REQUIRED_"/>
                                </div>
                            </Field.Section>

                            <Field.Section>
                                <Grid>
                                    {/*<Grid.Cell>
                                        <Field.Section>
                                            <Text scale={0.8}>
                                                <i18n.Translate text="_NEW_TAG_MODAL_TEXTCOLOR_FIELD_LABEL_" />
                                            </Text>
                                            <div>
                                                <Field.Text
                                                    name="textColor"
                                                    placeholder="_NEW_TAG_MODAL_TEXTCOLOR_FIELD_PLACEHOLDER_"
                                                    scale={1}
                                                    validators="$required|$color"/>
                                                <Field.Error
                                                    for="textColor"
                                                    validator="$required"
                                                    message="_FIELD_ERROR_REQUIRED_"/>
                                                <Field.Error
                                                    for="textColor"
                                                    validator="$color"
                                                    message="_FIELD_ERROR_COLOR_"/>
                                            </div>
                                        </Field.Section>
                                    </Grid.Cell>*/}
                                    <Grid.Cell>
                                        <Field.Section>
                                            <Text scale={0.8}>
                                                <i18n.Translate text="_NEW_TAG_MODAL_BACKGROUNDCOLOR_FIELD_LABEL_" /> (<span>{this.state.selectedTagColor}</span>)
                                            </Text>
                                            <div>
                                                {this.tagColors.map((color) => {
                                                    console.log(["SELECTED COLOR", color, this.state.selectedTagColor]);
                                                    return (<a key={color} onClick={this.selectTagColor(color)} className={classNames([styles.colorBox, (this.state.selectedTagColor == color ? styles.colorBoxActive : "")])} style={{backgroundColor: color}}></a>);
                                                })}
                                            </div>
                                        </Field.Section>
                                    </Grid.Cell>

                                    {/*<Grid.Cell>
                                        <Field.Section>
                                            <Text scale={0.8}>
                                                <i18n.Translate text="_NEW_TAG_MODAL_PREVIEW_FIELD_LABEL_" />
                                            </Text>

                                            <div>
                                                <div className={styles.label} style={{
                                                    backgroundColor: `#${this.state.labelBackgroundColor}`,
                                                    color: Style.brightness(this.state.labelBackgroundColor) > 40 ? "#ffffff" : "#000000"
                                                }}>test</div>
                                            </div>
                                        </Field.Section>
                                    </Grid.Cell>*/}
                                </Grid>
                            </Field.Section>
                        </Modal.Body>

                        <Modal.Footer align="right">
                            <Button type="submit"
                                loadingComponent={
                                    <span>
                                        <i18n.Translate text="_SAVING_" format="lower" />
                                        <span className={styles.spinnerContainer}>
                                            <Spinner.Bars color="#fff" />
                                        </span>
                                    </span>
                                }
                                scale={1}>
                                <i18n.Translate text="_SAVE_" format="lower" />
                            </Button>
                        </Modal.Footer>
                    </Form>
                </Modal>
            </div>
        );
    }
}

export default withRouter(connect(
    mapStateToProps,
    mapDispatchToProps
)(Component));
