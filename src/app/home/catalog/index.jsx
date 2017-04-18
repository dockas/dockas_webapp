import React from "react";
import {LoggerFactory,Redux} from "darch/src/utils";
import {connect} from "react-redux";
import Container from "darch/src/container";
import Grid from "darch/src/grid";
import Product from "common/product";
import styles from "./styles";

let Logger = new LoggerFactory("catalog");

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

    products = [
        {
            _id: 1,
            summary: "tomate do himaláia",
            price: 55.00,
            currency: "R$",
            images: []
        },
        {
            _id: 2,
            summary: "cenoura tomalo",
            price: 12.54,
            currency: "R$",
            images: []
        },
        {
            _id: 3,
            summary: "papel higiênico Neve",
            price: 17.86,
            currency: "R$",
            images: []
        },
        {
            _id: 4,
            summary: "fralda Pampers",
            price: 38.99,
            currency: "R$",
            images: []
        }
    ];

    componentDidMount() {
        let logger = Logger.create("componentDidMount");
        logger.info("enter");

        // Retrieve products
        Redux.dispatch(
            Product.actions.productFind()
        );
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
            </div>
        );
    }
}

/** Export **/
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Component);

