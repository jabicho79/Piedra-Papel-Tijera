variable "newrelic_account_id" {
  description = "New Relic Account ID"
  type        = string
  sensitive   = true
}

variable "newrelic_api_key" {
  description = "New Relic API Key (User API Key, not license key)"
  type        = string
  sensitive   = true
}

variable "newrelic_region" {
  description = "New Relic region (US or EU)"
  type        = string
  default     = "US"
  validation {
    condition     = contains(["US", "EU"], var.newrelic_region)
    error_message = "Region must be either US or EU."
  }
}

variable "app_name" {
  description = "Application name"
  type        = string
  default     = "Piedra-Papel-Tijera"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "notification_channel_id" {
  description = "New Relic notification channel ID for alerts"
  type        = string
  default     = ""
}

variable "alert_severity" {
  description = "Alert severity level"
  type        = string
  default     = "CRITICAL"
  validation {
    condition     = contains(["CRITICAL", "WARNING"], var.alert_severity)
    error_message = "Severity must be either CRITICAL or WARNING."
  }
}
