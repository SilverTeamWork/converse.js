import 'shared/autocomplete/index.js';
import tpl_muc_sidebar from "./templates/muc-sidebar.js";
import { CustomElement } from 'shared/components/element.js';
import { _converse, api, converse } from "@converse/headless/core";

import './styles/muc-occupants.scss';

const { u } = converse.env;

export default class MUCSidebar extends CustomElement {

    static get properties () {
        return {
            jid: { type: String }
        }
    }

    connectedCallback () {
        super.connectedCallback();
        this.model = _converse.chatboxes.get(this.jid);
        this.listenTo(this.model.occupants, 'add', this.requestUpdate);
        this.listenTo(this.model.occupants, 'remove', this.requestUpdate);
        this.listenTo(this.model.occupants, 'change', this.requestUpdate);
        this.model.initialized.then(() => this.requestUpdate());
    }

    render () {
        const tpl = tpl_muc_sidebar(Object.assign(
            this.model.toJSON(), {
                'occupants': [...this.model.occupants.models],
                'closeSidebar': ev => this.closeSidebar(ev),
                'onOccupantClicked': ev => this.onOccupantClicked(ev),
            }
        ));
        return tpl;
    }

    closeSidebar(ev) {
        ev?.preventDefault?.();
        ev?.stopPropagation?.();
        u.safeSave(this.model, { 'hidden_occupants': true });
        // FIXME: do this declaratively
        _converse.chatboxviews.get(this.jid)?.scrollDown();
    }

    onOccupantClicked (ev) {
        ev?.preventDefault?.();
        const chatview = _converse.chatboxviews.get(this.getAttribute('jid'));
        chatview?.getBottomPanel().insertIntoTextArea(`@${ev.target.textContent}`);
    }
}

api.elements.define('converse-muc-sidebar', MUCSidebar);
