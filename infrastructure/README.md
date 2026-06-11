# Infrastructure as Code

This directory contains all infrastructure configuration for the Piedra-Papel-Tijera application.

## Structure

```
infrastructure/
├── terraform/
│   └── newrelic/
│       ├── provider.tf              # New Relic provider configuration
│       ├── variables.tf             # Variable definitions
│       ├── dashboards.tf            # Dashboard definitions
│       ├── alerts.tf                # Alert policy and conditions
│       ├── terraform.tfvars.example # Example variables (copy and fill)
│       ├── .gitignore              # Git ignore for Terraform
│       └── README.md               # Detailed New Relic Terraform guide
└── README.md                        # This file
```

## Overview

### New Relic Terraform

Manages New Relic dashboards and alerts using Infrastructure as Code.

**What it does:**
- Creates 3 monitoring dashboards:
  - Game Performance Dashboard
  - Availability & Uptime Dashboard
  - P2P Performance (WebRTC) Dashboard
- Configures 3 alert policies with 7 conditions for:
  - Performance issues
  - Service availability
  - Network/P2P performance

**Quick Start:**
```bash
cd terraform/newrelic
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your New Relic credentials
terraform init
terraform plan
terraform apply
```

See [terraform/newrelic/README.md](terraform/newrelic/README.md) for detailed instructions.

## Philosophy

- **Infrastructure as Code**: All infrastructure defined in version control
- **Reproducibility**: Easy to recreate environments
- **Auditability**: Track all infrastructure changes in git history
- **Automation**: Deploy with single command

## Best Practices

1. **Always use `terraform plan` before `apply`**
   ```bash
   terraform plan -out=tfplan
   terraform apply tfplan
   ```

2. **Keep credentials in `.tfvars` (not committed)**
   ```bash
   terraform.tfvars  # ← NEVER commit
   terraform.tfvars.example  # ← Committed
   ```

3. **Use meaningful variable names**
   - Clear intent
   - Easy to maintain
   - Self-documenting

4. **Document custom configurations**
   - Add comments to complex resources
   - Explain threshold choices
   - Link to related documentation

5. **Regular backups**
   ```bash
   cp terraform.tfstate terraform.tfstate.backup
   ```

## Future Additions

Potential infrastructure to add:

- **Azure Terraform**: App Service, Container Registry, monitoring
- **CI/CD Terraform**: GitHub Actions, deployment configurations
- **Networking**: CDN, DDoS protection, SSL certificates
- **Monitoring**: Additional monitoring integrations
- **Kubernetes**: K8s manifests if migrating to AKS

## Contributing

When adding new infrastructure:

1. Create a new feature branch
2. Add Terraform configuration
3. Include documentation
4. Test with `terraform plan`
5. Create a pull request
6. After review, merge and apply

## Support

For issues with infrastructure:
- Check the specific module's README
- Review Terraform documentation
- Check service provider documentation
- Open an issue in the repository
