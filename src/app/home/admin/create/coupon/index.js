import React from "react"
import lodash from "lodash"
import {withRouter} from "react-router-dom"
import config from "config"
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

let Logger = new LoggerFactory("create.coupon", {level: "debug"})

/**
 * Main component class.
 */
class Component extends React.Component {
    /** React properties **/
    static displayName = "create.coupon";
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

    async onFormSubmit(data) {
        let logger = Logger.create("onFormSubmit")
        logger.info("enter", data)

        this.setState({loading: true})

        // @TODO : Set more general currency symbol and code.
        if(data.valueType == "monetary") {
            data.currencySymbol = "R$"
            data.currencyCode = "BRL"
        }

        // Create the coupon
        try {
            let response = await Api.shared.couponCreate(data)

            logger.info("api couponCreate success", response)

            // Go to coupons page.
            this.props.history.replace("/admin/coupons")
        }
        catch(error) {
            logger.error("api couponCreate error", error)
            this.setState({loading: false})
        }
    }

    render() {
        let {loading,users,loadingUsers} = this.state

        return (
            <div>
                <Container size="md">
                    <h3 className="headline"><i18n.Translate text="_CREATE_COUPON_PAGE_TITLE_" /></h3>

                    <Form loading={loading}
                        onSubmit={this.onFormSubmit}>

                        <Field.Section>
                            <Grid>
                                <Grid.Cell>
                                    <Field.Section>
                                        <Text scale={0.8} color="moody">
                                            <i18n.Translate text="_CREATE_COUPON_PAGE_NAME_ID_LABEL_" />
                                        </Text>
                                        <div>
                                            <Field.Text
                                                name="nameId"
                                                placeholder="_CREATE_COUPON_PAGE_NAME_ID_PLACEHOLDER_"
                                                scale={1}
                                                validators="id|$required"/>
                                            <Field.Error
                                                for="nameId"
                                                validator="id"
                                                message="_FIELD_ERROR_ID_"/>
                                            <Field.Error
                                                for="nameId"
                                                validator="$required"
                                                message="_FIELD_ERROR_REQUIRED_"/>
                                        </div>
                                    </Field.Section>
                                </Grid.Cell>

                                <Grid.Cell>
                                    <Field.Section>
                                        <Text scale={0.8} color="moody">
                                            <i18n.Translate text="_CREATE_COUPON_PAGE_MAX_APPLY_COUNT_LABEL_" />
                                        </Text>
                                        <div>
                                            <Field.Number
                                                name="maxApplyCount"
                                                value={1}
                                                numDecimals={0}
                                                scale={1}/>
                                        </div>
                                    </Field.Section>
                                </Grid.Cell>
                            </Grid>
                        </Field.Section>

                        <Field.Section>
                            <Text scale={0.8} color="moody">
                                <i18n.Translate text="_CREATE_COUPON_PAGE_USERS_FIELD_LABEL_" />
                            </Text>
                            <div>
                                <Field.Select
                                    name="users"
                                    placeholder="_CREATE_COUPON_PAGE_USERS_FIELD_PLACEHOLDER_"
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
                                            <i18n.Translate text="_CREATE_COUPON_PAGE_VALUE_LABEL_" />
                                        </Text>
                                        <div>
                                            <Field.Number
                                                name="value"
                                                numDecimals={2}
                                                scale={1}
                                                validators="$required"/>
                                            <Field.Error
                                                for="nameId"
                                                validator="$required"
                                                message="_FIELD_ERROR_REQUIRED_"/>
                                        </div>
                                    </Field.Section>
                                </Grid.Cell>

                                <Grid.Cell>
                                    <Field.Section>
                                        <Text scale={0.8} color="moody">
                                            <i18n.Translate text="_CREATE_COUPON_PAGE_VALUE_TYPE_LABEL_" />
                                        </Text>
                                        <div>
                                            <Field.Select
                                                name="valueType"
                                                value="percentual"
                                                placeholder="_CREATE_COUPON_PAGE_VALUE_TYPE_FIELD_PLACEHOLDER_"
                                                options={config.coupon.types}
                                                clearSearchOnSelect={true}
                                                creatable={false}
                                                multi={false}
                                                scale={1} />
                                        </div>
                                    </Field.Section>
                                </Grid.Cell>
                            </Grid>
                        </Field.Section>

                        <Field.Section>
                            <Text scale={0.8} color="moody">
                                <i18n.Translate text="_CREATE_COUPON_PAGE_DESCRIPTION_LABEL_" />
                            </Text>
                            <Field.TextArea
                                rows={2}
                                name="description"
                                placeholder="_CREATE_COUPON_PAGE_DESCRIPTION_FIELD_PLACEHOLDER_"
                                scale={1} />
                            <Field.Error
                                for="description"
                                validator="$required"
                                message="_FIELD_ERROR_REQUIRED_"/>
                        </Field.Section>

                        <Field.Section>
                            <div className={styles.buttonContainer}>
                                <Button type="submit"
                                    loadingComponent={
                                        <span>
                                            <i18n.Translate text="_LOADING_" />
                                            <span className={styles.spinnerContainer}>
                                                <Spinner.Bars color="#fff" />
                                            </span>
                                        </span>
                                    }
                                    scale={1}>
                                    <i18n.Translate text="_CREATE_COUPON_PAGE_SUBMIT_BUTTON_TEXT_" />
                                </Button>
                            </div>
                        </Field.Section>
                    </Form>

                    {/*<div className={styles.optionsContainer}>
                        <Text scale={0.8} color="moody">
                            <i18n.Translate text="_CREATE_NOTIFICATION_PAGE_OPTIONS_FIELD_LABEL_" />
                        </Text>

                        <Form onSubmit={(data) => {
                            return new Promise((resolve) => {
                                let options = this.state.options.concat([data]);

                                this.setState({options}, () => {
                                    resolve({value: "", label: ""});
                                });
                            });
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
                                        );
                                    })}
                                </tbody>
                            </table>
                        </Form>
                    </div>*/}
                </Container>
            </div>
        )
    }
}

export default withRouter(Component)
