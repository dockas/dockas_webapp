import React from "react"
import lodash from "lodash"
import {connect} from "react-redux"
import {Converter} from "showdown"
import {LoggerFactory, Redux} from "darch/src/utils"
import Field from "darch/src/field"
import {Brand,Panel} from "common"

let Logger = new LoggerFactory("brand.detail.info")
let converter = new Converter({
    headerLevelStart: 5
})

converter.setFlavor("github")

/**
 * Redux map state to props function.
 *
 * @param {object} state
 * @param {object} ownProps
 */
function mapStateToProps(state) {
    return {
        brandData: state.brand.data,
        brandNameIdToId: state.brand.nameIdToId,
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
    static displayName = "brand.detail.info";
    static defaultProps = {};
    static propTypes = {};

    state = {
        editing: {},
        saving: {}
    };

    getScopeData(props=this.props) {
        let brand,
            nameId = lodash.get(props, "match.params.id"),
            {brandData,brandNameIdToId} = props

        brand = brandNameIdToId[nameId] ?
            brandData[brandNameIdToId[nameId]] : 
            null

        return {brand}
    }

    componentDidMount() {
        let logger = Logger.create("componentDidMount")
        logger.info("enter")
    }

    async onSubmit(data, {name=null}={}) {
        let {brand} = this.getScopeData()

        this.setState({
            saving: Object.assign(this.state.saving, {
                [name]: true
            })
        })

        // Let's update the product info.
        await Redux.dispatch(Brand.actions.brandUpdate(brand._id, data))

        this.setState({
            saving: Object.assign(this.state.saving, {
                [name]: false
            }),
            editing: Object.assign(this.state.editing, {
                [name]: false
            })
        })
    }

    render() {
        let {brand} = this.getScopeData()
        let {editing,saving} = this.state
        let {user} = this.props
        let {isApprovedOwner,isAdmin} = Brand.utils.getOwner(user, brand)

        return (
            <div>
                <Panel id="description"
                    display="block"
                    canEdit={isAdmin||isApprovedOwner}
                    editing={editing.description}
                    loading={saving.description}
                    labelText="_BRAND_DETAIL_INFO_PAGE_DESCRIPTION_FIELD_LABEL_"
                    onEditStart={() => { this.setState({editing: Object.assign(editing, {description: true})}) }}
                    onEditEnd={this.onSubmit}
                    onCancel={() => { this.setState({editing: Object.assign(editing, {description: false})}) }}>
                    
                    {editing.description ? (
                        <Field.TextArea
                            name="description"
                            rows={2}
                            value={brand.description}
                            name="description"
                            disabled={saving.description}
                            scale={1}
                            focus={true}/>
                    ) : (
                        <div dangerouslySetInnerHTML={{
                            __html: brand.description ? 
                                converter.makeHtml(brand.description) :
                                ""
                        }}></div>
                    )}
                </Panel>
            </div>
        )
    }
}

/** Export **/
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Component)

