import { AzureFunction, Context, HttpRequest } from "@azure/functions"
const { NodeTracerProvider } = require('@opentelemetry/node')
const { ConsoleSpanExporter, SimpleSpanProcessor } = require('@opentelemetry/tracing')
const { trace }  = require("@opentelemetry/api");

const axios = require("axios").default;

const provider = new NodeTracerProvider()
const consoleExporter = new ConsoleSpanExporter()
const spanProcessor = new SimpleSpanProcessor(consoleExporter)

const name = 'show-users'
const version = '0.1.0'
const tracer = trace.getTracer(name, version)

provider.addSpanProcessor(spanProcessor)
provider.register()
trace.setGlobalTracerProvider(provider)

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void>{
    context.log('HTTP trigger function processed a request to show users in dashboard.');
    let usersData: any;
    context.res.headers = { "Content-Type": "application/json" };
    tracer.startActiveSpan("dashboard azure function", async parentSpan =>{
        const span1 = tracer.startSpan("getting users from another azure func",
        { attributes: { attribute1: 'value1' } });
        const responseMessage = await axios.get('http://localhost:7071/api/getUsers')
        .then((users: { data: any; }) => {usersData = users.data;})
        .catch((err: any) => {context.log("unable to get users")})
        span1.end();
        const span2 = tracer.startSpan("show users on dashboard");
        console.log(usersData);
        context.res = {
            // status: 200, /* Defaults to 200 */
            body: usersData
        };
        span2.end();
        parentSpan.end();
        
    })
    // return context.res
};

export default httpTrigger;