import React from "react";
import lodash from "lodash";
import config from "config";
import {connect} from "react-redux";
import Container from "darch/src/container";
import Grid from "darch/src/grid";
import Text from "darch/src/text";
import i18n from "darch/src/i18n";
import Button from "darch/src/button";
import Uploader from "darch/src/uploader";
import Label from "darch/src/label";
import Spinner from "darch/src/spinner";
import Tabs from "darch/src/tabs";
//import Dropdown from "darch/src/dropdown";
import {LoggerFactory,Redux,Style} from "darch/src/utils";
import {Api,Product,Basket,Badge,Brand,File} from "common";
import placeholderImg from "assets/images/placeholder.png";
import styles from "./styles";

let Logger = new LoggerFactory("catalog.item.page");

/**
 * Redux map state to props function.
 *
 * @param {object} state
 * @param {object} ownProps
 */
function mapStateToProps(state) {
    return {
        productData: state.product.data,
        fileData: state.file.data,
        productNameIdToId: state.product.nameIdToId,
        basket: state.basket,
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
    static displayName = "catalog.item.page";
    static defaultProps = {};
    static propTypes = {};

    state = {
        editing: {},
        saving: {}
    };

    uploadedFiles = {};

    getProduct(props=this.props) {
        let {productData,productNameIdToId} = props;
        let nameId = lodash.get(props, "params.id");
        
        return productNameIdToId[nameId]?
            productData[productNameIdToId[nameId]] :
            null;
    }

    async componentDidMount() {
        let logger = Logger.create("componentDidMount");
        logger.info("enter", {params: this.props.params});

        let newState = {initializing: false};
        let nameId = lodash.get(this.props, "params.id");
        let product = this.getProduct();

        // If record was not fetched yet, then get it 
        // directly from the server.
        if(!product) {
            this.setState({initializing: true});

            logger.debug("product not fetched yet");

            try {
                await Redux.dispatch(
                    Product.actions.productFindByNameId(nameId, {
                        populate: {paths: ["profileImages","tags","brand","brand.company"]}
                    })
                );
            }
            catch(error) {
                logger.error("api productFindByNameId error", error);
            }
        }
        // Let's ensure that fetched product is populated with necessary data.
        else {
            Product.populator.populate(
                [product], 
                {paths:["profileImages","tags","brand","brand.company"]}
            );
        }
        
        // Auth token for upload profile images.
        try {
            newState.authToken = await Api.shared.http.getAuthToken();
            logger.info("api http getAuthToken success", newState.authToken);
        }
        catch(error) {
            logger.error("api http getAuthToken error", error);
        }

        // Update state
        this.setState(newState);

        // Window resize
        window.addEventListener("resize", this.handleWindowResize);
        this.handleWindowResize();
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.handleWindowResize);
    }

    processProfileImages() {
        let profileImages = [],
            {fileData} = this.props,
            {uploaderImages} = this.state,
            product = this.getProduct(),
            logger = Logger.create("processProfileImages");

        logger.info("enter", {product, files: Object.keys(fileData)});

        if(product) {
            for(let imageId of product.profileImages) {
                logger.debug("processing product profile image", {imageId});

                if(!fileData[imageId]){
                    logger.debug("image not available in store");
                    continue;
                }

                profileImages.push({
                    _id: fileData[imageId]._id,
                    url: `//${config.hostnames.file}/images/${fileData[imageId].path}`
                });
            }

            logger.debug("product profileImages", {profileImages});

            // Add uploader loaded images.
            for(let image of uploaderImages||[]) {
                profileImages.push({
                    type: "localImage",
                    _id: image._id,
                    url: image.url
                });
            }

            logger.debug("product full profileImages", {profileImages});
        }

        return profileImages;
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

    onSubmit(data, formName) {
        let product = this.getProduct(),
            logger = Logger.create("onSubmit");

        logger.info("enter", {data, formName});

        if(!product) {return;}

        let changed = false;

        for(let key of Object.keys(data)) {
            if(product[key] != data[key]) {
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

    onUploaderInit(flow) {
        let logger = Logger.create("onUploaderInit");
        logger.info("enter");

        this.flow = flow;
    }

    onUploaderImagesLoad(images) {
        this.setState({
            uploaderImages: lodash.cloneDeep(images)
        }, () => {
            this.flow.upload();
        });
    }

    onUploadStart() {
        let logger = Logger.create("onUploadStart");
        logger.info("enter");
    }

    async onFileUploadSuccess(file, fid) {
        let logger = Logger.create("onFileUploadSuccess");
        logger.info("enter", {file, fid});

        this.uploadedFiles[fid] = file;

        try {
            Redux.dispatch(
                File.actions.fileAdd(file)
            );
        }
        catch(error) {
            logger.error("file action fileAdd error", error);
        }
    }

    async onUploadComplete() {
        let {uploaderImages} = this.state,
            product = this.getProduct(),
            fileIds = lodash.get(product, "profileImages")||[],
            logger = Logger.create("onUploadComplete");

        logger.info("enter", {
            uploaderImages: lodash.map(uploaderImages, "_id"),
            uploadedFiles: this.uploadedFiles,
            fileIds
        });

        // Process uploaderImages
        for(let image of uploaderImages) {
            logger.debug(`processing image ${image._id}`, {
                file: this.uploadedFiles[image._id]
            });

            if(!this.uploadedFiles[image._id]){
                logger.debug("no uploaded file for image");
                continue;
            }

            fileIds.push(lodash.get(this.uploadedFiles,`${image._id}._id`));
        }

        logger.debug("fileIds", {fileIds});

        try {
            await this.updateProduct({profileImages: fileIds});
        }
        catch(error) {
            return logger.error("updateProduct error", error);
        }

        // Clear uploadedFiles
        this.uploadedFiles = {};

        // Clear uploaderImages.
        this.setState({uploaderImages: []});
    }

    selectMainProfileImage(image) {
        this.updateProduct({
            mainProfileImage: image._id,
        });
    }

    async updateProduct(data) {
        let response,
            product = this.getProduct(),
            logger = Logger.create("updateProduct");

        if(!product){return;}

        logger.info("enter", {data});

        // Update product.
        try {
            response = await Redux.dispatch(
                Product.actions.productUpdate(product._id, data)
            );
            logger.debug("api productUpdate success", response);
        }
        catch(error) {
            return logger.error("api productUpdate error", error);
        }
    }

    async onApproveButtonClick() {
        let product = this.getProduct(),
            logger = Logger.create("onApproveButtonClick");
        
        if(!product){return;}

        logger.info("enter");

        this.setState({approving: true});

        // Let's approve the product (make it public).
        try {
            let response = await Redux.dispatch(
                Product.actions.productStatusUpdate(product._id, "public")
            );
            logger.debug("api productStatusUpdate success", response);
        }
        catch(error) {
            logger.error("api productStatusUpdate error", error);
        }

        this.setState({approving: false});
    }

    render() {
        let {uid,user,productData} = this.props;
        let product = this.getProduct();
        let profileImages = this.processProfileImages();
        let {items} = this.props.basket;
        let {initializing,screenSize,isPriceModalOpen} = this.state;
        let nameId = lodash.get(this.props, "params.id");
        let {isApprovedOwner,isAdmin} = Brand.utils.getOwner(user, lodash.get(product,"brand"));

        let item = lodash.find(items, (item) => {
            return lodash.get(productData, `${item.product}.nameId`) == nameId;
        });

        let mainProfileImage = lodash.find(profileImages, (image) => {
            return lodash.get(product, "mainProfileImage") == image._id;
        });


        //console.log(["zacumba lele", isApprovedOwner, isAdmin]);

        return (
            <div className={styles.page}>
                <div className={styles.mainContent}>
                    <Container>
                        {product ? (
                            screenSize != "phone" ? (
                                <Grid>
                                    <Grid.Cell>
                                        <div className={styles.sidebarContainer}>
                                            {item && product.stock > 0 ? <Badge className={styles.badge} count={item.quantity} borderWidth={8} /> : null}

                                            <div className={styles.mainImageContainer}>
                                                <Uploader.Main authToken={this.state.authToken} targetUrl={`//${config.hostnames.api}/${config.apiVersion}/file/upload`}
                                                    uploadOnSubmitted={true}
                                                    onInit={this.onUploaderInit}
                                                    onFileUploadSuccess={this.onFileUploadSuccess}
                                                    onUploadComplete={this.onUploadComplete}
                                                    onSelectMainImage={this.selectMainProfileImage}
                                                    mainImage={mainProfileImage}
                                                    onImagesLoad={this.onUploaderImagesLoad}
                                                    images={profileImages}
                                                    defaulImageUrl={placeholderImg}
                                                    showAddMoreButton={true}
                                                    showSelectMainProfileImageButton={isAdmin||isApprovedOwner}
                                                    borderColor="white"
                                                    borderWidth="7px"
                                                    editing={isAdmin||isApprovedOwner}/>
                                            </div>

                                            
                                            <div className={styles.priceContainer}>
                                                <Text scale={2}>
                                                    <b><i18n.Number prefix="R$" numDecimals={2} value={product.priceValue/100} /></b>

                                                    {isAdmin||isApprovedOwner ? (
                                                        <a className={styles.changePriceButton} onClick={() => {this.setState({isPriceModalOpen: true});}} title="change price">
                                                            <span className="icon-price-tag"></span>
                                                        </a>
                                                    ) : null}
                                                </Text>
                                            </div>

                                            <div className={styles.totalPriceContainer}>
                                                {item ? (
                                                    <Text scale={0.8} color="#999999">
                                                        ( <i18n.Translate text="_TOTAL_IN_BASKET_" format="lower"/> = <b><i18n.Number prefix="R$" numDecimals={2} value={(item.quantity * product.priceValue)/100} /></b> )
                                                    </Text>
                                                ) : (
                                                    <Text scale={0.8} color="#999999">••••</Text>
                                                )}
                                            </div>

                                            {uid && product.status != Product.types.Status.NOT_APPROVED ? (
                                                <div className={styles.addBtnContainer}>
                                                    <Grid noGap={true}>
                                                        {item? (
                                                            <Grid.Cell span={0.3}>
                                                                <div className={styles.removeBtnContainer}>
                                                                    <Button scale={1} color="danger" block={true} onClick={() => {
                                                                        Redux.dispatch(Basket.actions.basketRemoveProduct(product));
                                                                    }}>-</Button>
                                                                </div>
                                                            </Grid.Cell>
                                                        ) : (<span></span>)}

                                                        <Grid.Cell>
                                                            <Button scale={1} color="success" block={true} onClick={() => {
                                                                Redux.dispatch(Basket.actions.basketAddProduct(product));
                                                            }} disabled={product.stock <= 0 || (item && item.quantity == product.stock) }>
                                                                {product.stock <= 0 || (item && item.quantity == product.stock) ? (
                                                                    <i18n.Translate text="_OUT_OF_STOCK_" />
                                                                ) : (
                                                                    <span>+ <i18n.Translate text="_ADD_" /></span>
                                                                )}
                                                            </Button>
                                                        </Grid.Cell>
                                                    </Grid>
                                                </div>
                                            ) : null}
                                        </div>
                                    </Grid.Cell>
                                    
                                    <Grid.Cell span={4}>
                                        <div className={styles.bodyContainer}>

                                            <div className={styles.nameContainer}>
                                                <Text scale={1.5}>{product.name}</Text>

                                                {product.status == Product.types.Status.NOT_APPROVED ? (
                                                    <span style={{marginLeft: "10px"}}><Label scale={0.8} color="#F9690E" layout="outlined"><i18n.Translate text={`_PRODUCT_STATUS_${lodash.toUpper(product.status)}_`}/></Label></span>
                                                ) : null}

                                                {/*product.status == Product.types.Status.NOT_APPROVED ? (
                                                    isAdmin ? (
                                                        <Dropdown Toggle={<span style={{marginLeft: "10px"}}><Label color="#F9690E" scale={0.8}><i18n.Translate text={`_PRODUCT_STATUS_${lodash.toUpper(product.status)}_`}/></Label></span>}
                                                        showCaret={false}
                                                        arrowOffset={30}
                                                        position="right"
                                                        positionOffset={0}
                                                        buttonLayout="none" 
                                                        buttonColor="dark" 
                                                        buttonScale={1}>
                                                            <Dropdown.Item>
                                                                Aprovar
                                                            </Dropdown.Item>
                                                        </Dropdown>
                                                    ) : (
                                                        <span style={{marginLeft: "10px"}}><Label scale={0.8} color="#F9690E"><i18n.Translate text={`_PRODUCT_STATUS_${lodash.toUpper(product.status)}_`}/></Label></span>
                                                    )
                                                ) : null*/}
                                            </div>

                                            {/*isAdmin ? (
                                                <div className={styles.actionsContainer}>
                                                    {product.status == Product.types.Status.NOT_APPROVED ? (
                                                        <Button scale={0.8} onClick={this.onApproveButtonClick} disabled={this.state.approving}>
                                                            {!this.state.approving ? <span>aprovar</span> : (
                                                                <span><span>aprovando</span><span style={{marginLeft: "5px"}}><Spinner.CircSide color="white"/></span></span>
                                                            )}
                                                        </Button>
                                                    ) : null}
                                                </div>
                                            ) : null*/}

                                            <div className={styles.tabsBodyContainer}>
                                                <div className={styles.tabsBody}>
                                                    <Tabs bordered={true}>
                                                        <Tabs.Item to={`/item/${nameId}`}><i18n.Translate text="_CATALOG_ITEM_PAGE_INFO_TAB_LABEL_"/></Tabs.Item>
                                                        {isAdmin||isApprovedOwner?<Tabs.Item to={`/item/${nameId}/statistics`}><i18n.Translate text="_CATALOG_ITEM_PAGE_STATISTICS_TAB_LABEL_"/></Tabs.Item>:null}
                                                        {isAdmin && product.status == Product.types.Status.NOT_APPROVED ?(
                                                            <Tabs.Item align="right">
                                                                <Button scale={0.6} onClick={this.onApproveButtonClick} disabled={this.state.approving}>
                                                                    {!this.state.approving ? <span>aprovar</span> : (
                                                                        <span><span>aprovando</span><span style={{marginLeft: "5px"}}><Spinner.CircSide scale={0.9} color="white"/></span></span>
                                                                    )}
                                                                </Button>
                                                            </Tabs.Item>
                                                        ):null}
                                                    </Tabs>
                                                </div>
                                            </div>

                                            <div className={styles.childrenBodyContainer}>
                                                {this.props.children}
                                            </div>
                                        </div>
                                    </Grid.Cell>
                                </Grid>
                            ) : (
                                <div>
                                    <div className={styles.nameContainer}>
                                        <Text scale={1.5}>
                                            {product.name} 
                                            
                                            {["not_approved"].indexOf(product.status) >= 0 ? (
                                                <span style={{marginLeft: "10px"}}><Label scale={0.8} color="#F9690E"><i18n.Translate text={`_PRODUCT_STATUS_${lodash.toUpper(product.status)}_`}/></Label></span>
                                            ) : null}
                                        </Text>
                                    </div>

                                    <div className={styles.mainImageContainer}>
                                        {item && product.stock > 0 ? <Badge className={styles.badge} count={item.quantity} borderWidth={8} /> : null}
                                        
                                        <Uploader.Main authToken={this.state.authToken} targetUrl={`//${config.hostnames.api}/${config.apiVersion}/file/upload`}
                                            uploadOnSubmitted={true}
                                            onInit={this.onUploaderInit}
                                            onFileUploadSuccess={this.onFileUploadSuccess}
                                            onUploadComplete={this.onUploadComplete}
                                            onSelectMainImage={this.selectMainProfileImage}
                                            mainImage={mainProfileImage}
                                            onImagesLoad={this.onUploaderImagesLoad}
                                            images={profileImages}
                                            defaulImageUrl={placeholderImg}
                                            showAddMoreButton={true}
                                            showSelectMainProfileImageButton={isAdmin||isApprovedOwner}
                                            borderColor="white"
                                            borderWidth="7px"
                                            editing={isAdmin||isApprovedOwner}/>
                                    </div>

                                    <div className={styles.totalPriceContainer}>
                                        {item ? (
                                            <Text scale={0.8} color="#999999">
                                                ( <i18n.Translate text="_TOTAL_IN_BASKET_" format="lower"/> = <b><i18n.Number prefix="R$" numDecimals={2} value={(item.quantity * product.priceValue)/100} /></b> )
                                            </Text>
                                        ) : (
                                            <Text scale={0.8} color="#999999">••••</Text>
                                        )}
                                    </div>
                                </div>
                            )
                        ) : initializing ? (
                            <div>Carregando ...</div>
                        ) : (
                            <div>Ops... Esse produto não está cadastrado em nosso catálogo! :(</div>
                        )}
                    </Container>
                </div>

                <Product.PriceModal open={isPriceModalOpen}
                    product={product}
                    onComplete={(result) => {
                        let logger = Logger.create("onPriceModalComplete");
                        logger.info("enter", result);

                        this.setState({isPriceModalOpen: false});
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
