// @ts-ignore
import { fetchWithErrorHandling } from '@neos-project/neos-ui-backend-connector';

const doInvokeCommand = async (
    endPoint: string,
    commandName: string,
    args: string[],
    siteNode: string = null,
    focusedNode: string = null,
    documentNode: string = null
): Promise<any> => {
    return fetchWithErrorHandling
        .withCsrfToken((csrfToken) => ({
            url: endPoint,
            method: 'POST',
            credentials: 'include',
            headers: {
                'X-Flow-Csrftoken': csrfToken,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                commandName,
                argument: args.join(' '),
                siteNode,
                focusedNode,
                documentNode,
            }),
        }))
        .then((response) => response && response.json());
};

export default doInvokeCommand;
