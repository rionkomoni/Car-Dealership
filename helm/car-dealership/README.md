# Car Dealership Helm Chart

This chart deploys backend + frontend with:

- rolling updates
- load-balanced services
- HPAs for autoscaling
- ingress routing for `/api` and `/`

## Environments

- `values-test.yaml`
- `values-staging.yaml`
- `values-prod.yaml`

## Install example

```bash
helm upgrade --install car-dealership-test ./helm/car-dealership \
  --namespace car-dealership-test --create-namespace \
  --values ./helm/car-dealership/values-test.yaml \
  --set backend.image.repository=ghcr.io/<owner>/<repo>/backend \
  --set backend.image.tag=<sha> \
  --set frontend.image.repository=ghcr.io/<owner>/<repo>/frontend \
  --set frontend.image.tag=<sha>
```
