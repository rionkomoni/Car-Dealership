describe("Car Dealership core user flow", () => {
  it("loads homepage and navigates to login", () => {
    cy.visit("/");
    cy.contains(/makinat|cars|inventory/i).should("exist");
    cy.get('a[href="/login"]').first().click({ force: true });
    cy.url().should("include", "/login");
    cy.contains(/log in|sign in|kyçu/i).should("exist");
  });

  it("shows validation on invalid login", () => {
    cy.visit("/login");
    cy.get('input[type="email"]').type("invalid.user@example.com");
    cy.get('input[type="password"]').type("wrong-password");
    cy.contains("button", /sign in|log in/i).click();
    cy.contains(/failed|gabim|nuk|network|request/i, { timeout: 10000 }).should("exist");
  });
});
