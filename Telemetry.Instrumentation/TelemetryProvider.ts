import { Resource } from "@opentelemetry/resources";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";
import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";
import {AzureMonitorTraceExporter} from "@azure/monitor-opentelemetry-exporter"
import { BatchSpanProcessor, ConsoleSpanExporter  } from "@opentelemetry/sdk-trace-base";
import { trace, SpanKind, Context, Span, Tracer, context, SpanContext }  from "@opentelemetry/api";
import { TelemetryConstants } from "./TelemetryConstants";
const { W3CTraceContextPropagator} = require("@opentelemetry/core");
export class TelemetryProvider{
    private static TelemetryResource: Resource;
    private static Provider: NodeTracerProvider;
    // private static TelemetryExporter: AzureMonitorTraceExporter = new AzureMonitorTraceExporter({
    //     connectionString: TelemetryConstants.ConnectionString
    // });
    private static TelemetryExporter = new ConsoleSpanExporter();
    private static TelemetryProcessor: BatchSpanProcessor = new BatchSpanProcessor(TelemetryProvider.TelemetryExporter);
    public static TelemetryTracer: Tracer;
    constructor(TracerName: string, TracerVersion: string){
        TelemetryProvider.TelemetryResource =
        Resource.default().merge(
                new Resource({
                    [SemanticResourceAttributes.SERVICE_NAME]: TelemetryConstants.ServiceName,
                    [SemanticResourceAttributes.SERVICE_VERSION]: TelemetryConstants.ServiceVersion,
                })
            );

        TelemetryProvider.Provider = new NodeTracerProvider({
            resource: TelemetryProvider.TelemetryResource,
        });
        TelemetryProvider.Provider.addSpanProcessor(TelemetryProvider.TelemetryProcessor)
        TelemetryProvider.Provider.register();
        trace.setGlobalTracerProvider(TelemetryProvider.Provider)
        TelemetryProvider.TelemetryTracer = trace.getTracer(TracerName, TracerVersion)
    }

    public static getTelemetryTracer(): Tracer {
        return TelemetryProvider.TelemetryTracer
    }

    public static startTracing(spanName: string, activeSpan: Span = undefined, kind: number = 0, attributes: Object = null): Span{
        const spanKind: SpanKind = TelemetryProvider.getSpanKind(kind)
        // const currentSpan: Span = TelemetryProvider.getCurrentSpan()
        // if(currentSpan!=undefined)
        // {const id = currentSpan.spanContext().traceId
        // console.log("id: ", id)}
        // if(currentSpan == undefined){
        //     console.log("undefined")
        // }
        // const ctx: Context = trace.setSpan(context.active(), currentSpan);
        const ctx = trace.setSpan(context.active(), activeSpan);
        const span: Span = TelemetryProvider.TelemetryTracer.startSpan(spanName, {kind: spanKind}, ctx)
        if(attributes != null){
            this.setSpanTags(span, attributes)
        }
        return span
    }

    public static setParentSpan(span: Span): Context {
        return trace.setSpan(context.active(), span)
    }

    public static getSpanKind(kind: number): SpanKind {
        if(kind == 0) return SpanKind.INTERNAL
        else if(kind == 1) return SpanKind.SERVER
        else if(kind == 2) return SpanKind.CLIENT
        else if(kind == 3) return SpanKind.PRODUCER
        return SpanKind.CONSUMER
    }

    public static getCurrentSpan(): Span{
        return trace.getSpan(context.active());
    }

    public static setSpanTags(span: Span, attributes: Object): void{
        if(attributes == null){
            throw new Error("NULL MESSAGE!!")
        }

        if(span.isRecording()){
            for (const [key, value] of Object.entries(attributes)){
                span.setAttribute(key, value)
            }
        }
    }

    public static endTracing(span: Span): void{
        span.end()
    }
}