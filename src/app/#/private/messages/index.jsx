import React from "react";
import lodash from "lodash";
import {connect} from "react-redux";
import {LoggerFactory,Redux} from "darch/src/utils";
import i18n from "darch/src/i18n";
import styles from "./styles";
import {Room} from "common";

let Logger = new LoggerFactory("messages", {level:"debug"});

/**
 * Redux map state to props function.
 *
 * @param {object} state
 * @param {object} ownProps
 */
function mapStateToProps(state) {
    return {
        user: state.user.profiles[state.user.uid],
        rooms: state.room.data,
        activeRoomId: state.room.activeId
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
    static displayName = "messages";
    static defaultProps = {};
    static propTypes = {};

    constructor(props) {
        super(props);

        this.state = {
        };
    }

    /**
     * LYFECICLE : This function is called when component
     * got mounted in the view.
     */
    componentDidMount() {
        let logger = Logger.create("componentDidMount");
        logger.info("enter");

        // Fetch user rooms that were not fetched yet.
        let {user,rooms} = this.props;
        let roomIdsToFetch = [];
        let roomIdsAlreadyFecthed = [];

        for (let userRoomId of (user.rooms||[])) {
            if(!rooms[userRoomId]) {roomIdsToFetch.push(userRoomId);}
            else { roomIdsAlreadyFecthed.push(userRoomId); }
        }

        logger.debug("rooms info", {
            userRooms: user.rooms,
            rooms,
            roomIdsToFetch,
            roomIdsAlreadyFecthed
        });

        if(roomIdsToFetch.length) {
            if(!roomIdsAlreadyFecthed.length){
                this.setState({loading: true});
            }

            Redux.dispatch(
                Room.actions.findRooms({
                    _id: roomIdsToFetch,
                    populate: [
                        "creator",
                        "tags"
                    ]
                })
            ).then(() => {
                this.setState({loading: false});
            });
        }
        
        this.filterUserRooms();
    }

    /**
     * LIFECYCLE 
     */
    componentDidUpdate(prevProps,prevState) {
        let logger = Logger.create("componentDidUpdate");
        logger.info("enter");

        let {rooms,activeRoomId} = this.props;
        let {userRooms} = this.state;

        // Filter user rooms.
        if(!lodash.isEqual(rooms, prevProps.rooms)) {
            this.filterUserRooms();
        }

        if(!lodash.isEqual(userRooms, prevState.userRooms)) {
            logger.debug("userRooms changed", {
                activeRoomId: activeRoomId
            });

            if(!activeRoomId && userRooms && userRooms.length) {
                Redux.dispatch(
                    Room.actions.setActiveRoomId(userRooms[0]._id)
                );
            }
        }
    }

    filterUserRooms() {
        let logger = Logger.create("filterUserRooms");
        logger.info("enter", {activeRoomId: this.props.activeRoomId});

        let {user,rooms} = this.props;
        let userRooms = [];

        for(let roomId of (user.rooms||[])) {
            if(!rooms[roomId]){continue;}
            userRooms.push(rooms[roomId]);
        }

        this.setState({userRooms});
    }

    onRoomSelect(room) {
        Redux.dispatch(
            Room.actions.setActiveRoomId(room._id)
        );
    }

    /**
     * This function renders new room component.
     */
    renderRoom() {
        let logger = Logger.create("renderRoom"),
            {activeRoomId,rooms} = this.props;
        
        logger.info("enter", {activeRoomId,rooms});

        if(!activeRoomId) {
            logger.debug("no activeRoomId");
            return null;
        }

        logger.debug("activeRoom", {room: rooms[activeRoomId]});

        return (
            <Room data={rooms[activeRoomId]} />
        );
    }

    /**
     * This function is responsible for generating the component's view.
     */
    render() {
        let {loading,userRooms} = this.state;
        let {activeRoomId} = this.props;

        return (
            <div className={styles.rooms}>
                <div className={styles.left}>
                    {loading||!userRooms ? (
                        <div style={{textAlign: "center"}}>
                            <i18n.Translate text="_LOADING_ROOMS_" />
                        </div>
                    ) : !(userRooms.length) ? (
                        <div style={{textAlign: "center"}}>
                            <i18n.Translate text="_YOU_ARE_MEMBER_OF_NO_ROOM_" />
                        </div>
                    ) : (
                        userRooms.map((room) => {
                            return <Room.Preview key={room._id} 
                                data={room}
                                active={room._id==activeRoomId}
                                onSelect={this.onRoomSelect}/>;
                        })
                    )}
                </div>
                <div className={styles.right}>
                    {this.renderRoom()}
                </div>
            </div>
        );
    }
}

/** Export **/
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Component);

