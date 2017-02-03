import {IBuildApi}  from "vso-node-api/BuildApi";
import {Build, BuildDefinition} from "vso-node-api/interfaces/BuildInterfaces";
import {WebApi} from "vso-node-api/WebApi";
import * as tl from "vsts-task-lib/task";

import * as cm from "./common";


async function run() {
    try {

        let serverUrl: string;
        let projectId: string = tl.getInput("project");
        let collectionName: string = tl.getInput("collectionName");
        let builDefinitionId: number = Number(tl.getInput("buildDefinition"));
        let apiClient: WebApi = cm.getWebApi("connection");

        if (apiClient.serverUrl.includes(".visualstudio.com")) {
            // running on VSTS
            serverUrl = apiClient.serverUrl;
        }else {
            // running on TFS
            serverUrl = apiClient.serverUrl + "/" + collectionName + "/";
        }

        let buildClient: IBuildApi = apiClient.getBuildApi(serverUrl);

        let buildToTrigger: Build = <Build>{};

        let buildDefinition: BuildDefinition = await buildClient.getDefinition(builDefinitionId, projectId);

        console.log("Starting the build : " + buildDefinition.name
                         + "  for the project :  " + buildDefinition.project.name);

        buildToTrigger.definition = buildDefinition;

        buildToTrigger = await buildClient.queueBuild(buildToTrigger, projectId);

        console.log("Build : " + buildToTrigger.buildNumber + " queued...");

    } catch (err) {
        tl.setResult(tl.TaskResult.Failed, err.message);
    }
}

run();
