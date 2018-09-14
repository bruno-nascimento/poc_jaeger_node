const express = require('express');
const { Tags, FORMAT_HTTP_HEADERS } = require('opentracing');
const jaeger = require('jaeger-client');
const UDPSender = require('jaeger-client/dist/src/reporters/udp_sender').default;
const sampler = new jaeger.ConstSampler(true);
const reporter = new jaeger.RemoteReporter(new UDPSender());

const jaegerTracer = new jaeger.Tracer('teste-envoy', reporter, sampler);

const app = express();

app.get('/', function (req, res) {
    // const span = jaegerTracer.startSpan('server');
    // span.setTag("teste-envoy", true);
    const parentSpanContext = jaegerTracer.extract(FORMAT_HTTP_HEADERS, req.headers);
    const span = jaegerTracer.startSpan('server', {
        childOf: parentSpanContext,
        tags: {[Tags.SPAN_KIND]: Tags.SPAN_KIND_RPC_SERVER}
    });
    console.log(JSON.stringify(req.headers));
    res.send('Hello World!');
    span.finish();
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});

