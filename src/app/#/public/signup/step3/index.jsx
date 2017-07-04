import React from "react";
import {connect} from "react-redux";
import lodash from "lodash";
import {LoggerFactory,Container,Grid,i18n,Button,Spinner,Redux,Toaster} from "darch/src";
import {User} from "common";
import logoIcon from "assets/images/logo_icon.png";
import styles from "./styles";
import Term from "./term";

let Logger = new LoggerFactory("signup.step3");

/**
 * Redux map state to props function.
 *
 * @param {object} state
 * @param {object} ownProps
 */
function mapStateToProps(state) {
    return {
        profile: state.user.data[state.user.uid]
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
    static displayName = "signup.step3";
    static defaultProps = {
        onComplete: () => {}
    };
    static propTypes = {
        onComplete: React.PropTypes.func
    };

    /** Instance properties **/
    state = {
        selectedTerms: []
    };

    constructor(props) {
        super(props);

        let termLabels = [
            "Jabira jabirota",
            "Por mares nunca dantes navegados",
            "Saiii...seu sinistro",
            "Batman, aqui é Robin",
            "Gostosinho(a) você, hein",
            "Político ladrão, safado"
        ];

        this.terms = termLabels.map((label) => {
            return {
                value: lodash.snakeCase(label),
                label: label
            };
        });
    }

    /**
     * LYFECICLE : This function is called when component
     * got mounted in the view.
     */
    componentDidMount() {
        let logger = Logger.create("componentDidMount");
        logger.info("enter", {user: this.props.user});
    }

    onTermSelect(term) {
        let {selectedTerms} = this.state;

        if(selectedTerms.length == 3 && !this.moreTermToastAlreadyShowed) {
            this.moreTermToastAlreadyShowed = true;

            return Redux.dispatch(
                Toaster.actions.push("danger", "_SIGNUP_STEP3_ERROR_MANY_TERMS_SELECTED_")
            );
        }

        this.setState({
            selectedTerms: selectedTerms.concat([term.value])
        });
    }

    onTermDeselect(term) {
        let {selectedTerms} = this.state;

        this.moreTermToastAlreadyShowed = false;

        this.setState({
            selectedTerms: lodash.filter(selectedTerms, (v) => {
                return v != term.value;
            })
        });
    }

    async onFinalizeClick() {
        let logger = Logger.create("onFinalizeClick");
        let {selectedTerms} = this.state;

        logger.info("enter", {selectedTerms});

        if(selectedTerms.length == 0) {
            return Redux.dispatch(
                Toaster.actions.push("danger", "_SIGNUP_STEP3_ERROR_NO_TERMS_SELECTED_")
            );
        }

        this.setState({loading: true});

        // Save to user profile.
        try {
            // Update user nickName
            await Redux.dispatch(
                User.actions.userUpdate({
                    keywords: selectedTerms
                })
            );
        }
        catch(error) {
            logger.error("userUpdate error", error);
            this.setState({loading: false});
        }

        this.props.onComplete();
    }

    /**
     * This function is responsible for generating the component's view.
     */
    render() {
        return (
            <div className={styles.page}>
                <Container>
                    <Grid>
                        <Grid.Cell></Grid.Cell>
                        <Grid.Cell span={1.2}>
                            <div className={styles.logoContainer}>
                                <img className={styles.logo} src={logoIcon} />
                            </div>

                            <div className={styles.box}>
                                <div className={styles.text1}>
                                    <i18n.Translate text="_SIGNUP_STEP_3_TEXT_1_" data={this.props.profile}/>
                                </div>

                                <div className={styles.termsContainer}>
                                    {this.terms.map((term) => {
                                        let selected = (this.state.selectedTerms.indexOf(term.value) >= 0);

                                        return <Term key={term.value} 
                                            data={term} 
                                            selected={selected}
                                            onSelect={this.onTermSelect}
                                            onDeselect={this.onTermDeselect}/>;
                                    })}
                                </div>

                                <div className={styles.buttonContainer}>
                                    <Button type="submit"
                                        loading={this.state.loading}
                                        loadingComponent={
                                            <span>
                                                <i18n.Translate text="_LOADING_" />
                                                <span className={styles.spinnerContainer}>
                                                    <Spinner.CircSide color="#fff" />
                                                </span>
                                            </span>
                                        }
                                        scale={1.3}
                                        onClick={this.onFinalizeClick}>
                                        <i18n.Translate text="_FINALIZE_" />
                                    </Button>
                                </div>
                            </div>
                        </Grid.Cell>
                        <Grid.Cell></Grid.Cell>
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
