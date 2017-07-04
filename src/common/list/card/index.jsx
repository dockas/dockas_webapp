import React from "react";
import lodash from "lodash";
import config from "config";
import {Link} from "react-router";
import {LoggerFactory} from "darch/src/utils";
import styles from "./styles";

let Logger = new LoggerFactory("list.card");

/**
 * Main component class.
 */
export default class Component extends React.Component {
    /** React properties **/
    static displayName = "list.card";
    static defaultProps = {};
    static propTypes = {};

    componentDidMount() {
        let logger = Logger.create("componentDidMount");
        logger.info("enter");
    }

    render() {
        let {list} = this.props;
        let bannerPath = lodash.get(list, "bannerImage.path");

        let style = {
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat"
        };

        if(bannerPath) {
            style.backgroundImage = `url(//${config.hostnames.file}/images/${bannerPath})`;
        }

        return (
            <Link className={styles.card} to={`/lists/${list.nameId}`}>
                <div className={styles.body}>
                    <div className={styles.overlay}>
                        <div className={styles.content}>
                            <div className={styles.title}>{list.name}</div>
                        </div>
                    </div>

                    <div className={styles.bannerImage} style={style}></div>
                </div>
            </Link>
        );
    }
}
