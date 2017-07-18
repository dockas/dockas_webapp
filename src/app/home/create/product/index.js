import React from "react"
import config from "config"
import lodash from "lodash"
//import classNames from "classnames";
import {withRouter} from "react-router-dom"
import {connect} from "react-redux"
import {LoggerFactory,Redux} from "darch/src/utils"
import Container from "darch/src/container"
import Grid from "darch/src/grid"
import i18n from "darch/src/i18n"
import Form from "darch/src/form"
import Field from "darch/src/field"
import Button from "darch/src/button"
import Spinner from "darch/src/spinner"
import Text from "darch/src/text"
import Uploader from "darch/src/uploader"
import Toaster from "darch/src/toaster"
import NumberUtils from "darch/src/field/number/utils"
import placeholderImg from "assets/images/placeholder.png"
import {Api,Product,Brand,File} from "common"
import styles from "./styles"
import TagModal from "./tag_modal"

let Logger = new LoggerFactory("create.product")

/**
 * Redux map state to props function.
 *
 * @param {object} state
 * @param {object} ownProps
 */
function mapStateToProps(state) {
    return {
        spec: state.i18n.spec,
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
    static displayName = "create.product";
    static defaultProps = {};
    static propTypes = {};

    /** Instance properties */
    state = {
        profileImages: [],
        mainProfileImage: null
    };

    async componentDidMount() {
        let {user} = this.props,
            newState = {},
            logger = Logger.create("componentDidMount")

        logger.info("enter")

        // Retrieve auth token for uploader component.
        try {
            newState.authToken = await Api.shared.http.getAuthToken()
        }
        catch(error) {
            logger.error("api http getAuthToken error", error)
        }

        // If user is not admin, then retrieve only it's
        // own brands.
        if(user.roles.indexOf("admin") < 0) {
            try {
                let result = await Redux.dispatch(
                    Brand.actions.brandFind({owners: [user._id]})
                )

                logger.info("action brandFind success", result)

                let brands = (lodash.get(result,"value.data")||[]).map((brand) => {
                    return {value: brand._id, label: brand.name}
                })

                if(brands.length == 1) {
                    newState.brandId = brands[0]._id
                }

                newState.brands = brands
            }
            catch(error) {
                logger.error("action brandFind error", error)
            }
        }

        // Retrieve all tags.
        try {
            let response = await Api.shared.tagFind()
            logger.debug("api tagFind success", response)

            // Process tags
            let tags = response.results.map((tag) => {
                return {value: tag._id, label: tag.name, color: tag.color}
            })

            newState.tags = tags
        }
        catch(error) {
            logger.error("Api tagFind error", error)
        }

        this.setState(newState)
    }

    /**
     * This function submits the create form.
     */
    onFormSubmit(data) {
        let logger = Logger.create("onFormSubmit")
        logger.info("enter", data)
        //console.log("onFormSubmit", data);

        this.setState({loading: true})

        // Register data
        this.data = lodash.merge({}, data, this.data)

        // Supply type
        if(data.onDemandSupply === false) {
            this.data.supplyType = "on_stock"
        }

        // Bug with NumberFormat
        // https://github.com/s-yadav/react-number-format/issues/45
        this.data.priceValue = NumberUtils.parseViewToModel(this.props.spec, data.priceValue)
        this.data.priceValue = parseInt((this.data.priceValue * 100).toFixed(0))
        delete this.data.onDemandSupply

        if(this.state.uploadComplete) {
            return this.onUploadComplete()
        }

        // Start uploading photo.
        this.flow.upload()
    }

    onUploaderInit(flow) {
        let logger = Logger.create("onUploaderInit")
        logger.info("enter")

        this.flow = flow
    }

    onUploaderImagesLoad(images) {
        let profileImages = this.state.profileImages.concat(images)

        this.setState({
            profileImages,
            mainProfileImage: this.state.mainProfileImage || profileImages[0]
        })
    }

    selectMainProfileImage(image) {
        this.setState({mainProfileImage: image})
    }

    onUploadStart() {
        let logger = Logger.create("onUploadStart")
        logger.info("enter")
    }

    async onUploadSuccess(file, fid) {
        let logger = Logger.create("onUploadSuccess")
        logger.info("enter", {file, fid})

        //this.data.mainImage = file._id;
        this.data.profileImages = this.data.profileImages || []
        this.data.profileImages.push(file._id)

        if(lodash.get(this.state, "mainProfileImage._id") == fid) {
            this.data.mainProfileImage = file._id
        }

        // Add file to store
        Redux.dispatch(
            File.actions.fileAdd(file)
        )
    }

    async onUploadComplete() {
        let response,
            logger = Logger.create("onUploadComplete")

        logger.info("enter", this.data)

        // Mark upload as completed
        this.setState({uploadComplete: true})

        // Create brand
        if(this.state.brandToCreate) {
            logger.debug("creating brand")

            try {
                response = await Api.shared.brandCreate({
                    name: this.state.brandToCreate,
                    owners: this.data.owners
                })

                logger.info("api brandCreate success", response)

                this.data.brand = response.result._id
                delete this.data.owners
            }
            catch(error) {
                return logger.error("api brandCreate error", error)
            }
        }

        // Save product.
        try {
            response = await Redux.dispatch(Product.actions.productCreate(this.data))
            logger.info("action productCreate success", response)
        }
        catch(error) {
            this.setState({loading: false})
            return logger.error("api productCreate error", error)
        }

        // Everything is done... go to product page.
        this.props.history.replace(`/item/${response.value.nameId}`)
    }

    /**
     * This function load tags.
     */
    async loadTags(value) {
        let logger = Logger.create("loadTags")
        logger.info("enter", {value})

        if(lodash.isEmpty(value)) {return}

        this.setState({loadingTags: true})

        try {
            let response = await Api.shared.tagFind({
                name: value
            })

            logger.debug("api tagFind success", response)

            // Process tags
            let tags = response.results.map((tag) => {
                return {value: tag._id, label: tag.name, color: tag.color}
            })

            this.setState({tags, loadingTags: false})
        }
        catch(error) {
            logger.error("api tagFind error", error)
            this.setState({loadingTags: false})
        }
    }

    /**
     * This function open the add tag modal.
     */
    openNewTagModal() {
        let logger = Logger.create("openAddTagModal")
        logger.info("enter")

        this.setState({newTagModalOpen: true})
    }

    /**
     * This function loads brands.
     */
    async loadBrands(value) {
        let logger = Logger.create("loadBrands")
        logger.info("enter", {value})

        if(lodash.isEmpty(value)) {return}

        this.setState({loadingBrands: true})

        try {
            let result = await Redux.dispatch(
                Brand.actions.brandFind({name: value})
            )

            logger.debug("action brandFind success", result)

            // Process brands
            let brands = (lodash.get(result,"value.data")||[]).map((brand) => {
                return {value: brand._id, label: brand.name}
            })

            this.setState({brands, loadingBrands: false})
        }
        catch(error) {
            logger.error("api brandFind error", error)
            this.setState({loadingBrands: false})
        }
    }

    /**
     * This function loads users.
     */
    async loadUsers(value) {
        let logger = Logger.create("loadUsers")
        logger.info("enter", {value})

        if(lodash.isEmpty(value)) {return}

        this.setState({loadingUsers: true})

        try {
            let response = await Api.shared.userFind({
                email: value
            })

            logger.debug("Api userFind success", response)

            // Process users
            let users = response.results.map((user) => {
                return {value: user._id, label: user.email}
            })

            this.setState({users, loadingUsers: false})
        }
        catch(error) {
            logger.error("Api userFind error", error)
            this.setState({loadingUsers: false})
        }
    }

    onCSVInputChange(target) {
        return (evt) => {
            let logger = Logger.create("onCSVInputChange")
            logger.info("enter", {target})

            let files = evt.target.files

            //console.log(["file", files]);

            var reader = new FileReader()
            reader.onload = async () => {
                let csvStr = reader.result

                // Send to api.
                switch(target) {
                    case "products": {
                        try {
                            let result = await Api.shared.productCreateFromCSV({csv: csvStr})
                            logger.info("api productCreateFromCSV success", result)

                            Redux.dispatch(Toaster.actions.push("success", "_PRODUCTS_CREATE_SUCCESS_"))
                        }
                        catch(error) {
                            logger.error("api productCreateFromCSV error", error)
                        }
                        break
                    }

                    case "brands": {
                        try {
                            let result = await Api.shared.brandCreateFromCSV({csv: csvStr})
                            logger.info("api brandCreateFromCSV success", result)

                            Redux.dispatch(Toaster.actions.push("success", "_BRANDS_CREATE_SUCCESS_"))
                        }
                        catch(error) {
                            logger.error("api brandCreateFromCSV error", error)
                        }
                        break
                    }

                    case "companies": {
                        try {
                            let result = await Api.shared.companyCreateFromCSV({csv: csvStr})
                            logger.info("api companyCreateFromCSV success", result)

                            Redux.dispatch(Toaster.actions.push("success", "_COMPANIES_CREATE_SUCCESS_"))
                        }
                        catch(error) {
                            logger.error("api companyCreateFromCSV error", error)
                        }
                        break
                    }

                    case "tags": {
                        try {
                            let result = await Api.shared.tagCreateFromCSV({csv: csvStr})
                            logger.info("api tagCreateFromCSV success", result)

                            Redux.dispatch(Toaster.actions.push("success", "_TAGS_CREATE_SUCCESS_"))
                        }
                        catch(error) {
                            logger.error("api tagCreateFromCSV error", error)
                        }
                        break
                    }

                    default: {
                        break
                    }
                }
                
            }

            reader.readAsText(files[0], "utf-8")
        }
    }

    render() {
        let {
            tags,loadingTags,newTagModalOpen,
            users,loadingUsers,brands,brandId,
            loadingBrands,brandToCreate,
            uploadComplete
        } = this.state

        let {user} = this.props
        let isAdmin = (user && user.roles.indexOf("admin") >= 0)

        let inputFileStyle={
            width: "0.1px",
            height: "0.1px",
            opacity: 0,
            overflow: "hidden",
            position: "absolute",
            zIndex: -1
        }

        return (
            <div className={styles.page}>
                <Container size="md">
                    <h3 className="headline">
                        <i18n.Translate text="_CREATE_PRODUCT_PAGE_TITLE_" />

                        <div style={{float: "right"}}>
                            {isAdmin ? (
                                <span className={styles.fileInputButton}>
                                    <label style={{fontSize: "18px"}} htmlFor="productCSV">CSV Produtos</label>
                                    <input name="productCSV" id="productCSV" type="file" accept=".csv" onChange={this.onCSVInputChange("products")} style={inputFileStyle} />
                                </span>
                            ) : null}
                        </div>
                    </h3>

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
                                <Uploader.Main authToken={this.state.authToken} targetUrl={`//${config.hostnames.api}/${config.apiVersion}/file/upload`}
                                    onInit={this.onUploaderInit}
                                    onFileUploadSuccess={this.onUploadSuccess}
                                    onUploadComplete={this.onUploadComplete}
                                    onSelectMainImage={this.selectMainProfileImage}
                                    mainImage={this.state.mainProfileImage}
                                    defaultImageUrl={placeholderImg}
                                    onImagesLoad={this.onUploaderImagesLoad}
                                    images={this.state.profileImages}
                                    showAddMoreButton={!uploadComplete}/>
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
                                        <Grid>
                                            <Grid.Cell span={isAdmin?5:undefined}>
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
                                            </Grid.Cell>

                                            {isAdmin ? (
                                                <Grid.Cell>
                                                    <Field.Section>
                                                        <Text scale={0.8}>
                                                            <i18n.Translate text="_CREATE_PRODUCT_PAGE_SUPPLY_ON_DEMAND_FIELD_LABEL_" />
                                                        </Text>
                                                        <div>
                                                            <Field.Switch
                                                                name="onDemandSupply"
                                                                value={false}
                                                                scale={1}
                                                                trueLabel="_YES_"
                                                                falseLabel="_NO_" />
                                                        </div>
                                                    </Field.Section>
                                                </Grid.Cell>
                                            ) : <span></span>}
                                        </Grid>
                                    </Field.Section>

                                    <Field.Section>
                                        <Text scale={0.8} block={true}>
                                            <i18n.Translate text="_CREATE_PRODUCT_PAGE_BRAND_FIELD_LABEL_" />

                                            {isAdmin ? (
                                                <div style={{float: "right"}}>
                                                    <span className={styles.fileInputButton}>
                                                        <label htmlFor="brandCSV">CSV Marcas</label>
                                                        <input name="brandCSV" id="brandCSV" type="file" accept=".csv" onChange={this.onCSVInputChange("brands")} style={inputFileStyle} />
                                                    </span>

                                                    <span className={styles.separator}>•</span>

                                                    <span className={styles.fileInputButton}>
                                                        <label htmlFor="companyCSV">CSV Empresas</label>
                                                        <input name="companyCSV" id="companyCSV" type="file" accept=".csv" onChange={this.onCSVInputChange("companies")} style={inputFileStyle} />
                                                    </span>
                                                </div>
                                            ) : null}
                                        </Text>
                                        <div>
                                            <Field.Select
                                                name="brand"
                                                placeholder="_CREATE_PRODUCT_PAGE_BRAND_FIELD_PLACEHOLDER_"
                                                options={brands}
                                                value={brandId}
                                                loadOptions={isAdmin?this.loadBrands:()=>{}}
                                                loading={loadingBrands}
                                                clearSearchOnSelect={true}
                                                creatable={false}
                                                onCreateOption={this.onCreateBrand}
                                                createOptionLabel="_CREATE_PRODUCT_PAGE_BRAND_FIELD_CREATE_OPTION_LABEL_"
                                                multi={false}
                                                scale={1}
                                                searchable={isAdmin}
                                                loaderComponent={<Spinner.CircSide color="#555" />}
                                                validators="$required"/>
                                            <Field.Error
                                                for="brand"
                                                validator="$required"
                                                message="_FIELD_ERROR_REQUIRED_"/>
                                        </div>
                                    </Field.Section>

                                    {brandToCreate ? (
                                        <Field.Section>
                                            <Text scale={0.8}>
                                                <i18n.Translate text="_CREATE_PRODUCT_PAGE_BRAND_OWNERS_FIELD_LABEL_" />
                                            </Text>
                                            <div>
                                                <Field.Select
                                                    name="owners"
                                                    placeholder="_CREATE_PRODUCT_PAGE_BRAND_OWNERS_FIELD_PLACEHOLDER_"
                                                    options={users}
                                                    loadOptions={this.loadUsers}
                                                    loading={loadingUsers}
                                                    clearSearchOnSelect={true}
                                                    creatable={false}
                                                    multi={true}
                                                    scale={1}
                                                    loaderComponent={<Spinner.CircSide color="#555" />}/>
                                                <Field.Error
                                                    for="owners"
                                                    validator="$required"
                                                    message="_FIELD_ERROR_REQUIRED_"/>
                                            </div>
                                        </Field.Section>
                                    ) : null}

                                    <Field.Section>
                                        <Text scale={0.8}>
                                            <i18n.Translate text="_CREATE_PRODUCT_PAGE_DESCRIPTION_FIELD_LABEL_" />
                                        </Text>
                                        <div>
                                            <Field.TextArea
                                                rows={2}
                                                name="description"
                                                placeholder="_CREATE_PRODUCT_PAGE_DESCRIPTION_FIELD_PLACEHOLDER_"
                                                scale={1} />
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
                                                        <Field.Number
                                                            name="stock"
                                                            value={0}
                                                            numDecimals={0}
                                                            placeholder="_CREATE_PRODUCT_PAGE_STOCK_FIELD_PLACEHOLDER_"
                                                            scale={1}/>
                                                    </div>
                                                </Field.Section>
                                            </Grid.Cell>
                                        </Grid>
                                    </Field.Section>

                                    {isAdmin ? (
                                        <Field.Section>
                                            <Text width="100%" scale={0.8}>
                                                <i18n.Translate text="_CREATE_PRODUCT_PAGE_TAGS_FIELD_LABEL_" />

                                                {isAdmin ? (
                                                    <div style={{float: "right"}}>
                                                        <a onClick={this.openNewTagModal} style={{cursor: "pointer"}}>Adicionar</a>

                                                        <span style={{margin: "0px 5px"}}>•</span>

                                                        <span className={styles.fileInputButton}>
                                                            <label htmlFor="tagCSV">CSV Tags</label>
                                                            <input name="tagCSV" id="tagCSV" type="file" accept=".csv" onChange={this.onCSVInputChange("tags")} style={inputFileStyle} />
                                                        </span>
                                                    </div>
                                                ) : null}
                                            </Text>
                                            <div>
                                                <Field.Select
                                                    name="selectedTags"
                                                    placeholder="_CREATE_PRODUCT_PAGE_TAGS_FIELD_PLACEHOLDER_"
                                                    options={tags}
                                                    loading={loadingTags}
                                                    clearSearchOnSelect={true}
                                                    creatable={false}
                                                    multi={true}
                                                    scale={1}
                                                    loaderComponent={<Spinner.CircSide color="#555" />}/>
                                                <Field.Error
                                                    for="selectedTags"
                                                    validator="$required"
                                                    message="_FIELD_ERROR_REQUIRED_"/>
                                            </div>
                                        </Field.Section>
                                    ) : null}

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

                <TagModal open={newTagModalOpen} onComplete={() => {
                    // @TODO : add created tag to tags list.
                    
                    this.setState({newTagModalOpen: false})
                }}/>
            </div>
        )
    }
}

export default withRouter(connect(
    mapStateToProps,
    mapDispatchToProps
)(Component))
