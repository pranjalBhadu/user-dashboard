import { AzureFunction, Context, HttpRequest } from "@azure/functions";
// import {TelemetryProvider} from "../Telemetry.Instrumentation/TelemetryProvider"
// import {TelemetryProvider} from 'opentelemetrywrapper'
// import {TelemetryProvider} from "../Telemetry.Instrumentation/TelemetryProvider"
import {TelemetryProvider} from "opentelemetrywrapper"
const axios = require("axios").default;
const connstr = "InstrumentationKey=e42c6ebf-ab37-42b5-9993-6ea44d52f6bf;IngestionEndpoint=https://centralindia-0.in.applicationinsights.azure.com/;LiveEndpoint=https://centralindia.livediagnostics.monitor.azure.com/"

const tp = new TelemetryProvider("http app", "0.1.0", connstr);
const tracer = TelemetryProvider.getTelemetryTracer()

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  // context.log("HTTP trigger function for fetching user json");
  // let usersData;
  // context.res.headers = { "Content-Type": "application/json" };
  // const span = TelemetryProvider.startTracing("fetch user data json from api", undefined, 0, { attr1: "first" })
  // TelemetryProvider.startTracingWith("test span", () => {
  //   context.log("In test Span")
  //   context.log(TelemetryProvider.getCurrentSpanContext())
  //   TelemetryProvider.startTracingWith("test span child", () => {
  //       context.log("In test Span Child")
  //       context.log(TelemetryProvider.getCurrentSpanContext())
  //   })
  // })
  // const responseMessage = await axios.get('https://jsonplaceholder.typicode.com/users')
  // .then(users => {usersData = users.data; })
  // .catch(err => {console.log("unable to get users")})
  // TelemetryProvider.endTracing(span)
  //   // console.log(userData)
  // context.res = {
  //     // status: 200, /* Defaults to 200 */
  //     body: usersData
  // };
  let usersData: any = undefined;
  TelemetryProvider.startTracingWith("start getUsers()", () => {
    TelemetryProvider.startTracingWith("fetch from api", async () => {
      const responseMessage = await axios.get('https://jsonplaceholder.typicode.com/users')
      .then(users => {usersData = users.data})
      .catch(err => {context.log("Unable to fetch users")})
      context.res = {
        headers : {
          "Content-Type": "application/json"
        }, 
        body: usersData
      }
    })
})
}

export default httpTrigger;
