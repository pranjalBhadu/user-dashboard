import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import {TelemetryProvider} from "../Telemetry.Instrumentation/TelemetryProvider"
const axios = require("axios").default;

const tp = new TelemetryProvider("http app", "0.1.0");
const tracer = TelemetryProvider.getTelemetryTracer()

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  context.log("HTTP trigger function for fetching user json");
  let usersData;
  context.res.headers = { "Content-Type": "application/json" };
  const span = TelemetryProvider.startTracing("fetch user data json from api", undefined, 0, { attr1: "first" })
  const currentSpan= TelemetryProvider.getCurrentSpan()
  console.log("current span: ",currentSpan)
  const responseMessage = await axios.get('https://jsonplaceholder.typicode.com/users')
  .then(users => {usersData = users.data; })
  .catch(err => {console.log("unable to get users")})
  TelemetryProvider.endTracing(span)
    // console.log(userData)
  context.res = {
      // status: 200, /* Defaults to 200 */
      body: usersData
  };
};

export default httpTrigger;
