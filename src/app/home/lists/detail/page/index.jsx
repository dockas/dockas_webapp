import React from "react";
import lodash from "lodash";
import config from "config";
import {connect} from "react-redux";
import {LoggerFactory,Redux} from "darch/src/utils";
import Container from "darch/src/container";
import placeholderImg from "assets/images/banner_placeholder.png";
import {List,ListSubscription} from "common";
import styles from "./styles";

let Logger = new LoggerFactory("lists.detail.page");

/**
 * Redux map state to props function.
 *
 * @param {object} state
 * @param {object} ownProps
 */
function mapStateToProps(state) {
    return {
        fileData: state.file.data,
        listData: state.list.data,
        listSubscriptionData: state.listSubscription.data,
        listSubscriptionListToId: state.listSubscription.listIdToId,
        listNameIdToId: state.list.nameIdToId,
        uid: state.user.uid,
        user: state.user.uid?state.user.data[state.user.uid]:null
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
    static displayName = "lists.detail.page";
    static defaultProps = {};
    static propTypes = {};

    getScopeData(props=this.props) {
        let result = {},
            nameId = lodash.get(props, "params.id"),
            {
                fileData,listData,listNameIdToId,
                listSubscriptionListToId,listSubscriptionData
            } = props;

        result.list = listNameIdToId[nameId] ?
            listData[listNameIdToId[nameId]] :
            null;
        
        // Get related data.
        if(result.list) {
            result.bannerImage = lodash.get(
                fileData, 
                result.list.bannerImage
            );

            // subscription
            if(listSubscriptionListToId[result.list._id]) {
                result.listSubscription = listSubscriptionData[
                    listSubscriptionListToId[result.list._id]
                ];
            }
        }

        return result;
    }

    async componentDidMount() {
        let {list,listSubscription} = this.getScopeData(),
            nameId = lodash.get(this.props, "params.id"),
            logger = Logger.create("componentDidMount");
        
        logger.info("enter", {list,nameId});

        // If record was not fetched yet, then get it 
        // directly from the server.
        if(!list) {
            this.setState({initializing: true});
            logger.debug("list not fetched yet");

            let result = await Redux.dispatch(
                List.actions.listFindByNameId(nameId, null, {
                    populate: {
                        paths: [
                            "bannerImage"
                        ]
                    }
                })
            );

            list = lodash.get(result, "value.data");
        }
        // Let's ensure that fetched record is populated with necessary data.
        else {
            List.populator.populate(
                [list], 
                {paths:["bannerImage"]}
            );
        }

        // If no list yet, then return.
        if(!list){return;}

        // Retrieve list subscription.
        if(!listSubscription) {
            try {
                await Redux.dispatch(
                    ListSubscription.actions.listSubscriptionFind({
                        list: [list._id]
                    })
                );

                logger.info("action listSubscriptionFind success");
            }
            catch(error) {
                logger.error("action listSubscriptionFind error", error);
            }
        }
    }

    render() {
        let {list,bannerImage} = this.getScopeData();

        return list ? (
            <div>
                <Container size="md">
                    <div className={styles.banner} style={{
                        backgroundImage: bannerImage ?
                            `url(//${config.hostnames.file}/images/${bannerImage.path})` :
                            placeholderImg
                    }}>
                        <div className={styles.overlay}>
                            <div className={styles.content}>
                                <div className={styles.title}>
                                    <h3 style={{margin: "0"}}>{list.name}</h3>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.contentContainer}>
                        {this.props.children}
                    </div>
                </Container>
            </div>
        ) : null;
    }
}

/** Export **/
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Component);
