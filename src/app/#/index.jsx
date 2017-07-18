import React from "react"
import {connect} from "react-redux"
//import lodash from "lodash";
//import config from "config";
import {LoggerFactory} from "darch/src/utils"
import styles from "./styles"

let Logger = new LoggerFactory("lists.detail.subscribe")

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
    static displayName = "lists.detail.subscribe";
    static defaultProps = {};
    static propTypes = {};

    state = {};

    async componentDidMount() {
        let logger = Logger.create("componentDidMount")
        logger.info("enter")
    }

    render() {
        return (
            <div>
                subscribe
            </div>
        )
    }
}

/** Export **/
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Component)
