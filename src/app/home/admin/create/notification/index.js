import React from "react"
import lodash from "lodash"
import {LoggerFactory} from "darch/src/utils"
import Container from "darch/src/container"
import i18n from "darch/src/i18n"
import Form from "darch/src/form"
import Field from "darch/src/field"
import Text from "darch/src/text"
import Button from "darch/src/button"
import Spinner from "darch/src/spinner"
import Grid from "darch/src/grid"
import {Api} from "common"
import styles from "./styles"

let Logger = new LoggerFactory("create.notification")

/**
 * Main component class.
 */
export default class Component extends React.Component {
    /** React properties **/
    static displayName = "create.notification";
    static defaultProps = {};
    static propTypes = {};

    state = {
        options: []
    };

    componentDidMount() {
        let logger = Logger.create("componentDidMount")
        logger.info("enter")
    }

    /**
     * This function loads users.
     */
    async loadUsers(value) {
        let logger = Logger.create("loadUsers")
        logger.info("enter", {value})

        if(lodash.isEmpty(value)) {return}

        this.setState({loadingUsers: true})

        try {
            let response = await Api.shared.userFind({
                email: value
            })

            logger.debug("Api userFind success", response)

            // Process users
            let users = response.results.map((user) => {
                return {value: user._id, label: user.email}
            })

            this.setState({users, loadingUsers: false})
        }
        catch(error) {
            logger.error("Api userFind error", error)
            this.setState({loadingUsers: false})
        }
    }

    onFormSubmit(data) {
        let logger = Logger.create("onFormSubmit")
        logger.info("enter", data)
    }

    render() {
        let {loading,users,loadingUsers,options} = this.state

        return (
            <div>
                <Container size="md">
                    <h3 className="headline"><i18n.Translate text="_CREATE_NOTIFICATION_PAGE_TITLE_" /></h3>

                    <Field.Section>
                        <Form loading={loading}
                            onSubmit={this.onFormSubmit}>

                            <Field.Section>
                                <Text scale={0.8} color="moody">
                                    <i18n.Translate text="_CREATE_NOTIFICATION_PAGE_USERS_FIELD_LABEL_" />
                                </Text>
                                <div>
                                    <Field.Select
                                        name="users"
                                        placeholder="_CREATE_NOTIFICATION_PAGE_USERS_FIELD_PLACEHOLDER_"
                                        options={users}
                                        loadOptions={this.loadUsers}
                                        loading={loadingUsers}
                                        clearSearchOnSelect={true}
                                        creatable={false}
                                        multi={true}
                                        scale={1}
                                        loaderComponent={<Spinner.CircSide color="#555" />}/>
                                </div>
                            </Field.Section>

                            <Field.Section>
                                <Grid>
                                    <Grid.Cell>
                                        <Field.Section>
                                            <Text scale={0.8} color="moody">
                                                <i18n.Translate text="_CREATE_NOTIFICATION_PAGE_MESSAGE_FIELD_LABEL_" />
                                            </Text>
                                            <div>
                                                <Field.TextArea
                                                    name="name"
                                                    placeholder="_CREATE_NOTIFICATION_PAGE_MESSAGE_FIELD_PLACEHOLDER_"
                                                    scale={1}
                                                    validators="$required"/>
                                                <Field.Error
                                                    for="name"
                                                    validator="$required"
                                                    message="_FIELD_ERROR_REQUIRED_"/>
                                            </div>
                                        </Field.Section>
                                    </Grid.Cell>
                                </Grid>
                            </Field.Section>
                        </Form>
                    </Field.Section>

                    <div className={styles.optionsContainer}>
                        <Text scale={0.8} color="moody">
                            <i18n.Translate text="_CREATE_NOTIFICATION_PAGE_OPTIONS_FIELD_LABEL_" />
                        </Text>

                        <Form onSubmit={(data) => {
                            return new Promise((resolve) => {
                                let options = this.state.options.concat([data])

                                this.setState({options}, () => {
                                    resolve({value: "", label: ""})
                                })
                            })
                        }}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>
                                            <Field.Text
                                                name="value"
                                                placeholder="_CREATE_NOTIFICATION_PAGE_OPTION_VALUE_FIELD_PLACEHOLDER_"
                                                scale={1}/>
                                        </th>
                                        <th>
                                            <Field.Text
                                                name="label"
                                                placeholder="_CREATE_NOTIFICATION_PAGE_OPTION_LABEL_FIELD_PLACEHOLDER_"
                                                scale={1}/>
                                        </th>
                                        <th>
                                            <Button type="submit" layout="link">add</Button>
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {options.map((option) => {
                                        return (
                                            <tr key={option.value}>
                                                <td>{option.value}</td>
                                                <td>{option.label}</td>
                                                <td></td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </Form>
                    </div>
                </Container>
            </div>
        )
    }
}
