import React from "react";
import {connect} from "react-redux";
import {LoggerFactory,Redux} from "darch/src/utils";
import {Room} from "common";
import styles from "./styles";

let Logger = new LoggerFactory("room", {level:"debug"});

/**
 * Redux map state to props function.
 *
 * @param {object} state
 * @param {object} ownProps
 */
function mapStateToProps(state) {
    return {
        rooms: state.room.data
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
    static displayName = "room";
    static defaultProps = {};
    static propTypes = {};

    /** Instance properties **/
    state = {};

    /**
     * LYFECICLE : This function is called when component
     * got mounted in the view.
     */
    componentDidMount() {
        let logger = Logger.create("componentDidMount");
        logger.info("enter", {params: this.props.params});

        // Fetch room if not fetched yet.
        let {rooms,params} = this.props;

        if(!rooms[params.id]) {
            this.setState({loading: true});

            Redux.dispatch(
                Room.actions.findRooms({
                    _id: [params.id],
                    populate: [
                        "creator",
                        "tags"
                    ]
                })
            ).then(() => {
                this.setState({loading: false});
            });
        }
    }

    /**
     * This function is responsible for generating the component's view.
     */
    render() {
        let logger = Logger.create("componentDidMount"),
            {loading} = this.state,
            room = this.props.rooms[this.props.params.id];

        logger.info("enter", {room});

        return (
            <div className={styles.room}>
                <div className={styles.roomContainer}>
                    {loading ? (
                        <span>Carregando ...</span>
                    ) : room ? (
                        <Room data={room} />
                    ) : (
                        <span>Essa sala não existe</span>
                    )}
                </div>
            </div>
        );
    }
}

/** Export **/
/** Export **/
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Component);
