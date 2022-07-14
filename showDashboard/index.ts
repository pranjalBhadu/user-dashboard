import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import {TelemetryProvider} from "../Telemetry.Instrumentation/TelemetryProvider"

const axios = require("axios").default;

const tp = new TelemetryProvider("http app", "0.1.0");
const tracer = TelemetryProvider.getTelemetryTracer()
console.log(tracer)

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void>{
        const span = TelemetryProvider.startTracing("start of dashboard")
        context.log('HTTP trigger function processed a request to show users in dashboard.');
        let usersData: any;
        context.res.headers = { "Content-Type": "application/json" };
        const span1 = TelemetryProvider.startTracing("fetch user data from getUsers", span)
        const responseMessage = await axios.get('https://user-dashboard.azurewebsites.net/api/getusers')
        .then(users => { 
            usersData = users.data; 
        })
        .catch(err => {console.log("unable to get users")})
        TelemetryProvider.endTracing(span1);
        const span2 = TelemetryProvider.startTracing("show user data on dashboard", span)
        context.res = {
            // status: 200, /* Defaults to 200 */
            body: usersData
        };
        TelemetryProvider.endTracing(span2);
        TelemetryProvider.endTracing(span)
    // return context.res
};

export default httpTrigger;