import React from "react"
import lodash from "lodash"
import {connect} from "react-redux"
import {LoggerFactory} from "darch/src/utils"
import Tabs from "darch/src/tabs"
import i18n from "darch/src/i18n"
import Button from "darch/src/button"
import styles from "./styles"

let Logger = new LoggerFactory("lists.detail.bar")

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
    static displayName = "lists.detail.bar";
    static defaultProps = {};
    static propTypes = {};

    async componentDidMount() {
        let logger = Logger.create("componentDidMount")
        logger.info("enter")
    }

    render() {
        let {user,list} = this.props
        let nameId = list.nameId
        let isOwner = user && list && lodash.findIndex(list.owners, (owner) => {
            return owner.user == user._id
        }) >= 0

        console.log(["isOwner list", isOwner, user, list])

        //let listSubscription = subscriptions[list._id];

        return (
            <div className={styles.tabsContainer}>
                <Tabs bordered={true}>
                    <Tabs.Item to={`/lists/${nameId}`}><i18n.Translate text="_LIST_DETAIL_PAGE_INFO_TAB_LABEL_"/></Tabs.Item>
                    
                    {isOwner ? (
                        <Tabs.Item to={`/lists/${nameId}/subscription`}><i18n.Translate text="_LIST_DETAIL_PAGE_SUBSCRIPTION_TAB_LABEL_"/></Tabs.Item>
                    ) : null}

                    {isOwner ? (
                        <Tabs.Item to={`/lists/${nameId}/settings`}><i18n.Translate text="_LIST_DETAIL_PAGE_SETTINGS_TAB_LABEL_"/></Tabs.Item>
                    ) : null}

                    {/*listSubscription? (
                        <Tabs.Item to={`/lists/${nameId}/subscription`}><i18n.Translate text="_LIST_DETAIL_PAGE_SUBSCRIPTION_TAB_LABEL_"/></Tabs.Item>
                    ) : null*/}

                    {/*!listSubscription ? (
                        <Tabs.Item align="right">
                            <div className="field-gap"><Button scale={0.7} to={`/lists/${nameId}/subscribe`}>assinar</Button></div>
                        </Tabs.Item>
                    ) : null*/}

                    {!isOwner ? (
                        <Tabs.Item align="right">
                            <div className="field-gap">
                                <Button scale={0.6} to={{
                                    pathname: "/create/list", 
                                    query: {from: list.nameId}
                                }}>adicionar às minhas listas</Button>
                            </div>
                        </Tabs.Item>
                    ) : null}

                    {this.props.children}
                </Tabs>
            </div>
        )
    }
}

/** Export **/
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Component)
