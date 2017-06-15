import React from "react";
import {LoggerFactory,Redux} from "darch/src/utils";
import {connect} from "react-redux";
import Modal from "darch/src/modal";
import i18n from "darch/src/i18n";
import Form from "darch/src/form";
import Field from "darch/src/field";
import Button from "darch/src/button";
import Spinner from "darch/src/spinner";
import Text from "darch/src/text";
import Grid from "darch/src/grid";
import {User,Api} from "common";
import styles from "./styles";

let Logger = new LoggerFactory("checkout.payment.address_modal");

/**
 * Redux map state to props function.
 *
 * @param {object} state
 * @param {object} ownProps
 */
function mapStateToProps(state) {
    return {
        user: state.user.profiles[state.user.uid],
        basket: state.basket
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
    static displayName = "checkout.payment.address_modal";
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

    state = {};

    cityOptions = [
        {value: "Belo Horizonte", label: "Belo Horizonte"}
    ];

    componentDidMount() {
        let logger = Logger.create("componentDidMount");
        logger.info("enter");
    }

    async onSubmit(data) {
        let logger = Logger.create("onSubmit");
        logger.info("enter", data);

        this.setState({loading: true});

        // Set data
        data.postal_code = data.postal_code.replace(/[_-]/g, "");
        data.phone = data.phone.replace(/[_-]/g,"");
        data.phone = {
            areaCode: data.phone.replace(/^\((\d+)\)\d+$/,"$1"),
            number: data.phone.replace(/^\(\d+\)(\d+)$/,"$1")
        };

        // @TODO : Internationalize this.
        data.state = "MG";
        data.country = "BRA";

        // Add address to user profile.
        Redux.dispatch(
            User.actions.userAddAddress(data)
        ).then(() => {
            this.setState({loading: false});
            this.props.onComplete(data, "address_modal");
        })
        .catch(() => {
            this.setState({loading: false});
        });
    }

    render() {
        let {open,onDismiss,user} = this.props;
        let {loading,loadingPostalCodeAddress} = this.state;
        let phone = user.phones && user.phones.length ? `${user.phones[0].areaCode}${user.phones[0].number}` : undefined;

        return (
            <Modal open={open} onDismiss={() => {onDismiss("address_modal");}}>
                <Modal.Header>
                    <h3 style={{margin: 0}}>
                        <i18n.Translate text="_CHECKOUT_STEP_PAYMENT_ADD_ADDRESS_MODAL_TITLE_" />
                    </h3>
                </Modal.Header>

                <Form onSubmit={this.onSubmit} loading={loading}>
                    <Modal.Body>
                        <Field.Section>
                            <Grid>
                                <Grid.Cell span={2}>
                                    <Field.Section>
                                        <Text scale={0.8}>
                                            <i18n.Translate text="_CHECKOUT_STEP_PAYMENT_ADD_ADDRESS_MODAL_LABEL_FIELD_LABEL_" />
                                        </Text>
                                        <Field.Text
                                            name="label"
                                            placeholder="_CHECKOUT_STEP_PAYMENT_ADD_ADDRESS_MODAL_LABEL_FIELD_PLACEHOLDER_"
                                            scale={1}
                                            validators="$required"/>
                                        <Field.Error
                                            for="label"
                                            validator="$required"
                                            message="_FIELD_ERROR_REQUIRED_"/>
                                    </Field.Section>
                                </Grid.Cell>
                                <Grid.Cell>
                                    <Field.Section>
                                        <div>
                                            <Text scale={0.8}>
                                                <i18n.Translate text="_CHECKOUT_STEP_PAYMENT_ADD_ADDRESS_MODAL_POSTAL_CODE_FIELD_LABEL_" />
                                            </Text>

                                            {loadingPostalCodeAddress?<span style={{marginLeft: "5px"}}><Spinner.CircSide scale={0.7} /></span>:null}
                                        </div>
                                        <Field.Text
                                            name="postal_code"
                                            placeholder="_CHECKOUT_STEP_PAYMENT_ADD_ADDRESS_MODAL_POSTAL_CODE_FIELD_PLACEHOLDER_"
                                            mask="99999-999"
                                            maskChar="_"
                                            scale={1}
                                            validators={["$required", {
                                                name: "cep",
                                                validate: async (value) => {
                                                    let logger = Logger.create("cep validate");
                                                    logger.debug("enter", {value});

                                                    if(!value){return true;}

                                                    value = value.replace(/[_-]/g, "");

                                                    if(!(/^\d{8}$/).test(value)) {return false;}

                                                    try {
                                                        let response = await Api.shared.postalCodeFindAddress(value, {
                                                            country_code: "BRA"
                                                        }, {preventErrorInterceptor: true});

                                                        logger.info("api postalCodeFindAddress success", response);

                                                        let {result} = response;

                                                        return {valid: true, $set: {
                                                            street: result.street,
                                                            neighborhood: result.neighborhood,
                                                            city: result.city
                                                        }};
                                                    }
                                                    catch(error) {
                                                        logger.error("api postalCodeFindAddress error", error);

                                                        return {valid: false, error};
                                                    }
                                                }
                                            }]}
                                            onValidationStart={(validator) => {
                                                if(validator == "cep") {this.setState({loadingPostalCodeAddress: true});}
                                            }}
                                            onValidationEnd={(validator) => {
                                                if(validator == "cep") {this.setState({loadingPostalCodeAddress: false});}
                                            }}/>
                                        <Field.Error
                                            for="postal_code"
                                            validator="$required"
                                            message="_FIELD_ERROR_REQUIRED_"/>
                                        <Field.Error
                                            for="postal_code"
                                            validator="cep"
                                            message="_FIELD_ERROR_POSTAL_CODE_"/>
                                    </Field.Section>
                                </Grid.Cell>
                            </Grid>
                        </Field.Section>

                        <Field.Section>
                            <Grid>
                                <Grid.Cell span={3}>
                                    <Field.Section>
                                        <Text scale={0.8}>
                                            <i18n.Translate text="_CHECKOUT_STEP_PAYMENT_ADD_ADDRESS_MODAL_STREET_FIELD_LABEL_" />
                                        </Text>
                                        <Field.Text
                                            name="street"
                                            placeholder="_CHECKOUT_STEP_PAYMENT_ADD_ADDRESS_MODAL_STREET_FIELD_PLACEHOLDER_"
                                            scale={1}
                                            validators="$required"/>
                                        <Field.Error
                                            for="street"
                                            validator="$required"
                                            message="_FIELD_ERROR_REQUIRED_"/>
                                    </Field.Section>
                                </Grid.Cell>

                                <Grid.Cell>
                                    <Field.Section>
                                        <Text scale={0.8}>
                                            <i18n.Translate text="_CHECKOUT_STEP_PAYMENT_ADD_ADDRESS_MODAL_NUMBER_FIELD_LABEL_" />
                                        </Text>
                                        <Field.Text
                                            name="number"
                                            placeholder="_CHECKOUT_STEP_PAYMENT_ADD_ADDRESS_MODAL_NUMBER_FIELD_PLACEHOLDER_"
                                            scale={1}
                                            validators="$required"/>
                                        <Field.Error
                                            for="number"
                                            validator="$required"
                                            message="_FIELD_ERROR_REQUIRED_"/>
                                    </Field.Section>
                                </Grid.Cell>

                                <Grid.Cell>
                                    <Field.Section>
                                        <Text scale={0.8}>
                                            <i18n.Translate text="_CHECKOUT_STEP_PAYMENT_ADD_ADDRESS_MODAL_COMPLEMENT_FIELD_LABEL_" />
                                        </Text>
                                        <Field.Text
                                            name="complement"
                                            placeholder="_CHECKOUT_STEP_PAYMENT_ADD_ADDRESS_MODAL_COMPLEMENT_FIELD_PLACEHOLDER_"
                                            scale={1}
                                        />
                                    </Field.Section>
                                </Grid.Cell>
                            </Grid>
                        </Field.Section>

                       <Field.Section>
                            <Grid>
                                <Grid.Cell>
                                    <Field.Section>
                                        <Text scale={0.8}>
                                            <i18n.Translate text="_CHECKOUT_STEP_PAYMENT_ADD_ADDRESS_MODAL_NEIGHBORHOOD_FIELD_LABEL_" />
                                        </Text>
                                        <Field.Text
                                            name="neighborhood"
                                            placeholder="_CHECKOUT_STEP_PAYMENT_ADD_ADDRESS_MODAL_NEIGHBORHOOD_FIELD_PLACEHOLDER_"
                                            scale={1}
                                            validators="$required"/>
                                        <Field.Error
                                            for="neighborhood"
                                            validator="$required"
                                            message="_FIELD_ERROR_REQUIRED_"/>
                                    </Field.Section>
                                </Grid.Cell>
                                <Grid.Cell>
                                    <Field.Section>
                                        <Text scale={0.8}>
                                            <i18n.Translate text="_CHECKOUT_STEP_PAYMENT_ADD_ADDRESS_MODAL_CITY_FIELD_LABEL_" />
                                        </Text>
                                        <Field.Select
                                            name="city"
                                            placeholder="_CHECKOUT_STEP_PAYMENT_ADD_ADDRESS_MODAL_CITY_FIELD_PLACEHOLDER_"
                                            options={this.cityOptions}
                                            validators="$required"/>
                                        <Field.Error
                                            for="city"
                                            validator="$required"
                                            message="_FIELD_ERROR_REQUIRED_"/>
                                    </Field.Section>
                                </Grid.Cell>
                            </Grid>
                        </Field.Section>

                        <Field.Section>
                            <Grid>
                                <Grid.Cell>
                                    <Field.Section>
                                        <Text scale={0.8}>
                                            <i18n.Translate text="_CHECKOUT_STEP_PAYMENT_ADD_ADDRESS_MODAL_PHONE_FIELD_LABEL_" />
                                        </Text>
                                        <Field.Text
                                            name="phone"
                                            value={phone}
                                            placeholder="_CHECKOUT_STEP_PAYMENT_ADD_ADDRESS_MODAL_PHONE_FIELD_PLACEHOLDER_"
                                            mask="(99)99999-9999"
                                            maskChar="_"
                                            scale={1}
                                            validators="$required|phone"/>
                                        <Field.Error
                                            for="phone"
                                            validator="$required"
                                            message="_FIELD_ERROR_REQUIRED_"/>
                                        <Field.Error
                                            for="phone"
                                            validator="phone"
                                            message="_FIELD_ERROR_PHONE_"/>
                                    </Field.Section>
                                </Grid.Cell>
                            </Grid>
                        </Field.Section>
                    </Modal.Body>

                    <Modal.Footer align="right">
                        <div className="field-gap">
                            <Button color="danger" onClick={() => {onDismiss("address_modal");}}>
                                <i18n.Translate text="_CANCEL_" format="lower" />
                            </Button>
                        </div>

                        <div className="field-gap">
                            <Button type="submit"
                                loadingComponent={
                                    <span>
                                        <i18n.Translate text="_SAVING_" format="lower" />
                                        <span style={{marginLeft: "10px"}}>
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

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Component);
