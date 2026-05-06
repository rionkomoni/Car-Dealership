# Kubernetes deployment (autoscaling + load balancing + rolling updates)

## Files

- `namespace.yaml`
- `backend-configmap.yaml`
- `backend-secret.example.yaml` (copy and replace values before apply)
- `backend-deployment.yaml`
- `backend-service.yaml`
- `backend-hpa.yaml`
- `frontend-configmap.yaml`
- `frontend-deployment.yaml`
- `frontend-service.yaml`
- `frontend-hpa.yaml`
- `ingress.yaml`

## Prerequisites

- A Kubernetes cluster (minikube/kind/cloud)
- NGINX Ingress Controller
- Metrics Server (required for HPA CPU scaling)
- Built/pushed images:
  - `car-dealership-backend:latest`
  - `car-dealership-frontend:latest`

## Apply

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/backend-configmap.yaml
kubectl apply -f k8s/frontend-configmap.yaml
kubectl apply -f k8s/backend-secret.example.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml
kubectl apply -f k8s/backend-hpa.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml
kubectl apply -f k8s/frontend-hpa.yaml
kubectl apply -f k8s/ingress.yaml
```

## Verify

```bash
kubectl get pods -n car-dealership
kubectl get svc -n car-dealership
kubectl get hpa -n car-dealership
kubectl get ingress -n car-dealership
kubectl rollout status deployment/backend -n car-dealership
kubectl rollout status deployment/frontend -n car-dealership
```

## Notes

- Rolling updates are configured via Deployment strategy (`maxUnavailable: 0`, `maxSurge: 1`).
- Load balancing is provided by ClusterIP Services + Ingress.
- Autoscaling is configured with HPA (CPU utilization targets).
