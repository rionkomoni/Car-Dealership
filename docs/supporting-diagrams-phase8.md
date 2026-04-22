# Supporting Model Diagrams (Phase 8)

Ky dokument përfshin minimalisht 4 diagramat e kërkuara:
- Component Diagram
- Sequence Diagram (API Call)
- Deployment Diagram
- State Diagram (entitet dinamik)

## 1) Component Diagram

```mermaid
flowchart LR
  subgraph Client["Frontend (React)"]
    UI["UI Components"]
    Router["Routing + Guards"]
    State["Redux Store"]
    APIClient["Axios API Client"]
    UI --> Router
    Router --> State
    State --> APIClient
  end

  subgraph Server["Backend (Express)"]
    Gateway["API Gateway Middleware"]
    AuthM["Auth Middleware"]
    Modules["Modules Registry"]
    Cars["Cars Module"]
    Admin["Admin Module"]
    Manager["Manager Module"]
    Contact["Contact Module"]
    Logs["CarLogs Module"]

    Gateway --> AuthM
    Gateway --> Modules
    Modules --> Cars
    Modules --> Admin
    Modules --> Manager
    Modules --> Contact
    Modules --> Logs
  end

  subgraph Data["Data Layer"]
    MySQL[(MySQL)]
    Mongo[(MongoDB)]
  end

  APIClient --> Gateway
  Cars --> MySQL
  Admin --> MySQL
  Manager --> MySQL
  Contact --> Mongo
  Logs --> Mongo
```

## 2) Sequence Diagram (Purchase API Call)

```mermaid
sequenceDiagram
  autonumber
  participant U as User
  participant F as React BuyCar Page
  participant A as API /api/cars/:id/purchase
  participant D as Domain Entities
  participant DB as MySQL
  participant L as Mongo CarLog

  U->>F: Submit purchase + optional trade-in
  F->>A: POST /api/cars/:id/purchase (JWT)
  A->>DB: BEGIN + SELECT car FOR UPDATE
  DB-->>A: car row
  A->>D: Build InventoryCar/TradeInVehicle/PurchaseQuote
  D-->>A: Validated amount_to_add
  A->>DB: INSERT purchase + UPDATE cars.sold_out=1 + COMMIT
  A->>L: saveCarLog(action="purchase")
  A-->>F: 201 Purchase response
  F-->>U: Toast success + redirect
```

## 3) Deployment Diagram

```mermaid
flowchart TB
  subgraph UserDevice["User Device"]
    Browser["Browser (React SPA)"]
  end

  subgraph AppHost["Application Host (Windows/XAMPP dev)"]
    FE["Frontend Dev Server (:3000)"]
    BE["Express API (:5000)"]
  end

  subgraph DataHost["Data Services"]
    SQL["MySQL / phpMyAdmin"]
    MGO["MongoDB"]
  end

  Browser --> FE
  FE --> BE
  BE --> SQL
  BE --> MGO
```

## 4) State Diagram (Car sales lifecycle)

```mermaid
stateDiagram-v2
  [*] --> Available
  Available --> Reserved : Purchase initiated
  Reserved --> SoldOut : Purchase committed
  Reserved --> Available : Purchase cancelled / rollback
  SoldOut --> Available : Admin/Manager marks available
  Available --> Removed : Admin deletes listing
  SoldOut --> Removed : Admin deletes listing
```

