describe("Car Dealership core user flow", () => {
  it("loads homepage and navigates to login", () => {
    cy.intercept("GET", "/api/cars*", {
      statusCode: 200,
      body: {
        data: [
          {
            id: 1,
            name: "BMW X5",
            year: 2021,
            price: 25000,
            image: "https://example.com/bmw.jpg",
            sold_out: 0,
          },
        ],
        meta: { total: 1, page: 1, pageSize: 8, totalPages: 1 },
      },
    }).as("cars");

    cy.visit("/");
    cy.wait("@cars");
    cy.contains(/gjej veturën|inventari ynë|shiko inventarin/i).should("exist");
    cy.get('a[href="/login"]').first().click({ force: true });
    cy.url().should("include", "/login");
    cy.contains(/log in|sign in|kyçu/i).should("exist");
  });

  it("shows validation on invalid login", () => {
    cy.intercept("POST", "/api/auth/login", {
      statusCode: 400,
      body: { message: "Password i gabuar" },
    }).as("invalidLogin");

    cy.visit("/login");
    cy.get("#login-email").type("invalid.user@example.com");
    cy.get("#login-password").type("wrong-password");
    cy.contains("button", /sign in|log in/i).click();
    cy.wait("@invalidLogin");
    cy.contains(/failed|gabim|gabuar|password|nuk|network|request/i, {
      timeout: 10000,
    }).should("exist");
  });
});
