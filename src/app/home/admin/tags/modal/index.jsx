import React from "react"
import {connect} from "react-redux"
import classNames from "classnames"
import lodash from "lodash"
//import config from "config";
import {LoggerFactory,Redux} from "darch/src/utils"
import Modal from "darch/src/modal"
import i18n from "darch/src/i18n"
import Field from "darch/src/field"
import Form from "darch/src/form"
import Grid from "darch/src/grid"
import Text from "darch/src/text"
import Spinner from "darch/src/spinner"
import Button from "darch/src/button"
import {Tag} from "common"
import styles from "./styles"

let Logger = new LoggerFactory("lists.detail.subscribe")

/**
 * Redux map state to props function.
 *
 * @param {object} state
 * @param {object} ownProps
 */
function mapStateToProps(state) {
    console.log(["macunae maluco", state.tag])

    return {
        tagDropdown: state.tag.dropdown,
        uid: state.user.uid,
        user: state.user.uid?state.user.data[state.user.uid]:null
    }
}

/**
 * Redux dispatch to props map.
 */
let mapDispatchToProps = {

}

/**
 * Main component class.
 */
class Component extends React.Component {
    /** React properties **/
    static displayName = "lists.detail.subscribe";
    static defaultProps = {};
    static propTypes = {};

    state = {};

    colors = [
        "#EC644B",
        "#D24D57",
        "#F22613",
        "#D91E18",
        "#96281B",
        "#EF4836",
        "#D64541",
        "#C0392B",
        "#CF000F",
        "#E74C3C",
        "#DB0A5B",
        "#F64747",
        "#F1A9A0",
        "#D2527F",
        "#E08283",
        "#F62459",
        "#E26A6A",
        "#DCC6E0",
        "#663399",
        "#674172",
        "#AEA8D3",
        "#913D88",
        "#9A12B3",
        "#BF55EC",
        "#BE90D4",
        "#8E44AD",
        "#9B59B6",
        "#446CB3",
        "#E4F1FE",
        "#4183D7",
        "#59ABE3",
        "#81CFE0",
        "#52B3D9",
        "#C5EFF7",
        "#22A7F0",
        "#3498DB",
        "#2C3E50",
        "#19B5FE",
        "#336E7B",
        "#22313F",
        "#6BB9F0",
        "#1E8BC3",
        "#3A539B",
        "#34495E",
        "#67809F",
        "#2574A9",
        "#1F3A93",
        "#89C4F4",
        "#4B77BE",
        "#5C97BF",
        "#4ECDC4",
        "#A2DED0",
        "#87D37C",
        "#90C695",
        "#26A65B",
        "#03C9A9",
        "#68C3A3",
        "#65C6BB",
        "#1BBC9B",
        "#1BA39C",
        "#66CC99",
        "#36D7B7",
        "#C8F7C5",
        "#86E2D5",
        "#2ECC71",
        "#16a085",
        "#3FC380",
        "#019875",
        "#03A678",
        "#4DAF7C",
        "#2ABB9B",
        "#00B16A",
        "#1E824C",
        "#049372",
        "#26C281",
        "#F5D76E",
        "#F7CA18",
        "#F4D03F",
        "#e9d460",
        "#FDE3A7",
        "#F89406",
        "#EB9532",
        "#E87E04",
        "#F4B350",
        "#F2784B",
        "#EB974E",
        "#F5AB35",
        "#D35400",
        "#F39C12",
        "#F9690E",
        "#F9BF3B",
        "#F27935",
        "#E67E22",
        "#ececec",
        "#6C7A89",
        "#D2D7D3",
        "#EEEEEE",
        "#BDC3C7",
        "#ECF0F1",
        "#95A5A6",
        "#DADFE1",
        "#ABB7B7",
        "#F2F1EF",
        "#BFBFBF"
    ];

    async componentDidMount() {
        let logger = Logger.create("componentDidMount")
        logger.info("enter")

        this.selectColor()()
    }

    componentDidUpdate(prevProps) {
        let tag = this.props.tag
        let prevTag = prevProps.tag

        console.log(["componentDidUpdate maluco doido", tag, prevTag])

        // Tag changed
        if(!lodash.isEqual(tag, prevTag)) {
            console.log(["componentDidUpdate maluco doido : changed"])
            this.selectColor(lodash.get(tag,"color"))()
        }
    }

    selectColor(color) {
        return () => {
            let logger = Logger.create("selectColor")
            logger.info("enter", {color})

            if(!color) {
                // Select a random color.
                let min = 0, max = this.colors.length-1
                let randomIdx = Math.floor(Math.random() * (max - min)) + min
                color = this.colors[randomIdx]
            }

            this.setState({selectedColor: color})
        }
    }

    async reloadTagScope() {
        if(!this.props.reloadTagScope) {
            return Promise.resolve()
        }

        let result,
            {query,opts} = this.props.reloadTagScope,
            logger = Logger.create("reloadTagScope")

        try {
            result = await Redux.dispatch(
                Tag.actions.tagFind(query,opts)
            )

            logger.info("action tagFind success", result)
        }
        catch(error) {
            logger.error("action tagFind error", error)
        }
    }

    async updateTag(data) {
        let result,
            {tag} = this.props,
            logger = Logger.create("updateTag")

        logger.info("enter", data)

        // Strip non modified fields.
        data = lodash.pickBy(data, (value, key) => {
            return !lodash.isEqual(value,tag[key])
        })

        // Color
        if(tag.color != this.state.selectedColor) {
            data.color = this.state.selectedColor
        }

        logger.debug("modified data", data)

        try {
            result = await Redux.dispatch(
                Tag.actions.tagUpdate(tag._id, data)
            )

            logger.info("action tagUpdate success", result)
        }
        catch(error) {
            logger.error("action tagUpdate error", error)
            return this.setState({loading: false})
        }

        // Update state
        this.setState({loading: false})
        this.props.onComplete(data)
    }

    async onSubmit(data) {
        if(this.props.tag) { return this.updateTag(data) }

        let result,
            {selectedColor} = this.state,
            logger = Logger.create("onSubmit")

        logger.info("enter", data)

        this.setState({loading: true})
        data.color = selectedColor

        try {
            result = await Redux.dispatch(
                Tag.actions.tagCreate(data)
            )

            logger.info("action tagCreate success", result)
        }
        catch(error) {
            logger.error("action tagCreate error", error)
            return this.setState({loading: false})
        }

        // Reload tag scope
        await this.reloadTagScope()

        // Update state
        this.setState({loading: false})
        this.props.onComplete(data)
    }

    render() {
        let {open,onDismiss,tag,tagDropdown} = this.props
        let {loading,selectedColor} = this.state

        return (
            <Modal open={open} onDismiss={onDismiss}>
                <Modal.Header>
                    <h3 style={{margin: 0}}>
                        <i18n.Translate text="_NEW_TAG_MODAL_TITLE_" />
                    </h3>
                </Modal.Header>

                <Form loading={loading}
                    onSubmit={this.onSubmit}>
                    
                    <Modal.Body>
                        <Field.Section>
                            <Grid>
                                <Grid.Cell span={2}>
                                    <Field.Section>
                                        <Text scale={0.8}>
                                            <i18n.Translate text="_NEW_TAG_MODAL_NAME_FIELD_LABEL_" />
                                        </Text>
                                        <div>
                                            <Field.Text
                                                name="name"
                                                placeholder="_NEW_TAG_MODAL_NAME_FIELD_PLACEHOLDER_"
                                                scale={1}
                                                value={lodash.get(tag,"name")}
                                                validators="$required"/>
                                            <Field.Error
                                                for="name"
                                                validator="$required"
                                                message="_FIELD_ERROR_REQUIRED_"/>
                                        </div>
                                    </Field.Section>
                                </Grid.Cell>
                                <Grid.Cell>
                                    <Field.Section>
                                        <Text scale={0.8}>
                                            <i18n.Translate text="_NEW_TAG_MODAL_PRIORITY_FIELD_LABEL_" />
                                        </Text>
                                        <div>
                                            <Field.Text
                                                name="priority"
                                                scale={1}
                                                type="number"
                                                value={lodash.get(tag,"priority")||0}
                                                validators="$required"/>
                                            <Field.Error
                                                for="name"
                                                validator="$required"
                                                message="_FIELD_ERROR_REQUIRED_"/>
                                        </div>
                                    </Field.Section>
                                </Grid.Cell>
                            </Grid>
                        </Field.Section>

                        <Field.Section>
                            <Text scale={0.8}>
                                <i18n.Translate text="_NEW_TAG_MODAL_CATEGORIES_FIELD_LABEL_" />
                            </Text>
                            <div>
                                <Field.Select
                                    name="categories"
                                    placeholder="_NEW_TAG_MODAL_CATEGORIES_PLACEHOLDER_LABEL_"
                                    options={tagDropdown}
                                    value={lodash.get(tag,"categories")}
                                    clearSearchOnSelect={true}
                                    creatable={false}
                                    multi={true}
                                    scale={1}
                                    searchable={true}/>
                            </div>
                        </Field.Section>

                        <Field.Section>
                            <Grid>
                                <Grid.Cell>
                                    <Field.Section>
                                        <Text scale={0.8}>
                                            <i18n.Translate text="_NEW_TAG_MODAL_BACKGROUNDCOLOR_FIELD_LABEL_" /> {selectedColor? (<span>{selectedColor}</span>) : null}
                                        </Text>
                                        <div style={{lineHeight: 0}}>
                                            {this.colors.map((color) => {
                                                //console.log(["SELECTED COLOR", color, this.state.selectedTagColor]);
                                                return (<a key={color} onClick={this.selectColor(color)} className={classNames([styles.colorBox, (selectedColor == color ? styles.colorBoxActive : "")])} style={{backgroundColor: color}}></a>)
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
        )
    }
}

/** Export **/
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Component)