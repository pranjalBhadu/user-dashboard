import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import {TelemetryProvider} from "opentelemetrywrapper"
import { trace}  from "@opentelemetry/api";

const connstr = "InstrumentationKey=e42c6ebf-ab37-42b5-9993-6ea44d52f6bf;IngestionEndpoint=https://centralindia-0.in.applicationinsights.azure.com/;LiveEndpoint=https://centralindia.livediagnostics.monitor.azure.com/"

const axios = require("axios").default;
const tp = new TelemetryProvider("http app", "0.1.0", connstr);


const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void>{
        const span = tp.startTracing("start of dashboard")
        let usersData: any;
        context.res.headers = { "Content-Type": "application/json" };
        const span1 = tp.startTracing("fetch user data from getUsers", span)
        tp.addTraceEvent(span1, "this is an event in dashboard");
        const responseMessage = await axios.get('https://user-dashboard.azurewebsites.net/api/getUsers?')
        .then(users => { 
            usersData = users.data; 
        })
        .catch(err => {console.log("unable to get users")})
        tp.endTracing(span1)

        const span2 = tp.startTracing("show user data on dashboard", span)
        context.res = {
            headers: { "Content-Type": "application/json" },
            body: usersData
        };
        tp.endTracing(span2);
        tp.endTracing(span)
    // return context.res
};

export default httpTrigger;