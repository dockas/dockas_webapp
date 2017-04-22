import React from "react";
import {LoggerFactory,Redux,Storage} from "darch/src/utils";
import {connect} from "react-redux";
import Container from "darch/src/container";
import Grid from "darch/src/grid";
import Modal from "darch/src/modal";
import i18n from "darch/src/i18n";
import Button from "darch/src/button";
import Product from "common/product";
import styles from "./styles";

let Logger = new LoggerFactory("catalog");
let storage = new Storage();

/**
 * Redux map state to props function.
 *
 * @param {object} state
 * @param {object} ownProps
 */
function mapStateToProps(state) {
    return {
        products: state.product.data
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
    static displayName = "catalog";
    static defaultProps = {};
    static propTypes = {};

    state = {};

    async componentDidMount() {
        let logger = Logger.create("componentDidMount");
        logger.info("enter");

        let infoModalViewed = await storage.get("infoModalViewed");

        if(!infoModalViewed) {
            this.setState({infoModalOpen: true});
        }

        // Retrieve products
        Redux.dispatch(
            Product.actions.productFind({populate: ["tags"]})
        );
    }

    onInfoModalDismiss() {
        storage.set("infoModalViewed", "true");
        this.setState({infoModalOpen: false});
    }

    render() {
        let {products} = this.props;

        return (
            <div className={styles.page}>
                <Container>
                    <Grid spots={12} noGap={true} bordered={true}>
                        {products ? (
                            products.map((product) => {
                                return (
                                    <Grid.Cell key={product._id} span={2}>
                                        <Product.Card data={product} />
                                    </Grid.Cell>
                                );
                            })
                        ) : (
                            <span>Loading ...</span>
                        )}
                    </Grid>
                </Container>

                <Modal open={this.state.infoModalOpen}>
                    <Modal.Header>
                        <h3 style={{margin: 0}}>
                            <i18n.Translate text="_INFO_MODAL_TITLE_" />
                        </h3>
                    </Modal.Header>

                    <Modal.Body>
                        <i18n.Translate text="_INFO_MODAL_BODY_" />
                    </Modal.Body>

                    <Modal.Footer align="right">
                        <Button type="submit"
                            scale={1} onClick={this.onInfoModalDismiss}>
                            <i18n.Translate text="_OK_" />
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
}

/** Export **/
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Component);

