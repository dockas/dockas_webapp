import React from "react"
import PropTypes from "prop-types"
import classNames from "classnames"
import {LoggerFactory,Style} from "darch/src/utils"
import styles from "./styles"

let Logger = new LoggerFactory("badge")

/**
 * Main component class.
 */
export default class Component extends React.Component {
    /** React properties **/
    static displayName = "badge";
    static defaultProps = {
        color: "moody",
        borderWidth: 0,
        borderColor: "white",
        scale: 1
    };
    
    static propTypes = {
        count : PropTypes.number,
        color: PropTypes.string,
        borderWidth: PropTypes.number,
        borderColor: PropTypes.string,
        scale: PropTypes.number
    };

    componentDidMount() {
        let logger = Logger.create("componentDidMount")
        logger.info("enter")
    }

    render() {
        let {color,className,borderWidth,borderColor,scale} = this.props
        color = Style.getColor(color)
        borderColor = Style.getColor(borderColor)
        let opositeColor = Style.getOpositeColor(color)

        return (
            <div className={classNames([styles.badge, className])}
                style={{
                    background: color,
                    color: opositeColor,
                    border: borderWidth > 0 ? `${borderWidth}px solid ${borderColor}` : "none",
                    fontSize: `${scale}em`
                }}>
                {this.props.count}
            </div>
        )
    }
}
