import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import {TelemetryProvider} from "opentelemetrywrapper"
const axios = require("axios").default;

const connstr = "InstrumentationKey=e42c6ebf-ab37-42b5-9993-6ea44d52f6bf;IngestionEndpoint=https://centralindia-0.in.applicationinsights.azure.com/;LiveEndpoint=https://centralindia.livediagnostics.monitor.azure.com/"

const tp = new TelemetryProvider("http app", "0.1.0", connstr);

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const span = tp.startTracing("tracing getUsers")
  tp.addTraceEvent(span, "This is an event in getUsers")

  let usersData: JSON;

  const m = tp.getMessageContext()
  m.ApplicationName = "getUsers"
  m.CreatedBy = "Pranjal Bhadu"
  m.UserId = "1001"
  m.CustomProperties = {
    version: "1.0.0"
  }
  const span1 = tp.startTracing("fetching dummy users", span, 0, m)
  const responseMessage = await axios.get('https://jsonplaceholder.typicode.com/users')
  .then(users => {usersData = users.data; })
  .catch(err => {console.log("unable to get users")})
  tp.endTracing(span1)

  const span2 = tp.startTracing("sending data to response", span)
  context.res = {
    headers: { "Content-Type": "application/json" },
    body: usersData
  };
  tp.endTracing(span2)
  
  tp.endTracing(span)
}

export default httpTrigger;
