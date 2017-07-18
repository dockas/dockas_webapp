import React from "react"
import {connect} from "react-redux"
import lodash from "lodash"
import qs from "qs"
//import config from "config";
import {LoggerFactory} from "darch/src/utils"
import Container from "darch/src/container"
import Grid from "darch/src/grid"
import i18n from "darch/src/i18n"
import Field from "darch/src/field"
import Form from "darch/src/form"
import Button from "darch/src/button"
import Spinner from "darch/src/spinner"
import {Api} from "common"
import styles from "./styles"

let Logger = new LoggerFactory("approve")

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
    static displayName = "approve";
    static defaultProps = {};
    static propTypes = {};

    state = {};

    async componentDidMount() {
        let logger = Logger.create("componentDidMount")
        logger.info("enter")
    }

    async onSubmit(data) {
        let logger = Logger.create("onSubmit")
        logger.info("enter", data)

        let query = qs.parse(lodash.get(this.props, "location.search"))

        this.setState({approving: true})

        try {
            let response = await Api.shared.orderApprove(query.oid, data)
            logger.info("api orderApprove success", response)
        }
        catch(error) {
            logger.error("api orderApprove error", error)
        }

        this.setState({approving: false})
    }

    render() {
        let {approving} = this.state
        let query = qs.parse(lodash.get(this.props, "location.search"))

        return (
            <div>
                <Container size="md">
                    <h3 style={{textAlign: "center"}}>Autorizar Pedido #{query.oc}</h3>
                    <div style={{textAlign: "center"}}>Insira sua senha para autorizar o pagamento do pedido <b>#{query.oc}</b> no cartão <b>{query.bsb} ••••{query.bsld}</b>:</div>


                    <div style={{marginTop: "20px"}}>
                        <Grid>
                            <Grid.Cell></Grid.Cell>

                            <Grid.Cell span={1}>
                                <div className={styles.box}>
                                    <Form loading={approving}
                                        onSubmit={this.onSubmit}>
                                        <Field.Section>
                                            <div className={styles.label}>
                                                <i18n.Translate text="_APPROVE_LIST_ORDER_PAGE_PASSWORD_FIELD_LABEL_" />
                                            </div>
                                            <Field.Text
                                                type="password"
                                                name="password"
                                                placeholder="_APPROVE_LIST_ORDER_PAGE_PASSWORD_FIELD_LABEL_"
                                                scale={1.5}
                                                validators="$required"/>
                                            <Field.Error
                                                for="password"
                                                validator="$required"
                                                message="_FIELD_ERROR_REQUIRED_"/>
                                        </Field.Section>

                                        <Field.Section>
                                            <div className={styles.buttonContainer}>
                                                <Button type="submit"
                                                    block={true}
                                                    loadingComponent={
                                                        <span>
                                                            <i18n.Translate text="_LOADING_" />
                                                            <span className={styles.spinnerContainer}>
                                                                <Spinner.Bars color="#fff" />
                                                            </span>
                                                        </span>
                                                    }
                                                    scale={1.3}>
                                                    <i18n.Translate text="_AUTHORIZE_" />
                                                </Button>
                                            </div>
                                        </Field.Section>
                                    </Form>
                                </div>
                            </Grid.Cell>

                            <Grid.Cell></Grid.Cell>
                        </Grid>
                    </div>
                </Container>
            </div>
        )
    }
}

/** Export **/
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Component)
