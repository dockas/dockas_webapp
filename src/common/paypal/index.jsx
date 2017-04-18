/* globals paypal */

import React from "react";
import {findDOMNode} from "react-dom";
import {LoggerFactory} from "darch/src/utils";
import styles from "./styles";

let Logger = new LoggerFactory("paypal", {level:"debug"});

/**
 * Main component class.
 */
export default class Component extends React.Component {
    /** React properties **/
    static displayName = "paypal";
    
    static defaultProps = {
        env: "production",
        currency: "BRL",
        onComplete: () => {}
    };
    
    static propTypes = {
        env: React.PropTypes.string,
        value: React.PropTypes.number.isRequired,
        currency: React.PropTypes.string,
        onComplete: React.PropTypes.func
    };

    /**
     * LYFECICLE : This function is called when component
     * got mounted in the view.
     */
    componentDidMount() {
        let logger = Logger.create("componentDidMount");
        logger.info("enter", {value: this.props.value});

        let {env, value, currency, onComplete} = this.props;

        paypal.Button.render({

            // Set your environment
            env: env, // sandbox | production

            // PayPal Client IDs - replace with your own
            // Create a PayPal app: https://developer.paypal.com/developer/applications/create
            client: {
                sandbox:    "Ac95bP9cLOVq7YzUbyMNabCBWH3p1frTjzZ74a_a1DH-VFdenOtrrTD2z6qG7FLRFszgFvyu4bWh0NMa",
                production: "AdgyTk-1bkskjMaVHZeWUzIeCkEBIKr0jsOtQAXDx4rKZoaNcaU8Nq5RAHEzqj_ipfHFDVboeuNtcnyW"
            },

            locale: "pt_BR",

            style: {
                size: "medium",
                color: "gold",
                shape: "pill",
                label: "checkout"
            },

            // Wait for the PayPal button to be clicked
            payment: function() {

                // Make a client-side call to the REST api to create the payment
                // Check bug http://stackoverflow.com/questions/43132449/paypal-express-checkout-error-when-supplying-input-fields
                return paypal.rest.payment.create(this.props.env, this.props.client, {
                    transactions: [{
                        amount: { total: `${value}`, currency: currency },
                    }]
                }, env == "production" ? {
                    input_fields: {
                        no_shipping: 1
                    }
                } : undefined);
            },

            commit: true,

            // Wait for the payment to be authorized by the customer
            onAuthorize: function(data, actions) {

                // Execute the payment
                return actions.payment.execute().then(onComplete);
            }

        }, findDOMNode(this));
    }

    /**
     * This function is responsible for generating the component's view.
     */
    render() {
        return (
            <div className={styles.paypal}></div>
        );
    }
}
