import React from "react";
import lodash from "lodash";
import config from "config";
import {connect} from "react-redux";
import Container from "darch/src/container";
import Grid from "darch/src/grid";
import Field from "darch/src/field";
import Form from "darch/src/form";
import Text from "darch/src/text";
import i18n from "darch/src/i18n";
import Button from "darch/src/button";
import Uploader from "darch/src/uploader";
import {LoggerFactory,Redux} from "darch/src/utils";
import {Api,Product,Basket,Badge} from "common";
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
    static displayName = "catalog.item";
    static defaultProps = {};
    static propTypes = {};

    state = {
        editing: {},
        saving: {}
    };

    async componentDidMount() {
        let logger = Logger.create("componentDidMount");
        logger.info("enter", {location: this.props});

        let newState = {initializing: false};
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
                let findResponse = await Api.shared.productFindByNameId(nameId, {
                    populate: ["images"]
                });
                
                product = findResponse.result;
            }
            catch(error) {
                logger.error("api productFindByNameId error", error);
            }
        }
        
        if(product) {
            // Process images
            let images = [];

            for(let image of product.images) {
                images.push({
                    id: image._id, 
                    url: `//${config.hostnames.file}/images/${image.path}`
                });
            }

            let mainImage = lodash.find(images, (image) => {
                return image.id == product.mainImage;
            });

            newState.product = product;
            newState.mainImage = mainImage;
            newState.images = images;
        } 

        this.setState(newState);
    }

    onSubmit(data, formName) {
        let logger = Logger.create("onSubmit");
        logger.info("enter", {data, formName});

        let changed = false;

        for(let key of Object.keys(data)) {
            if(this.state.product[key] != data[key]) {
                changed = true;
                break;
            }
        }

        if(changed) {logger.debug("changed");}

        let editingChanged = {};
        editingChanged[formName] = false;

        let newState = {
            editing: Object.assign(this.state.editing, editingChanged)
        };

        this.setState(newState);
    }

    onFlowInit(flow) {
        let logger = Logger.create("onFlowInit");
        logger.info("enter");

        this.flow = flow;
    }

    onUploadStart() {
        let logger = Logger.create("onUploadStart");
        logger.info("enter");
    }

    async onUploadSuccess(fileData, fid) {
        let logger = Logger.create("onUploadSuccess");
        logger.info("enter", {fileData, fid});

        // Update images
        let idx = lodash.findIndex(this.state.images, (image) => {
            return image.id = fid;
        });

        let newImages = this.state.images;

        if(idx >= 0 && newImages.length && idx < newImages.length) {
            newImages.splice(idx, 1, {
                id: fileData._id,
                url: `${config.hostnames.file}/images/${fileData.path}`
            });
        }

        this.setState({images: newImages});
    }

    async onUploadComplete() {
        let logger = Logger.create("onUploadComplete");

        logger.info("enter", this.data);

        this.updateProduct({
            images: this.state.images
        });
    }

    onUploaderImagesLoad(images) {
        console.log(["onUploaderImagesLoad", images]);

        let newState = {},
            currentImages = this.state.images || [];

        if((!currentImages || !currentImages.length) && images && images.length) {
            newState.mainImage = images[0];
        }

        newState.images = currentImages.concat(images);

        console.log(["onUploaderImagesLoad concated", newState.images]);

        this.setState(newState);
    }

    selectMainImage(image) {
        this.setState({mainImage: image});
    }

    async updateProduct(data) {
        let productResponse,
            productId = lodash.get(this.state, "product.id"),
            logger = Logger.create("onUploadComplete");

        logger.info("enter", data);

        // Update product.
        try {
            productResponse = await Redux.dispatch(Product.actions.productUpdate(productId, data));
            logger.debug("api productUpdate success", productResponse);
        }
        catch(error) {
            return logger.error("api productUpdate error", error);
        }
    }

    render() {
        let {uid,user} = this.props;
        let {initializing,product,editing,saving,images,mainImage} = this.state;
        let nameId = lodash.get(this.props, "params.id");
        
        let item = lodash.find(this.props.basket.items, (item) => {
            return item.product.nameId == nameId;
        });

        console.log(["product item", item, this.props.basket]);

        return (
            <div className={styles.page}>
                <div className={styles.banner}></div>

                <div className={styles.mainContent}>
                    <Container>
                        {product ? (
                            <Grid>
                                <Grid.Cell>
                                    <div className={styles.sidebarContainer}>
                                        {item ? <Badge className={styles.badge} count={item.count} borderWidth={8} /> : null}

                                        <div className={styles.mainImageContainer}>
                                            <Uploader token={this.state.authToken} targetUrl={`//${config.hostnames.api}/${config.apiVersion}/file/upload`}
                                                uploadOnSubmitted={true}
                                                onFlowInit={this.onFlowInit}
                                                onUploadSuccess={this.onUploadSuccess}
                                                onUploadComplete={this.onUploadComplete}
                                                onSelectMainImage={this.selectMainImage}
                                                mainImage={mainImage}
                                                onImagesLoad={this.onUploaderImagesLoad}
                                                images={images}
                                                showAddMoreButton={true}/>

                                            {/*mainImage ? (
                                                <div className={styles.mainImage} style={{
                                                    backgroundImage: `url(//${config.hostnames.file}/images/${mainImage.path})`,
                                                    backgroundSize: "cover",
                                                    backgroundPosition: "center"
                                                }}></div>
                                            ) : null*/}
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
                                    </div>
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
                                            <Form name="description" loading={saving.description} onSubmit={this.onSubmit}>
                                                <div>
                                                    <Text scale={0.8} color="moody">
                                                        <i18n.Translate text="_CATALOG_ITEM_PAGE_DESCRIPTION_FIELD_LABEL_" />
                                                    </Text>

                                                    {user && user.roles.indexOf("admin") >= 0 || product.owners.indexOf(uid) >= 0 ? (
                                                        !editing.description ? (
                                                            <span> • <a style={{fontSize: "0.8em"}} onClick={() => {this.setState({editing: Object.assign(editing, {description: true})});}}><i18n.Translate text="_CATALOG_ITEM_PAGE_EDIT_LABEL_" /></a></span>
                                                        ) : (
                                                            <span> • <Button textCase="lower" scale={0.8} type="submit" layout="link"><i18n.Translate text="_CATALOG_ITEM_PAGE_SAVE_LABEL_" /></Button></span>
                                                        )
                                                    ) : null}
                                                </div>

                                                <div>
                                                    {editing.description ? (
                                                            <Field.TextArea
                                                                name="description"
                                                                rows={2}
                                                                value={product.description}
                                                                name="description"
                                                                scale={1} />
                                                    ) : (
                                                        <Text scale={1}>{product.description}</Text>
                                                    )}
                                                </div>
                                            </Form>
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
            </div>
        );
    }
}

/** Export **/
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Component);
