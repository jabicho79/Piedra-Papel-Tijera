# New Relic Monitoring Setup

This guide explains how to configure New Relic monitoring for the Piedra-Papel-Tijera application.

## Overview

The application includes two types of New Relic monitoring:

1. **Browser Monitoring (RUM)** - Real User Monitoring for frontend performance
2. **Infrastructure Monitoring** - Container and service health monitoring
3. **Health Endpoints** - Custom health check endpoints

## Prerequisites

- New Relic account (free tier available at https://newrelic.com)
- New Relic License Key (found in Account Settings)

## Setup Instructions

### Step 1: Get Your New Relic License Key

1. Go to https://one.newrelic.com
2. Click your account name (bottom left) → **Account settings**
3. Copy your **License Key** from the **API keys** section

### Step 2: Configure Browser Monitoring

The New Relic Browser Agent is already embedded in `src/index.html`.

To enable it with your license key:

1. Go to New Relic UI → **Browser** section
2. Click **Create new app**
3. Select **Copy/paste JavaScript** method
4. Replace the script in `src/index.html` with the provided JavaScript snippet

Or manually update the `src/index.html`:

```html
<!-- New Relic Browser Monitoring -->
<script>
  window.NREUM || (window.NREUM = {}), __nr_require = function(e, n, t) { ... }
  // Insert New Relic browser agent from your account
</script>
```

### Step 3: Deploy Infrastructure Monitoring

#### For Azure App Service:

1. Add environment variables to your App Service:

```bash
az webapp config appsettings set \
  --name piedras \
  --resource-group RG_SPAIN \
  --settings \
    NEW_RELIC_LICENSE_KEY="your-license-key" \
    NEW_RELIC_APP_NAME="Piedra-Papel-Tijera" \
    NEW_RELIC_ENVIRONMENT="production"
```

2. The Docker container now includes:
   - **Health check endpoint**: `/health/status.json`
   - **Monitoring headers**: X-Application, X-Version
   - **Container healthcheck**: Runs every 30 seconds

#### For Docker Locally:

```bash
docker run -d \
  -e NEW_RELIC_LICENSE_KEY="your-license-key" \
  -e NEW_RELIC_APP_NAME="Piedra-Papel-Tijera-Dev" \
  -p 80:80 \
  jabicho/piedra-papel-tijera:latest
```

### Step 4: Verify Installation

#### Browser Monitoring:

1. Open the app in your browser
2. Go to New Relic → **Browser** → Your app name
3. Wait 2-3 minutes for data to appear
4. You'll see:
   - Page load performance
   - Core Web Vitals
   - User interactions
   - JavaScript errors

#### Health Endpoint:

Test the health endpoint:

```bash
curl https://your-app-url.azurewebsites.net/health/status.json
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2026-06-11T16:52:14Z"
}
```

## Monitoring Features

### Browser Monitoring (RUM)

- **Page Load Metrics**: First Paint, First Contentful Paint, Largest Contentful Paint
- **Core Web Vitals**: LCP, FID, CLS
- **JavaScript Errors**: Automatic error tracking and reporting
- **User Interactions**: Click, scroll, and navigation events
- **AJAX Calls**: Network requests tracking (P2P WebRTC)
- **Custom Events**: Track game events (game start, winner, etc.)

### Infrastructure Monitoring

- **Container Health**: Health checks every 30 seconds
- **Resource Usage**: CPU, memory, network
- **Uptime Monitoring**: Track service availability
- **Response Times**: Page load and API response metrics

### Custom Monitoring

Add custom events to track game-specific metrics:

```javascript
// In src/app.js
if (window.newrelic) {
  // Track game start
  window.newrelic.addPageAction('game_started', {
    mode: 'single_player' // or 'multiplayer'
  });

  // Track game end
  window.newrelic.addPageAction('game_ended', {
    winner: 'player1',
    moves: 5
  });

  // Track errors
  window.newrelic.noticeError(new Error('WebRTC connection failed'));
}
```

## Dashboards

### Recommended Dashboards to Create

1. **Game Performance Dashboard**
   - Page Load Time
   - JavaScript Errors
   - User Count (Real User Monitoring)

2. **Availability Dashboard**
   - Health Check Status
   - Container Uptime
   - Response Times

3. **P2P Performance Dashboard**
   - Network Request Performance
   - WebRTC Connection Metrics
   - Data Transfer Size

## Alerts

### Create Alert Policies

1. **Page Load Performance**
   - Alert when LCP > 4 seconds
   - Alert when JavaScript errors > 10 per minute

2. **Service Availability**
   - Alert when health check fails
   - Alert when response time > 5 seconds

3. **Error Tracking**
   - Alert on new error types
   - Alert when error rate > 1%

### Example Alert (Azure CLI):

```bash
# Configure webhook notification for alerts
# 1. Create notification channel in New Relic UI
# 2. Set up webhook to your notification system
# 3. Create alert policy with the notification channel
```

## Troubleshooting

### Browser Agent Not Reporting Data

**Problem**: Data not showing in New Relic Browser after 5 minutes

**Solutions**:
1. Verify license key is correct
2. Check browser console for errors
3. Ensure JavaScript is enabled
4. Check CORS settings
5. Verify app is accessible publicly

### Health Check Failing

**Problem**: Container health check failing

**Solutions**:
1. Verify Nginx is running: `curl http://localhost/health/status.json`
2. Check container logs: `docker logs <container-id>`
3. Verify port 80 is exposed
4. Check firewall rules

### Missing Metrics

**Problem**: Some metrics not appearing in New Relic

**Solutions**:
1. Wait 2-3 minutes for data aggregation
2. Verify app has active traffic
3. Check New Relic account is not suspended
4. Verify license key has appropriate permissions

## Performance Optimization

Based on New Relic metrics, optimize:

1. **Image Optimization**: Reduce asset sizes
2. **Caching**: Implement longer cache headers for static assets
3. **CDN**: Serve static content through CDN (Cloudflare, Akamai)
4. **Code Splitting**: Split JavaScript bundles
5. **Compression**: Enable gzip compression (already in Nginx)

## Cost Optimization

- **Free Tier**: 100GB ingested data per month
- **Data Ingest**: Monitor your data usage in Settings
- **Retention**: Set data retention policies
- **Filtering**: Filter unnecessary data (e.g., health checks)

## References

- [New Relic Browser Monitoring](https://docs.newrelic.com/docs/browser)
- [New Relic Infrastructure](https://docs.newrelic.com/docs/infrastructure)
- [New Relic Alerts](https://docs.newrelic.com/docs/alerts)
- [New Relic API](https://docs.newrelic.com/docs/apis)

## Support

For issues or questions:
- New Relic Support: https://support.newrelic.com
- New Relic Docs: https://docs.newrelic.com
- GitHub Issues: Report issues in this repository
