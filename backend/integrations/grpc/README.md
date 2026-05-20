# gRPC — kontratë për komunikim service-to-service

## Status në këtë projekt

| Shtresë | Protokolli |
|---------|------------|
| Browser ↔ API | **REST/JSON** (`/api/v1/*`) |
| Service ↔ Service (e ardhshme) | **gRPC** (protobuf) |

Monolith-i aktual **nuk nis** server gRPC — kjo dosje dokumenton **kontratën** dhe rrugën e integrimit kur moduli `business` ndahet.

## Skedari

- [`car_dealership.proto`](car_dealership.proto) — `CarCatalogService`, `PurchaseService`

## Pse gRPC pas REST?

- Performancë më e lartë (HTTP/2, binary payload)
- Kontratë e fortë (.proto) midis ekipeve
- I përshtatshëm **mbrapa** API Gateway (Nginx/Ingress), jo direkt nga React

## Hapat e ardhshëm (shembull)

1. `npm install @grpc/grpc-js @grpc/proto-loader`
2. Gjenero stub nga `.proto`
3. `catalog-service` implementon `CarCatalogService`
4. Gateway publik mban REST; shërbimet e brendshme flasin gRPC
