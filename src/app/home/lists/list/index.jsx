import React from "react";
//import lodash from "lodash";
import moment from "moment";
import {withRouter} from "react-router";
import {LoggerFactory,Redux} from "darch/src/utils";
import Container from "darch/src/container";
import i18n from "darch/src/i18n";
import Button from "darch/src/button";
import Modal from "darch/src/modal";
import Spinner from "darch/src/spinner";
import {Api,Basket} from "common";
import styles from "./styles";

let Logger = new LoggerFactory("lists.list");

/**
 * Main component class.
 */
class Component extends React.Component {
    /** React properties **/
    static displayName = "lists.list";
    static defaultProps = {};
    static propTypes = {};

    lists = [
        {
            _id: 1,
            name: "festa pequena em casa",
            nameId: "festa-pequena-em-casa",
            items: [
                {
                    count: 2,
                    product: {
                        _id: "produto_1",
                        name: "produto 1",
                        priceValue: 2.99
                    }
                },
                {
                    count: 6,
                    product: {
                        _id: "produto_2",
                        name: "produto 2",
                        priceValue: 1.59
                    }
                },
            ],
            lastPurchasedAt: moment().toISOString()
        },

        {
            _id: 2,
            name: "cecilia",
            nameId: "cecilia",
            items: [
                {
                    count: 5,
                    product: {
                        _id: "produto_1",
                        name: "produto 1",
                        priceValue: 2.99
                    }
                },
                {
                    count: 6,
                    product: {
                        _id: "produto_2",
                        name: "produto 2",
                        priceValue: 1.59
                    }
                },
                {
                    count: 5,
                    product: {
                        _id: "produto_3",
                        name: "produto 3",
                        priceValue: 4.55
                    }
                },
                {
                    count: 2,
                    product: {
                        _id: "produto_4",
                        name: "produto 4",
                        priceValue: 0.87
                    }
                },
            ],
            lastPurchasedAt: moment().toISOString()
        }
    ];

    state = {
        showListDetails: {},
        initializing: true
    };

    async componentDidMount() {
        let logger = Logger.create("componentDidMount");
        logger.info("enter");

        let newState = {
            initializing: false
        };

        try {
            let response = await Api.shared.listFind({
                populate: ["items[].product"]
            });

            logger.info("Api listFind success", response);

            newState.lists = response.results;
        }
        catch(error) {
            logger.error("Api listFind error", error);
        }

        this.setState(newState);
    }

    evalPrice(list) {
        let sum = 0.00;

        for(let item of list.items) {
            sum += (item.product.priceValue * item.count);
        }

        return sum;
    }

    toggleListDetails(list) {
        return () => {
            let {showListDetails} = this.state;

            if(showListDetails[list._id]) {
                delete showListDetails[list._id];
            }
            else {
                showListDetails = Object.assign({},showListDetails,{[list._id]: true});
            }

            this.setState({showListDetails});
        };
    }

    dismissOverrideWarningModal() {
        this.setState({overrideWarningModalOpen: false});
    }

    onOverrideWarningModalYesButtonClicked() {
        // Load list into basket.
    }

    onLoadListButtonClick(list) {
        return () => {
            let logger = Logger.create("onLoadListButtonClick");
            logger.info("enter", list);

            Redux.dispatch(Basket.actions.basketLoadList(list));

            // Go to catalog page
            this.props.router.push("/");
        };
    }

    render() {
        let {showListDetails,overrideWarningModalOpen,initializing,lists} = this.state;

        return (
            <div>
                <Container>
                    <h2>
                        <i18n.Translate text="_LISTS_PAGE_TITLE_" />
                    </h2>

                    <div className="table-container">
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th></th>
                                    <th><i18n.Translate text="_LISTS_PAGE_NAME_TH_" /></th>
                                    <th><i18n.Translate text="_LISTS_PAGE_ITEMS_COUNT_TH_" /></th>
                                    <th><i18n.Translate text="_LISTS_PAGE_PRICE_TH_" /></th>
                                    <th><i18n.Translate text="_LISTS_PAGE_LAST_PURCHASED_AT_TH_" /></th>
                                    <th></th>
                                </tr>
                            </thead>

                            {initializing ? (
                                <tbody>
                                    <tr>
                                        <td colSpan="6" className={styles.infoCellContainer}><Spinner.CircSide color="moody" /></td>
                                    </tr>
                                </tbody>
                            ) : lists && lists.length ? (
                                lists.map((list) => {
                                    return (
                                        <tbody key={list._id}>
                                            <tr>
                                                <td className={styles.plusCell} style={{background: showListDetails[list._id]?"#f9f9f9":""}}>
                                                    <a onClick={this.toggleListDetails(list)}>
                                                        {showListDetails[list._id] ? (
                                                            <span className="icon-squared-minus"></span>
                                                        ) : (
                                                            <span className="icon-squared-plus"></span>
                                                        )}
                                                    </a>
                                                </td>
                                                <td>{list.name}</td>
                                                <td>{list.items.length}</td>
                                                <td><i18n.Number prefix="R$" numDecimals={2} value={this.evalPrice(list)} /></td>
                                                <td>{list.lastPurchasedAt ? <i18n.Moment date={list.lastPurchasedAt} /> : "-"}</td>
                                                <td>
                                                    <Button scale={0.8} onClick={this.onLoadListButtonClick(list)}>
                                                        <i18n.Translate text="_LISTS_PAGE_LOAD_BUTTON_LABEL_" />
                                                    </Button>
                                                </td>
                                            </tr>

                                            {showListDetails[list._id] ? (
                                                list.items.map((item) => {
                                                    return (
                                                        <tr key={item.product._id} className={styles.itemRow}>
                                                            <td></td>
                                                            <td>{item.product.name}</td>
                                                            <td>{item.count} x <i18n.Number prefix="R$" numDecimals={2} value={item.product.priceValue}/></td>
                                                            <td><i18n.Number prefix="R$" numDecimals={2} value={item.product.priceValue*item.count}/></td>
                                                            <td></td>
                                                            <td></td>
                                                        </tr>
                                                    );
                                                })
                                            ) : null}
                                        </tbody>
                                    );
                                })
                            ) : (
                                <tbody>
                                    <tr>
                                        <td colSpan="6" className={styles.infoCellContainer}>
                                            <i18n.Translate text="_LISTS_PAGE_NO_DATA_FOUND_TEXT_" />
                                        </td>
                                    </tr>
                                </tbody>
                            ) }
                        </table>
                    </div>
                </Container>

                <Modal open={overrideWarningModalOpen}>
                    <Modal.Header>
                        <h3 style={{margin: 0}}>
                            <i18n.Translate text="_LISTS_PAGE_OVERRIDE_WARNING_MODAL_TITLE_" />
                        </h3>
                    </Modal.Header>

                    <Modal.Body>
                        <i18n.Translate text="_LISTS_PAGE_OVERRIDE_WARNING_MODAL_BODY_" />
                    </Modal.Body>

                    <Modal.Footer align="right">
                        <Button
                            scale={1} onClick={this.onOverrideWarningModalYesButtonClicked}>
                            <i18n.Translate text="_YES_" />
                        </Button>

                        <Button type="submit"
                            scale={1} onClick={this.dismissOverrideWarningModal}>
                            <i18n.Translate text="_NO_" />
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
}

export default withRouter(Component);
