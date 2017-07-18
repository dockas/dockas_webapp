import React from "react"
import {withRouter} from "react-router-dom"
import {LoggerFactory,Redux} from "darch/src/utils"
import Form from "darch/src/form"
import Field from "darch/src/field"
import Container from "darch/src/container"
import Spinner from "darch/src/spinner"
import i18n from "darch/src/i18n"
import Button from "darch/src/button"
import Text from "darch/src/text"
import notAuthPol from "policies/not_auth"
import {Api,Basket,Tracker} from "common"
import styles from "./styles"

let Logger = new LoggerFactory("invitation")

/**
 * Main component class.
 */
class Component extends React.Component {
    /** React properties **/
    static displayName = "invitation";
    static defaultProps = {};
    static propTypes = {};

    state = {};

    async componentDidMount() {
        let {history} = this.props,
            logger = Logger.create("componentDidMount")

        logger.info("enter")

        Redux.dispatch(Basket.actions.basketSetShowCard(false))

        // Initialize
        try {
            await notAuthPol(history)
        }
        catch(error) {
            return logger.error("notAuthPol error", error)
        }

        this.setState({initialized: true})
    }

    async onSubmit(data) {
        let logger = Logger.create("onSubmit")
        logger.info("enter", data)

        if(!this.state.postalCodeAddress) {return}

        this.setState({loading: true})

        data.postalCodeAddress = this.state.postalCodeAddress
        delete data.postal_code

        try {
            let response = await Api.shared.invitationCreate(data)
            logger.info("api invitationCreate success", response)

            Tracker.track("invitation requested", data)

            this.setState({loading: false, success: true})
        }
        catch(error) {
            this.setState({loading: false})
        }
    }

    async onChange(data) {
        let logger = Logger.create("onChange")
        logger.info("enter", data)
    }

    render() {
        let {postalCodeAddress,loadingPostalCodeAddress,initialized} = this.state

        return initialized ? (
            <div>
                <Container size="md">
                    <h2><i18n.Translate text="_INVITATION_PAGE_TITLE_" /></h2>

                    {!this.state.success ? (
                        <div>
                            <div><i18n.Translate text="_INVITATION_PAGE_BODY_TEXT_" /></div>

                            <div className={styles.formContainer}>
                                <Form loading={this.state.loading}
                                    onSubmit={this.onSubmit}
                                    onChange={this.onChange}>
                                    <Field.Section>
                                        <div><Text scale={0.8}><i18n.Translate text="_INVITATION_PAGE_EMAIL_FIELD_LABEL_" /></Text></div>
                                        <Field.Text
                                            name="email"
                                            placeholder="_INVITATION_PAGE_EMAIL_FIELD_PLACEHOLDER_"
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
                                        <div>
                                            <Text scale={0.8}><i18n.Translate text="_INVITATION_PAGE_POSTAL_CODE_FIELD_LABEL_" /></Text>
                                            {loadingPostalCodeAddress?<span style={{marginLeft: "5px"}}><Spinner.CircSide scale={0.7} /></span>:null}
                                        </div>
                                        <Field.Text
                                            name="postal_code"
                                            placeholder="_INVITATION_PAGE_POSTAL_CODE_FIELD_PLACEHOLDER_"
                                            mask="99999-999"
                                            maskChar="_"
                                            scale={1.5}
                                            validators="$required|cep"
                                            onValidationStart={(validator) => {
                                                //console.log("@@@ onValidationStart", {validator});

                                                if(validator == "cep") { this.setState({loadingPostalCodeAddress: true}) }
                                            }}
                                            onValidationEnd={(validator, result) => {
                                                //console.log("@@@ onValidationEnd", {validator, result});
                                                if(validator == "cep") {
                                                    this.setState({
                                                        loadingPostalCodeAddress: false,
                                                        postalCodeAddress: result.data
                                                    })
                                                }
                                            }}/>

                                        {postalCodeAddress ? (
                                            <Text color="#aaaaaa" scale={0.8}>{postalCodeAddress.street}, {postalCodeAddress.city} - {postalCodeAddress.state}</Text>
                                        ) : null}

                                        <Field.Error
                                            for="postal_code"
                                            validator="$required"
                                            message="_FIELD_ERROR_REQUIRED_"/>
                                        <Field.Error
                                            for="postal_code"
                                            validator="cep"
                                            message="_FIELD_ERROR_POSTAL_CODE_"/>
                                    </Field.Section>

                                    <Field.Section>
                                        <div className={styles.buttonContainer}>
                                            <Button type="submit"
                                                loadingComponent={
                                                    <span>
                                                        <i18n.Translate text="_SENDING_" />
                                                        <span className={styles.spinnerContainer}>
                                                            <Spinner.Bars color="#fff" />
                                                        </span>
                                                    </span>
                                                }
                                                scale={1.3}>
                                                <i18n.Translate text="_INVITATION_PAGE_SEND_BUTTON_TEXT_" />
                                            </Button>
                                        </div>
                                    </Field.Section>
                                </Form>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <div><i18n.Translate text="_INVITATION_PAGE_SUCCESS_BODY_TEXT_" /></div>
                        </div>
                    )}
                </Container>
            </div>
        ) : null
    }
}

/** Export **/
export default withRouter(Component)
