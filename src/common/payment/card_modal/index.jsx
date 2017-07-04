import React from "react";
import lodash from "lodash";
import moment from "moment";
import {LoggerFactory,Redux} from "darch/src/utils";
import Modal from "darch/src/modal";
import i18n from "darch/src/i18n";
import Form from "darch/src/form";
import Field from "darch/src/field";
import Button from "darch/src/button";
import Spinner from "darch/src/spinner";
import Text from "darch/src/text";
import Grid from "darch/src/grid";
import Separator from "darch/src/separator";
import {User} from "common";
import styles from "./styles";

let Logger = new LoggerFactory("checkout.payment.card_modal", {level: "debug"});

/**
 * Main component class.
 */
export default class Component extends React.Component {
    /** React properties **/
    static displayName = "checkout.payment.card_modal";
    static defaultProps = {
        onComplete: () => {},
        onDismiss: () => {},
        open: false
    };

    static propTypes = {
        onComplete: React.PropTypes.func,
        onDismiss: React.PropTypes.func,
        open: React.PropTypes.bool
    };

    state = {
        brand: "bank-card"
    };

    componentDidMount() {
        let logger = Logger.create("componentDidMount");
        logger.info("enter");
    }

    async onSubmit(data) {
        let result,
            logger = Logger.create("onSubmit");

        logger.info("enter", data);

        // Parse data
        let expDateSplits = data.expDate.split("/");
        let holderPhone = data.holderPhone.replace(/[_-]/g,"");
        let holderDocumentNumber = data.holderDocumentNumber.replace(/[\._-]/g,"");

        logger.info("processed", {expDateSplits,holderPhone,holderDocumentNumber});

        let source = {
            method: "credit_card",
            data: {
                expMonth: parseInt(expDateSplits[0].replace(/0/g,"")),
                expYear: parseInt(expDateSplits[1]),
                number: data.number.replace(/ /g,""),
                cvc: parseInt(data.cvc),
                holder: {
                    fullname: data.holderName,
                    birthdate: moment(data.holderBirthdate, "DD/MM/YYYY").toISOString(), // @TODO : Internationalize date format.
                    document: {
                        type: "cpf",
                        number: holderDocumentNumber
                    },
                    phone: {
                        countryCode: "55",
                        areaCode: holderPhone.replace(/^\((\d+)\)\d+$/,"$1"),
                        number: holderPhone.replace(/^\(\d+\)(\d+)$/,"$1")
                    }
                }
            }
        };

        logger.debug("parsed data", source);

        this.setState({loading: true});

        // Do something.
        try {
            result = await Redux.dispatch(User.actions.userAddBillingSource(source));
            logger.info("user actions userAddBillingSource success", result);

            this.setState({loading: false});
        }
        catch(error) {
            logger.error("user actions userAddBillingSource error", error);
            return this.setState({loading: false});
        }

        this.props.onComplete(
            lodash.assign({}, lodash.get(result, "value"), {cvc: data.cvc}), 
            this.props.name
        );
    }

    onFormChange(data) {
        let logger = Logger.create("onFormChange");
        logger.info("enter", data);

        let {number} = data;

        let newSchema = {};

        // Get credit card brand
        if(number) {
            if((/^4/).test(number)) {newSchema.brand = "card-visa";}
            else if((/^3[47]/).test(number)) {newSchema.brand = "card-amex";}
            else if((/^5[1-5]/).test(number)) {newSchema.brand = "card-mastercard";}
            else {newSchema.brand = "bank-card";}
        }
        else {newSchema.brand = "bank-card";}

        this.setState(newSchema);
    }

    render() {
        let {open,onDismiss} = this.props;
        let {loading,brand} = this.state;

        return (
            <Modal open={open} onDismiss={() => {onDismiss("card_modal");}}>
                <Modal.Header>
                    <h3 style={{margin: 0}}>
                        <i18n.Translate text="_CHECKOUT_STEP_PAYMENT_ADD_CARD_MODAL_TITLE_" />
                    </h3>
                </Modal.Header>

                <Form onSubmit={this.onSubmit} loading={loading} onChange={this.onFormChange}>
                    <Modal.Body>
                        <Field.Section>
                            <Text scale={0.8}>
                                <i18n.Translate text="_CHECKOUT_STEP_PAYMENT_ADD_CARD_MODAL_NUMBER_FIELD_LABEL_" />
                            </Text>

                            <div className={styles.numberFieldContainer}>
                                <Field.Text
                                    name="number"
                                    placeholder="_CHECKOUT_STEP_PAYMENT_ADD_CARD_MODAL_NUMBER_FIELD_PLACEHOLDER_"
                                    mask="9999 9999 9999 9999"
                                    scale={1}
                                    validators="$required"/>

                                <div className={styles.brandIconContainer}>
                                    <span className={`icon-${brand}`}></span>
                                </div>
                            </div>

                            <Field.Error for="number"
                                validator="$required"
                                message="_FIELD_ERROR_REQUIRED_"/>
                        </Field.Section>

                        <Field.Section>
                            <Grid>
                                <Grid.Cell>
                                    <Text scale={0.8}>
                                        <i18n.Translate text="_CHECKOUT_STEP_PAYMENT_ADD_CARD_MODAL_EXP_DATE_FIELD_LABEL_" />
                                    </Text>

                                    <Field.Text
                                        name="expDate"
                                        placeholder="_CHECKOUT_STEP_PAYMENT_ADD_CARD_MODAL_EXP_DATE_FIELD_PLACEHOLDER_"
                                        mask="99/99"
                                        scale={1}
                                        validators="$required|card_exp_date"/>

                                    <Field.Error for="expDate"
                                        validator="$required"
                                        message="_FIELD_ERROR_REQUIRED_"/>

                                    <Field.Error for="expDate"
                                        validator="card_exp_date"
                                        message="_FIELD_ERROR_CARD_EXP_DATE_"/>
                                </Grid.Cell>
                                <Grid.Cell>
                                    <Text scale={0.8}>
                                        <i18n.Translate text="_CHECKOUT_STEP_PAYMENT_ADD_CARD_MODAL_CVC_FIELD_LABEL_" />
                                    </Text>

                                    <Field.Text
                                        name="cvc"
                                        placeholder={brand=="card-amex"?"_CHECKOUT_STEP_PAYMENT_ADD_CARD_MODAL_CVC4_FIELD_PLACEHOLDER_":"_CHECKOUT_STEP_PAYMENT_ADD_CARD_MODAL_CVC3_FIELD_PLACEHOLDER_"}
                                        mask={brand=="card-amex"?"9999":"999"}
                                        scale={1}
                                        validators="$required"/>

                                    <Field.Error for="cvc"
                                        validator="$required"
                                        message="_FIELD_ERROR_REQUIRED_"/>
                                </Grid.Cell>
                            </Grid>
                        </Field.Section>

                        <div className={styles.separator}>
                            <Separator.Line>
                                <Separator.Info align="right">
                                    <Text scale={0.8}>Dono do Cartão</Text>
                                </Separator.Info>
                            </Separator.Line>
                        </div>

                        <Field.Section>
                            <Grid>
                                <Grid.Cell>
                                    <Field.Section>
                                        <Text scale={0.8}>
                                            <i18n.Translate text="_CHECKOUT_STEP_PAYMENT_ADD_CARD_MODAL_HOLDER_NAME_FIELD_LABEL_" />
                                        </Text>

                                        <Field.Text
                                            name="holderName"
                                            placeholder="_CHECKOUT_STEP_PAYMENT_ADD_CARD_MODAL_HOLDER_NAME_FIELD_PLACEHOLDER_"
                                            scale={1}
                                            validators="$required"/>

                                        <Field.Error for="holderName"
                                            validator="$required"
                                            message="_FIELD_ERROR_REQUIRED_"/>
                                    </Field.Section>
                                </Grid.Cell>
                                <Grid.Cell>
                                    <Field.Section>
                                        <Text scale={0.8}>
                                            <i18n.Translate text="_CHECKOUT_STEP_PAYMENT_ADD_CARD_MODAL_HOLDER_BIRTHDATE_FIELD_LABEL_" />
                                        </Text>

                                        <Field.Text
                                            name="holderBirthdate"
                                            placeholder="_CHECKOUT_STEP_PAYMENT_ADD_CARD_MODAL_HOLDER_BIRTHDATE_PLACEHOLDER_LABEL_"
                                            mask="99/99/9999"
                                            maskChar="_"
                                            scale={1}
                                            validators="$required|birthdate:DD/MM/YYYY"/>

                                        <Field.Error for="holderBirthdate"
                                            validator="$required"
                                            message="_FIELD_ERROR_REQUIRED_"/>

                                        <Field.Error for="holderBirthdate"
                                            validator="birthdate"
                                            message="_FIELD_ERROR_BIRTHDATE_"/>
                                    </Field.Section>
                                </Grid.Cell>
                            </Grid>
                        </Field.Section>

                        <Field.Section>
                            <Grid>
                                <Grid.Cell>
                                    <Field.Section>
                                        <Text scale={0.8}>
                                            <i18n.Translate text="_CHECKOUT_STEP_PAYMENT_ADD_CARD_MODAL_HOLDER_DOCUMENT_NUMBER_FIELD_LABEL_" /> (CPF)
                                        </Text>

                                        <Field.Text
                                            name="holderDocumentNumber"
                                            placeholder="_CHECKOUT_STEP_PAYMENT_ADD_CARD_MODAL_HOLDER_DOCUMENT_NUMBER_FIELD_PLACEHOLDER_"
                                            mask="999.999.999-99"
                                            maskChar="_"
                                            scale={1}
                                            validators="$required|document_cpf"/>

                                        <Field.Error for="holderDocumentNumber"
                                            validator="$required"
                                            message="_FIELD_ERROR_REQUIRED_"/>

                                        <Field.Error for="holderDocumentNumber"
                                            validator="document_cpf"
                                            message="_FIELD_ERROR_DOCUMENT_CPF_"/>
                                    </Field.Section>
                                </Grid.Cell>

                                <Grid.Cell>
                                    <Field.Section>
                                        <Text scale={0.8}>
                                            <i18n.Translate text="_CHECKOUT_STEP_PAYMENT_ADD_CARD_MODAL_HOLDER_PHONE_FIELD_LABEL_" />
                                        </Text>

                                        <Field.Text
                                            name="holderPhone"
                                            placeholder="_CHECKOUT_STEP_PAYMENT_ADD_CARD_MODAL_HOLDER_PHONE_FIELD_PLACEHOLDER_"
                                            mask="(99)99999-9999"
                                            maskChar="_"
                                            scale={1}
                                            validators="$required|phone"/>

                                        <Field.Error for="holderPhone"
                                            validator="$required"
                                            message="_FIELD_ERROR_REQUIRED_"/>

                                        <Field.Error for="holderPhone"
                                            validator="phone"
                                            message="_FIELD_ERROR_PHONE_"/>
                                    </Field.Section>
                                </Grid.Cell>
                            </Grid>
                        </Field.Section>
                    </Modal.Body>

                    <Modal.Footer align="right">
                        <div className="field-gap">
                            <Button color="danger" onClick={() => {onDismiss("card_modal");}}>
                                <i18n.Translate text="_CANCEL_" format="lower" />
                            </Button>
                        </div>

                        <div className="field-gap">
                            <Button type="submit"
                                loadingComponent={
                                    <span>
                                        <i18n.Translate text="_SAVING_" format="lower" />
                                        <span style={{marginLeft: "5px"}}>
                                            <Spinner.Bars color="#fff" />
                                        </span>
                                    </span>
                                }
                                scale={1}>
                                <i18n.Translate text="_SAVE_" format="lower" />
                            </Button>
                        </div>
                    </Modal.Footer>
                </Form>
            </Modal>
        );
    }
}
