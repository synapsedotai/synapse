GKE Deploy

Use Terraform to manage clusters. For staging deploys, push to main and GitHub Actions triggers gcloud auth and kubectl apply with the latest image tag. Ensure Workload Identity is configured.

