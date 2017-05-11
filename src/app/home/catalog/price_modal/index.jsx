import React from "react";
import {LoggerFactory} from "darch/src/utils";
import Modal from "darch/src/modal";
import i18n from "darch/src/i18n";
import Field from "darch/src/field";
import Button from "darch/src/button";
import Spinner from "darch/src/spinner";
import {Api} from "common";
import styles from "./styles";

let Logger = new LoggerFactory("admin.products.price_modal");

/**
 * Main component class.
 */
export default class Component extends React.Component {
    /** React properties **/
    static displayName = "admin.products.price_modal";
    static defaultProps = {
        onComplete: () => {},
        open: false
    };
    
    static propTypes = {
        onComplete: React.PropTypes.func,
        product: React.PropTypes.object,
        open: React.PropTypes.bool
    };

    state = {};

    componentDidMount() {
        let logger = Logger.create("componentDidMount");
        logger.info("enter", {product: this.props.product});

        if(this.props.product) {
            this.setState({
                value: this.props.product.priceValue
            });
        }
    }

    componentDidUpdate(prevProps) {
        let logger = Logger.create("componentDidUpdate");
        logger.info("enter", {
            prevProduct: prevProps.product,
            currentProduct: this.props.product
        });

        // Product has changed
        if(this.props.product 
        && this.props.product != prevProps.product) {
            this.setState({
                value: this.props.product.priceValue
            });
        }
    }

    async onSubmit() {
        this.setState({loading: true});

        let data = { value: this.state.value };

        // Do something.
        try {
            await Api.shared.productPriceUpdate(
                this.props.product._id,
                data
            );

            this.setState({loading: false});
        }
        catch(error) {
            return this.setState({loading: false});
        }

        this.props.onComplete(data);
    }

    render() {
        let {open,onComplete} = this.props;
        let {loading,value} = this.state;

        return (
            <Modal open={open} onDismiss={() => { onComplete(); }}>
                <Modal.Header>
                    <h3 style={{margin: 0}}><i18n.Translate text="_ADMIN_PRODUCTS_PAGE_CHANGE_PRICE_MODAL_TITLE_" /></h3>
                </Modal.Header>

                <Modal.Body>
                    <Field.Section>
                        <div className={styles.label}>
                            <i18n.Translate text="_ADMIN_PRODUCTS_PAGE_CHANGE_PRICE_MODAL_VALUE_LABEL_" />
                        </div>
                        
                        <Field.Number
                            name="value"
                            value={value}
                            numDecimals={2}
                            onChange={(val) => { this.setState({value: val}); }}
                            placeholder="_CREATE_PRODUCT_PAGE_PRICE_VALUE_FIELD_PLACEHOLDER_"
                            scale={1} />
                    </Field.Section>
                </Modal.Body>

                <Modal.Footer align="right">
                    <Button type="submit"
                        onClick={this.onSubmit}
                        loading={loading}
                        loadingComponent={
                            <span>
                                <i18n.Translate text="_SAVING_" format="lower" />
                                <span className={styles.spinnerContainer}>
                                    <Spinner.Bars color="#fff" />
                                </span>
                            </span>
                        }
                        scale={1}>
                        <i18n.Translate text="_UPDATE_" format="lower" />
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }
}
