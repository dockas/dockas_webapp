import React from "react";
import lodash from "lodash";
import config from "config";
import {connect} from "react-redux";
import Container from "darch/src/container";
import Grid from "darch/src/grid";
import Text from "darch/src/text";
import i18n from "darch/src/i18n";
import Uploader from "darch/src/uploader";
import Tabs from "darch/src/tabs";
import {LoggerFactory,Redux,Style} from "darch/src/utils";
import {Api,Brand} from "common";
import backgroundImg from "assets/images/background.jpg";
import placeholderImg from "assets/images/placeholder.png";
import styles from "./styles";

let Logger = new LoggerFactory("item.page");

/**
 * Redux map state to props function.
 *
 * @param {object} state
 * @param {object} ownProps
 */
function mapStateToProps(state) {
    return {
        brands: state.brand.data,
        brand: state.brand.selected,
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
    static displayName = "item.page";
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

        // Try to get brand from brands store.
        let brand = lodash.find(this.props.brands, (brand) => {
            return brand.nameId == nameId;
        });

        // If nothing was found, then get it directly from the server.
        if(!brand) {
            this.setState({initializing: true});

            try {
                let findResponse = await Api.shared.brandFindByNameId(nameId, {
                    populate: ["profileImages"]
                });
                
                brand = findResponse.result;
            }
            catch(error) {
                logger.error("api brandFindByNameId error", error);
            }
        }
        
        if(brand) {
            // Process profile images
            let profileImages = [];

            for(let image of brand.profileImages||[]) {
                profileImages.push({
                    _id: image._id, 
                    url: `//${config.hostnames.file}/images/${image.path}`
                });
            }

            let mainProfileImage = lodash.find(profileImages, (image) => {
                return image._id == brand.mainProfileImage;
            });

            newState.mainProfileImage = mainProfileImage;
            newState.profileImages = profileImages;

            // Select product
            Redux.dispatch(Brand.actions.brandSelect(brand));
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

        if(!this.props.brand) {return;}

        let changed = false;

        for(let key of Object.keys(data)) {
            if(this.props.brand[key] != data[key]) {
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
            let oldImage = profileImages[idx];
            let newImage = {
                _id: fileData._id,
                url: `//${config.hostnames.file}/images/${fileData.path}`
            };

            if(oldImage._id == mainProfileImage._id) {
                mainProfileImage = newImage;
            }

            profileImages.splice(idx, 1, newImage);
        }

        this.setState({mainProfileImage, profileImages});
    }

    async onUploadComplete() {
        let logger = Logger.create("onUploadComplete");
        logger.info("enter", this.data);

        this.updateBrand({
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
        this.updateBrand({
            mainProfileImage: image._id,
        }).then(() => {
            this.setState({mainProfileImage: image});
        });
    }

    async updateBrand(data) {
        let brandResponse,
            brandId = lodash.get(this.props, "brand._id"),
            logger = Logger.create("updateBrand");

        if(!brandId){return;}

        logger.info("enter", data);

        // Update product.
        try {
            brandResponse = await Redux.dispatch(Brand.actions.brandUpdate(brandId, data));
            logger.debug("api brandUpdate success", brandResponse);
        }
        catch(error) {
            return logger.error("api brandUpdate error", error);
        }
    }

    render() {
        let {user,brand} = this.props;
        let {initializing,profileImages,mainProfileImage,screenSize} = this.state;
        let nameId = lodash.get(this.props, "params.id");
        let {isApprovedOwner,isAdmin} = Brand.utils.getOwner(user, brand);

        return (
            <div className={styles.page}>
                <div className={styles.banner} style={{
                    backgroundImage: `url(${backgroundImg})`
                }}>
                    
                    <div className={styles.bannerOverlay}></div>

                    {screenSize != "phone" ? (
                        <Container>
                            {brand ? (
                                <Grid>
                                    <Grid.Cell>
                                    </Grid.Cell>

                                    <Grid.Cell span={4}>
                                        <div className={styles.bannerBodyContainer}>
                                            <div className={styles.bannerBody}>
                                                <Text scale={1.5}>{brand.name}</Text>
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
                        {brand ? (
                            <Grid>
                                <Grid.Cell>
                                </Grid.Cell>

                                <Grid.Cell span={4}>
                                    <div className={styles.tabsBodyContainer}>
                                        <div className={styles.tabsBody}>
                                            <Tabs bordered={false}>
                                                <Tabs.Item to={`/brand/${nameId}`}><i18n.Translate text="_BRAND_DETAIL_PAGE_PRODUCTS_TAB_LABEL_"/></Tabs.Item>
                                                <Tabs.Item to={`/brand/${nameId}/info`}><i18n.Translate text="_BRAND_DETAIL_PAGE_INFO_TAB_LABEL_"/></Tabs.Item>
                                                <Tabs.Item to={`/brand/${nameId}/photos`}><i18n.Translate text="_BRAND_DETAIL_PAGE_PHOTOS_TAB_LABEL_"/></Tabs.Item>
                                                {isAdmin||isApprovedOwner ? <Tabs.Item to={`/brand/${nameId}/statistics`}><i18n.Translate text="_BRAND_DETAIL_PAGE_STATISTICS_TAB_LABEL_" /></Tabs.Item> : null}
                                                {isAdmin||isApprovedOwner ? <Tabs.Item to={`/brand/${nameId}/orders`}><i18n.Translate text="_BRAND_DETAIL_PAGE_ORDERS_TAB_LABEL_" /></Tabs.Item> : null}
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
                        {brand ? (
                            <Grid>
                                <Grid.Cell>
                                    <div className={styles.sidebarContainer}>
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
                                                showAddMoreButton={isAdmin||isApprovedOwner}
                                                showSelectMainProfileImageButton={isAdmin||isApprovedOwner}
                                                borderColor="#ffffff"
                                                borderWidth="7px"
                                                editing={isAdmin||isApprovedOwner}/>

                                            {/*mainImage ? (
                                                <div className={styles.mainImage} style={{
                                                    backgroundImage: `url(//${config.hostnames.file}/images/${mainImage.path})`,
                                                    backgroundSize: "cover",
                                                    backgroundPosition: "center"
                                                }}></div>
                                            ) : null*/}
                                        </div>
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
                            <div>Ops... Essa marca não está cadastrada! :(</div>
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
