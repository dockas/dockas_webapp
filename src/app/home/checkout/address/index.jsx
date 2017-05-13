import React from "react";
import {withRouter} from "react-router";
import {connect} from "react-redux";
import lodash from "lodash";
import {LoggerFactory,Redux,Style} from "darch/src/utils";
import Container from "darch/src/container";
import i18n from "darch/src/i18n";
import Button from "darch/src/button";
import Modal from "darch/src/modal";
import Form from "darch/src/form";
import Field from "darch/src/field";
import Grid from "darch/src/grid";
import Spinner from "darch/src/spinner";
import {User,Basket} from "common";
import styles from "./styles";

let Logger = new LoggerFactory("checkout.address");

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
    static displayName = "checkout.address";
    static defaultProps = {};
    static propTypes = {};

    state = {};

    cityOptions = [
        {value: "Belo Horizonte", label: "Belo Horizonte"}
    ];

    constructor(props) {
        super(props);

        this.state = {
            selectedAddress: this.props.basket.address
        };
    }

    componentDidMount() {
        let logger = Logger.create("componentDidMount");
        logger.info("enter");

        window.addEventListener("resize", this.handleWindowResize);

        this.handleWindowResize();
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.handleWindowResize);
    }

    handleWindowResize() {
        let logger = Logger.create("handleWindowResize");

        let {screenSize} = this.state;
        let currentScreenSize = Style.screenForWindowWidth(window.innerWidth);

        if(currentScreenSize != screenSize) {
            logger.info("enter", {screenSize, currentScreenSize});
            this.setState({screenSize: currentScreenSize});
        }
    }

    onBasketButtonClick() {
        let logger = Logger.create("onBasketButtonClick");
        logger.info("enter");

        // Set selected address to basket
        Redux.dispatch(Basket.actions.basketSelectAddress(this.state.selectedAddress));

        // Go to payment page
        this.props.router.push("/checkout/payment");
    }

    openNewAddressModal() {
        let logger = Logger.create("openNewAddressModal");
        logger.info("enter");

        this.setState({
            newAddressModalOpen: true
        });
    }

    onNewAddressSubmit(data) {
        let logger = Logger.create("onNewAddressSubmit");
        logger.info("enter", data);

        this.setState({newAddressModalLoading: true});

        data.postal_code = `${data.postal_code}`;

        Redux.dispatch(
            User.actions.userAddAddress(data)
        ).then(() => {
            this.setState({
                newAddressModalOpen: false,
                newAddressModalLoading: false
            });
        })
        .cacth(() => {
            this.setState({
                newAddressModalLoading: false
            });
        });
    }

    selectAddress(address) {
        return () => {
            Redux.dispatch(Basket.actions.basketSelectAddress(address));
        };
    }

    onAddressRadioChange(evt) {
        let logger = Logger.create("onAddressRadioChange");

        let id = evt.currentTarget.value;

        let selectedAddress = lodash.find(this.props.user.addresses, (address) => {
            return address.id == id;
        });

        logger.info("enter", {id, selectedAddress});

        this.setState({selectedAddress});
    }

    render() {
        let {newAddressModalOpen,newAddressModalLoading,selectedAddress,screenSize} = this.state;
        let {user} = this.props;

        return (
            <div className={styles.page}>
                <Container>
                    <div className={styles.header}>
                        <h3 className={styles.title}>
                            <i18n.Translate text="_CHECKOUT_STEP_ADDRESS_TITLE_" />

                            {screenSize != "phone" ? (
                                <div className={styles.addAddressButtonContainer}>
                                    <Button onClick={this.openNewAddressModal} scale={0.9}>Adicionar Novo Endereço</Button>
                                </div>
                            ) : null}
                        </h3>
                    </div>

                    {screenSize == "phone" ? (
                        <div className={styles.addAddressButtonContainerPhone}>
                            <Button onClick={this.openNewAddressModal} scale={1}>Adicionar Novo Endereço</Button>
                        </div>
                    ) : null}

                    <div>
                        {user.addresses && user.addresses.length ? (
                            user.addresses.map((data) => {
                                return (
                                    <div key={data.id} className={styles.addressCard}>
                                        <div className={styles.addressSelect}>
                                            <input type="radio" value={data.id} checked={selectedAddress?selectedAddress.id==data.id:false} onChange={this.onAddressRadioChange} />
                                        </div>
                                        <div className={styles.addressBody}>
                                            <div className={styles.addressLabel}>{data.label}</div>
                                            <div className={styles.addressInfo}>
                                                {data.address}, {data.number}{data.complement?` ${data.complement}`:""}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div>Nenhum endereço cadastrado</div>
                        )}
                    </div>
                </Container>

                <Basket.Card onClick={this.onBasketButtonClick} buttonLabel="_BASKET_CARD_CHOOSE_ADDRESS_BUTTON_TEXT_" disabled={!this.state.selectedAddress}/>

                <Modal open={newAddressModalOpen} onDismiss={() => {
                    this.setState({newAddressModalOpen: false});
                }}>
                    <Modal.Header>
                        <h3 style={{margin: 0}}>
                            <i18n.Translate text="_NEW_ADDRESS_MODAL_TITLE_" />
                        </h3>
                    </Modal.Header>

                    <Form onSubmit={this.onNewAddressSubmit} loading={newAddressModalLoading}>
                        <Modal.Body>
                            <Field.Section>
                                <Grid>
                                    <Grid.Cell span={2}>
                                        <Field.Section>
                                            <div className={styles.label}>
                                                <i18n.Translate text="_NEW_ADDRESS_MODAL_LABEL_FIELD_LABEL_" />
                                            </div>
                                            <Field.Text
                                                name="label"
                                                placeholder="_NEW_ADDRESS_MODAL_LABEL_FIELD_PLACEHOLDER_"
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
                                            <div className={styles.label}>
                                                <i18n.Translate text="_NEW_ADDRESS_MODAL_POSTAL_CODE_FIELD_LABEL_" />
                                            </div>
                                            <Field.Number
                                                name="postal_code"
                                                format="#####-###"
                                                mask="_"
                                                validator="$required"
                                            />
                                            <Field.Error
                                                for="postal_code"
                                                validator="$required"
                                                message="_FIELD_ERROR_REQUIRED_"/>
                                        </Field.Section>
                                    </Grid.Cell>
                                </Grid>
                            </Field.Section>

                            <Field.Section>
                                <Grid>
                                    <Grid.Cell span={3}>
                                        <Field.Section>
                                            <div className={styles.label}>
                                                <i18n.Translate text="_NEW_ADDRESS_MODAL_ADDRESS_FIELD_LABEL_" />
                                            </div>
                                            <Field.Text
                                                name="address"
                                                placeholder="_NEW_ADDRESS_MODAL_ADDRESS_FIELD_PLACEHOLDER_"
                                                scale={1}
                                                validators="$required"/>
                                            <Field.Error
                                                for="address"
                                                validator="$required"
                                                message="_FIELD_ERROR_REQUIRED_"/>
                                        </Field.Section>
                                    </Grid.Cell>

                                    <Grid.Cell>
                                        <Field.Section>
                                            <div className={styles.label}>
                                                <i18n.Translate text="_NEW_ADDRESS_MODAL_NUMBER_FIELD_LABEL_" />
                                            </div>
                                            <Field.Text
                                                name="number"
                                                placeholder="_NEW_ADDRESS_MODAL_NUMBER_FIELD_PLACEHOLDER_"
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
                                            <div className={styles.label}>
                                                <i18n.Translate text="_NEW_ADDRESS_MODAL_COMPLEMENT_FIELD_LABEL_" />
                                            </div>
                                            <Field.Text
                                                name="complement"
                                                placeholder="_NEW_ADDRESS_MODAL_COMPLEMENT_FIELD_PLACEHOLDER_"
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
                                            <div className={styles.label}>
                                                <i18n.Translate text="_NEW_ADDRESS_MODAL_NEIGHBORHOOD_FIELD_LABEL_" />
                                            </div>
                                            <Field.Text
                                                name="neighborhood"
                                                placeholder="_NEW_ADDRESS_MODAL_NEIGHBORHOOD_FIELD_PLACEHOLDER_"
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
                                            <div className={styles.label}>
                                                <i18n.Translate text="_NEW_ADDRESS_MODAL_CITY_FIELD_LABEL_" />
                                            </div>
                                            <Field.Select
                                                name="city"
                                                placeholder="_NEW_ADDRESS_MODAL_CITY_FIELD_PLACEHOLDER_"
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
                        </Modal.Body>
                        <Modal.Footer align="right">

                            <div className="field-gap">
                                <Button color="danger" onClick={() => {
                                    this.setState({newAddressModalOpen: false});
                                }}>
                                    <i18n.Translate text="_CANCEL_" format="lower" />
                                </Button>
                            </div>

                            <div className="field-gap">
                                <Button type="submit"
                                    loadingComponent={
                                        <span>
                                            <i18n.Translate text="_SAVING_" format="lower" />
                                            <span className={styles.spinnerContainer}>
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
            </div>
        );
    }
}

/** Export **/
export default withRouter(connect(
    mapStateToProps,
    mapDispatchToProps
)(Component));
