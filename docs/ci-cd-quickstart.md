# CI/CD Quickstart (GitHub Actions + Helm + Kubernetes)

Ky udhëzues të ndihmon të ndezësh pipeline-in pa konfuzion.

## 1) Çfarë duhet të kesh gati

- GitHub repository me branch `main`
- Kubernetes cluster (test/staging/prod)
- `kubectl` i lidhur me secilin cluster
- Ingress Controller + Metrics Server në cluster

## 2) Secrets në GitHub Actions

Hape repo:
- `Settings` -> `Secrets and variables` -> `Actions` -> `New repository secret`

Shto këto secrets:

- `KUBE_CONFIG_TEST`
- `KUBE_CONFIG_STAGING`
- `KUBE_CONFIG_PROD`
- `TEST_BASE_URL`

## 3) Si të marrësh kubeconfig për secret

Në makinën tënde (PowerShell), për secilin cluster:

```powershell
kubectl config view --raw
```

Kopjo të gjithë output-in dhe vendose si vlerë të secret-it përkatës:
- test -> `KUBE_CONFIG_TEST`
- staging -> `KUBE_CONFIG_STAGING`
- prod -> `KUBE_CONFIG_PROD`

## 4) TEST_BASE_URL

Vendos URL-në e ambientit test ku Newman duhet të godasë API-n:

Shembull:
```text
https://test.car-dealership.local
```

ose nëse përdor path me gateway:
```text
https://test.car-dealership.local
```

(`local.postman_environment.json` përdor `{{baseUrl}}` dhe workflow e vendos automatikisht.)

## 5) Si rrjedh pipeline

Workflow: `.github/workflows/ci-cd.yml`

1. Lint + Unit tests  
2. Build/push Docker images në GHCR  
3. Deploy në test me Helm  
4. Integration tests (Newman)  
5. Deploy në staging  
6. Deploy në production (kur push tag `v*`)

## 6) Trigger production deploy

Krijo tag release:

```powershell
git tag v1.0.0
git push origin v1.0.0
```

## 7) Verifikime pas deploy

```powershell
kubectl get pods -n car-dealership-test
kubectl get svc -n car-dealership-test
kubectl get hpa -n car-dealership-test
kubectl get ingress -n car-dealership-test
```

## 8) Troubleshooting i shpejtë

- `deploy_test skipped`: mungon `KUBE_CONFIG_TEST`
- `integration tests failed`: `TEST_BASE_URL` i pasaktë ose endpoint-i jo i arritshëm
- `ImagePullBackOff`: image path/tag i pasaktë ose mungon leje në GHCR
- `HPA unknown`: mungon Metrics Server

