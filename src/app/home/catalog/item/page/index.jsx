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
import {Api,Product,Basket,Badge,Brand} from "common";
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
        products: lodash.get(state.product,"scope.catalogList.data"),
        product: state.product.selected,
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
    static displayName = "catalog.item.page";
    static defaultProps = {};
    static propTypes = {};

    state = {
        editing: {},
        saving: {}
    };

    async componentDidMount() {
        let logger = Logger.create("componentDidMount");
        logger.info("enter", {params: this.props.params});

        let newState = {initializing: false};
        let nameId = lodash.get(this.props, "params.id");

        // Try to get product from products store.
        let product = lodash.find(this.props.products, (product) => {
            return product.nameId == nameId;
        });

        // If nothing was found, then get it directly from the server.
        if(!product) {
            this.setState({initializing: true});

            logger.debug("product not in products", {
                products: this.props.products
            });

            try {
                let findResponse = await Api.shared.productFindByNameId(nameId, {
                    populate: ["profileImages","tags","brand","brand.company"]
                });
                
                product = findResponse.result;
            }
            catch(error) {
                logger.error("api productFindByNameId error", error);
            }
        }
        
        if(product) {
            console.log("product already fetched", product);

            // Select product
            Redux.dispatch(Product.actions.productSelect(product));
        }

        try {
            newState.authToken = await Api.shared.http.getAuthToken();
            logger.info("api http getAuthToken success", newState.authToken);
        }
        catch(error) {
            logger.error("api http getAuthToken error", error);
        }

        this.setState(newState);
        this.processProfileImages(product);

        // Window resize
        window.addEventListener("resize", this.handleWindowResize);

        this.handleWindowResize();
    }

    componentDidUpdate(prevProps) {
        let logger = Logger.create("componentDidUpdate");
        logger.info("enter");

        let {product} = this.props;
        let profileImagesStr = lodash.map(lodash.get(product, "profileImages"),"_id").sort().join(",");
        let prevProfileImagesStr = lodash.map(lodash.get(prevProps, "product.profileImages"), "_id").sort().join(",");

        logger.debug("data", {
            profileImagesStr,
            prevProfileImagesStr
        });

        // If product images is diferent than state profile images,
        // then process again.
        if(profileImagesStr != prevProfileImagesStr
        ||lodash.get(product, "mainProfileImage") != lodash.get(prevProps,"product.mainProfileImage")) {
            logger.debug("product profileImages changed");
            this.processProfileImages(product);
        }
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.handleWindowResize);
    }

    processProfileImages(product) {
        // Process profile images
        let profileImages = [];

        for(let image of product.profileImages||[]) {
            profileImages.push({
                _id: image._id,
                url: image.url?image.url:`//${config.hostnames.file}/images/${image.path}`
            });
        }

        // If the are local-files mounted, then add it to the end
        // of the profile images array.
        let localImages = lodash.filter(this.state.profileImages, (img) => {
            return img.type == "local-file";
        });

        console.log("rapadura mole : localImages", {localImages});

        profileImages = profileImages.concat(localImages);

        // Set main profile image.
        let mainProfileImage = lodash.find(profileImages, (image) => {
            return image._id == product.mainProfileImage;
        });

        console.log("rapadura mole", {mainProfileImage, profileImages});

        // Return to caller.
        this.setState({
            mainProfileImage,
            profileImages
        });
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
        let logger = Logger.create("onSubmit");
        logger.info("enter", {data, formName});

        if(!this.props.product) {return;}

        let changed = false;

        for(let key of Object.keys(data)) {
            if(this.props.product[key] != data[key]) {
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

    onUploadStart() {
        let logger = Logger.create("onUploadStart");
        logger.info("enter");
    }

    async onFileUploadSuccess(fileData, fid) {
        let logger = Logger.create("onFileUploadSuccess");
        logger.info("enter", {fileData, fid});

        //console.log(["console onFileUploadSuccess", fileData, fid]);

        // Update images
        let idx = lodash.findIndex(this.state.profileImages, (image) => {
            return image._id == fid;
        });

        //console.log(["console onFileUploadSuccess : idx", idx]);

        let profileImages = this.oldProfileImages = this.state.profileImages;
        let mainProfileImage = this.oldMainProfileImage = this.state.mainProfileImage;

        logger.debug("idx", {idx});

        if(idx >= 0 && profileImages.length && idx < profileImages.length) {
            //console.log(["console onFileUploadSuccess : let's update profile images"]);

            let oldImage = profileImages[idx];
            let newImage = {
                _id: fileData._id,
                url: `//${config.hostnames.file}/images/${fileData.path}`
            };

            //console.log(["console onUploadSuccess : oldImage, newImage", oldImage, newImage]);

            if(oldImage._id == mainProfileImage._id) {
                mainProfileImage = newImage;
            }

            //console.log(["console onUploadSuccess : images before splice", lodash.map(profileImages, "_id")]);

            profileImages.splice(idx, 1, newImage);

            //console.log(["console onUploadSuccess : images aftre splice", lodash.map(profileImages, "_id")]);
        }

        this.setState({mainProfileImage, profileImages});
    }

    async onUploadComplete() {
        let logger = Logger.create("onUploadComplete");
        logger.info("enter", this.data);

        try {
            await this.updateProduct({
                mainProfileImage: lodash.get(this.state, "mainProfileImage._id"),
                profileImages: lodash.map(this.state.profileImages, (image) => {
                    return image._id;
                })
            }, {profileImages: this.state.profileImages});
        }
        catch(error) {
            return logger.error("updateProduct error", error);
        }

        // Clear profile images.
        this.setState({profileImages: []});
    }

    onUploaderImagesLoad(images) {
        let profileImages = this.state.profileImages.concat(images);

        this.setState({
            profileImages,
            mainProfileImage: this.state.mainProfileImage || profileImages[0]
        }, () => {
            this.flow.upload();
        });
    }

    selectMainProfileImage(image) {
        this.updateProduct({
            mainProfileImage: image._id,
        }).then(() => {
            this.setState({mainProfileImage: image});
        });
    }

    async updateProduct(data, oldData) {
        let response,
            productId = lodash.get(this.props, "product._id"),
            logger = Logger.create("onUploadComplete");

        if(!productId){return;}

        logger.info("enter", {data,oldData});

        // Update product.
        try {
            response = await Redux.dispatch(
                Product.actions.productUpdate(productId, data, {
                    data: oldData
                })
            );
            logger.debug("api productUpdate success", response);
        }
        catch(error) {
            return logger.error("api productUpdate error", error);
        }
    }

    async onApproveButtonClick() {
        let productId = lodash.get(this.props, "product._id"),
            logger = Logger.create("onApproveButtonClick");
        
        logger.info("enter");

        this.setState({approving: true});

        // Let's approve the product (make it public).
        try {
            let response = await Redux.dispatch(
                Product.actions.productStatusUpdate(productId, "public")
            );
            logger.debug("api productStatusUpdate success", response);
        }
        catch(error) {
            logger.error("api productStatusUpdate error", error);
        }

        this.setState({approving: false});
    }

    render() {
        let {uid,user,product} = this.props;
        let {items} = this.props.basket;
        let {initializing,profileImages,mainProfileImage,screenSize} = this.state;
        let nameId = lodash.get(this.props, "params.id");
        let {isApprovedOwner,isAdmin} = Brand.utils.getOwner(user, lodash.get(product,"brand"));
        let isProductReady = product && product.nameId == lodash.get(this.props, "params.id");

        let item = lodash.find(items, (item) => {
            return item.product.nameId == nameId;
        });

        return (
            <div className={styles.page}>
                {/*<div className={styles.banner}>
                    <div className={styles.bannerOverlay}></div>
                    {screenSize != "phone" ? (
                        <Container>
                            {product ? (
                                <Grid>
                                    <Grid.Cell>
                                    </Grid.Cell>

                                    <Grid.Cell span={4}>
                                        <div className={styles.bannerBodyContainer}>
                                            <div className={styles.bannerBody}>
                                                <Text scale={1.5}>{product.name}</Text>
                                            </div>
                                        </div>
                                    </Grid.Cell>
                                </Grid>
                            ) : (null)}
                        </Container>
                    ) : (
                        null
                    )}

                    <Container>
                        {product ? (
                            <Grid>
                                <Grid.Cell>
                                </Grid.Cell>

                                <Grid.Cell span={4}>
                                    <div className={styles.tabsBodyContainer}>
                                        <div className={styles.tabsBody}>
                                            <Tabs bordered={false}>
                                                <Tabs.Item to={`/item/${nameId}`}>Info</Tabs.Item>
                                                <Tabs.Item to={`/item/${nameId}/statistics`}>Estatísticas</Tabs.Item>
                                            </Tabs>
                                        </div>
                                    </div>
                                </Grid.Cell>
                            </Grid>
                        ) : (null)}
                    </Container>
                </div>*/}

                <div className={styles.mainContent}>
                    <Container>
                        {isProductReady ? (
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
            </div>
        );
    }
}

/** Export **/
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Component);
