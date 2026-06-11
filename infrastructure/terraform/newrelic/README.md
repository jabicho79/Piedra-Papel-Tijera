# New Relic Terraform Configuration

This directory contains Terraform configuration for managing New Relic dashboards and alerts for the Piedra-Papel-Tijera application.

## What's Included

### Dashboards

1. **Game Performance Dashboard**
   - Largest Contentful Paint (LCP)
   - First Input Delay (FID)
   - Cumulative Layout Shift (CLS)
   - Page Load Time
   - JavaScript Errors
   - Active Users

2. **Availability & Uptime Dashboard**
   - Health Check Success Rate
   - Average Response Time
   - Container Health Status
   - HTTP Response Codes
   - Error Rate
   - SLA Status (99.9%)

3. **P2P Performance (WebRTC) Dashboard**
   - AJAX Request Duration
   - Data Transfer Size
   - Network Requests by Type
   - Failed AJAX Requests
   - User Interactions
   - Request Latency (P99)
   - Request Throughput

### Alert Policies

#### Game Performance Alerts
- LCP exceeds 4 seconds (Critical: >4s, Warning: >2.5s)
- JavaScript errors exceed 10/minute (Critical: >10, Warning: >5)
- Page load time exceeds 5 seconds (Critical: >5s, Warning: >3s)

#### Availability Alerts
- Health check failures (Critical: <95%, Warning: <99%)
- Response time exceeds 5 seconds (Critical: >5s, Warning: >3s)
- Error rate exceeds 1% (Critical: >5%, Warning: >1%)

#### P2P/Network Performance Alerts
- AJAX requests exceed 3 seconds (Critical: >3s, Warning: >1.5s)
- AJAX failure rate exceeds 5% (Critical: >10%, Warning: >5%)
- P99 latency exceeds 2 seconds (Critical: >2s, Warning: >1s)

## Prerequisites

- Terraform >= 1.0
- New Relic account with API access
- New Relic User API Key (not the license key)
- New Relic Account ID

## Setup Instructions

### Step 1: Get Your New Relic Credentials

1. **Account ID:**
   - Go to https://one.newrelic.com
   - Click your profile icon → **Account settings**
   - Your Account ID is displayed at the top

2. **User API Key:**
   - Go to https://one.newrelic.com/api-keys
   - Click **Create key**
   - Select **User API key**
   - Generate a new key
   - Copy the key (format: `NRAK-...`)

### Step 2: Configure Terraform Variables

```bash
# Copy the example variables file
cp terraform.tfvars.example terraform.tfvars

# Edit with your New Relic credentials
nano terraform.tfvars
```

Fill in:
- `newrelic_account_id` - Your account ID (numeric)
- `newrelic_api_key` - Your User API key (NRAK-...)
- `newrelic_region` - US or EU
- `app_name` - Application name (default: Piedra-Papel-Tijera)
- `environment` - Environment (default: production)

### Step 3: Initialize Terraform

```bash
cd infrastructure/terraform/newrelic
terraform init
```

### Step 4: Review Changes

```bash
terraform plan
```

This shows all resources that will be created:
- 3 Dashboards
- 3 Alert Policies
- 7 Alert Conditions

### Step 5: Apply Configuration

```bash
terraform apply
```

Type `yes` when prompted to create the resources.

### Step 6: Verify in New Relic UI

1. Go to https://one.newrelic.com
2. **Dashboards** → You should see your 3 new dashboards
3. **Alerts & AI** → **Alert Policies** → You should see 3 new policies with 7 conditions

## Managing Alerts (Optional)

### Add Notification Channels

To send alerts to Slack, email, or other services:

1. In New Relic UI: **Alerts & AI** → **Notification channels**
2. Create a notification channel (e.g., Slack webhook)
3. Copy the channel ID
4. Add to `notification_channel_id` in Terraform
5. Update alert conditions to use the channel

### Update Alert Thresholds

To modify alert thresholds:

1. Edit `alerts.tf`
2. Update the `threshold` values
3. Run `terraform plan` to review changes
4. Run `terraform apply` to deploy

Example: Change LCP critical threshold from 4s to 3s:

```hcl
critical {
  operator              = "ABOVE"
  threshold             = 3000  # Changed from 4000
  threshold_duration_seconds = 300
}
```

## Terraform State Management

### Local State (Development)

State is stored locally in `terraform.tfstate`. Good for local development.

```bash
# Backup state before major changes
cp terraform.tfstate terraform.tfstate.backup
```

### Remote State (Production)

For team environments, use remote state:

```hcl
# terraform.tf
terraform {
  backend "s3" {
    bucket         = "your-terraform-bucket"
    key            = "newrelic/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-locks"
  }
}
```

## Common Commands

```bash
# Plan changes
terraform plan

# Apply changes
terraform apply

# Destroy all resources
terraform destroy

# Check state
terraform state list
terraform state show newrelic_one_dashboard.game_performance

# Format code
terraform fmt -recursive

# Validate configuration
terraform validate
```

## Troubleshooting

### Error: "Invalid API key"

**Solution:**
- Verify you're using a **User API Key**, not a License Key
- User API Keys start with `NRAK-`
- Get a new key: https://one.newrelic.com/api-keys

### Error: "Invalid account ID"

**Solution:**
- Account ID should be numeric (e.g., `1234567`)
- Found at: https://one.newrelic.com → Account settings
- Don't include region code in the ID

### Dashboards not appearing

**Solution:**
- Dashboards may take 30-60 seconds to appear in New Relic UI
- Verify by running: `terraform state show newrelic_one_dashboard.game_performance`
- Check New Relic UI: Dashboards → Dashboard list

### Alerts not triggering

**Solution:**
- Ensure your app has RUM enabled and sending data
- Alerts require actual metrics to evaluate
- Wait 2-3 minutes for initial data collection
- Check that app name matches: `${var.app_name}`

## Advanced Configuration

### Custom NRQL Queries

Modify `dashboards.tf` or `alerts.tf` to use custom queries:

```hcl
widget_line {
  title  = "Custom Metric"
  nrql_query {
    query = "SELECT custom_metric FROM MyApp WHERE condition = true"
  }
}
```

### Dynamic Alert Thresholds

Use variables for thresholds:

```hcl
variable "lcp_critical_threshold" {
  type    = number
  default = 4000
}

critical {
  threshold = var.lcp_critical_threshold
}
```

### Multiple Applications

Manage multiple apps with workspaces:

```bash
# Create workspace for staging
terraform workspace new staging

# Switch workspace
terraform workspace select staging

# Deploy for staging with different variables
terraform apply -var-file="staging.tfvars"
```

## Cleanup

To remove all resources managed by Terraform:

```bash
# Review what will be deleted
terraform plan -destroy

# Delete all resources
terraform destroy
```

## Resources

- [New Relic Terraform Provider Docs](https://registry.terraform.io/providers/newrelic/newrelic/latest/docs)
- [NRQL Query Language](https://docs.newrelic.com/docs/nrql/nrql-syntax-clauses-functions)
- [Dashboard Widgets Reference](https://docs.newrelic.com/docs/query-your-data/dashboards/manage-your-dashboard)
- [Alert Thresholds Guide](https://docs.newrelic.com/docs/alerts-applied-intelligence/new-relic-alerts/alert-conditions/set-thresholds-alert-conditions)

## Support

For issues:
- Check [New Relic Terraform Provider GitHub](https://github.com/newrelic/terraform-provider-newrelic)
- Review [New Relic Documentation](https://docs.newrelic.com)
- Open an issue in this repository
