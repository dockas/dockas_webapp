import React from "react";
import {connect} from "react-redux";
import classNames from "classnames";
//import lodash from "lodash";
//import config from "config";
import {LoggerFactory} from "darch/src/utils";
import Text from "darch/src/text";
import AddressModal from "../address_modal";
import styles from "./styles";

let Logger = new LoggerFactory("common.payment.address_selec_panel");

/**
 * Redux map state to props function.
 *
 * @param {object} state
 * @param {object} ownProps
 */
function mapStateToProps(state) {
    return {
        uid: state.user.uid,
        user: state.user.uid?state.user.data[state.user.uid]:null
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
    static displayName = "common.payment.address_select_panel";
    static defaultProps = {
        onAddressSelected: () => {},
        onAddressCreated: () => {}
    };
    static propTypes = {
        selectedAddressId: React.PropTypes.string,
        onAddressSelected: React.PropTypes.func,
        onAddressCreated: React.PropTypes.func
    };

    state = {};

    async componentDidMount() {
        let logger = Logger.create("componentDidMount");
        logger.info("enter");
    }

    selectAddress(address) {
        return () => {
            this.props.onAddressSelected(address);
        };
    }

    onModalDismiss() {
        this.setState({isModalOpen: false});
    }

    onModalComplete(data) {
        this.setState({isModalOpen: false}, () => {
            this.onAddressCreated(data);
        });
    }

    render() {
        let {user,selectedAddressId} = this.props;
        let addresses = user.addresses || [];

        if(addresses.length == 1 && !selectedAddressId) {
            setTimeout(() => {
                this.selectAddress(addresses[0])();
            }, 100);
        }

        return (
            <div className={styles.panel}>
                <div className={styles.section}>
                    <div className="headline" style={{overflow: "auto", "paddingBottom": "10px"}}>
                        <span><span className="icon-marker" style={{marginRight: "5px"}}></span>Endereço de Entrega</span>
                        <div style={{float: "right"}}>
                            <a onClick={()=>{this.setState({isModalOpen: true});}}><Text color="moody">Adicionar</Text></a>
                        </div>
                    </div>

                    <div style={{marginTop: "10px"}}>
                        {addresses.length ? addresses.map((address) => {
                            return (
                                <div key={address._id} className={classNames([
                                    styles.box,
                                    selectedAddressId == address._id ? styles.active : ""
                                ])} onClick={this.selectAddress(address)}>
                                    <div className={styles.title}>{address.label}</div>
                                    <div className={styles.body}>{address.street}, {address.number} - {address.neighborhood}</div>
                                </div>
                            );
                        }) : (
                            <Text scale={0.8}>Nenhum endereço cadastrado. Clique no botão <b>Adicionar</b> para cadastrar um novo endereço.</Text>
                        )}
                    </div>
                </div>

                <AddressModal open={this.state.isModalOpen} onDismiss={this.onModalDismiss} onComplete={this.onModalComplete} />
            </div>
        );
    }
}

/** Export **/
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Component);