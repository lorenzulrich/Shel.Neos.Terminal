import React, { useMemo, useRef } from 'react';
import Terminal from 'react-console-emulator';

// @ts-ignore
import { themr } from '@friendsofreactjs/react-css-themr';

// @ts-ignore
import { IconButton } from '@neos-project/react-ui-components';

import { Node, RegistrationKey } from '../interfaces';
import SponsorshipBadge from './SponsorshipBadge';
import { useCommands } from '../provider/CommandsProvider';

// @ts-ignore
import style from './ReplWrapper.css';

export interface TerminalTheme {
    contentStyle: Record<string, any> | string;
    styleEchoBack: Record<string, any> | string;
    promptLabelStyle: Record<string, any> | string;
    inputTextStyle: Record<string, any> | string;
}

interface ReplProps {
    config: {
        theme: TerminalTheme;
        welcomeMessage?: string;
        registrationKey?: RegistrationKey;
    };
    user: {
        firstName: string;
        lastName: string;
        fullName: string;
    };
    siteNode: Node;
    documentNode: Node;
    className?: string;
    theme?: Record<string, string>;
    terminalOpen?: boolean;
    toggleNeosTerminal: (visible?: boolean) => void;
}

const ReplWrapper: React.FC<ReplProps> = ({
    config,
    theme,
    user,
    siteNode,
    documentNode,
    terminalOpen,
    toggleNeosTerminal,
}) => {
    const { invokeCommand, commands, translate } = useCommands();
    const terminal = useRef<Terminal>();

    const promptLabel = useMemo(() => {
        const currentPath =
            siteNode.contextPath === documentNode.contextPath ? '~' : documentNode.properties.uriPathSegment;
        return `${user.firstName}@${siteNode.name}:${currentPath}$`;
    }, [user.firstName, siteNode.name, documentNode.contextPath, documentNode.properties.uriPathSegment]);

    const commandsDefinition = useMemo(() => {
        return Object.keys(commands).reduce((carry, commandName) => {
            const command = commands[commandName];

            // Register command globally
            window.NeosTerminal[commandName] = (...args) => invokeCommand(commandName, args);

            carry[commandName] = {
                ...command,
                description: translate(command.description ?? ''),
                fn: (...args) => {
                    const currentTerminal = terminal.current;
                    invokeCommand(commandName, args)
                        .then((result) => {
                            currentTerminal.state.stdout.pop();
                            let output = result;
                            if (!result) {
                                output = translate('command.empty');
                            }
                            currentTerminal.pushToStdout(output);
                        })
                        .catch((error) => {
                            console.error(
                                error,
                                translate(
                                    'command.invocationError',
                                    'An error occurred during invocation of the "{commandName}" command',
                                    { commandName }
                                )
                            );
                            currentTerminal.state.stdout.pop();
                            currentTerminal.pushToStdout(translate('command.error'));
                        });
                    return translate('command.evaluating');
                },
            };
            return carry;
        }, {});
    }, [commands, invokeCommand]);

    if (!Object.keys(commands).length) return null;

    return (
        <div className={theme.replWrapper}>
            <IconButton
                onClick={() => toggleNeosTerminal()}
                isActive={terminalOpen}
                title={translate('toggleTerminal')}
                icon="terminal"
            />
            <div className={theme.terminalWrapper} style={{ display: terminalOpen ? 'block' : 'none' }}>
                <Terminal
                    autoFocus={true}
                    ref={terminal}
                    commands={commandsDefinition}
                    ignoreCommandCase={true}
                    welcomeMessage={translate(config.welcomeMessage)}
                    promptLabel={promptLabel}
                    style={{ borderRadius: 0, maxHeight: '50vh' }}
                    {...config.theme}
                />
                <SponsorshipBadge registrationKey={config.registrationKey} />
            </div>
        </div>
    );
};

export default React.memo(themr('shel-neos-terminal/replWrapper', style)(ReplWrapper));
