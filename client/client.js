const { Tags, FORMAT_HTTP_HEADERS } = require('opentracing');
const jaeger = require('jaeger-client');
const UDPSender = require('jaeger-client/dist/src/reporters/udp_sender').default;
const sampler = new jaeger.ConstSampler(true);
const reporter = new jaeger.RemoteReporter(new UDPSender());

const jaegerTracer = new jaeger.Tracer('teste-envoy', reporter, sampler);

const got = require('got');

(async () => {
	try {
        const span = jaegerTracer.startSpan("client", {tags: {[Tags.SPAN_KIND]: Tags.SPAN_KIND_RPC_CLIENT}});
        let headers = {};
        jaegerTracer.inject(span, FORMAT_HTTP_HEADERS, headers);
        console.log(headers);
		const response = await got('http://localhost:3000', {headers});
        span.finish();
        console.log(response.body);
        setTimeout(()=>{
            process.exit();
        }, 1000)
	} catch (error) {
		console.log(error);
		process.exit(1);
	}
})();