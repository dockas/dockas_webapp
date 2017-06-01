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
import Tabs from "darch/src/tabs";
import {LoggerFactory,Redux,Style} from "darch/src/utils";
import {Api,Product,Basket,Badge} from "common";
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
        products: state.product.data,
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

            try {
                let findResponse = await Api.shared.productFindByNameId(nameId, {
                    populate: ["profileImages","tags","brand"]
                });
                
                product = findResponse.result;
            }
            catch(error) {
                logger.error("api productFindByNameId error", error);
            }
        }
        
        if(product) {
            // Process profile images
            let profileImages = [];

            for(let image of product.profileImages||[]) {
                profileImages.push({
                    _id: image._id, 
                    url: `//${config.hostnames.file}/images/${image.path}`
                });
            }

            let mainProfileImage = lodash.find(profileImages, (image) => {
                return image._id == product.mainProfileImage;
            });

            newState.mainProfileImage = mainProfileImage;
            newState.profileImages = profileImages;

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

        // Window resize
        window.addEventListener("resize", this.handleWindowResize);

        this.handleWindowResize();
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.handleWindowResize);
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

        let profileImages = this.state.profileImages;
        let mainProfileImage = this.state.mainProfileImage;

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

        //console.log(["console onUploadComplete", this.state]);

        logger.info("enter", this.data);

        this.updateProduct({
            mainProfileImage: lodash.get(this.state, "mainProfileImage._id"),
            profileImages: lodash.map(this.state.profileImages, (image) => {
                //console.log("console onUploadComplete : image", image);

                return image._id;
            })
        });
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

    async updateProduct(data) {
        let productResponse,
            productId = lodash.get(this.props, "product._id"),
            logger = Logger.create("onUploadComplete");

        if(!productId){return;}

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
        let {uid,user,product} = this.props;
        let {items} = this.props.basket;
        let {initializing,profileImages,mainProfileImage,screenSize} = this.state;
        let nameId = lodash.get(this.props, "params.id");
        
        let item = lodash.find(items, (item) => {
            return item.product.nameId == nameId;
        });

        return (
            <div className={styles.page}>
                <div className={styles.banner}>
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
                </div>

                <div className={styles.mainContent}>
                    <Container>
                        {product ? (
                            <Grid>
                                <Grid.Cell>
                                    <div className={styles.sidebarContainer}>
                                        {item ? <Badge className={styles.badge} count={item.count} borderWidth={8} /> : null}

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
                                                showSelectMainProfileImageButton={(user && user.roles.indexOf("admin") >= 0)}
                                                borderColor="white"
                                                borderWidth="7px"
                                                editing={(user && user.roles.indexOf("admin") >= 0)}/>

                                            {/*mainImage ? (
                                                <div className={styles.mainImage} style={{
                                                    backgroundImage: `url(//${config.hostnames.file}/images/${mainImage.path})`,
                                                    backgroundSize: "cover",
                                                    backgroundPosition: "center"
                                                }}></div>
                                            ) : null*/}
                                        </div>

                                        {screenSize != "phone" ? (
                                            <div className={styles.priceContainer}>
                                                <Text scale={2}>
                                                    <b><i18n.Number prefix="R$" numDecimals={2} value={product.priceValue/100} /></b>
                                                </Text>
                                            </div>
                                        ) : null}

                                        {screenSize != "phone" ? (
                                            <div className={styles.totalPriceContainer}>
                                                {item ? (
                                                    <Text scale={0.8} color="#999999">
                                                        ( <i18n.Translate text="_TOTAL_IN_BASKET_" format="lower"/> = <b><i18n.Number prefix="R$" numDecimals={2} value={(item.count * product.priceValue)/100} /></b> )
                                                    </Text>
                                                ) : (
                                                    <Text scale={0.8} color="#999999">••••</Text>
                                                )}
                                            </div>
                                        ) : null}

                                        {uid && screenSize != "phone" ? (
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
                                        {this.props.children}
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
