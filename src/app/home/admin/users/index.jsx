import React from "react";
import lodash from "lodash";
import {connect} from "react-redux";
import {LoggerFactory} from "darch/src/utils";
import Container from "darch/src/container";
import i18n from "darch/src/i18n";
import Modal from "darch/src/modal";
//import Form from "darch/src/form";
import Field from "darch/src/field";
import Button from "darch/src/button";
import Spinner from "darch/src/spinner";
import {Api} from "common";
import Bar from "../bar";
import styles from "./styles";

let Logger = new LoggerFactory("admin.users");

/**
 * Redux map state to props function.
 *
 * @param {object} state
 * @param {object} ownProps
 */
function mapStateToProps(state) {
    return {
        uid: state.user.uid
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
    static displayName = "admin.users";
    static defaultProps = {};
    static propTypes = {};

    state = {};

    userRolesOptions = [
        {value: "user", label: "_ADMIN_USERS_PAGE_ROLE_USER_"},
        {value: "admin", label: "_ADMIN_USERS_PAGE_ROLE_ADMIN_"}
    ];

    async componentDidMount() {
        let logger = Logger.create("componentDidMount");
        logger.info("enter");

        let findResponse = await Api.shared.userFind();

        console.log(["USERS", findResponse.results]);

        this.setState({
            users: findResponse.results
        });
    }

    onSetRoleButtonClicked(user) {
        return () => {
            console.log(["CHANGE ROLE USER", user]);
            this.setState({
                changeRoleModalOpen: true,
                changeRoleUser: user,
                changeRoleUserRole: user.role
            });
        };
    }

    async onChangeRoleSubmit() {
        let logger = Logger.create("onChangeRoleSubmit");
        logger.info("enter");

        this.setState({changeRoleModalLoading: true});

        let data = {
            _id: this.state.changeRoleUser._id,
            roles: [this.state.changeRoleUserRole]
        };

        await Api.shared.userUpdate(data);

        // Update user profile
        this.state.changeRoleUser.roles = data.roles;

        this.setState({
            changeRoleModalLoading: false,
            changeRoleModalOpen: false,
            changeRoleUser: null
        });
    }

    render() {
        let role = lodash.get(this.state, "changeRoleUserRole");

        console.log(["THE ROLE", role, this.userRolesOptions]);

        return (
            <div>
                <Bar />

                <Container>
                    <table>
                        <thead>
                            <tr>
                                <th><i18n.Translate text="_ADMIN_USERS_PAGE_FULL_NAME_TH_" /></th>
                                <th><i18n.Translate text="_ADMIN_USERS_PAGE_EMAIL_TH_" /></th>
                                <th><i18n.Translate text="_ADMIN_USERS_PAGE_ROLE_TH_" /></th>
                                <th><i18n.Translate text="_ADMIN_USERS_PAGE_CREATED_AT_TH_" /></th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.state.users && this.state.users.length ? this.state.users.map((user) => {
                                return (
                                    <tr key={user._id}>
                                        <td>{user.fullName}</td>
                                        <td>{user.email}</td>
                                        <td>{user.roles.join(",")}</td>
                                        <td>
                                            {user.createdAt ? <i18n.Moment date={user.createdAt} /> : null}
                                        </td>
                                        <td>
                                            <a onClick={this.onSetRoleButtonClicked(user)} style={{fontSize: "1.4em"}} title="change role">
                                                <span className="icon-user-checked"></span>
                                            </a>
                                        </td>
                                    </tr>
                                );
                            }) : null}
                        </tbody>
                    </table>
                </Container>

                <Modal open={this.state.changeRoleModalOpen} onDismiss={() => {
                    this.setState({changeRoleModalOpen: false});
                }}>
                    <Modal.Header>
                        <h3 style={{margin: 0}}><i18n.Translate text="_ADMIN_USERS_PAGE_CHANGE_ROLE_MODAL_TITLE_" /></h3>
                    </Modal.Header>

                     <Modal.Body>
                        <Field.Section>
                            <div className={styles.label}>
                                <i18n.Translate text="_ADMIN_USERS_PAGE_CHANGE_ROLE_MODAL_ROLE_LABEL_" />
                            </div>
                            <Field.Select
                                name="role"
                                value={role}
                                onChange={(val) => {
                                    this.setState({changeRoleUserRole: val});
                                }}
                                multi={false}
                                placeholder="_ADMIN_USERS_PAGE_CHANGE_ROLE_MODAL_ROLE_PLACEHOLDER_"
                                options={this.userRolesOptions}/>
                        </Field.Section>
                    </Modal.Body>

                    <Modal.Footer align="right">
                        <Button type="submit"
                            onClick={this.onChangeRoleSubmit}
                            loading={this.state.changeRoleModalLoading}
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
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
}

/** Export **/
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Component);
