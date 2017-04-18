import lodash from "lodash";
import {LoggerFactory} from "darch/src";
import io from "socket.io-client";
import Api from "./api";

let Logger = new LoggerFactory("common.utils.socket", {level:"debug"});

/**
 * Main class definition.
 */
export default class Socket {
    static eventsToReemit = {};

    constructor({url="", shared=false} = {}) {
        let logger = Logger.create("constructor");
        logger.info("enter", {url,shared});

        this.io = io(url);

        if(shared) {Socket.shared = this;}

        this.io.on("connected", (data) => {
            logger.debug("connected", data);

            // Reconnect
            if(this.disconnected) {
                this.disconnected = false;

                lodash.forOwn(this.eventsToReemit, (reemit, event) => {
                    logger.debug("event to reemit", {event,reemit});

                    if(reemit.on == "reconnect") {
                        this.emit(event, reemit.data);
                    }
                });
            }

            // Gets connected when signed, so resign.
            if(this.signed) {
                Api.shared.http.getAuthToken().then((token) => {
                    this.sign(token);
                });
            }
        });

        this.io.on("sign:success", () => {
            logger.debug("sign:success");
            this.signed = true;
            
            // Reemit events on sign success.
            lodash.forOwn(this.eventsToReemit, (reemit, event) => {
                logger.debug("event to reemit", {event,reemit});

                if(reemit.on == "sign") {
                    this.emit(event, reemit.data);
                }
            });
        });

        this.io.on("unsign:success", () => {
            logger.debug("unsign:success");
            this.signed = false;
        });

        this.io.on("disconnect", (data) => {
            logger.debug("disconnected", data);
            this.disconnected = true;
        });
    }

    /**
     * This function signs the socket in.
     */
    sign(token) {
        this.io.emit("sign", token);
    }

    /**
     * This function unsign the socket.
     */
    unsign() {
        this.io.emit("unsign");
    }

    /**
     * This function wraps io on event function.
     */
    on(event, cb) {
        this.io.on(event, cb);
    }

    /**
     * This function wraps io emit event function.
     */
    emit(event, data, opts={}) {
        this.io.emit(event, data);

        if(opts.reemitOn) {
            Socket.eventsToReemit[event] = {
                data,
                on: opts.reemitOn
            };
        }
    }

    /**
     * This function removes an event to reemit.
     */
    removeEventToReemit(event) {
        delete Socket.eventsToReemit[event];
    }

    /**
     * This function removes an event listener.
     */
    removeListener(event, handler) {
        this.io.removeListener(event, handler);
    }

    /**
     * This function closes the socket connection.
     */
    close() {
        this.io.disconnect();
    }
}