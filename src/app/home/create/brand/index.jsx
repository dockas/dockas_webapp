import React from "react";
import lodash from "lodash";
import config from "config";
import {connect} from "react-redux";
import {withRouter} from "react-router";
import {LoggerFactory} from "darch/src/utils";
import Container from "darch/src/container";
import Form from "darch/src/form";
import Field from "darch/src/field";
import i18n from "darch/src/i18n";
import Uploader from "darch/src/uploader";
import Grid from "darch/src/grid";
import Text from "darch/src/text";
import Button from "darch/src/button";
import Spinner from "darch/src/spinner";
import {Api} from "common";
import placeholderImg from "assets/images/placeholder.png";
import styles from "./styles";

let Logger = new LoggerFactory("create.brand");

/**
 * Redux map state to props function.
 *
 * @param {object} state
 * @param {object} ownProps
 */
function mapStateToProps(state) {
    return {
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
    static displayName = "create.brand";
    static defaultProps = {};
    static propTypes = {};

    state = {
        profileImages: [],
        mainProfileImage: null
    };

    async componentDidMount() {
        let newState = {},
            logger = Logger.create("componentDidMount");

        logger.info("enter");

        // Retrieve auth token for uploader component.
        try {
            newState.authToken = await Api.shared.http.getAuthToken();
        }
        catch(error) {
            logger.error("api http getAuthToken error", error);
        }

        this.setState(newState);
    }

    /**
     * This function loads users.
     */
    async loadUsers(value) {
        let logger = Logger.create("loadUsers");
        logger.info("enter", {value});

        if(lodash.isEmpty(value)) {return;}

        this.setState({loadingUsers: true});

        try {
            let response = await Api.shared.userFind({
                email: value
            });

            logger.debug("api userFind success", response);

            // Process users
            let users = response.results.map((user) => {
                return {value: user._id, label: user.email};
            });

            this.setState({users, loadingUsers: false});
        }
        catch(error) {
            logger.error("api userFind error", error);
            this.setState({loadingUsers: false});
        }
    }

    onUploaderInit(flow) {
        let logger = Logger.create("onUploaderInit");
        logger.info("enter");

        this.flow = flow;
    }

    onUploaderImagesLoad(images) {
        let profileImages = this.state.profileImages.concat(images);

        this.setState({
            profileImages,
            mainProfileImage: this.state.mainProfileImage || profileImages[0]
        });
    }

    /**
     * This function submits the create form.
     */
    onSubmit(data) {
        let logger = Logger.create("onSubmit");
        logger.info("enter", data);

        this.setState({loading: true});

        // Register data
        this.data = lodash.merge({}, data, this.data);

        // Process owners
        let owners = [];
        
        for(let uid of this.data.owners||[]) {
            // Do not include self user.
            if(uid == this.props.uid) {continue;}
            owners.push({user: uid});
        }

        this.data.owners = owners;

        if(this.state.uploadComplete) {
            return this.onUploadComplete();
        }

        // Start uploading photo.
        this.flow.upload();
    }

    onUploadStart() {
        let logger = Logger.create("onUploadStart");
        logger.info("enter");
    }

    async onUploadSuccess(fileData, fid) {
        let logger = Logger.create("onUploadSuccess");
        logger.info("enter", {fileData, fid});

        //this.data.mainImage = fileData._id;
        this.data.profileImages = this.data.profileImages || [];
        this.data.profileImages.push(fileData._id);

        if(lodash.get(this.state, "mainProfileImage._id") == fid) {
            this.data.mainProfileImage = fileData._id;
        }
    }

    async onUploadComplete() {
        let response,
            logger = Logger.create("onUploadComplete");

        // Mark upload as completed
        this.setState({uploadComplete: true});

        // Save brand.
        try {
            response = await Api.shared.brandCreate(this.data);
            logger.info("action brandCreate success", response);
        }
        catch(error) {
            this.setState({loading: false});
            return logger.error("api brandCreate error", error);
        }

        // Go to brand page
        this.props.router.replace(`/brand/${response.result.nameId}`);
    }

    selectMainProfileImage(image) {
        this.setState({mainProfileImage: image});
    }

    render() {
        let {
            authToken,mainProfileImage,profileImages,
            loading,users,loadingUsers, uploadComplete
        } = this.state;

        return (
            <div>
                <Container size="md">
                    <h3 className="headline">
                        <i18n.Translate text="_CREATE_BRAND_PAGE_TITLE_" />
                    </h3>
                    <Grid>
                        <Grid.Cell>
                            {authToken ? (
                                <Uploader.Main authToken={authToken} targetUrl={`//${config.hostnames.api}/${config.apiVersion}/file/upload`}
                                    uploadOnSubmitted={false}
                                    onInit={this.onUploaderInit}
                                    onFileUploadSuccess={this.onUploadSuccess}
                                    onUploadComplete={this.onUploadComplete}
                                    onSelectMainImage={this.selectMainProfileImage}
                                    defaultImageUrl={placeholderImg}
                                    mainImage={mainProfileImage}
                                    onImagesLoad={this.onUploaderImagesLoad}
                                    images={profileImages}
                                    showAddMoreButton={!uploadComplete}/>
                            ) : null}
                        </Grid.Cell>

                        <Grid.Cell span={4}>
                            <div className={styles.formContainer}>
                                <Form loading={loading}
                                    onSubmit={this.onSubmit}>

                                    <Field.Section>
                                        <Grid>
                                            <Grid.Cell>
                                                <Field.Section>
                                                    <Text scale={0.8}>
                                                        <i18n.Translate text="_CREATE_BRAND_PAGE_NAME_FIELD_LABEL_" />
                                                    </Text>
                                                    <div>
                                                        <Field.Text
                                                            name="name"
                                                            placeholder="_CREATE_BRAND_PAGE_NAME_FIELD_PLACEHOLDER_"
                                                            scale={1}
                                                            validators="$required"/>
                                                        <Field.Error
                                                            for="name"
                                                            validator="$required"
                                                            message="_FIELD_ERROR_REQUIRED_"/>
                                                    </div>
                                                </Field.Section>
                                            </Grid.Cell>

                                            {/*<Grid.Cell>
                                                <Field.Section>
                                                    <Text scale={0.8}>
                                                        <i18n.Translate text="_CREATE_BRAND_PAGE_NAME_ID_FIELD_LABEL_" />
                                                    </Text>
                                                    <div>
                                                        <Field.Text
                                                            name="nameId"
                                                            placeholder="_CREATE_BRAND_PAGE_NAME_ID_FIELD_PLACEHOLDER_"
                                                            scale={1}
                                                            validators="id|brand_name_id|$required"/>
                                                        <Field.Error
                                                            for="nameId"
                                                            validator="id"
                                                            message="_FIELD_ERROR_ID_"/>
                                                        <Field.Error
                                                            for="nameId"
                                                            validator="brand_name_id"
                                                            message="_FIELD_BRAND_NAME_ID_"/>
                                                        <Field.Error
                                                            for="nameId"
                                                            validator="$required"
                                                            message="_FIELD_ERROR_REQUIRED_"/>
                                                    </div>
                                                </Field.Section>
                                            </Grid.Cell>*/}
                                        </Grid>
                                    </Field.Section>

                                    <Field.Section>
                                        <Text scale={0.8}>
                                            <i18n.Translate text="_CREATE_BRAND_PAGE_OWNERS_FIELD_LABEL_" />
                                        </Text>
                                        <div>
                                            <Field.Select
                                                name="owners"
                                                placeholder="_CREATE_BRAND_PAGE_OWNERS_FIELD_PLACEHOLDER_"
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

                                    <Field.Section>
                                        <Text scale={0.8}>
                                            <i18n.Translate text="_CREATE_BRAND_PAGE_DESCRIPTION_FIELD_LABEL_" />
                                        </Text>
                                        <div>
                                            <Field.TextArea
                                                rows={3}
                                                name="description"
                                                placeholder="_CREATE_BRAND_PAGE_DESCRIPTION_FIELD_PLACEHOLDER_"
                                                scale={1}
                                                validators="$required"/>
                                            <Field.Error
                                                for="description"
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
                                                <i18n.Translate text="_CREATE_BRAND_PAGE_SUBMIT_BUTTON_TEXT_" />
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

export default withRouter(connect(
    mapStateToProps,
    mapDispatchToProps
)(Component));

