import { AzureFunction, Context, HttpRequest } from "@azure/functions";
const { NodeTracerProvider } = require('@opentelemetry/node')
const { ConsoleSpanExporter, SimpleSpanProcessor } = require('@opentelemetry/tracing')
const { trace }  = require("@opentelemetry/api");

const provider = new NodeTracerProvider()
const consoleExporter = new ConsoleSpanExporter()
const spanProcessor = new SimpleSpanProcessor(consoleExporter)

const name = 'get-users'
const version = '0.1.0'
const tracer = trace.getTracer(name, version)

provider.addSpanProcessor(spanProcessor)
provider.register()
trace.setGlobalTracerProvider(provider)

const axios = require("axios").default;

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  context.log("HTTP trigger function for fetching user json");
  let usersData;

  context.res.headers = { "Content-Type": "application/json" };
  const span = tracer.startSpan("fetch user data json from api")
  const responseMessage = await axios.get('https://jsonplaceholder.typicode.com/users')
  .then(users => {usersData = users.data; })
  .catch(err => {console.log("unable to get users")})
  span.end();
    // console.log("HERE")
  context.res = {
      // status: 200, /* Defaults to 200 */
      body: usersData
  };
};

export default httpTrigger;
