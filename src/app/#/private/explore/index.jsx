import React from "react";
import {LoggerFactory} from "darch/src/utils";
import i18n from "darch/src/i18n";
import Container from "darch/src/container";
import Grid from "darch/src/grid";
import styles from "./styles";
import {Api,Room} from "common";

let Logger = new LoggerFactory("private.explore", {level: "debug"});

/**
 * Main component class.
 */
export default class Component extends React.Component {
    /** React properties **/
    static displayName = "private.explore";
    static defaultProps = {};
    static propTypes = {};

    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        let logger = Logger.create("componentDidMount");
        logger.info("enter");

        // Load rooms.
        this.loadRooms();
    }

    /**
     * This function load rooms into the scene.
     */
    async loadRooms() {
        let logger = Logger.create("loadRooms");
        logger.info("enter");

        this.setState({loadingRooms: true});

        try {
            // @FIX : It should be some query here to prevent finding
            // all rooms :)
            let response = await Api.shared.roomFind({
                populate: ["tags"]
            });

            logger.debug("api roomFind success", response);

            this.setState({
                rooms: response.results, 
                loadingRooms: false
            });
        }
        catch(error) {
            logger.error("api roomFind error", error);
        }
    }

    render() {
        let {loadingRooms, rooms} = this.state;

        return (
            <Container className={styles.main}>
                {loadingRooms ? (
                    <div><i18n.Translate text="_LOADING_ROOMS_" /></div>
                ) : rooms ? (
                    <Grid spots={4}>
                        {rooms.map((room) => {
                            return (
                                <Grid.Cell key={room._id} >
                                    <Room.Card data={room} />
                                </Grid.Cell>
                            );
                        })}
                    </Grid>
                ) : null}
            </Container>
        );
    }
}
