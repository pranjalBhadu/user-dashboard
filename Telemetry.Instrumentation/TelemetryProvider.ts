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
    // public static ConnectionString: string;
    private static TelemetryExporter: AzureMonitorTraceExporter;
    // private static TelemetryExporter = new ConsoleSpanExporter();
    private static TelemetryProcessor: BatchSpanProcessor;
    public static TelemetryTracer: Tracer;
    constructor(TracerName: string, TracerVersion: string, ConnectionString: string){
        TelemetryProvider.TelemetryExporter = new AzureMonitorTraceExporter({
            connectionString: ConnectionString
        });

        TelemetryProvider.TelemetryProcessor = new BatchSpanProcessor(TelemetryProvider.TelemetryExporter);
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

    public static startTracing(spanName: string, activeSpan: Span|undefined = undefined, kind: number = 0, attributes: Object|null = null): Span{
        console.log("start of span")
        const spanKind: SpanKind = TelemetryProvider.getSpanKind(kind)
        let span: Span;
        if(activeSpan!=undefined){
            const ctx = trace.setSpan(context.active(), activeSpan);
            span = TelemetryProvider.TelemetryTracer.startSpan(spanName, {kind: spanKind}, ctx)
        }else{
            span = TelemetryProvider.TelemetryTracer.startSpan(spanName, {kind: spanKind})
        }
        if(attributes != undefined){
            this.setSpanTags(span, attributes)
        }
        console.log("span context: ")
        console.log(span.spanContext)
        return span
    }

    public static startTracingWith(spanName: string, func: () => void){
        const span: Span = TelemetryProvider.TelemetryTracer.startSpan(spanName);
        context.with(trace.setSpan(context.active(), span), func)
    }

    public static getSpanKind(kind: number): SpanKind {
        if(kind == 0) return SpanKind.INTERNAL
        else if(kind == 1) return SpanKind.SERVER
        else if(kind == 2) return SpanKind.CLIENT
        else if(kind == 3) return SpanKind.PRODUCER
        return SpanKind.CONSUMER
    }

    // public static getSpanId(span): string | undefined{
    //     return trace.getSpan(context.active());
    // }

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