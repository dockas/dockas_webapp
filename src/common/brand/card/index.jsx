import React from "react";
import config from "config";
import lodash from "lodash";
import {connect} from "react-redux";
import {withRouter} from "react-router";
import {LoggerFactory,Style} from "darch/src/utils";
//import i18n from "darch/src/i18n";
import placeholderImg from "assets/images/placeholder.png";
import styles from "./styles";

let Logger = new LoggerFactory("common.product.card");

/**
 * Redux map state to props function.
 *
 * @param {object} state
 * @param {object} ownProps
 */
function mapStateToProps(state) {
    return {
        user: lodash.get(state.user.data, state.user.uid),
        uid: state.user.uid,
        basket: state.basket
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
    static displayName = "common.product.card";

    static defaultProps = {
        onChangePrice: () => {}
    };

    static propTypes = {
        onChangePrice: React.PropTypes.func
    };

    state = {
        screenSize: "desktop"
    };

    /**
     * LYFECICLE : This function is called when component
     * got mounted in the view.
     */
    componentDidMount() {
        let logger = Logger.create("componentDidMount");
        logger.info("enter");

        this.handleWindowResize();
    }

    handleWindowResize() {
        let logger = Logger.create("handleWindowResize");

        let {screenSize} = this.state;
        let currentScreenSize = Style.screenForWindowWidth(window.innerWidth);

        if(currentScreenSize != screenSize) {
            logger.info("enter", {screenSize, currentScreenSize});
            this.setState({screenSize: currentScreenSize});
        }
    }

    goToBrandDetail() {
        this.props.router.push({
            pathname: `/brand/${this.props.data.nameId}`
        });
    }

    /**
     * This function is responsible for generating the component's view.
     */
    render() {
        let {data} = this.props;
        //let {screenSize} = this.state;

        let mainProfileImage = lodash.find(data.profileImages, (image) => {
            return image._id == data.mainProfileImage;
        });

        return (
            <div className={styles.card} 
                onClick={this.goToBrandDetail}>
                <div className={styles.imageContainer}>
                    {mainProfileImage ? (
                        <div className={styles.image} style={{
                            backgroundImage: `url(//${config.hostnames.file}/images/${mainProfileImage.path})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center"
                        }}></div>
                    ) : (
                        <div className={styles.image} style={{
                            backgroundImage: `url(${placeholderImg})`,
                            backgroundColor: "#f9f9f9",
                            backgroundSize: "cover",
                            backgroundPosition: "center"
                        }}></div>
                    )}
                </div>

                <div className={styles.name}>
                    <textarea disabled rows="2" value={data.name}></textarea>
                </div>
            </div>
        );
    }
}

/** Export **/
export default withRouter(connect(
    mapStateToProps,
    mapDispatchToProps
)(Component));


