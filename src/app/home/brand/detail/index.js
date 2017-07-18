import React from "react"
import lodash from "lodash"
import config from "config"
import {connect} from "react-redux"
import Container from "darch/src/container"
import Grid from "darch/src/grid"
import Text from "darch/src/text"
import i18n from "darch/src/i18n"
import Uploader from "darch/src/uploader"
import Tabs from "darch/src/tabs"
import {LoggerFactory,Redux,Style} from "darch/src/utils"
import {Api,Brand,File,RouterUtil} from "common"
import backgroundImg from "assets/images/background.jpg"
import placeholderImg from "assets/images/placeholder.png"
import styles from "./styles"

let Logger = new LoggerFactory("item.page")

/**
 * Redux map state to props function.
 *
 * @param {object} state
 * @param {object} ownProps
 */
function mapStateToProps(state) {
    return {
        fileData: state.file.data,
        brandData: state.brand.data,
        brandNameIdToId: state.brand.nameIdToId,
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
    static displayName = "item.page";
    static defaultProps = {};
    static propTypes = {};

    state = {
        editing: {},
        saving: {}
    };

    uploadedFiles = {};

    getScopeData(props=this.props) {
        let brand,
            nameId = lodash.get(props, "match.params.id"),
            {brandData,brandNameIdToId} = props

        brand = brandNameIdToId[nameId] ?
            brandData[brandNameIdToId[nameId]] : 
            null

        return {brand}
    }

    async componentDidMount() {
        let logger = Logger.create("componentDidMount")
        logger.info("enter", {params: this.props.params})

        // preload subroutes
        RouterUtil.preloadRoutes(this.props)

        let newState = {initializing: false}
        let nameId = lodash.get(this.props, "match.params.id")
        let {brand} = this.getScopeData()

        // If record was not fetched yet, then get it 
        // directly from the server.
        if(!brand) {
            this.setState({initializing: true})

            try {
                await Redux.dispatch(
                    Brand.actions.brandFindByNameId(nameId, {
                        populate: {paths: ["profileImages","company","wallet"]}
                    })
                )
            }
            catch(error) {
                logger.error("api brandFindByNameId error", error)
            }
        }
        // Let's ensure that fetched brand is populated with necessary data.
        else {
            Brand.populator.populate(
                [brand], 
                {paths:["profileImages","company","wallet"]}
            )
        }

        // Auth token for upload profile images.
        try {
            newState.authToken = await Api.shared.http.getAuthToken()
            logger.info("api http getAuthToken success", newState.authToken)
        }
        catch(error) {
            logger.error("api http getAuthToken error", error)
        }

        // Update state
        this.setState(newState)

        // Window resize
        window.addEventListener("resize", this.handleWindowResize)
        this.handleWindowResize()
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.handleWindowResize)
    }

    processProfileImages() {
        let profileImages = [],
            {fileData} = this.props,
            {uploaderImages} = this.state,
            {brand} = this.getScopeData()

        if(brand) {
            for(let imageId of brand.profileImages) {
                if(!fileData[imageId]){continue}

                profileImages.push({
                    _id: fileData[imageId]._id,
                    url: `//${config.hostnames.file}/images/${fileData[imageId].path}`
                })
            }

            // Add uploader loaded images.
            for(let image of uploaderImages||[]) {
                profileImages.push({
                    type: "localImage",
                    _id: image._id,
                    url: image.url
                })
            }
        }

        return profileImages
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

    onSubmit(data, formName) {
        let {brand} = this.getScopeData(),
            logger = Logger.create("onSubmit")

        logger.info("enter", {data, formName})

        if(!brand) {return}

        let changed = false

        for(let key of Object.keys(data)) {
            if(brand[key] != data[key]) {
                changed = true
                break
            }
        }

        if(changed) {logger.debug("changed")}

        let editingChanged = {}
        editingChanged[formName] = false

        let newState = {
            editing: Object.assign(this.state.editing, editingChanged)
        }

        this.setState(newState)
    }

    onUploaderInit(flow) {
        let logger = Logger.create("onUploaderInit")
        logger.info("enter")

        this.flow = flow
    }

    onUploaderImagesLoad(images) {
        this.setState({
            uploaderImages: lodash.cloneDeep(images)
        }, () => {
            this.flow.upload()
        })
    }

    onUploadStart() {
        let logger = Logger.create("onUploadStart")
        logger.info("enter")
    }

    async onFileUploadSuccess(file, fid) {
        let logger = Logger.create("onFileUploadSuccess")
        logger.info("enter", {file, fid})

        this.uploadedFiles[fid] = file

        Redux.dispatch(
            File.actions.fileAdd(file)
        )
    }

    async onUploadComplete() {
        let {uploaderImages} = this.state,
            {brand} = this.getScopeData(),
            fileIds = lodash.get(brand, "profileImages")||[],
            logger = Logger.create("onUploadComplete")

        logger.info("enter", {uploadedImages: uploaderImages})

        // Process uploaderImages
        for(let image of uploaderImages) {
            if(!this.uploadedFiles[image._id]){continue}
            fileIds.push(lodash.get(this.uploadedFiles,`${image._id}._id`))
        }

        logger.debug("fileIds", {fileIds})

        try {
            await this.updateBrand({profileImages: fileIds})
        }
        catch(error) {
            return logger.error("updateBrand error", error)
        }

        // Clear uploadedFiles
        this.uploadedFiles = {}

        // Clear uploaderImages.
        this.setState({uploaderImages: []})
    }

    selectMainProfileImage(image) {
        this.updateBrand({
            mainProfileImage: image._id,
        }).then(() => {
            this.setState({mainProfileImage: image})
        })
    }

    async updateBrand(data) {
        let response,
            {brand} = this.getScopeData(),
            logger = Logger.create("updateBrand")

        if(!brand){return}

        logger.info("enter", data)

        // Update product.
        try {
            response = await Redux.dispatch(
                Brand.actions.brandUpdate(brand._id, data)
            )

            logger.debug("api brandUpdate success", response)
        }
        catch(error) {
            return logger.error("api brandUpdate error", error)
        }
    }

    render() {
        let nameId = lodash.get(this.props, "match.params.id")
        let {user} = this.props
        let {initializing,screenSize} = this.state
        let {brand} = this.getScopeData()
        let profileImages = this.processProfileImages()
        let {isApprovedOwner,isAdmin} = Brand.utils.getOwner(user, brand)

        let mainProfileImage = lodash.find(profileImages, (image) => {
            return lodash.get(brand, "mainProfileImage") == image._id
        })

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
                                                {isAdmin||isApprovedOwner ? <Tabs.Item to={`/brand/${nameId}/wallet`}><i18n.Translate text="_BRAND_DETAIL_PAGE_WALLET_TAB_LABEL_" /></Tabs.Item> : null}
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
                                        {RouterUtil.renderRoutes(this.props)}
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
        )
    }
}

/** Export **/
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Component)
