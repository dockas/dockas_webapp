import React from "react";
import config from "config";
import lodash from "lodash";
import {LoggerFactory,Redux} from "darch/src/utils";
import Container from "darch/src/container";
import Grid from "darch/src/grid";
import i18n from "darch/src/i18n";
import Form from "darch/src/form";
import Field from "darch/src/field";
import Button from "darch/src/button";
import Spinner from "darch/src/spinner";
import Text from "darch/src/text";
import Uploader from "darch/src/uploader";
import styles from "./styles";
import {Api,Product} from "common";

let Logger = new LoggerFactory("create.product");

/**
 * Main component class.
 */
export default class Component extends React.Component {
    /** React properties **/
    static displayName = "create.product";
    static defaultProps = {};
    static propTypes = {};

    /** Instance properties */
    state = {};

    async componentDidMount() {
        let logger = Logger.create("componentDidMount");
        logger.info("enter");

        let authToken = await Api.shared.http.getAuthToken();
        this.setState({authToken});
    }

    /**
     * This function submits the create form.
     */
    async onFormSubmit(data) {
        let logger = Logger.create("onSubmit");
        logger.info("enter", data);
        //console.log("onFormSubmit", data);
        
        // Register data
        this.data = lodash.clone(data);

        // @TODO : There should be a number component that handles
        // conversion of string to number including localized decimal
        // separator symbol.
        this.data.price = parseFloat(this.data.price.replace(/,/g, "."));

        // Start uploading photo.
        this.flow.upload();
    }

    onFlowInit(flow) {
        let logger = Logger.create("onFlowInit");
        logger.info("enter");

        this.flow = flow;
    }

    onUploadSuccess(fileId) {
        let logger = Logger.create("onUploadSuccess");
        logger.info("enter", fileId);

        this.data.image = fileId;

        // @TODO : Save product price first.

        // Save product data.
        Redux.dispatch(
            Product.actions.productCreate(this.data)
        );
    }

    render() {
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
                                <Uploader token={this.state.authToken} targetUrl={`http://${config.hostnames.file}/upload`} 
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
                                            <i18n.Translate text="_CREATE_PRODUCT_PAGE_SUMMARY_FIELD_LABEL_" />
                                        </Text>
                                        <div>
                                            <Field.Text
                                                name="summary"
                                                placeholder="_CREATE_PRODUCT_PAGE_SUMMARY_FIELD_PLACEHOLDER_"
                                                scale={1}
                                                validators="$required"/>
                                            <Field.Error
                                                for="description"
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
                                                        <i18n.Translate text="_CREATE_PRODUCT_PAGE_PRICE_FIELD_LABEL_" />
                                                    </Text>
                                                    <div>
                                                        <Field.Number
                                                            name="price"
                                                            placeholder="_CREATE_PRODUCT_PAGE_PRICE_FIELD_PLACEHOLDER_"
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
            </div>
        );
    }
}
