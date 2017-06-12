import React from "react";
import classNames from "classnames";
import {LoggerFactory} from "darch/src/utils";
import Modal from "darch/src/modal";
import i18n from "darch/src/i18n";
import Form from "darch/src/form";
import Field from "darch/src/field";
import Button from "darch/src/button";
import Spinner from "darch/src/spinner";
import Text from "darch/src/text";
import Grid from "darch/src/grid";
import {Api} from "common";
import styles from "./styles";

let Logger = new LoggerFactory("create.product.tag_modal");

/**
 * Main component class.
 */
export default class Component extends React.Component {
    /** React properties **/
    static displayName = "create.product.tag_modal";
    static defaultProps = {
        onComplete: () => {},
        open: false
    };
    
    static propTypes = {
        onComplete: React.PropTypes.func,
        open: React.PropTypes.bool
    };

    state = {};

    colors = [
        "#446CB3",
        "#52B3D9",
        "#22313F",
        "#EC644B",
        "#96281B",
        "#674172",
        "#336E7B",
        "#3A539B",
        "#26A65B",
        "#F7CA18",
        "#D35400",
        "#6C7A89"
    ];

    componentDidMount() {
        let logger = Logger.create("componentDidMount");
        logger.info("enter");

        // Select a random color.
        let min = 0, max = this.colors.length-1;
        let randomIdx = Math.floor(Math.random() * (max - min)) + min;
        let randomColor = this.colors[randomIdx];

        this.setState({selectedColor: randomColor});
    }

    selectColor(color) {
        return () => {
            let logger = Logger.create("selectColor");
            logger.info("enter", {color});

            this.setState({selectedColor: color});
        };
    }

    async onSubmit(data) {
        let result,
            logger = Logger.create("onSubmit");

        logger.info("enter", data);

        this.setState({loading: true});
        data.color = this.state.selectedColor;

        try {
            result = await Api.shared.tagCreate(data);
            logger.info("api tagCreate success", result);
        }
        catch(error) {
            logger.error("api tagCreate error", error);
            return this.setState({loading: false});
        }

        this.props.onComplete(data);
    }

    render() {
        let {open,onComplete} = this.props;
        let {loading,selectedColor} = this.state;

        return (
            <Modal open={open} onDismiss={() => { onComplete(); }}>
                <Modal.Header>
                    <h3 style={{margin: 0}}>
                        <i18n.Translate text="_NEW_TAG_MODAL_TITLE_" />
                    </h3>
                </Modal.Header>

                <Form loading={loading} onSubmit={this.onSubmit}>
                    <Modal.Body>
                        <Field.Section>
                            <Text scale={0.8}>
                                <i18n.Translate text="_NEW_TAG_MODAL_NAME_FIELD_LABEL_" />
                            </Text>
                            <div>
                                <Field.Text
                                    name="name"
                                    placeholder="_NEW_TAG_MODAL_NAME_FIELD_PLACEHOLDER_"
                                    scale={1}
                                    validators="$required"/>
                                <Field.Error
                                    for="name"
                                    validator="$required"
                                    message="_FIELD_ERROR_REQUIRED_"/>
                            </div>
                        </Field.Section>

                        <Field.Section>
                            <Grid>
                                <Grid.Cell>
                                    <Field.Section>
                                        <Text scale={0.8}>
                                            <i18n.Translate text="_NEW_TAG_MODAL_BACKGROUNDCOLOR_FIELD_LABEL_" /> (<span>{selectedColor}</span>)
                                        </Text>
                                        <div>
                                            {this.colors.map((color) => {
                                                //console.log(["SELECTED COLOR", color, this.state.selectedTagColor]);
                                                return (<a key={color} onClick={this.selectColor(color)} className={classNames([styles.colorBox, (selectedColor == color ? styles.colorBoxActive : "")])} style={{backgroundColor: color}}></a>);
                                            })}
                                        </div>
                                    </Field.Section>
                                </Grid.Cell>
                            </Grid>
                        </Field.Section>
                    </Modal.Body>

                    <Modal.Footer align="right">
                        <Button type="submit"
                            loadingComponent={
                                <span>
                                    <i18n.Translate text="_SAVING_" format="lower" />
                                    <span className={styles.spinnerContainer}>
                                        <Spinner.Bars color="#fff" />
                                    </span>
                                </span>
                            }
                            scale={1}>
                            <i18n.Translate text="_SAVE_" format="lower" />
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        );
    }
}
