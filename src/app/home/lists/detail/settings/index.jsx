import React from "react";
import {connect} from "react-redux";
import lodash from "lodash";
import {withRouter} from "react-router";
//import config from "config";
import {LoggerFactory,Redux} from "darch/src/utils";
import Form from "darch/src/form";
import Field from "darch/src/field";
import Button from "darch/src/button";
import i18n from "darch/src/i18n";
import Text from "darch/src/text";
import Spinner from "darch/src/spinner";
import {Api,List} from "common";
import DetailBar from "../bar";
import styles from "./styles";

let Logger = new LoggerFactory("lists.detail.settings");

/**
 * Redux map state to props function.
 *
 * @param {object} state
 * @param {object} ownProps
 */
function mapStateToProps(state) {
    return {
        userData: state.user.data,
        listData: state.list.data,
        listNameIdToId: state.list.nameIdToId,
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
    static displayName = "lists.detail.settings";
    static defaultProps = {};
    static propTypes = {};

    state = {};

    getScopeData(props=this.props) {
        let result = {},
            nameId = lodash.get(props, "params.id"),
            {listData,listNameIdToId} = props;

        console.log([
            "list settings getScopeData",
            nameId, 
            listData,
            listNameIdToId
        ]);

        result.list = listNameIdToId[nameId] ?
            listData[listNameIdToId[nameId]] :
            null;

        return result;
    }

    async componentDidMount() {
        let {list} = this.getScopeData(),
            logger = Logger.create("componentDidMount");

        logger.info("enter", {list});

        this.prevData = lodash.pick(list, ["name", "owners"]);

        // Ensure that list is populated with necessary data.
        if(list) {
            await List.populator.populate([list], {
                paths: [
                    "owners[].user"
                ]
            });

            this.setOwners();
        }
    }

    async componentDidUpdate(prevProps) {
        console.log([
            "list settings getScopeData : componentDidUpdate",
            this.props.params.id,
            prevProps.params.id
        ]);
    }

    setOwners() {
        let logger = Logger.create("setOwners");
        let {list} = this.getScopeData();
        let {userData} = this.props;
        let ownerIds = lodash.map(list.owners, "user");
        let ownersDropdown = [];

        for(let owner of list.owners) {
            if(!userData[owner.user]){continue;}
            ownersDropdown.push({
                value: owner.user,
                label: lodash.get(userData, `${owner.user}.email`)
            });
        }

        logger.debug("data", {
            ownerIds,
            ownersDropdown
        });

        this.setState({
            ownerIds,
            users: ownersDropdown
        });
    }

    async loadUsers(value) {
        let logger = Logger.create("loadUsers");
        logger.info("enter", {value});

        if(lodash.isEmpty(value)) {return;}

        this.setState({loadingUsers: true});

        try {
            let response = await Api.shared.userFind({
                email: value
            });

            logger.debug("api userFind success", response);

            // Process users
            let users = response.results.map((user) => {
                return {
                    value: user._id, 
                    label: user.email
                };
            });

            this.setState({users, loadingUsers: false});
        }
        catch(error) {
            logger.error("api userFind error", error);
            this.setState({loadingUsers: false});
        }
    }

    async onSave(data, {updatedFields=[]}={}) {
        let result,
            {list} = this.getScopeData(),
            logger = Logger.create("onSave");

        logger.info("enter", {data, updatedFields});
        this.setState({saving: true});

        // Pick just the updated fields.
        data = lodash.pick(data, updatedFields);

        // Prevent update nothing
        if(!lodash.size(data)){return;}

        // Process owners
        if(data.owners) {
            data.owners = lodash.map(data.owners, (owner) => {
                return {user: owner};
            });
        }

        try {
            result = await Redux.dispatch(
                List.actions.listUpdate(list._id, data)
            );

            logger.info("action listUpdate success", result);

            result = lodash.get(result, "value.data");
        }
        catch(error) {
            logger.error("action listUpdate error", error);
        }

        // If name has changed, then we must redirect user to new url.
        if(data.name && data.name != this.prevData.name) {
            //window.location.href = `/lists/${result.nameId}/settings`;
            this.props.router.push({
                pathname: `/lists/${result.nameId}/settings`
            });

            this.prevData = Object.assign({}, this.prevData, data);
        }

        this.setState({saving: false});
    }

    render() {
        let {list} = this.getScopeData();
        let {uid} = this.props;
        let {saving,users,loadingUsers,ownerIds} = this.state;

        return (
            <div>
                <DetailBar list={list} />

                <div className={styles.box}>
                    <Form onSubmit={this.onSave} loading={saving}>
                        <div className={styles.header}>
                            <div className={styles.titleContainer}>
                                <h3 style={{margin: "0"}}>
                                    Geral

                                    <div style={{float: "right"}}>
                                        <div className="field-gap">
                                            <Button scale={0.7} type="submit">
                                                <span>salvar</span>
                                            </Button>
                                        </div>
                                    </div>
                                </h3>
                            </div>
                        </div>

                        <div className={styles.body}>
                            <Field.Section>
                                <Text scale={0.8}><i18n.Translate text="_LIST_DETAIL_SETTINGS_PAGE_NAME_FIELD_LABEL_" /></Text>

                                <Field.Text name="name" 
                                    value={list.name}
                                    validators="$required"/>

                                <Field.Error for="name"
                                    validator="$required"
                                    message="_FIELD_ERROR_REQUIRED_"/>
                            </Field.Section>

                            <Field.Section>
                                <Text scale={0.8}>
                                    <i18n.Translate text="_CREATE_LIST_PAGE_USERS_FIELD_LABEL_" />
                                </Text>
                                <div>
                                    <Field.Select
                                        name="owners"
                                        placeholder="_CREATE_LIST_PAGE_USERS_FIELD_PLACEHOLDER_"
                                        nonRemovableValues={[uid]}
                                        options={users}
                                        value={ownerIds}
                                        loadOptions={this.loadUsers}
                                        loading={loadingUsers}
                                        clearSearchOnSelect={true}
                                        creatable={false}
                                        multi={true}
                                        scale={1}
                                        loaderComponent={<Spinner.CircSide color="#555" />}/>
                                    <Field.Error
                                        for="users"
                                        validator="$required"
                                        message="_FIELD_ERROR_REQUIRED_"/>
                                </div>
                            </Field.Section>
                        </div>
                    </Form>
                </div>
            </div>
        );
    }
}

/** Export **/
export default withRouter(connect(
    mapStateToProps,
    mapDispatchToProps
)(Component));
