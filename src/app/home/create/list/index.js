import React from "react"
import lodash from "lodash"
import config from "config"
import qs from "qs"
import {connect} from "react-redux"
import {withRouter} from "react-router-dom"
import {LoggerFactory,Redux} from "darch/src/utils"
import Container from "darch/src/container"
import Form from "darch/src/form"
import Field from "darch/src/field"
import i18n from "darch/src/i18n"
import Uploader from "darch/src/uploader"
import Grid from "darch/src/grid"
import Text from "darch/src/text"
import Button from "darch/src/button"
import Spinner from "darch/src/spinner"
import {Api,List,Basket,File,Product} from "common"
import placeholderImg from "assets/images/banner_placeholder.png"
import styles from "./styles"

let Logger = new LoggerFactory("create.list")

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
        listData: state.list.data,
        listNameIdToId: state.list.nameIdToId,
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
    static displayName = "create.brand";
    static defaultProps = {};
    static propTypes = {};

    state = {
    };

    getScopeData(props=this.props) {
        let result = {},
            {fileData,listData,listNameIdToId} = props,
            query = qs.parse(lodash.get(props, "location.search")),
            fromListNameId = query.from

        result.fromListNameId = fromListNameId

        if(fromListNameId) {
            result.fromList = listNameIdToId[fromListNameId] ?
                listData[listNameIdToId[fromListNameId]] :
                null

            result.bannerImage = result.fromList ? 
                fileData[result.fromList.bannerImage] :
                null
        }

        return result
    }

    async componentDidMount() {
        let newState = {initializing: false},
            logger = Logger.create("componentDidMount"),
            {fromListNameId,fromList} = this.getScopeData()

        logger.info("enter")

        // Retrieve auth token for uploader component.
        try {
            newState.authToken = await Api.shared.http.getAuthToken()
        }
        catch(error) {
            logger.error("api http getAuthToken error", error)
        }

        // Let's fetch non fetched list
        if(fromListNameId && !fromList) {
            this.setState({initializing: true})
            logger.debug("list not fetched yet")

            let result = await Redux.dispatch(
                List.actions.listFindByNameId(fromListNameId, null, {
                    populate: {
                        paths: [
                            "bannerImage",
                            "items[].product",
                            "items[].product.mainProfileImage",
                            "items[].product.tags"
                        ]
                    }
                })
            )

            fromList = lodash.get(result, "value.data")
        }
        // Let's ensure that fetched record is populated with necessary data.
        else if(fromListNameId && fromList) {
            List.populator.populate(
                [fromList], 
                {
                    paths:[
                        "bannerImage",
                        "items[].product",
                        "items[].product.mainProfileImage",
                        "items[].product.tags"
                    ]
                }
            )
        }

        Redux.dispatch(Basket.actions.basketSetShowCard(false))

        this.setState(newState)
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

            logger.debug("api userFind success", response)

            // Process users
            let users = response.results.map((user) => {
                return {value: user._id, label: user.email}
            })

            this.setState({users, loadingUsers: false})
        }
        catch(error) {
            logger.error("api userFind error", error)
            this.setState({loadingUsers: false})
        }
    }

    /**
     * This function submits the create form.
     */
    onSubmit(data) {
        let {fromList,bannerImage} = this.getScopeData(),
            logger = Logger.create("onSubmit")

        logger.info("enter", data)

        this.setState({loading: true})

        // Register data
        this.data = lodash.merge({}, data, this.data)

        // Process public status.
        this.data.status = this.data.public ? "public" : "private"
        delete this.data.public

        // Process owners
        let owners = []

        for(let uid of this.data.owners||[]) {
            // Do not include self user.
            if(uid == this.props.uid) {continue}
            owners.push({user: uid})
        }

        this.data.owners = owners

        // Process products of fromList.
        if(fromList) {
            this.data.items = lodash.cloneDeep(fromList.items)
        }

        if(bannerImage && (!this.flow.files||!this.flow.files.length)) {
            this.data.bannerImage = bannerImage._id
        }

        console.log(["ruanda cabuanda", this.data])

        if(!this.data.bannerImage || this.state.uploadComplete) {
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

    onUploaderImageLoad(image) {
        this.setState({bannerImage: image})
    }

    onUploadStart() {
        let logger = Logger.create("onUploadStart")
        logger.info("enter")
    }

    async onUploadSuccess(file, fid) {
        let logger = Logger.create("onUploadSuccess")
        logger.info("enter", {file, fid})

        this.data.bannerImage = file._id

        // Add file to store
        Redux.dispatch(
            File.actions.fileAdd(file)
        )
    }

    async onUploadComplete() {
        let response,
            logger = Logger.create("onUploadComplete")

        // Mark upload as completed
        this.setState({uploadComplete: true})

        // Save brand.
        try {
            response = await Redux.dispatch(List.actions.listCreate(this.data))
            logger.info("action listCreate success", response)
        }
        catch(error) {
            this.setState({loading: false})
            return logger.error("api listCreate error", error)
        }

        // Go to list page
        //this.props.router.replace(`/list/${response.result.nameId}`);
        this.props.history.replace("/lists")
    }

    render() {
        let bannerImageUrl
        let {fromList,bannerImage} = this.getScopeData()
        let {user,productData} = this.props
        let {loading,users,loadingUsers} = this.state
        let isAdmin = user && user.roles.indexOf("admin") >= 0

        fromList = fromList || {}

        if(bannerImage) {
            bannerImageUrl = `//${config.hostnames.file}/images/${bannerImage.path}`
        }

        return (
            <div>
                <Container size="sm">
                    <Form loading={loading}
                        onSubmit={this.onSubmit}>

                        <h3 className="headline">
                            <i18n.Translate text="_CREATE_LIST_PAGE_TITLE_" />

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
                                    scale={0.8}>
                                    <i18n.Translate text="_CREATE_LIST_PAGE_SUBMIT_BUTTON_TEXT_" />
                                </Button>
                            </div>
                        </h3>

                        {this.state.authToken ? (
                            <div className={styles.bannerContainer}>
                                <Text scale={0.8}>
                                    <i18n.Translate text="_CREATE_LIST_PAGE_BANNER_IMAGE_FIELD_LABEL_" />
                                </Text>
                                <Uploader.Banner authToken={this.state.authToken} targetUrl={`//${config.hostnames.api}/${config.apiVersion}/file/upload`}
                                    onInit={this.onUploaderInit}
                                    onFileUploadSuccess={this.onUploadSuccess}
                                    onUploadComplete={this.onUploadComplete}
                                    image={this.state.bannerImage}
                                    defaultImageUrl={bannerImageUrl?bannerImageUrl:placeholderImg}
                                    onImageLoad={this.onUploaderImageLoad}
                                    width="100%"
                                    height="200px"/>
                            </div>
                        ) : null}

                        <Field.Section>
                            <Grid>
                                <Grid.Cell span={4}>
                                    <Field.Section>
                                        <Text scale={0.8}>
                                            <i18n.Translate text="_CREATE_LIST_PAGE_NAME_FIELD_LABEL_" />
                                        </Text>
                                        <div>
                                            <Field.Text
                                                name="name"
                                                placeholder="_CREATE_LIST_PAGE_NAME_FIELD_PLACEHOLDER_"
                                                scale={1}
                                                value={fromList.name}
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
                                        <Text scale={0.8}>
                                            <i18n.Translate text="_CREATE_LIST_PAGE_PUBLIC_FIELD_LABEL_" />
                                        </Text>
                                        <Field.Section>
                                            <Field.Switch
                                                name="public"
                                                scale={1}
                                                trueLabel="_YES_"
                                                falseLabel="_NO_" />
                                        </Field.Section>
                                    </Grid.Cell>
                                ) : <span></span>}
                            </Grid>
                        </Field.Section>

                        <Field.Section>
                            <Text scale={0.8}>
                                <i18n.Translate text="_CREATE_LIST_PAGE_USERS_FIELD_LABEL_" />
                            </Text>
                            <div>
                                <Field.Select
                                    name="owners"
                                    placeholder="_CREATE_LIST_PAGE_USERS_FIELD_PLACEHOLDER_"
                                    options={users}
                                    loadOptions={this.loadUsers}
                                    loading={loadingUsers}
                                    clearSearchOnSelect={true}
                                    creatable={false}
                                    multi={true}
                                    scale={1}
                                    loaderComponent={<Spinner.CircSide color="#555" />}/>
                                <Field.Error
                                    for="users"
                                    validator="$required"
                                    message="_FIELD_ERROR_REQUIRED_"/>
                            </div>
                        </Field.Section>

                        <Field.Section>
                            <Text scale={0.8}>
                                <i18n.Translate text="_CREATE_LIST_PAGE_DESCRIPTION_FIELD_LABEL_" />
                            </Text>
                            <div>
                                <Field.TextArea
                                    rows={3}
                                    name="description"
                                    placeholder="_CREATE_LIST_PAGE_DESCRIPTION_FIELD_PLACEHOLDER_"
                                    value={fromList.description}
                                    scale={1}/>
                            </div>
                        </Field.Section>

                        {fromList.items ? (
                            <Field.Section>
                                <div className={styles.itemsContainer}>
                                    <h5 className="headline">
                                        <i18n.Translate text="_CREATE_LIST_PAGE_ITEMS_TITLE_" />
                                    </h5>

                                    <div>
                                        <Grid spots={3} noGap={true} bordered={true}>
                                            {fromList.items && fromList.items.length ? (
                                                fromList.items.map((item) => {
                                                    let product = productData[item.product]

                                                    return product && product.stock > 0 ? (
                                                        <Grid.Cell key={product._id} span={1}>
                                                            <Product.Card showBasketQuantity={false} 
                                                                quantity={item.quantity} 
                                                                data={product}
                                                                canEditQuantity={false}
                                                            />
                                                        </Grid.Cell>
                                                    ) : <span key={item.product}></span>
                                                })
                                            ) : null}
                                        </Grid>
                                    </div>
                                </div>
                            </Field.Section>
                        ) : null}
                    </Form>
                </Container>
            </div>
        )
    }
}

export default withRouter(connect(
    mapStateToProps,
    mapDispatchToProps
)(Component))
