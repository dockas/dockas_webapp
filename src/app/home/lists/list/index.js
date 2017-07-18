import React from "react"
import lodash from "lodash"
import {connect} from "react-redux"
import {withRouter} from "react-router-dom"
import {LoggerFactory,Redux} from "darch/src/utils"
import Container from "darch/src/container"
import Grid from "darch/src/grid"
//import i18n from "darch/src/i18n";
import authPol from "policies/auth"
import {List} from "common"
import styles from "./styles"

let Logger = new LoggerFactory("lists.list")

/**
 * Redux map state to props function.
 *
 * @param {object} state
 * @param {object} ownProps
 */
function mapStateToProps(state) {
    return {
        uid: state.user.uid,
        user: state.user.uid?state.user.data[state.user.uid]:null,
        listData: state.list.data,
        listPublicScopeIds: lodash.get(state.list, "scope.public.ids"),
        listMyScopeIds: lodash.get(state.list, "scope.my.ids")
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
    static displayName = "lists.list";
    static defaultProps = {};
    static propTypes = {};

    state = {}

    getScopeData(props=this.props) {
        let brand,
            nameId = lodash.get(props, "params.id"),
            {brandData,brandNameIdToId} = props

        brand = brandNameIdToId[nameId] ?
            brandData[brandNameIdToId[nameId]] : 
            null

        return {brand}
    }

    async componentDidMount() {
        let {history} = this.props,
            logger = Logger.create("componentDidMount")

        logger.info("enter")

        // Initialize
        try {
            await authPol(history)
        }
        catch(error) {
            return logger.error("authPol error", error)
        }

        this.setState({initialized: true})

        // Find public lists.
        try {
            await Redux.dispatch(
                List.actions.listFind({
                    status: ["public"],
                    sort: {priority: -1}
                }, {
                    scope: {id: "public"},
                    populate: {
                        paths: [
                            "bannerImage",
                            "items[].product"
                        ]
                    }
                })
            )
        }
        catch(error) {
            logger.error("list action find error", error)
        }

        // Find my lists.
        try {
            await Redux.dispatch(
                List.actions.listFind({
                    status: ["public","private"],
                    sort: {priority: -1}
                }, {
                    scope: {id: "my"},
                    populate: {
                        paths: [
                            "bannerImage",
                            "items[].product"
                        ]
                    }
                })
            )
        }
        catch(error) {
            logger.error("list action find error", error)
        }
    }

    render() {
        let {initialized} = this.state

        let {
            listData,
            listPublicScopeIds,
            listMyScopeIds
        } = this.props

        return initialized ? (
            <div>
                <Container>
                    {listMyScopeIds ? (
                        <div className={styles.section}>
                            <div className={styles.header}>
                                <h4 className={styles.title}>Minhas Listas</h4>
                            </div>

                            {listMyScopeIds.length ? (
                                <Grid spots={5}>
                                    {listMyScopeIds.map((listId) => {
                                        let list = listData[listId]

                                        return (
                                            <Grid.Cell key={list._id}>
                                                <List.Card2 list={list}/>
                                            </Grid.Cell>
                                        )
                                    })}
                                </Grid>
                            ) : null}
                        </div>
                    ) : null}

                    <div className={styles.section}>
                        <div className={styles.header}>
                            <h4 className={styles.title}>Públicas</h4>
                        </div>

                        {listPublicScopeIds && listPublicScopeIds.length ? (
                            <Grid spots={5}>
                                {listPublicScopeIds.map((listId) => {
                                    let list = listData[listId]

                                    return (
                                        <Grid.Cell key={list._id}>
                                            <List.Card2 list={list}/>
                                        </Grid.Cell>
                                    )
                                })}
                            </Grid>
                        ) : null}
                    </div>
                </Container>
            </div>
        ) : null
    }
}

/** Export **/
export default withRouter(connect(
    mapStateToProps,
    mapDispatchToProps
)(Component))
