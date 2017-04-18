import React from "react";
import {LoggerFactory,Form,Field,Button,Container,Grid,i18n,Spinner,Redux} from "darch/src";
import {Auth,Api} from "common";
import logoIcon from "assets/images/logo_icon.png";
import styles from "./styles";

let Logger = new LoggerFactory("signup.step1", {level: "debug"});

/**
 * Main component class.
 */
export default class Component extends React.Component {
    /** React properties **/
    static displayName = "signup.step1";
    static defaultProps = {
        onComplete: () => {}
    };
    static propTypes = {
        onComplete: React.PropTypes.func.isRequired
    };

    /** Instance properties **/
    state = {};

    /**
     * LYFECICLE : This function is called when component
     * got mounted in the view.
     */
    componentDidMount() {
        let logger = Logger.create("componentDidMount");
        logger.info("enter");
    }

    /**
     * This function submits the login form.
     */
    async onSubmit(data) {
        let logger = Logger.create("onSubmit");
        logger.info("enter", {data});

        this.setState({loading: true});

        try {
            // Signs the user up.
            let signupResponse = await Api.shared.signup(data);

            logger.debug("Api signup success", signupResponse);

            // Dispatch signin action
            let signinResponse = await Redux.dispatch(
                Auth.actions.signin({
                    nickOrEmail: data.email,
                    password: data.password
                })
            );

            logger.debug("Auth signin action success", signinResponse);

            // This step is now completed.
            this.props.onComplete();
        } catch(error) {
            logger.error("signup process error", error);
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

                        <Grid.Cell span={1.2}>
                            <div className={styles.logoContainer}>
                                <img className={styles.logo} src={logoIcon} />
                            </div>

                            <div className={styles.box}>
                                <Form loading={this.state.loading}
                                    onSubmit={this.onSubmit}>
                                    <Field.Section>
                                        <div className={styles.label}>
                                            <i18n.Translate text="_FULLNAME_FIELD_LABEL_" />
                                        </div>
                                        <Field.Text
                                            name="fullName"
                                            placeholder="_FULLNAME_FIELD_PLACEHOLDER_"
                                            scale={1.5}
                                            validators="$required"/>
                                        <Field.Error
                                            for="fullName"
                                            validator="$required"
                                            message="_FIELD_ERROR_REQUIRED_"/>
                                    </Field.Section>

                                    <Field.Section>
                                        <div className={styles.label}>
                                            <i18n.Translate text="_EMAIL_FIELD_LABEL_" />
                                        </div>
                                        <Field.Text
                                            name="email"
                                            placeholder="_EMAIL_FIELD_PLACEHOLDER_"
                                            scale={1.5}
                                            validators="$required|$email"/>
                                        <Field.Error
                                            for="email"
                                            validator="$required"
                                            message="_FIELD_ERROR_REQUIRED_"/>
                                        <Field.Error
                                            for="email"
                                            validator="$email"
                                            message="_FIELD_ERROR_EMAIL_"/>
                                    </Field.Section>

                                    <Field.Section>
                                        <div className={styles.label}>
                                            <i18n.Translate text="_PASSWORD_FIELD_LABEL_" />
                                        </div>
                                        <Field.Password
                                            name="password"
                                            placeholder="_PASSWORD_FIELD_PLACEHOLDER_"
                                            unmaskLabel="_UNMASK_PASSWORD_LABEL"
                                            maskLabel="_MASK_PASSWORD_LABEL"
                                            scale={1.5}
                                            validators="$required"/>
                                    </Field.Section>

                                    {/*<Field.Section>
                                        
                                        <Field.Text
                                            name="nickName"
                                            value="test"
                                            placeholder="_NICKNAME_FIELD_PLACEHOLDER_"
                                            scale={1.5}
                                            preventValidateOnMount={false}
                                            validators={["$required", {
                                                name: "check",
                                                on: "blur",
                                                validate: (value) => {
                                                    console.log("CHECK VALIDATE", value);

                                                    return new Promise((resolve) => {
                                                        setTimeout(() => {
                                                            resolve(value != "bruno");
                                                        }, 5000);
                                                    });
                                                }
                                            }]}/>
                                    </Field.Section>*/}

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
                                                <i18n.Translate text="_SIGNUP_" />
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
