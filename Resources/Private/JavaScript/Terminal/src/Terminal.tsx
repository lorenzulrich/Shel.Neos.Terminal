import * as React from 'react';
import { connect } from 'react-redux';
import { $get, $transform } from 'plow-js';
import PropTypes from 'prop-types';

// Neos dependencies are provided by the UI
// @ts-ignore
import { neos } from '@neos-project/neos-ui-decorators';
// @ts-ignore
import { selectors } from '@neos-project/neos-ui-redux-store';

import ReplWrapper, { TerminalTheme } from './components/ReplWrapper';
import { CommandsProvider } from './provider/CommandsProvider';
import { Node, I18nRegistry } from './interfaces';
import { actions, selectors as terminalSelectors } from './actions';

interface TerminalProps {
    config: {
        getCommandsEndPoint: string;
        invokeCommandEndPoint: string;
        theme: TerminalTheme;
        welcomeMessage?: string;
    };
    siteNode: Node;
    documentNode: Node;
    focusedNodes: string[];
    i18nRegistry: I18nRegistry;
    terminalOpen: boolean;
}

@connect((state) => ({}), {
    toggleNeosTerminal: actions.toggleNeosTerminal,
})
@connect(
    $transform({
        user: $get('user.name'),
        siteNode: selectors.CR.Nodes.siteNodeSelector,
        documentNode: selectors.CR.Nodes.documentNodeSelector,
        focusedNodes: selectors.CR.Nodes.focusedNodePathsSelector,
        terminalOpen: terminalSelectors.terminalOpen,
    })
)
@neos((globalRegistry) => ({
    i18nRegistry: globalRegistry.get('i18n'),
    config: globalRegistry.get('frontendConfiguration').get('Shel.Neos.Terminal:Terminal'),
}))
export default class Terminal extends React.PureComponent<TerminalProps> {
    static propTypes = {
        config: PropTypes.object.isRequired,
        i18nRegistry: PropTypes.object.isRequired,
        user: PropTypes.object.isRequired,
        siteNode: PropTypes.object,
        documentNode: PropTypes.object,
        focusedNodes: PropTypes.array,
        terminalOpen: PropTypes.bool,
        toggleNeosTerminal: PropTypes.func,
    };

    render() {
        const { config } = this.props as TerminalProps;

        return (
            <CommandsProvider
                getCommandsEndPoint={config.getCommandsEndPoint}
                invokeCommandEndPoint={config.invokeCommandEndPoint}
                siteNode={this.props.siteNode.contextPath}
                documentNode={this.props.documentNode.contextPath}
                focusedNode={this.props.focusedNodes?.length > 0 ? this.props.focusedNodes[0] : null}
                i18nRegistry={this.props.i18nRegistry}
            >
                <ReplWrapper {...this.props} />
            </CommandsProvider>
        );
    }
}
