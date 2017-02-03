import * as vm from "vso-node-api/WebApi";
import * as tl from "vsts-task-lib/task";

export function getWebApi(connectionName: string): vm.WebApi {

        let hostAuth: IauthParameters = getEndpointDetails(connectionName);

        let authHandler = vm.getPersonalAccessTokenHandler(hostAuth.hostToken);

        let apiClient: vm.WebApi = new vm.WebApi(hostAuth.hostUrl, authHandler);

        return apiClient;
}

function getEndpointDetails(connectionName: string): IauthParameters {

        let hostAuth: IauthParameters = <IauthParameters>{};

        if (!tl.getEndpointUrl) {
                throw new Error(tl.loc("couldNotLocateEndPoint", connectionName));
        }
        let VstsTfsApiEndPoint: string = tl.getInput(connectionName); 
        if (!VstsTfsApiEndPoint) {
                throw new Error(tl.loc("couldNotLocateEndPoint", connectionName));
        }
        hostAuth.hostUrl = tl.getEndpointUrl(VstsTfsApiEndPoint, false); 
        if (!hostAuth.hostUrl) {
                throw new Error(tl.loc("couldNotFindServerUrl"));
        }

        let auth: tl.EndpointAuthorization = tl.getEndpointAuthorization(VstsTfsApiEndPoint, false);
        if (auth.scheme !== "Token") {
                throw new Error(tl.loc("authorizationSchemeNotSupported", auth.scheme));
        }

        hostAuth.hostToken = getAuthParameter(auth, "apitoken");
        return hostAuth;
}

function getAuthParameter(auth: tl.EndpointAuthorization, paramName: string): string {
        const keyParameters = "parameters";
        let paramValue: string;
        let parameters: string[] = Object.getOwnPropertyNames(auth[keyParameters]);
        let keyName: string;
        parameters.some((key): boolean => {
                if (key.toLowerCase() === paramName.toLowerCase()) {
                        keyName = key;
                        return true;
                }
        });

        paramValue = auth[keyParameters][keyName];
        return paramValue;
}

export interface IauthParameters {
        hostUrl: string;
        hostToken: string;
}
