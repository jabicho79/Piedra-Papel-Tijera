## Game Performance Dashboard
resource "newrelic_one_dashboard" "game_performance" {
  name = "${var.app_name} - Game Performance"

  ## Page Load Time Widget
  page {
    name = "Performance Metrics"

    ## LCP (Largest Contentful Paint)
    widget_line {
      title  = "Largest Contentful Paint (LCP)"
      column = 1
      row    = 1
      width  = 6
      height = 3

      nrql_query {
        query = "SELECT average(largestContentfulPaint) FROM PageViewTiming WHERE appName = '${var.app_name}' TIMESERIES"
      }
    }

    ## First Input Delay
    widget_line {
      title  = "First Input Delay (FID)"
      column = 7
      row    = 1
      width  = 6
      height = 3

      nrql_query {
        query = "SELECT average(firstInputDelay) FROM PageViewTiming WHERE appName = '${var.app_name}' TIMESERIES"
      }
    }

    ## Cumulative Layout Shift
    widget_line {
      title  = "Cumulative Layout Shift (CLS)"
      column = 1
      row    = 4
      width  = 6
      height = 3

      nrql_query {
        query = "SELECT average(cumulativeLayoutShift) FROM PageViewTiming WHERE appName = '${var.app_name}' TIMESERIES"
      }
    }

    ## Page Load Time
    widget_line {
      title  = "Page Load Time"
      column = 7
      row    = 4
      width  = 6
      height = 3

      nrql_query {
        query = "SELECT average(pageLoadTime) FROM PageView WHERE appName = '${var.app_name}' TIMESERIES"
      }
    }

    ## JavaScript Errors
    widget_bar {
      title  = "JavaScript Errors (Last 24h)"
      column = 1
      row    = 7
      width  = 6
      height = 3

      nrql_query {
        query = "SELECT count(*) FROM JavaScriptError WHERE appName = '${var.app_name}' FACET errorClass LIMIT 10"
      }
    }

    ## User Activity
    widget_line {
      title  = "Active Users (RUM)"
      column = 7
      row    = 7
      width  = 6
      height = 3

      nrql_query {
        query = "SELECT count(distinct(session)) FROM PageView WHERE appName = '${var.app_name}' TIMESERIES 1 hour"
      }
    }
  }
}

## Availability Dashboard
resource "newrelic_one_dashboard" "availability" {
  name = "${var.app_name} - Availability & Uptime"

  page {
    name = "Service Health"

    ## Health Check Status
    widget_line {
      title  = "Health Check Success Rate"
      column = 1
      row    = 1
      width  = 6
      height = 3

      nrql_query {
        query = "SELECT filter(count(*), where httpResponseCode = 200) / count(*) * 100 FROM Metric WHERE metricName = 'custom.health.check' TIMESERIES"
      }
    }

    ## Response Time
    widget_line {
      title  = "Average Response Time"
      column = 7
      row    = 1
      width  = 6
      height = 3

      nrql_query {
        query = "SELECT average(duration) FROM Transaction WHERE appName = '${var.app_name}' TIMESERIES"
      }
    }

    ## Container Uptime
    widget_line {
      title  = "Container Health Status"
      column = 1
      row    = 4
      width  = 12
      height = 3

      nrql_query {
        query = "SELECT latest(containerIsHealthy) FROM ContainerMetrics TIMESERIES 1 minute LIMIT MAX"
      }
    }

    ## HTTP Status Codes
    widget_bar {
      title  = "HTTP Response Codes (Last 24h)"
      column = 1
      row    = 7
      width  = 12
      height = 3

      nrql_query {
        query = "SELECT count(*) FROM Transaction WHERE appName = '${var.app_name}' FACET httpResponseCode LIMIT 10"
      }
    }

    ## Error Rate
    widget_line {
      title  = "Error Rate (%)"
      column = 1
      row    = 10
      width  = 6
      height = 3

      nrql_query {
        query = "SELECT filter(count(*), where error = true) / count(*) * 100 FROM Transaction WHERE appName = '${var.app_name}' TIMESERIES"
      }
    }

    ## SLA Status
    widget_line {
      title  = "SLA Status (99.9%)"
      column = 7
      row    = 10
      width  = 6
      height = 3

      nrql_query {
        query = "SELECT filter(count(*), where httpResponseCode != 500) / count(*) * 100 FROM Transaction WHERE appName = '${var.app_name}' TIMESERIES 1 hour"
      }
    }
  }
}

## P2P Performance Dashboard
resource "newrelic_one_dashboard" "p2p_performance" {
  name = "${var.app_name} - P2P Performance (WebRTC)"

  page {
    name = "Network & P2P Metrics"

    ## AJAX Performance
    widget_line {
      title  = "AJAX Request Duration"
      column = 1
      row    = 1
      width  = 6
      height = 3

      nrql_query {
        query = "SELECT average(duration) FROM AjaxRequest WHERE appName = '${var.app_name}' TIMESERIES"
      }
    }

    ## Data Transfer Size
    widget_line {
      title  = "Data Transfer Size (KB)"
      column = 7
      row    = 1
      width  = 6
      height = 3

      nrql_query {
        query = "SELECT sum(contentLength) / 1024 FROM AjaxRequest WHERE appName = '${var.app_name}' TIMESERIES"
      }
    }

    ## Network Requests Count
    widget_bar {
      title  = "Network Requests by Type"
      column = 1
      row    = 4
      width  = 6
      height = 3

      nrql_query {
        query = "SELECT count(*) FROM AjaxRequest WHERE appName = '${var.app_name}' FACET requestPath LIMIT 15"
      }
    }

    ## Failed Requests
    widget_bar {
      title  = "Failed AJAX Requests"
      column = 7
      row    = 4
      width  = 6
      height = 3

      nrql_query {
        query = "SELECT count(*) FROM AjaxRequest WHERE appName = '${var.app_name}' AND statusCode >= 400 FACET statusCode"
      }
    }

    ## WebRTC Connection Quality
    widget_line {
      title  = "Average Page Actions (User Interactions)"
      column = 1
      row    = 7
      width  = 12
      height = 3

      nrql_query {
        query = "SELECT count(*) FROM PageAction WHERE appName = '${var.app_name}' TIMESERIES 1 hour"
      }
    }

    ## Connection Latency
    widget_line {
      title  = "Request Latency (P99)"
      column = 1
      row    = 10
      width  = 6
      height = 3

      nrql_query {
        query = "SELECT percentile(duration, 99) FROM AjaxRequest WHERE appName = '${var.app_name}' TIMESERIES"
      }
    }

    ## Throughput
    widget_line {
      title  = "Request Throughput (req/min)"
      column = 7
      row    = 10
      width  = 6
      height = 3

      nrql_query {
        query = "SELECT rate(count(*), 1 minute) FROM AjaxRequest WHERE appName = '${var.app_name}' TIMESERIES"
      }
    }
  }
}
