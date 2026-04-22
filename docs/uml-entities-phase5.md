# UML Class Diagram - Entity Modeling (Phase 5)

Ky dokument përmbledh modelimin e avancuar të entiteteve me inheritance, polymorphism,
relacione 1:N / N:N dhe embedded entities.

```mermaid
classDiagram
  direction LR

  class AbstractVehicle {
    <<abstract>>
    +name : string
    +year : number
    +mileageKm : number
    +estimatedValue : number
    +validateCommon() void
  }

  class InventoryCar {
    +id : number
    +price : number
    +soldOut : boolean
    +validateSpecific() void
  }

  class TradeInVehicle {
    +toDbShape() object
  }

  class PurchaseQuote {
    +getTradeInValue() number
    +calculateAmountToAdd() number
    +validateBusinessRules() void
  }

  class User {
    +id : number
    +name : string
    +email : string
    +role : string
  }

  class Purchase {
    +id : number
    +car_id : number
    +buyer_user_id : number
    +car_price : number
    +trade_in_value : number
    +amount_to_add : number
  }

  class Contact {
    +name : string
    +email : string
    +message : string
    +context : ContactContext
  }

  class ContactContext {
    <<embedded>>
    +carId : number
    +source : string
    +tags : string[]
  }

  class CarLog {
    +action : string
    +carId : number
    +userId : number
    +carName : string
  }

  AbstractVehicle <|-- InventoryCar
  AbstractVehicle <|-- TradeInVehicle
  PurchaseQuote --> InventoryCar : targetCar
  PurchaseQuote --> TradeInVehicle : tradeIn (optional)

  User "1" --> "0..*" Purchase : creates
  InventoryCar "1" --> "0..1" Purchase : sold by
  InventoryCar "1" --> "0..*" CarLog : activity
  Contact *-- ContactContext : embedded
```

## Pikat kyçe të modelimit

- **Inheritance/Polymorphism**: `InventoryCar` dhe `TradeInVehicle` trashëgojnë `AbstractVehicle`.
- **Abstract entity**: `AbstractVehicle` nuk instancohet direkt.
- **Relacione 1:N**: `User -> Purchases`, `InventoryCar -> CarLog`.
- **Relacione të kompozuara / embedded (NoSQL)**: `Contact.context` (`ContactContext`) në MongoDB.
- **Validime modeli + biznesi**:
  - Validime strukturore në entitete (`validateCommon`, `validateSpecific`)
  - Validime biznesi në `PurchaseQuote` (`sold_out`, `trade-in` sanity checks)
  - Validime Mongoose për `Contact` dhe enum të zgjeruar për `CarLog.action`.

