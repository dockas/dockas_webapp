import React from "react"
import {connect} from "react-redux"
import lodash from "lodash"
//import config from "config";
import {LoggerFactory,Redux} from "darch/src/utils"
//import Container from "darch/src/container";
import i18n from "darch/src/i18n"
import Label from "darch/src/label"
import Button from "darch/src/button"
import {Tag} from "common"
import TagModal from "./modal"
import styles from "./styles"

let Logger = new LoggerFactory("admin.tags")

/**
 * Redux map state to props function.
 *
 * @param {object} state
 * @param {object} ownProps
 */
function mapStateToProps(state) {
    return {
        userData: state.user.data,
        tagData: state.tag.data,
        tagScopeIds: lodash.get(state.tag, "scope.admin.ids"),
        tagScopeQuery: lodash.get(state.tag, "scope.admin.query"),
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
    static displayName = "admin.tags";
    static defaultProps = {};
    static propTypes = {};

    state = {};

    async componentDidMount() {
        let logger = Logger.create("componentDidMount")
        logger.info("enter")

        this.setState({loadingTags: true})

        // Retrieve all tags
        await Redux.dispatch(Tag.actions.tagFind(null, {
            scope: {id: "admin"},
            populate: {
                paths: ["creator"]
            }
        }))

        this.setState({loadingTags: false})
    }

    onModalDismiss() {
        let logger = Logger.create("onModalDismiss")
        logger.info("enter")

        this.setState({isModalOpen: false})
    }

    onModalComplete(data) {
        let logger = Logger.create("onModalComplete")
        logger.info("enter", data)

        this.setState({editingTag: null, isModalOpen: false})
    }

    onTagEditButtonClick(tag) {
        return () => {
            this.setState({editingTag: tag, isModalOpen: true})
        }
    }

    render() {
        let {userData,tagData,tagScopeIds,tagScopeQuery} = this.props
        let {isModalOpen,editingTag,loadingTags} = this.state

        console.log(["tagScopeIds", tagScopeIds])

        // Sort
        tagScopeIds = lodash.orderBy(tagScopeIds, [
            (tagId) => {
                let tag = tagData[tagId]
                if(!tag) { return 0 }

                return tag.categories && tag.categories.length > 0 ? 1 : 2
            },
            (tagId) => {
                let tag = tagData[tagId]

                return lodash.map(lodash.orderBy(lodash.get(tag, "categories"), [(categoryTagId) => {
                    let categoryTag = tagData[categoryTagId]
                    return categoryTag ? categoryTag.priority : -1
                }], ["desc"]), (categoryTagId) => {
                    let categoryTag = tagData[categoryTagId]
                    return lodash.get(categoryTag, "nameId")||""
                }).join("")
            },
            (tagId) => {
                let tag = tagData[tagId]
                return lodash.get(tag, "priority")
            },
            (tagId) => {
                let tag = tagData[tagId]
                return lodash.get(tag, "name")
            }
        ], ["desc","asc", "desc", "asc"])

        return (
            <div className={styles.page}>
                <h2 style={{marginTop: "30px"}}>
                    <i18n.Translate text="_ADMIN_TAGS_PAGE_TITLE_" /><span style={{marginLeft: "15px"}}><Label color="#F9690E" scale={0.8} layout="outlined">admin</Label></span>
                </h2>

                <div className={styles.buttonsContainer}>
                    <Button onClick={() => {
                        this.setState({isModalOpen: true})
                    }} scale={0.8}>nova tag</Button>
                </div>

                <table className="table">
                    <thead>
                        <tr>
                            <th className={styles.priorityColumn}></th>
                            <th className={styles.colorColumn}></th>
                            <th>nome</th>
                            <th>criador</th>
                            <th>data criação</th>
                            <th>categorias</th>
                            <th># produtos</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {!tagScopeIds && loadingTags ? (
                            <tr><td colSpan="4" style={{textAlign: "center"}}>loading ...</td></tr>
                        ) : tagScopeIds && tagScopeIds.length ? (
                            tagScopeIds.map((tagId) => {
                                let tag = tagData[tagId]
                                let creator = tag?userData[tag.creator]:null

                                return tag ? (
                                    <tr key={tag._id}>
                                        <td className={styles.priorityCell}>{tag.priority}</td>
                                        <td className={styles.colorCell}>
                                            <div className={styles.colorBox} style={{backgroundColor: tag.color}}></div>
                                        </td>
                                        <td>{tag.name}</td>
                                        <td>{creator?creator.fullName:""}</td>
                                        <td><i18n.Moment date={tag.createdAt} format="date" /></td>
                                        <td>
                                            {lodash.map(lodash.orderBy(tag.categories, [(categoryTagId) => {
                                                let categoryTag = tagData[categoryTagId]
                                                return categoryTag ? categoryTag.priority : -1
                                            }], ["desc"]), (categoryTagId) => {
                                                let categoryTag = tagData[categoryTagId]

                                                return categoryTag ? (
                                                    <span key={categoryTagId} className={styles.categoryTagContainer}><Label scale={0.7} color={categoryTag.color}>{categoryTag.name}</Label></span>
                                                ) : null
                                            })}
                                        </td>
                                        <td>{tag.productCount}</td>
                                        <td>
                                            <Label scale={0.7} color="moody" onClick={this.onTagEditButtonClick(tag)}>
                                                <span className="icon-pencil"></span>
                                            </Label>
                                        </td>
                                    </tr>
                                ) : (
                                    <tr key={tagId}></tr>
                                )
                            })
                        ) : null}
                    </tbody>
                </table>

                <TagModal open={isModalOpen} 
                    onDismiss={this.onModalDismiss} 
                    onComplete={this.onModalComplete} 
                    tag={editingTag}
                    reloadTagScope={{
                        query: tagScopeQuery,
                        opts: {
                            scope: {id: "admin"}
                        }
                    }}
                />
            </div>
        )
    }
}

/** Export **/
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Component)
