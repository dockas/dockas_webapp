import React from "react";
import {connect} from "react-redux";
import {Converter} from "showdown";
import {LoggerFactory, Redux} from "darch/src/utils";
import Form from "darch/src/form";
import Field from "darch/src/field";
import Text from "darch/src/text";
import i18n from "darch/src/i18n";
import Button from "darch/src/button";
import {Brand} from "common";

let Logger = new LoggerFactory("brand.detail.info");
let converter = new Converter({
    headerLevelStart: 5
});

/**
 * Redux map state to props function.
 *
 * @param {object} state
 * @param {object} ownProps
 */
function mapStateToProps(state) {
    return {
        brand: state.brand.selected,
        uid: state.user.uid,
        user: state.user.uid?state.user.profiles[state.user.uid]:null
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
    static displayName = "brand.detail.info";
    static defaultProps = {};
    static propTypes = {};

    state = {
        editing: {},
        saving: {}
    };

    componentDidMount() {
        let logger = Logger.create("componentDidMount");
        logger.info("enter");
    }

    async onSubmit(data, name) {
        this.setState({
            saving: Object.assign(this.state.saving, {
                [name]: true
            })
        });

        // Let's update the product info.
        await Redux.dispatch(Brand.actions.brandUpdate(this.props.brand._id, data));

        this.setState({
            saving: Object.assign(this.state.saving, {
                [name]: false
            }),
            editing: Object.assign(this.state.editing, {
                [name]: false
            })
        });
    }

    render() {
        let {editing,saving} = this.state;
        let {brand,user} = this.props;
        let {isApprovedOwner,isAdmin} = Brand.utils.getOwner(user, brand);

        return (
            <div>
                <Field.Section>
                    <Form name="description" loading={saving.description} onSubmit={this.onSubmit}>
                        <div style={{textAlign: "right", borderBottom: "1px dashed transparent", marginBottom: "0px"}}>
                            <Text scale={0.8} color="moody">
                                <i18n.Translate text="_BRAND_DETAIL_INFO_PAGE_DESCRIPTION_FIELD_LABEL_" />
                            </Text>

                            {isAdmin||isApprovedOwner ? (
                                !editing.description ? (
                                    <span> • <a style={{fontSize: "0.8em"}} onClick={() => {this.setState({editing: Object.assign(editing, {description: true})});}}><i18n.Translate text="_CATALOG_ITEM_PAGE_EDIT_LABEL_" /></a></span>
                                ) : (
                                    <span> • <Button textCase="lower" scale={0.8} type="submit" layout="link"><i18n.Translate text="_CATALOG_ITEM_PAGE_SAVE_LABEL_" /></Button></span>
                                )
                            ) : null}
                        </div>

                        <div>
                            {editing.description ? (
                                <Field.TextArea
                                    name="description"
                                    rows={2}
                                    value={brand.description}
                                    name="description"
                                    disabled={saving.description}
                                    scale={1} />
                            ) : (
                                <div dangerouslySetInnerHTML={{
                                    __html: brand.description ? 
                                        converter.makeHtml(brand.description) :
                                        ""
                                }}></div>
                            )}
                        </div>
                    </Form>
                </Field.Section>
            </div>
        );
    }
}

/** Export **/
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Component);

