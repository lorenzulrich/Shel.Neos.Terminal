import * as React from 'react';
import { connect } from 'react-redux';
import { $get, $transform } from 'plow-js';
import PropTypes from 'prop-types';

// Neos dependencies are provided by the UI
// @ts-ignore
import { neos } from '@neos-project/neos-ui-decorators';
// @ts-ignore
import { selectors } from '@neos-project/neos-ui-redux-store';

import { Node, I18nRegistry } from './interfaces';
import fetchCommands from './helpers/fetchCommands';
import doInvokeCommand from './helpers/doInvokeCommand';

interface FallbackPluginProps {
    config: {
        getCommandsEndPoint: string;
        invokeCommandEndPoint: string;
    };
    siteNode: Node;
    documentNode: Node;
    focusedNodes: string[];
    i18nRegistry: I18nRegistry;
}

@connect(
    $transform({
        user: $get('user.name'),
        siteNode: selectors.CR.Nodes.siteNodeSelector,
        documentNode: selectors.CR.Nodes.documentNodeSelector,
        focusedNodes: selectors.CR.Nodes.focusedNodePathsSelector,
    })
)
@neos((globalRegistry) => ({
    i18nRegistry: globalRegistry.get('i18n'),
    config: globalRegistry.get('frontendConfiguration').get('Shel.Neos.Terminal:Terminal'),
}))
export default class FallbackPlugin extends React.PureComponent<FallbackPluginProps> {
    static propTypes = {
        config: PropTypes.object.isRequired,
        i18nRegistry: PropTypes.object.isRequired,
        siteNode: PropTypes.object,
        documentNode: PropTypes.object,
        focusedNodes: PropTypes.array,
    };

    componentDidMount() {
        const { getCommandsEndPoint, invokeCommandEndPoint } = this.props.config;

        // Fetch and register all available commands
        fetchCommands(getCommandsEndPoint).then(({ success, result }) => {
            if (!success) return;

            const invokeCommand = (commandName, ...args) => {
                const { siteNode, documentNode, focusedNodes } = this.props;

                const focusedNode = focusedNodes?.length > 0 ? focusedNodes[0] : null;

                return doInvokeCommand(
                    invokeCommandEndPoint,
                    commandName,
                    args,
                    siteNode.contextPath,
                    focusedNode,
                    documentNode.contextPath
                ).then(({ success, result }) => {
                    if (success) console.log(result);
                    else console.error(result);
                    return result;
                });
            };

            Object.keys(result).forEach((commandName) => {
                // Register command globally
                window.NeosTerminal[commandName] = (...args) => invokeCommand(commandName, args);
            });

            console.info('Neos Terminal commands are available via "NeosTerminal".');
        });
    }

    render() {
        // Plugin is invisible and just registers terminal commands
        return null;
    }
}
