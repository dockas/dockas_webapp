import React from "react";
import lodash from "lodash";
import {connect} from "react-redux";
import {LoggerFactory,Redux} from "darch/src/utils";
import Container from "darch/src/container";
import i18n from "darch/src/i18n";
import Modal from "darch/src/modal";
import Label from "darch/src/label";
import Form from "darch/src/form";
import Field from "darch/src/field";
import Button from "darch/src/button";
import Spinner from "darch/src/spinner";
import {User} from "common";
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
        uid: state.user.uid,
        userData: state.user.data
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
        {value: "admin", label: "_ADMIN_USERS_PAGE_ROLE_ADMIN_"},
        {value: "seller", label: "_ADMIN_USERS_PAGE_ROLE_SELLER_"}
    ];

    async componentDidMount() {
        let logger = Logger.create("componentDidMount");
        logger.info("enter");

        try {
            let result = await Redux.dispatch(
                User.actions.userFind()
            );

            logger.info("action userFind success", result);
        }
        catch(error) {
            logger.error("action userFind error", error);
        }
    }

    onSetRoleButtonClicked(user) {
        return () => {
            //console.log(["CHANGE ROLE USER", user]);
            this.setState({
                changeRoleModalOpen: true,
                changeRoleUser: user
            });
        };
    }

    async onChangeRolesSubmit(data) {
        let logger = Logger.create("onChangeRolesSubmit");
        logger.info("enter");

        this.setState({changeRoleModalLoading: true});

        try {
            let result = await Redux.dispatch(
                User.actions.userUpdate(this.state.changeRoleUser._id, data)
            );

            logger.info("action userUpdate success", result);
        }
        catch(error) {
            logger.error("action userUpdate error", error);
        }

        this.setState({
            changeRoleModalLoading: false,
            changeRoleModalOpen: false,
            changeRoleUser: null
        });
    }

    render() {
        let {userData} = this.props;
        let {changeRoleUser,changeRoleModalLoading} = this.state;

        return (
            <div>
                <Container>
                    <h2 style={{marginTop: "30px"}}>
                    <i18n.Translate text="_ADMIN_USERS_PAGE_TITLE_" /><span style={{marginLeft: "15px"}}><Label color="#F9690E" scale={0.8} layout="outlined">admin</Label></span>
                </h2>

                    <div className="table-container">
                        <table className="table">
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
                                {lodash.map(userData, (user) => {
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
                                })}
                            </tbody>
                        </table>
                    </div>
                </Container>

                <Modal open={this.state.changeRoleModalOpen} onDismiss={() => {
                    this.setState({changeRoleModalOpen: false});
                }}>
                    <Modal.Header>
                        <h3 style={{margin: 0}}><i18n.Translate text="_ADMIN_USERS_PAGE_CHANGE_ROLE_MODAL_TITLE_" /></h3>
                    </Modal.Header>

                    <Form onSubmit={this.onChangeRolesSubmit} loading={changeRoleModalLoading}>
                        <Modal.Body>
                            <Field.Section>
                                <div className={styles.label}>
                                    <i18n.Translate text="_ADMIN_USERS_PAGE_CHANGE_ROLE_MODAL_ROLE_LABEL_" />
                                </div>
                                <Field.Select
                                    name="roles"
                                    value={lodash.get(changeRoleUser, "roles")}
                                    onChange={(val) => {
                                        this.setState({changeRoleUserRole: val});
                                    }}
                                    nonRemovableValues={["user"]}
                                    multi={true}
                                    placeholder="_ADMIN_USERS_PAGE_CHANGE_ROLE_MODAL_ROLE_PLACEHOLDER_"
                                    options={this.userRolesOptions}
                                    validators="$required"/>
                            </Field.Section>
                        </Modal.Body>

                        <Modal.Footer align="right">
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
                        </Modal.Footer>
                    </Form>
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
