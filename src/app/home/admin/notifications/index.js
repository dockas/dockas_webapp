import React from "react"
import lodash from "lodash"
import {LoggerFactory,Redux} from "darch/src/utils"
import Container from "darch/src/container"
//import Spinner from "darch/src/spinner";
import i18n from "darch/src/i18n"
import Toaster from "darch/src/toaster"
import Tabs from "darch/src/tabs"
import {Api} from "common"
import Bar from "../bar"
import styles from "./styles"

let Logger = new LoggerFactory("admin.notifications")

/**
 * Main component class.
 */
export default class Component extends React.Component {
    /** React properties **/
    static displayName = "admin.notifications";
    static defaultProps = {};
    static propTypes = {};

    state = {};

    async componentDidMount() {
        let logger = Logger.create("componentDidMount")
        logger.info("enter")

        //this.setState({initializing: true});

        /*let findResponse = await Api.shared.invitationFind();

        this.setState({
            initializing: false,
            invitations: findResponse.results
        });*/
    }

    onSendBtnClick(invitation) {
        return async () => {
            let logger = Logger.create("componentDidMount")
            logger.info("enter", invitation)

            try {
                let response = await Api.shared.invitationSend(invitation._id)

                logger.info("api invitationSend success")

                // Assign updated data to invitation.
                lodash.assign(invitation, response.result)

                // Trigger rendering.
                this.setState({invitations: this.state.invitations})

                // Notify
                Redux.dispatch(Toaster.actions.push("success", "_INVITATION_SEND_SUCCESS_TOAST_MESSAGE_"))
            }
            catch(error) {
                logger.error("api invitationSend error", error)
            }
        }
    }

    render() {
        //let {initializing,invitations} = this.state;

        return (
            <div>
                <Bar>
                    <Tabs.Item align="right" color="moody" to="/admin/create/notification"><i18n.Translate text="_ADMIN_BAR_NOTIFICATIONS_CREATE_ACTION_LABEL_" /></Tabs.Item>
                </Bar>
                
                <Container>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th><i18n.Translate text="_ADMIN_NOTIFICATIONS_PAGE_USERS_TH_" /></th>
                                    <th><i18n.Translate text="_ADMIN_NOTIFICATIONS_TYPE_TH_" /></th>
                                    <th><i18n.Translate text="_ADMIN_NOTIFICATIONS_MESSAGE_TH_" /></th>
                                    <th><i18n.Translate text="_ADMIN_NOTIFICATIONS_PAGE_CREATED_AT_TH_" /></th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {/*initializing ? (
                                    <tr>
                                        <td colSpan="5" className={styles.infoCellContainer}><Spinner.CircSide color="moody" /></td>
                                    </tr>
                                ) : invitations && invitations.length ? (
                                    invitations.map((invitation) => {
                                        return (
                                            <tr key={invitation._id}>
                                                <td>{invitation.email}</td>
                                                <td>{invitation.sentCount}</td>
                                                <td>{invitation.sentAt ? (<i18n.Moment date={invitation.sentAt} />) : "-"}</td>
                                                <td>{invitation.status ? invitation.status : "open"}</td>
                                                <td>
                                                    {invitation.status != "closed" ? (
                                                        <a onClick={this.onSendBtnClick(invitation)} style={{fontSize: "1.4em"}} title="send">
                                                            <span className="icon-paper-plane"></span>
                                                        </a>
                                                    ) : null}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="6" className={styles.infoCellContainer}>
                                            <i18n.Translate text="_ADMIN_INVITATIONS_PAGE_NO_DATA_FOUND_TEXT_" />
                                        </td>
                                    </tr>
                                )*/}
                                
                            </tbody>
                        </table>
                    </div>
                </Container>
            </div>
        )
    }
}
