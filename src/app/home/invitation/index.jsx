/* global mixpanel */

import React from "react";
import {LoggerFactory} from "darch/src/utils";
import Form from "darch/src/form";
import Field from "darch/src/field";
import Container from "darch/src/container";
import Spinner from "darch/src/spinner";
import i18n from "darch/src/i18n";
import Button from "darch/src/button";
import {Api} from "common";
import styles from "./styles";

let Logger = new LoggerFactory("invitation");

/**
 * Main component class.
 */
export default class Component extends React.Component {
    /** React properties **/
    static displayName = "invitation";
    static defaultProps = {};
    static propTypes = {};

    state = {};

    componentDidMount() {
        let logger = Logger.create("componentDidMount");
        logger.info("enter");
    }

    async onSubmit(data) {
        let logger = Logger.create("onSubmit");
        logger.info("enter", data);

        this.setState({loading: true});

        try {
            let response = await Api.shared.invitationCreate(data);
            logger.info("api invitationCreate success", response);

            mixpanel.track("invitation requested");

            this.setState({loading: false, success: true});
        }
        catch(error) {
            this.setState({loading: false});
        }
    }

    render() {
        return (
            <div>
                <Container size="md">
                    <h2><i18n.Translate text="_INVITATION_PAGE_TITLE_" /></h2>

                    {!this.state.success ? (
                        <div>
                            <div><i18n.Translate text="_INVITATION_PAGE_BODY_TEXT_" /></div>

                            <div className={styles.formContainer}>
                                <Form loading={this.state.loading}
                                    onSubmit={this.onSubmit}>
                                    <Field.Section>
                                        <Field.Text
                                            name="email"
                                            placeholder="_INVITATION_PAGE_EMAIL_FIELD_PLACEHOLDER_"
                                            scale={1.5}
                                            validators="required"/>
                                        <Field.Error
                                            for="test"
                                            validator="required|email"
                                            message="_FIELD_ERROR_REQUIRED_"/>
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
        );
    }
}
