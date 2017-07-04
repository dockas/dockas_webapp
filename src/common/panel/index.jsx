import React from "react";
import classNames from "classnames";
import Form from "darch/src/form";
import Button from "darch/src/button";
import i18n from "darch/src/i18n";
import {LoggerFactory} from "darch/src/utils";
import styles from "./styles";

let Logger = new LoggerFactory("panel");

/**
 * Main component class.
 */
export default class Component extends React.Component {
    /** React properties **/
    static displayName = "panel";
    static defaultProps = {
        display: "inline-block",
        editing: false,
        loading: false,
        canEdit: true,
        onEditStart: () => {},
        onEditEnd: () => {},
        editText: "_EDIT_",
        saveText: "_SAVE_",
        cancelText: "_CANCEL_"
    };
    static propTypes = {
        id: React.PropTypes.string.isRequired,
        display: React.PropTypes.oneOf([
            "inline-block",
            "block"
        ]),
        editing: React.PropTypes.bool,
        loading: React.PropTypes.bool,
        canEdit: React.PropTypes.bool,
        onEditStart: React.PropTypes.func,
        onEditEnd: React.PropTypes.func,
        labelText: React.PropTypes.string.isRequired,
        editText: React.PropTypes.string,
        saveText: React.PropTypes.string,
        cancelText: React.PropTypes.string
    };

    componentDidMount() {
        let logger = Logger.create("componentDidMount");
        logger.info("enter");
    }

    onSubmit(data, id) {
        let logger = Logger.create("onSubmit");
        logger.info("enter");

        this.props.onEditEnd(data,id);
    }

    render() {
        let {
            id,canEdit,editing,loading,
            labelText,saveText,editText,
            display,cancelText
        } = this.props;

        return (
            <div className={classNames([
                styles.panel,
                styles[`panel-${display}`],
                editing?styles.active:""
            ])}>
                <Form name={id} loading={loading} onSubmit={this.onSubmit}>
                    <div className={styles.label}>
                        <i18n.Translate text={labelText} /> 

                        {canEdit ? (
                            !editing ? (
                                <span> • <a onClick={this.props.onEditStart}><i18n.Translate text={editText} format="lower" /></a></span>
                            ) : (
                                <span> • <Button textCase="lower" type="submit" layout="link"><i18n.Translate text={saveText} format="lower" /></Button> • <a onClick={this.props.onCancel}><i18n.Translate text={cancelText} format="lower" /></a></span>
                            )
                        ) : null}
                    </div>

                    {this.props.children}
                </Form>
            </div>
        );
    }
}
