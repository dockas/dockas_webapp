import React from "react";
import lodash from "lodash";
import {withRouter} from "react-router";
import {LoggerFactory,Redux} from "darch/src/utils";
import Container from "darch/src/container";
import Grid from "darch/src/grid";
import i18n from "darch/src/i18n";
import Form from "darch/src/form";
import Field from "darch/src/field";
import Button from "darch/src/button";
import Spinner from "darch/src/spinner";
import Text from "darch/src/text";
import Toaster from "darch/src/toaster";
import styles from "./styles";
import {Api,Room} from "common";

let Logger = new LoggerFactory("create.room", {level:"debug"});

/**
 * Main component class.
 */
class Component extends React.Component {
    /** React properties **/
    static displayName = "create.room";
    static defaultProps = {};
    
    static propTypes = {};

    /** Instance properties **/
    state = {};

    /** Tags to be created **/
    tagsToCreate = [];

    /**
     * LYFECICLE : This function is called when component
     * got mounted in the view.
     */
    componentDidMount() {
        let logger = Logger.create("componentDidMount");
        logger.info("enter");

        this.tagsToCreate = [];
    }

    /**
     * This function load tags.
     */
    async loadTags(value) {
        let logger = Logger.create("loadTags");
        logger.info("enter", {value});

        if(lodash.isEmpty(value)) {return;}

        this.setState({loadingTags: true});

        try {
            let response = await Api.shared.tagFind({
                name: value
            });

            logger.debug("Api tagFind success", response);

            // Process tags
            let tags = response.results.map((tag) => {
                return {value: tag._id, label: tag.name};
            });

            this.setState({tags, loadingTags: false});
        }
        catch(error) {
            logger.error("Api tagFind error", error);
            this.setState({loadingTags: false});
        }
    }

    /**
     * This function handle tag creation.
     */
    onCreateTag(value) {
        let logger = Logger.create("onCreateTag");
        logger.info("enter", {value});

        this.tagsToCreate.push(value);

        return {value, label: value};
    }

    /**
     * This function submits the create form.
     */
    async onFormSubmit(data) {
        let logger = Logger.create("onSubmit");
        logger.info("enter", data);

        this.setState({loading: true});

        // Handle creation of new tags.
        let promises = [];

        let tagsToCreateMap = lodash.reduce(data.tags, (map, tag, idx) => {
            logger.debug("tagsToCreateMap reduce", {map,tag,idx});

            let idx2 = this.tagsToCreate.indexOf(tag);
            if(idx2 >= 0) {map[tag] = idx;}
            return map;
        }, {});

        logger.debug("tagsToCreateMap", {tagsToCreateMap});

        if(lodash.size(tagsToCreateMap)) {

            lodash.forOwn(tagsToCreateMap, (val, name) => {
                promises.push(
                    Api.shared.tagCreate({name}).then((response) => {
                        return {name, id: response.result};
                    })
                );
            });

            try {
                let tags = await Promise.all(promises);
                logger.debug("api tagCreate all success", tags);

                // Replace tags by it's ids.
                tags.forEach((tag) => {
                    logger.debug("tagsToCreateMap replace by id", {tag});

                    data.tags[tagsToCreateMap[tag.name]] = tag.id;
                });
            }
            catch(error) {
                return logger.error("api tagCreate all error", error);
            }
        }
        
        // Create room.
        let roomData = {
            name: data.name,
            maxMembersCount: data.maxMembersCount,
            maxVisitorsCount: !data.locked?data.maxVisitorsCount:0,
            locked: data.locked,
            tags: data.tags,
            locationCoords: [
                data.location.coords.lng,
                data.location.coords.lat
            ],
            locationName: data.location.name,
            locationId: data.location.placeId,
            locationAddress: data.location.address,
            locationComponents: data.location.addressComponents
        };

        try {
            let createResponse = await Redux.dispatch(
                Room.actions.createRoom(roomData)
            );
            
            logger.debug("api roomCreate success", createResponse);

            // Post notification
            Redux.dispatch(
                Toaster.actions.push("success", "_ROOM_CREATE_SUCCESS_TOAST_MESSAGE_")
            );

            // Redirect to explore page.
            this.props.router.replace("/");
        }
        catch(error) {
            logger.error("api roomCreate error", error);
            this.setState({loading: false});
        }
    }

    onFormChange(values) {
        this.setState({locked: values.locked});
    }

    /**
     * This function is responsible for generating the component's view.
     */
    render() {
        let {tags,loadingTags} = this.state;

        return (
            <div className={styles.page}>
                <Container size="md">
                    <h3 className="headline"><i18n.Translate text="_CREATE_ROOM_PAGE_TITLE_" /></h3>

                    <Grid>
                        <Grid.Cell>
                            <div className={styles.image}>
                                <img src="http://placehold.it/300x300/f1f1f1?text=image" />
                            </div>
                        </Grid.Cell>
                        <Grid.Cell span={4}>
                            <div className={styles.formContainer}>
                                <Form loading={this.state.loading}
                                    onSubmit={this.onFormSubmit}
                                    onChange={this.onFormChange}>

                                    <Field.Section>
                                        <Grid>
                                            <Grid.Cell>
                                                <Field.Section>
                                                    <Text scale={0.8}>
                                                        <span className="icon-lock" style={{marginRight: "0.5em"}}></span>
                                                        <i18n.Translate text="_CREATE_ROOM_PAGE_LOCKED_FIELD_LABEL_" />
                                                    </Text>
                                                    <div>
                                                        <Field.Switch name="locked"
                                                            trueLabel="_YES_"
                                                            falseLabel="_NO_"/>
                                                    </div>
                                                </Field.Section>
                                            </Grid.Cell>

                                            <Grid.Cell span={4}>
                                                <Text scale={0.8}>
                                                    <p className={this.state.locked?"":styles.noHighlight}><i18n.Translate text="_CREATE_ROOM_PAGE_LOCKED_FIELD_LOCKED_DESCRIPTION_" /></p>
                                                    <p className={this.state.locked?styles.noHighlight:""}><i18n.Translate text="_CREATE_ROOM_PAGE_LOCKED_FIELD_UNLOCKED_DESCRIPTION_" /></p>
                                                </Text>
                                            </Grid.Cell>
                                        </Grid>
                                    </Field.Section>

                                    <Field.Section>
                                        <Text scale={0.8}><i18n.Translate text="_CREATE_ROOM_PAGE_NAME_FIELD_LABEL_" /></Text>
                                        <Field.Text
                                            name="name"
                                            placeholder="_CREATE_ROOM_PAGE_NAME_FIELD_PLACEHOLDER_"
                                            scale={1}
                                            validators="$required"/>
                                        <Field.Error
                                            for="name"
                                            validator="$required"
                                            message="_FIELD_ERROR_REQUIRED_"/>
                                    </Field.Section>

                                    {/*<Field.Section>
                                        <Grid>
                                            <Grid.Cell>
                                                <Field.Section>
                                                    <Text scale={0.8}><i18n.Translate text="_CREATE_ROOM_PAGE_MAX_MEMBER_COUNT_FIELD_LABEL_" /></Text>
                                                    <Field.Text
                                                        name="maxMembersCount"
                                                        placeholder={i18n.utils.translate({text: "_CREATE_ROOM_PAGE_MAX_MEMBER_COUNT_FIELD_PLACEHOLDER_"})}
                                                        scale={1}
                                                        validators="$digits"/>
                                                    <Field.Error
                                                        for="maxMemberCount"
                                                        validator="$digits"
                                                        message="_FIELD_ERROR_DIGITS_"/>
                                                </Field.Section>
                                            </Grid.Cell>

                                            {!this.state.locked ? (<Grid.Cell>
                                                <Field.Section>
                                                    <Text scale={0.8}><i18n.Translate text="_CREATE_ROOM_PAGE_MAX_VISITORS_COUNT_FIELD_LABEL_" /></Text>
                                                    <Field.Text
                                                        name="maxVisitorsCount"
                                                        placeholder={i18n.utils.translate({text: "_CREATE_ROOM_PAGE_MAX_VISITORS_COUNT_FIELD_PLACEHOLDER_"})}
                                                        scale={1}
                                                        validators="$digits"/>
                                                    <Field.Error
                                                        for="maxVisitorsCount"
                                                        validator="$digits"
                                                        message="_FIELD_ERROR_DIGITS_"/>
                                                </Field.Section>
                                            </Grid.Cell>) : null}
                                        </Grid>
                                    </Field.Section>*/}

                                    <Field.Section>
                                        <Text scale={0.8}><i18n.Translate text="_CREATE_ROOM_PAGE_TAGS_FIELD_LABEL_" /></Text>
                                        <Field.Select
                                            name="tags"
                                            placeholder="_CREATE_ROOM_PAGE_TAGS_FIELD_PLACEHOLDER_"
                                            options={tags}
                                            loadOptions={this.loadTags}
                                            loading={loadingTags}
                                            onCreateOption={this.onCreateTag}
                                            clearSearchOnSelect={true}
                                            creatable={true}
                                            multi={true}
                                            scale={1}
                                            loaderComponent={<Spinner.CircSide color="#555" />}
                                            validators="$required"/>
                                        <Field.Error
                                            for="tags"
                                            validator="$required"
                                            message="_FIELD_ERROR_REQUIRED_"/>
                                    </Field.Section>

                                    <Field.Section>
                                        <Text scale={0.8}><i18n.Translate text="_CREATE_ROOM_PAGE_LOCATION_FIELD_LABEL_" /></Text>
                                        <Field.Location name="location"
                                            width="100%"
                                            height="150pt"
                                            validators="$required"/>
                                        <Field.Error
                                            for="location"
                                            validator="$required"
                                            message="_FIELD_ERROR_REQUIRED_"/>
                                    </Field.Section>

                                    <Field.Section>
                                        <div className={styles.buttonContainer}>
                                            <Button type="submit"
                                                loadingComponent={
                                                    <span>
                                                        <i18n.Translate text="_LOADING_" />
                                                        <span className={styles.spinnerContainer}>
                                                            <Spinner.Bars color="#fff" />
                                                        </span>
                                                    </span>
                                                }
                                                scale={1}>
                                                <i18n.Translate text="_CREATE_ROOM_PAGE_SUBMIT_BUTTON_TEXT_" />
                                            </Button>
                                        </div>
                                    </Field.Section>
                                </Form>
                            </div>
                        </Grid.Cell>
                    </Grid>
                </Container>
            </div>
        );
    }
}

export default withRouter(Component);
