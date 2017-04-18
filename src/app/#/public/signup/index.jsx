import React from "react";
import {withRouter} from "react-router";
import {LoggerFactory} from "darch/src";
import styles from "./styles";
import Step1 from "./step1";
import Step2 from "./step2";
import Step3 from "./step3";

let Logger = new LoggerFactory("public.signup");

/**
 * Main component class.
 */
class Component extends React.Component {
    /** React properties **/
    static displayName = "public.signup";
    static defaultProps = {};
    static propTypes = {};

    /** Instance properties **/
    state = {
        step: 1
    };

    /**
     * LYFECICLE : This function is called when component
     * got mounted in the view.
     */
    componentDidMount() {
        let logger = Logger.create("componentDidMount");
        logger.info("enter");

        // Set route leave hook.
        // See https://github.com/ReactTraining/react-router/blob/master/docs/guides/ConfirmingNavigation.md
        //this.props.router.setRouteLeaveHook(this.props.route, this.routerWillLeave)
    }

    /**
     * LIFECYCLE : This function is called when router is
     * going to perform a transition from this component to
     * another one. Return false to prevent the transition.
     */
    /*routerWillLeave(nextLocation) {
        return true;
    }*/

    /**
     * This function moves the user to next signup step.
     */
    onStepComplete() {
        let logger = Logger.create("onStepComplete");
        logger.info("enter", {step: this.state.step});

        let {step} = this.state;
        let newState = {step: step+1};

        // Handle last step
        if(step == 3) {
            logger.info("is final step");

            // Go to private route.
            return this.props.router.replace("/");
        }

        logger.info("new state", newState);

        this.setState({step: step+1}, () => {
            logger.info("state updated");
        });
    }

    /**
     * This function is responsible for generating the component's view.
     */
    render() {
        let {step} = this.state;

        switch (step) {
            case 1: return <Step1 onComplete={this.onStepComplete}/>;
            case 2: return <Step2 onComplete={this.onStepComplete}/>;
            case 3: return <Step3 onComplete={this.onStepComplete}/>;
            default: return null;
        }
    }
}

/**
 * Export component
 */
export default withRouter(Component);
