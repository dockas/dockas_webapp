import React from "react"
import lodash from "lodash"
import qs from "qs"
import {Link,withRouter} from "react-router-dom"
import {LoggerFactory,Redux} from "darch/src/utils"
import Form from "darch/src/form"
import Field from "darch/src/field"
import Button from "darch/src/button"
import Container from "darch/src/container"
import Grid from "darch/src/grid"
import i18n from "darch/src/i18n"
import Spinner from "darch/src/spinner"
import notAuthPol from "policies/not_auth"
import styles from "./styles"
import logo from "assets/images/logo_icon_100x100.png"
import {Auth,Tracker} from "common"

let Logger = new LoggerFactory("signin", {level: "debug"})

/**
 * Main component class.
 */
class Component extends React.Component {
    /** React properties **/
    static displayName = "signin";
    static defaultProps = {};
    static propTypes = {};

    /** Instance properties **/
    state = {};

    /**
     * LYFECICLE : This function is called when component
     * got mounted in the view.
     */
    async componentDidMount() {
        let {history} = this.props,
            logger = Logger.create("componentDidMount")

        logger.info("enter")

        // Clear cache.
        Redux.dispatch(Auth.actions.signinPageOpened())

        // Initialized
        try {
            await notAuthPol(history)
        }
        catch(error) {
            return logger.error("notAuthPol error", error)
        }

        this.setState({initialized: true})
    }

    /**
     * This function submits the login form.
     */
    async onSubmit(data) {
        let logger = Logger.create("onSubmit")
        logger.info("enter", {data})

        this.setState({loading: true})

        // Dispatch signin action
        let response = await Redux.dispatch(
            Auth.actions.signin({
                email: data.email,
                password: data.password
            })
        )

        Tracker.track("signin success", {email: data.email})

        logger.debug("Auth signin action success", response)

        let query = qs.parse((lodash.get(this.props, "location.search")||"").substr(1))

        console.log(["cole maluco maluco", query])

        // Redirect
        this.props.history.replace(query.redirect||"/")

        /*try {
            // Dispatch signin action
            let response = await Redux.dispatch(
                Auth.actions.signin({
                    email: data.email,
                    password: data.password
                })
            )

            Tracker.track("signin success", {email: data.email})

            logger.debug("Auth signin action success", response)

            let {query} = this.props.location

            // Redirect
            this.props.history.replace(query.redirect||"/")
        }
        catch(error) {
            logger.error("signin process error", error)

            Tracker.track("signin error", {email: data.email})

            this.setState({loading: false})
        }*/
    }

    /**
     * This function is responsible for generating the component's view.
     */
    render() {
        let {initialized} = this.state

        return initialized ? (
            <div className={styles.page}>
                <Container>
                    <Grid>
                        <Grid.Cell></Grid.Cell>

                        <Grid.Cell span={1}>
                            <div className={styles.logoContainer}>
                                <img className={styles.logo} src={logo} />
                            </div>

                            <div className={styles.box}>
                                <Form loading={this.state.loading}
                                    onSubmit={this.onSubmit}>
                                    <Field.Section>
                                        <div className={styles.label}>
                                            <i18n.Translate text="_LOGIN_FIELD_LABEL_" />
                                        </div>
                                        <Field.Text
                                            name="email"
                                            placeholder="_LOGIN_FIELD_PLACEHOLDER_"
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
                                        <Field.Text
                                            type="password"
                                            name="password"
                                            placeholder="_PASSWORD_FIELD_PLACEHOLDER_"
                                            scale={1.5}
                                            validators="$required"/>
                                        <Field.Error
                                            for="password"
                                            validator="$required"
                                            message="_FIELD_ERROR_REQUIRED_"/>
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
                                                scale={1.3}>
                                                <i18n.Translate text="_SIGNIN_" />
                                            </Button>
                                        </div>
                                        <Link to="/signup" style={{textDecoration: "none", marginTop: "10px", display: "inline-block"}}><i18n.Translate text="_CREATE_ACCOUNT_TEXT_" /></Link>
                                    </Field.Section>
                                </Form>
                            </div>
                        </Grid.Cell>

                        <Grid.Cell></Grid.Cell>
                    </Grid>
                </Container>
            </div>
        ) : null
    }
}

/**
 * Export component
 */
export default withRouter(Component)
