import React from "react";
import {connect} from "react-redux";
import {LoggerFactory,Container,Grid,Form,Field,i18n,Button,Spinner,Redux} from "darch/src";
import {User,Api} from "common";
import logoIcon from "assets/images/logo_icon.png";
import styles from "./styles";

let Logger = new LoggerFactory("signup.step2");

/**
 * Redux map state to props function.
 *
 * @param {object} state
 * @param {object} ownProps
 */
function mapStateToProps(state) {
    return {
        profile: state.user.profiles[state.user.uid]
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
    static displayName = "signup.step2";
    static defaultProps = {
        onComplete: () => {}
    };
    static propTypes = {
        onComplete: React.PropTypes.func
    };

    /** Instance properties **/
    state = {};

    /**
     * LYFECICLE : This function is called when component
     * got mounted in the view.
     */
    componentDidMount() {
        let logger = Logger.create("componentDidMount");
        logger.info("enter", {user: this.props.user});
    }

    /**
     * This function submits the form.
     */
    async onSubmit(data) {
        let logger = Logger.create("onSubmit");
        logger.info("enter", {data});

        // User does not modify nickName
        if(data.nickName == this.props.profile.nickName) {
            return this.props.onComplete();
        }

        this.setState({loading: true});

        try {
            // Update user nickName
            await Redux.dispatch(
                User.actions.userUpdate(data)
            );

            logger.debug("userUpdate succes");

            this.props.onComplete();
        }
        catch(error) {
            logger.error("userUpdate error", error);
            this.setState({loading: false});
        }
    }

    /**
     * This function is responsible for generating the component's view.
     */
    render() {
        return (
            <div className={styles.page}>
                <Container>
                    <Grid>
                        <Grid.Cell></Grid.Cell>
                        <Grid.Cell span={1}>
                            <div className={styles.logoContainer}>
                                <img className={styles.logo} src={logoIcon} />
                            </div>

                            <div className={styles.box}>
                                <div className={styles.text1}>
                                    <i18n.Translate text="_SIGNUP_STEP_2_TEXT_1_" data={this.props.profile}/>
                                </div>

                                <Form loading={this.state.loading}
                                    onSubmit={this.onSubmit}>
                                    <Field.Section>
                                        <div className={styles.label}>
                                            <i18n.Translate text="_NICKNAME_FIELD_LABEL_" />
                                        </div>
                                        <Field.Text
                                            name="nickName"
                                            value={this.props.profile.nickName}
                                            placeholder="_NICKNAME_FIELD_PLACEHOLDER_"
                                            scale={1.5}
                                            preventValidateOnMount={true}
                                            validators={["$required", {
                                                name: "check",
                                                on: "blur",
                                                validate: (value) => {
                                                    console.log("VALIDATE", value);

                                                    return Api.shared.userNickNameCheck({nickName: value})
                                                    .then((response) => {
                                                        return response.result;
                                                    });
                                                }
                                            }]}/>
                                        <Field.Error
                                            for="nickName"
                                            validator="$required"
                                            message="_FIELD_ERROR_REQUIRED_"/>
                                        <Field.Error
                                            for="nickName"
                                            validator="check"
                                            message="_FIELD_ERROR_NICKNAME_CHECK_"/>
                                    </Field.Section>

                                    <Field.Section>
                                        <div className={styles.buttonContainer}>
                                            <Button type="submit"
                                                loadingComponent={
                                                    <span>
                                                        <i18n.Translate text="_LOADING_" />
                                                        <span className={styles.spinnerContainer}>
                                                            <Spinner.CircSide color="#fff" />
                                                        </span>
                                                    </span>
                                                }
                                                scale={1.3}>
                                                <i18n.Translate text="_CONTINUE_" />
                                            </Button>
                                        </div>
                                    </Field.Section>
                                </Form>
                            </div>
                        </Grid.Cell>
                        <Grid.Cell></Grid.Cell>
                    </Grid>
                </Container>
            </div>
        );
    }
}

/** Export **/
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Component);
