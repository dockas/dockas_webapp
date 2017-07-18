import React from "react"
import {connect} from "react-redux"
import classNames from "classnames"
import lodash from "lodash"
import moment from "moment"
import config from "config"
import {LoggerFactory,Redux} from "darch/src/utils"
import Button from "darch/src/button"
import i18n from "darch/src/i18n"
import Text from "darch/src/text"
import Grid from "darch/src/grid"
import Spinner from "darch/src/spinner"
import Calendar from "darch/src/calendar"
import {Payment,ListSubscription,Order,Tracker} from "common"
import DetailBar from "../bar"
import styles from "./styles"
import Utils from "./utils"

let Logger = new LoggerFactory("lists.detail.subscription")

/**
 * Redux map state to props function.
 *
 * @param {object} state
 * @param {object} ownProps
 */
function mapStateToProps(state) {
    return {
        listData: state.list.data,
        listNameIdToId: state.list.nameIdToId,
        listSubscriptionData: state.listSubscription.data,
        listSubscriptionListIdToId: state.listSubscription.listIdToId,
        uid: state.user.uid,
        user: state.user.uid?state.user.data[state.user.uid]:null,
        orderData: state.order.data,
        orderListSubscriptionScopeIds: lodash.get(state, "order.scope.listSubscription.ids")
    }
}

/**
 * Redux dispatch to props map.
 */
let mapDispatchToProps = {

}

/**
 * Main component class.
 */
class Component extends React.Component {
    /** React properties **/
    static displayName = "lists.detail.subscription";
    static defaultProps = {};
    static propTypes = {};

    state = {};

    recurrenceOptions = [
        {value: "weekly", label: "_LIST_SUBSCRIPTION_WEEKLY_RECURRENCE_"},
        {value: "biweekly", label: "_LIST_SUBSCRIPTION_BIWEEKLY_RECURRENCE_"},
        {value: "monthly", label: "_LIST_SUBSCRIPTION_MONTHLY_RECURRENCE_"}
    ];

    getScopeData(props=this.props) {
        let result = {},
            nameId = lodash.get(props, "match.params.id"),
            {
                listData,listNameIdToId,
                listSubscriptionData,
                listSubscriptionListIdToId
            } = props

        result.list = listNameIdToId[nameId] ?
            listData[listNameIdToId[nameId]] :
            null

        if(result.list) {
            result.listSubscription = listSubscriptionListIdToId[result.list._id] ?
                listSubscriptionData[listSubscriptionListIdToId[result.list._id]] :
                null
        }

        return result
    }

    async componentDidMount() {
        let {listSubscription} = this.getScopeData(),
            logger = Logger.create("componentDidMount")

        logger.info("enter")

        this.setState({loadingOrders: true})
        this.setListSubscription()

        // Load subscription orders
        if(listSubscription) {
            this.setState({loadingOrders: true})

            try {
                await Redux.dispatch(Order.actions.orderFind({
                    listSubscription: [listSubscription._id],
                    user: [this.props.uid]
                }, {
                    scope: {id: "listSubscription"}
                }))
            }
            catch(error) {
                logger.error("order action orderFind error", error)
            }

            this.setState({loadingOrders: false})
        }
    }

    componentDidUpdate(prevProps) {
        let scope = this.getScopeData()
        let prevScope = this.getScopeData(prevProps)

        /*console.log(["macumba zalum : componentDidUpdate", {
            scope,
            prevScope
        }]);*/

        // List has changed or subscriptions has changed
        if(!lodash.isEqual(scope.list, prevScope.list)
        || !lodash.isEqual(scope.listSubscription, prevScope.listSubscription)) {
            this.setListSubscription()
        }
    }

    async setListSubscription() {
        let logger = Logger.create("setListSubscription")
        logger.info("enter")

        let {listSubscription} = this.getScopeData()

        if(listSubscription) {
            this.setState({
                listSubscription,
                calendarValue: listSubscription.nextDeliverDate,
                address: listSubscription.address,
                source: listSubscription.billingSource,
                recurrence: listSubscription.recurrence
            })
        }
    }

    onSourceSelected(source, type) {
        let logger = Logger.create("onSourceSelected")
        logger.info("enter", {source,type})
        this.setState({source})
    }

    onAddressSelected(address) {
        let logger = Logger.create("onAddressSelected")
        logger.info("enter", {address})
        this.setState({address})
    }

    onCancel() {
        let logger = Logger.create("onCancel")
        logger.info("enter")
    }

    async onSubscribe() {
        let {list} = this.getScopeData(),
            logger = Logger.create("onSubscribe")

        logger.info("enter")

        this.setState({subscribing: true})

        try {
            await Redux.dispatch(
                ListSubscription.actions.listSubscriptionCreate({
                    list: list._id,
                    nextDeliverDate: moment(this.state.calendarValue).hour(12).minutes(0).toISOString(),
                    recurrence: this.state.recurrence,
                    address: this.state.address,
                    billingSource: this.state.source
                })
            )

            logger.info("list action listSubscriptionCreate success")

            Tracker.track("list subscribed", {
                list: list.nameId,
                recurrence: this.state.recurrence,
                address: this.state.address.label
            })
        }
        catch(error) {
            logger.error("list action listSubscriptionCreate error", error)
        }

        this.setState({subscribing: false, nextDeliverDate: null})
    }

    async onSave() {
        let logger = Logger.create("onSave")
        logger.info("enter")

        this.setState({saving: true})

        let {listSubscription,source,recurrence,address} = this.state

        try {
            await Redux.dispatch(
                ListSubscription.actions.listSubscriptionUpdate(listSubscription._id, {
                    recurrence,
                    nextDeliverDate: moment(this.state.calendarValue).hour(12).minutes(0).toISOString(),
                    address,
                    billingSource: source
                })
            )

            logger.info("list action listSubscriptionUpdate success")
        }
        catch(error) {
            logger.error("list action listSubscriptionUpdate error", error)
        }

        this.setState({saving: false})
    }

    selectRecurrenceOption(option) {
        return () => {
            // Eval nextDeliverDate.
            let nextDeliverDate = Utils.getNextDeliverDate(
                option.value
            )

            this.setState({
                nextDeliverDate,
                recurrence: option.value
            })
        }
    }

    render() {
        let {list} = this.getScopeData()
        let {user,orderData,orderListSubscriptionScopeIds} = this.props
        let {
            listSubscription,source,address,
            recurrence,subscribing,
            saving,loadingOrders,calendarValue
        } = this.state
        
        let canSave = (
            listSubscription && 
            source &&
            address &&
            recurrence &&
            (
                listSubscription.billingSource != source._id ||
                listSubscription.address._id != address._id ||
                listSubscription.recurrence != recurrence
            )
        )

        let allowedWeekdays = lodash.map(lodash.get(config, "shared.order.allowedDeliverWeekdays"), (obj, weekday) => {
            return moment().isoWeekday(weekday).isoWeekday()
        })

        let minimumDaysToDeliver = lodash.get(config, "shared.order.minimumDaysToDeliver")
        let startDeliverMoment = minimumDaysToDeliver > 0 ?
            moment().add(minimumDaysToDeliver, "days") :
            moment()

        //console.log(["SUBSCRIPTIONS FUCK", calendarValue]);

        return (
            <div>
                <DetailBar list={list} />

                <div className={styles.box}>
                    {/*<div className={styles.header}>
                        <div className={styles.titleContainer}>
                            <h3 style={{margin: "0"}}>
                                Status
                            </h3>
                        </div>
                    </div>*/}

                    <div className={styles.body}>
                        {!listSubscription ? (
                            <Text>Você ainda não assina esta lista. Para assiná-la informe todos os campos na sessão "Pagamento & Entrega" logo abaixo e depois clieque no botão "ASSINAR".</Text>
                        ) : (
                            <Text>A próxima entrega desta lista está programa para o dia <b>{moment(listSubscription.nextDeliverDate).format("DD/MM/YYYY")}</b>.</Text>
                        )}
                    </div>
                </div>

                <div className={styles.box}>
                    <div className={styles.header}>
                        <div className={styles.titleContainer}>
                            <h3 style={{margin: "0"}}>
                                Pagamento & Entrega

                                <div style={{float: "right"}}>
                                    {listSubscription ? (
                                        <div className="field-gap">
                                            <Button scale={0.7} 
                                                onClick={this.onSave} 
                                                disabled={!canSave||saving}>

                                                {saving ? (
                                                    <span>salvando ...</span>
                                                ) : (
                                                    <span>salvar</span>
                                                )} 
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="field-gap">
                                            <Button scale={0.7} 
                                                onClick={this.onSubscribe} 
                                                disabled={!source||!address||!recurrence||subscribing}>

                                                {subscribing ? (
                                                    <span>assinando ...</span>
                                                ) : (
                                                    <span>assinar</span>
                                                )} 
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </h3>
                        </div>
                    </div>

                    <div className={styles.body}>
                        <Payment.SourceSelectPanel onSourceSelected={this.onSourceSelected} selectedSourceId={source?source._id:undefined} />
                        <Payment.Separator.Stripped/>
                        <Payment.AddressSelectPanel onAddressSelected={this.onAddressSelected} selectedAddressId={address?address._id:undefined}/>
                        <Payment.Separator.Stripped/>

                        <div className={styles.panel} style={{marginBottom: "20px"}}>
                            <div className="headline" style={{overflow: "auto", "paddingBottom": "10px"}}>
                                <span><span className="icon-calendar" style={{marginRight: "5px"}}></span>Próximas Entregas</span>
                            </div>

                            <div style={{marginTop: "10px"}}>
                                <Grid>
                                    <Grid.Cell>
                                        <div style={{marginBottom: "10px", textAlign: "center"}}>
                                            <Text color="#aaaaaa" scale={0.8}><b>data da próxima entrega</b></Text>
                                        </div>
                                        
                                        <div style={{textAlign: "center"}}>
                                            <Calendar startDate={startDeliverMoment.toISOString()}
                                                multi={false}
                                                value={calendarValue} 
                                                onChange={(value) => {
                                                    this.setState({calendarValue: value})
                                                }}
                                                allow={(date) => {
                                                    let dateMoment = moment(date)
                                                    return allowedWeekdays.indexOf(dateMoment.isoWeekday())>=0
                                                }}
                                                highlight={(date) => {
                                                    let {calendarValue,recurrence} = this.state
                                                    let dateMoment = moment(date)
                                                    let calendarMoment = calendarValue?moment(calendarValue):null

                                                    if(!calendarMoment){return false}

                                                    let calendarWeek = calendarMoment.isoWeek()
                                                    let dateWeek = dateMoment.isoWeek()

                                                    let recurrenceStep = recurrence == "weekly" ? 1 :
                                                        recurrence == "biweekly" ? 2 :
                                                            recurrence == "monthly" ? 4 : null

                                                    if(calendarMoment
                                                    && recurrenceStep
                                                    && dateMoment.isAfter(calendarMoment)
                                                    && dateMoment.isoWeekday() == calendarMoment.isoWeekday()
                                                    && (dateWeek-calendarWeek)%recurrenceStep == 0) {
                                                        return true
                                                    }

                                                    return false
                                                }}
                                            />
                                        </div>
                                    </Grid.Cell>

                                    <Grid.Cell span={2}>
                                        <div style={{marginBottom: "10px"}}>
                                            <Text color="#aaaaaa" scale={0.8}><b>recorrência</b></Text>
                                        </div>

                                        <Grid spots={4}>
                                            {this.recurrenceOptions.map((recurrenceOption) => {
                                                return (
                                                    <Grid.Cell key={recurrenceOption.value}>
                                                        <div className={classNames([
                                                            styles.card,
                                                            recurrence == recurrenceOption.value ? styles.active : ""
                                                        ])} onClick={this.selectRecurrenceOption(recurrenceOption)}>
                                                            <i18n.Translate text={recurrenceOption.label} />
                                                        </div>
                                                    </Grid.Cell>
                                                )
                                            })}
                                        </Grid>

                                        {recurrence ? (
                                            <div style={{marginTop: "20px", fontSize: "0.8em"}}>
                                                <ul style={{padding: "0"}}>
                                                    <li>as datas contornadas de laranja no calendário são as datas de entregas futuras</li>
                                                </ul>
                                            </div>
                                        ) : null}

                                        {/*nextDeliverDate ? (
                                            <div style={{marginTop: "20px"}}>
                                                <Text scale={0.8}>A próxima entrega será dia {moment(nextDeliverDate).format("DD/MM/YYYY")}.</Text>
                                            </div>
                                        ) : null*/}
                                    </Grid.Cell>
                                </Grid>
                            </div>
                        </div>
                    </div>
                </div>

                {listSubscription ? (
                    <div className={styles.box}>
                        <div className={styles.header}>
                            <div className={styles.titleContainer}>
                                <h3 style={{margin: "0"}}>
                                    Pedidos
                                </h3>
                            </div>
                        </div>

                        <div className={styles.body}>
                            <div className="table-container">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th><i18n.Translate text="_ORDERS_PAGE_ID_TH_" /></th>
                                            <th><i18n.Translate text="_ORDERS_PAGE_CREATED_AT_TH_" /></th>
                                            <th><i18n.Translate text="_ORDERS_PAGE_ADDRESS_TH_" /></th>
                                            {/*<th><i18n.Translate text="_ORDERS_PAGE_ITEMS_COUNT_TH_" /></th>*/}
                                            <th><i18n.Translate text="_ORDERS_PAGE_PRICE_VALUE_TH_" /></th>
                                            <th><i18n.Translate text="_ORDERS_PAGE_STATUS_TH_" /></th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loadingOrders ? (
                                            <tr>
                                                <td colSpan="6" className={styles.infoCellContainer}><Spinner.CircSide color="moody" /></td>
                                            </tr>
                                        ) : orderListSubscriptionScopeIds && orderListSubscriptionScopeIds.length ? (
                                            orderListSubscriptionScopeIds.map((orderId) => {
                                                let order = orderData[orderId]
                                                let {address} = order||{}

                                                console.log(["order address maluco", order, address, user])

                                                return order ? (
                                                    <tr key={order._id}>
                                                        <td>{order.count}</td>
                                                        <td><i18n.Moment date={order.createdAt} /></td>
                                                        <td>{address.label}</td>
                                                        {/*<td>{order.items.length}</td>*/}
                                                        <td><i18n.Number prefix="R$" numDecimals={2} value={order.totalPrice/100} /></td>
                                                        <td><i18n.Translate text={`_ORDER_STATUS_${lodash.toUpper(order.status)}_`}/></td>
                                                        <td>
                                                            {order.status == "unapproved" ? (
                                                                <Button to={{
                                                                    pathname: "/approve",
                                                                    query: {
                                                                        oid: order._id,
                                                                        oc: order.count,
                                                                        ln: list.name,
                                                                        bsm: lodash.get(listSubscription,"billingSource.method"),
                                                                        bsld: lodash.get(listSubscription,"billingSource.lastDigits"),
                                                                        bsb: lodash.get(listSubscription, "billingSource.brand")
                                                                    }
                                                                }} scale={0.6}><i18n.Translate text="_APPROVE_"/></Button>
                                                            ) : null }
                                                        </td>
                                                    </tr>
                                                ) : <span key={orderId}></span>
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan="6" className={styles.infoCellContainer}>
                                                    <i18n.Translate text="_ORDERS_PAGE_NO_DATA_FOUND_TEXT_" />
                                                </td>
                                            </tr>
                                        ) }
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>
        )
    }
}

/** Export **/
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Component)
