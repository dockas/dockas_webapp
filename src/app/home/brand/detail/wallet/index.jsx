import React from "react";
import {connect} from "react-redux";
import lodash from "lodash";
import moment from "moment";
import {LoggerFactory,Redux} from "darch/src/utils";
import i18n from "darch/src/i18n";
import Text from "darch/src/text";
import Spinner from "darch/src/spinner";
import {Panel,Wallet,Transfer} from "common";
import styles from "./styles";

let Logger = new LoggerFactory("brand.detail.wallet");

/**
 * Redux map state to props function.
 *
 * @param {object} state
 * @param {object} ownProps
 */
function mapStateToProps(state) {
    return {
        walletData: state.wallet.data,
        brandData: state.brand.data,
        brandNameIdToId: state.brand.nameIdToId,
        transferData: state.transfer.data,
        transferScopeIds: lodash.get(state, "transfer.scope.brandTransfers.ids"),
        transferScopeQuery: lodash.get(state, "transfer.scope.brandTransfers.query"),
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
    static displayName = "brand.detail.wallet";
    static defaultProps = {};
    static propTypes = {};

    state = {};

    getScopeData(props=this.props) {
        let result = {},
            nameId = lodash.get(props, "params.id"),
            {walletData,brandData,brandNameIdToId,
                transferScopeIds,transferScopeQuery} = props;

        result.brand = brandNameIdToId[nameId] ?
            brandData[brandNameIdToId[nameId]] : 
            null;

        if(result.brand) {
            result.wallet = walletData[result.brand.wallet];
        }

        result.transferIds = transferScopeIds;
        result.transferQuery = transferScopeQuery;

        return result;
    }

    async componentDidMount() {
        let {brand,wallet} = this.getScopeData(),
            newState = {initializing: false},
            logger = Logger.create("componentDidMount");

        logger.info("enter");

        this.setState({initializing: true});

        if(!wallet) {
            try {
                let result = await Redux.dispatch(
                    Wallet.actions.brandWalletFind(brand._id)
                );

                logger.info("action brandWalletFind success", result);
            }
            catch(error) {
                logger.error("action brandWalletFind error", error);
            }
        }

        // Find transfers.
        try {
            let result = await Redux.dispatch(
                Transfer.actions.brandTransfersFind(brand._id, {
                    sort: {createdAt: -1}
                }, {
                    scope: {id: "brandTransfers"}
                })
            );

            logger.info("action brandTransfersFind success", result);
        }
        catch(error) {
            logger.error("action brandTransfersFind error", error);
        }

        this.setState(newState);
    }

    render() {
        let {wallet,transferIds} = this.getScopeData();
        let {transferData} = this.props;
        let {initializing} = this.state;

        return (
            <div className={styles.page}>
                <Panel id="description"
                    canEdit={false}
                    labelText="_BRAND_DETAIL_WALLET_PAGE_BALANCE_FIELD_LABEL_">
                    
                    <Text color="moody" scale={1.5}><i18n.Number prefix="R$" value={parseFloat(((lodash.get(wallet,"credit")||0)/100).toFixed(2))} numDecimals={2} /></Text>
                </Panel>

                <h3><i18n.Translate text="_BRAND_DETAIL_WALLET_PAGE_TRANSFERS_SECTION_TITLE_" /></h3>

                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th><i18n.Translate text="_BRAND_DETAIL_WALLET_PAGE_TRANSFERS_SECTION_CREATED_AT_TH_" /></th>
                                <th><i18n.Translate text="_BRAND_DETAIL_WALLET_PAGE_TRANSFERS_SECTION_GROSS_VALUE_TH_" /></th>
                                <th><i18n.Translate text="_BRAND_DETAIL_WALLET_PAGE_TRANSFERS_SECTION_NET_VALUE_TH_" /></th>
                            </tr>
                        </thead>
                        <tbody>
                            {initializing ? (
                                <tr>
                                    <td colSpan="6" className={styles.infoCellContainer}><Spinner.CircSide color="moody" /></td>
                                </tr>
                            ) : transferIds && transferIds.length ? (
                                transferIds.map((transferId) => {
                                    let transfer = transferData[transferId];

                                    return transfer ? (
                                        <tr key={transfer._id}>
                                            <td>{moment(transfer.createdAt).format("DD/MM/YYYY")}</td>
                                            <td><i18n.Number prefix="R$" numDecimals={2} value={transfer.value/100} /></td>
                                            <td><i18n.Number prefix="R$" numDecimals={2} value={transfer.netValue/100} /></td>
                                        </tr>
                                    ) : (
                                        <tr key={transferId}></tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="6" className={styles.infoCellContainer}>
                                        <i18n.Translate text="_BRAND_DETAIL_WALLET_PAGE_TRANSFERS_SECTION_NOT_FOUND_" />
                                    </td>
                                </tr>
                            ) }
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
}

/** Export **/
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Component);


