const TOKEN_KEY = "car_dealership_token";
const USER_KEY = "car_dealership_user";

function setAuth(win, user) {
  win.localStorage.setItem(TOKEN_KEY, "e2e-demo-token");
  win.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

describe("Full end-to-end user scenarios", () => {
  it("registers a new user and redirects to login", () => {
    cy.intercept("POST", "/api/auth/register", {
      statusCode: 201,
      body: { message: "Regjistrimi u krye me sukses" },
    }).as("registerRequest");

    cy.visit("/register");
    cy.get('input[autocomplete="name"]').type("E2E User");
    cy.get('input[autocomplete="email"]').type("e2e.user@example.com");
    cy.get('input[autocomplete="new-password"]').type("StrongPass123");
    cy.contains("button", /register/i).click();

    cy.wait("@registerRequest")
      .its("request.body")
      .should("deep.include", { email: "e2e.user@example.com" });
    cy.url().should("include", "/login");
    cy.contains(/llogaria u krijua|register/i).should("exist");
  });

  it("logs in a user and persists session", () => {
    cy.intercept("POST", "/api/auth/login", {
      statusCode: 200,
      body: {
        success: true,
        token: "jwt-demo-token",
        accessToken: "jwt-demo-token",
        refreshToken: "refresh-demo-token",
        user: {
          id: 101,
          name: "E2E User",
          email: "e2e.user@example.com",
          role: "client",
        },
      },
    }).as("loginRequest");

    cy.visit("/login");
    cy.get('input[autocomplete="email"]').type("e2e.user@example.com");
    cy.get('input[autocomplete="current-password"]').type("StrongPass123");
    cy.contains("button", /sign in|log in/i).click();

    cy.wait("@loginRequest");
    cy.url().should("eq", `${Cypress.config("baseUrl")}/`);
    cy.window().then((win) => {
      expect(win.localStorage.getItem(TOKEN_KEY)).to.eq("jwt-demo-token");
    });
  });

  it("completes a car purchase transaction", () => {
    cy.intercept("GET", "/api/cars/1", {
      statusCode: 200,
      body: {
        id: 1,
        name: "BMW X5",
        price: 25000,
        sold_out: 0,
      },
    }).as("getCar");
    cy.intercept("POST", "/api/cars/1/purchase", {
      statusCode: 200,
      body: { message: "Blerja u regjistrua me sukses." },
    }).as("purchaseCar");

    cy.visit("/cars/1/buy", {
      onBeforeLoad(win) {
        setAuth(win, {
          id: 15,
          name: "Client Tester",
          email: "client@test.com",
          role: "client",
        });
      },
    });

    cy.wait("@getCar");
    cy.get('input[type="email"]').clear().type("buyer@test.com");
    cy.get('input[type="checkbox"]').check();
    cy.get('input[placeholder*="Audi"]').type("Audi A4 2018");
    cy.get('input[min="1950"]').type("2018");
    cy.get('input[min="0"]').first().type("120000");
    cy.get('input[step="0.01"]').type("8000");
    cy.contains("button", /përfundo blerjen/i).click();

    cy.wait("@purchaseCar");
    cy.contains(/blerja u regjistrua me sukses/i).should("exist");
  });

  it("loads admin reporting dashboard data", () => {
    cy.intercept("GET", "/api/admin/stats", {
      statusCode: 200,
      body: { users: 5, cars: 12, contactsMongo: 4, purchases: 7, testDrives: 3 },
    }).as("stats");
    cy.intercept("GET", "/api/admin/contacts", {
      statusCode: 200,
      body: [],
    }).as("contacts");
    cy.intercept("GET", "/api/admin/purchases", {
      statusCode: 200,
      body: [{ id: 1, car_name: "BMW X5", buyer_name: "Client Tester", total_price: 25000 }],
    }).as("purchases");
    cy.intercept("GET", "/api/admin/test-drives", {
      statusCode: 200,
      body: [],
    }).as("testDrives");
    cy.intercept("GET", "/api/admin/cars-inventory", {
      statusCode: 200,
      body: [{ id: 1, name: "BMW X5", year: 2021, sold_out: 0, price: 25000 }],
    }).as("inventory");

    cy.visit("/admin", {
      onBeforeLoad(win) {
        setAuth(win, {
          id: 1,
          name: "Admin User",
          email: "admin@gmail.com",
          role: "admin",
        });
      },
    });

    cy.wait(["@stats", "@contacts", "@purchases", "@testDrives", "@inventory"]);
    cy.contains(/admin dashboard/i).should("exist");
    cy.contains(/users \(mysql\)/i).should("exist");
    cy.contains(/blerje \(mysql\)/i).should("exist");
  });
});
