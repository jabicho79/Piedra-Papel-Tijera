## Alert Policy for Game Performance
resource "newrelic_alert_policy" "game_performance" {
  name = "${var.app_name} - Game Performance Alerts"
}

## LCP > 4 seconds
resource "newrelic_nrql_alert_condition" "lcp_threshold" {
  policy_id       = newrelic_alert_policy.game_performance.id
  type            = "static"
  name            = "LCP Exceeds 4 Seconds"
  description     = "Alerts when Largest Contentful Paint exceeds 4 seconds"
  enabled         = true

  nrql {
    query = "SELECT average(largestContentfulPaint) FROM PageViewTiming WHERE appName = '${var.app_name}'"
  }

  term {
    priority          = "critical"
    operator          = "ABOVE"
    threshold         = "4000"
    threshold_duration = 300
    time_function      = "all"
  }
}

## JavaScript Errors > 10 per minute
resource "newrelic_nrql_alert_condition" "js_errors" {
  policy_id       = newrelic_alert_policy.game_performance.id
  type            = "static"
  name            = "High JavaScript Error Rate"
  description     = "Alerts when JavaScript errors exceed 10 per minute"
  enabled         = true

  nrql {
    query = "SELECT count(*) FROM JavaScriptError WHERE appName = '${var.app_name}'"
  }

  term {
    priority          = "critical"
    operator          = "ABOVE"
    threshold         = "10"
    threshold_duration = 60
    time_function      = "all"
  }
}

## Page Load Time > 5 seconds
resource "newrelic_nrql_alert_condition" "page_load_time" {
  policy_id       = newrelic_alert_policy.game_performance.id
  type            = "static"
  name            = "Slow Page Load Time"
  description     = "Alerts when page load time exceeds 5 seconds"
  enabled         = true

  nrql {
    query = "SELECT average(pageLoadTime) FROM PageView WHERE appName = '${var.app_name}'"
  }

  term {
    priority          = "critical"
    operator          = "ABOVE"
    threshold         = "5000"
    threshold_duration = 300
    time_function      = "all"
  }
}

## Alert Policy for Service Availability
resource "newrelic_alert_policy" "availability" {
  name = "${var.app_name} - Availability Alerts"
}

## Health Check Failures
resource "newrelic_nrql_alert_condition" "health_check_failure" {
  policy_id       = newrelic_alert_policy.availability.id
  type            = "static"
  name            = "Health Check Success Rate Below 95%"
  description     = "Alerts when health check success rate drops below 95%"
  enabled         = true

  nrql {
    query = "SELECT percentage(count(*), WHERE httpResponseCode = 200) FROM Metric WHERE metricName = 'custom.health.check'"
  }

  term {
    priority          = "critical"
    operator          = "BELOW"
    threshold         = "95"
    threshold_duration = 180
    time_function      = "all"
  }
}

## Response Time > 5 seconds
resource "newrelic_nrql_alert_condition" "response_time" {
  policy_id       = newrelic_alert_policy.availability.id
  type            = "static"
  name            = "High Response Time"
  description     = "Alerts when response time exceeds 5 seconds"
  enabled         = true

  nrql {
    query = "SELECT average(duration) FROM Transaction WHERE appName = '${var.app_name}'"
  }

  term {
    priority          = "critical"
    operator          = "ABOVE"
    threshold         = "5000"
    threshold_duration = 300
    time_function      = "all"
  }
}

## Error Rate > 5%
resource "newrelic_nrql_alert_condition" "error_rate" {
  policy_id       = newrelic_alert_policy.availability.id
  type            = "static"
  name            = "High Error Rate"
  description     = "Alerts when error rate exceeds 5%"
  enabled         = true

  nrql {
    query = "SELECT percentage(count(*), WHERE error = true) FROM Transaction WHERE appName = '${var.app_name}'"
  }

  term {
    priority          = "critical"
    operator          = "ABOVE"
    threshold         = "5"
    threshold_duration = 300
    time_function      = "all"
  }
}

## Alert Policy for P2P/Network Performance
resource "newrelic_alert_policy" "p2p_performance" {
  name = "${var.app_name} - Network & P2P Performance Alerts"
}

## AJAX Request Duration > 3 seconds
resource "newrelic_nrql_alert_condition" "ajax_duration" {
  policy_id       = newrelic_alert_policy.p2p_performance.id
  type            = "static"
  name            = "Slow AJAX Requests"
  description     = "Alerts when AJAX requests take more than 3 seconds"
  enabled         = true

  nrql {
    query = "SELECT average(duration) FROM AjaxRequest WHERE appName = '${var.app_name}'"
  }

  term {
    priority          = "critical"
    operator          = "ABOVE"
    threshold         = "3000"
    threshold_duration = 300
    time_function      = "all"
  }
}

## Failed AJAX Requests > 10%
resource "newrelic_nrql_alert_condition" "ajax_errors" {
  policy_id       = newrelic_alert_policy.p2p_performance.id
  type            = "static"
  name            = "High AJAX Failure Rate"
  description     = "Alerts when AJAX failure rate exceeds 10%"
  enabled         = true

  nrql {
    query = "SELECT percentage(count(*), WHERE statusCode >= 400) FROM AjaxRequest WHERE appName = '${var.app_name}'"
  }

  term {
    priority          = "critical"
    operator          = "ABOVE"
    threshold         = "10"
    threshold_duration = 300
    time_function      = "all"
  }
}

## Request Latency P99 > 2 seconds
resource "newrelic_nrql_alert_condition" "latency_p99" {
  policy_id       = newrelic_alert_policy.p2p_performance.id
  type            = "static"
  name            = "High P99 Request Latency"
  description     = "Alerts when 99th percentile latency exceeds 2 seconds"
  enabled         = true

  nrql {
    query = "SELECT percentile(duration, 99) FROM AjaxRequest WHERE appName = '${var.app_name}'"
  }

  term {
    priority          = "critical"
    operator          = "ABOVE"
    threshold         = "2000"
    threshold_duration = 300
    time_function      = "all"
  }
}
