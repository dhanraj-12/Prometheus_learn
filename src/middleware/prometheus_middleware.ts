import type { Request,Response,NextFunction } from "express";
import client from "prom-client";


const requestCounter = new client.Counter({
    name: "http_requests_total",
    help: "Total number of HTTP requests",
    labelNames: ["method", "route", "status_code"]
})

const activerequestsGauge = new client.Gauge({
    name: "http_active_requests",
    help: "Number of active HTTP requests"
})


const httpRequestHistogram = new client.Histogram({
    name: "http_request_duration_seconds",
    help: "Duration of HTTP requests in seconds",
    labelNames: ["method", "route", "status_code"],
    buckets: [0.1, 0.5, 1, 2.5, 5, 10]
})

export function prometheusMiddleware(req: Request, res: Response, next: NextFunction) {

  const starttime = Date.now();
  activerequestsGauge.inc();
  res.on("finish", () => {
    const endtime = Date.now();
    const duration = endtime - starttime;
    console.log(`${req.method} ${req.originalUrl} took ${duration}ms`);
    requestCounter.inc({
      method: req.method,
      route: req.route ? req.route.path : req.originalUrl,
      status_code: res.statusCode
    })


    httpRequestHistogram.observe({
      method: req.method,
      route: req.route ? req.route.path : req.originalUrl,
      status_code: res.statusCode
    }, duration / 1000  );
    activerequestsGauge.dec();
  })

  next();
}