const openApiSpec = require("../backend/docs/openapi");

describe("OpenAPI 3.0 specification", () => {
  test("declares openapi 3.0.3 and security schemes", () => {
    expect(openApiSpec.openapi).toBe("3.0.3");
    expect(openApiSpec.components.securitySchemes.bearerAuth.scheme).toBe("bearer");
    expect(openApiSpec.components.securitySchemes.oauth2.type).toBe("oauth2");
    expect(
      openApiSpec.components.securitySchemes.oauth2.flows.password.tokenUrl
    ).toBe("/api/v1/auth/login");
  });

  test("documents versioned auth and cars with HATEOAS schemas", () => {
    expect(openApiSpec.paths["/api/v1/auth/login"]).toBeDefined();
    expect(openApiSpec.paths["/api/v1/cars"].get).toBeDefined();
    expect(openApiSpec.components.schemas.HateoasLinks).toBeDefined();
    expect(openApiSpec.components.schemas.PaginatedCarsResponse).toBeDefined();
  });

  test("documents users manager uploads and discovery", () => {
    expect(openApiSpec.paths["/api/v1/users/me"]).toBeDefined();
    expect(openApiSpec.paths["/api/v1/manager/overview"]).toBeDefined();
    expect(openApiSpec.paths["/api/uploads/car-image"]).toBeDefined();
    expect(openApiSpec.paths["/api/v1/integrations/discovery"]).toBeDefined();
  });
});
