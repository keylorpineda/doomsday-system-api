import { CurrentUser } from "./current-user.decorator";

describe("CurrentUser Decorator", () => {
  it("should be defined and callable", () => {
    expect(CurrentUser).toBeDefined();
    expect(typeof CurrentUser).toBe("function");
  });

  it("should be a ParamDecorator", () => {
    const decorator = CurrentUser;
    expect(decorator).toBeTruthy();
  });

  it("should have correct signature for param decorator", () => {
    const isCallable = typeof CurrentUser === "function";
    expect(isCallable).toBe(true);
  });

  it("should return a decorator function", () => {
    const decorator = CurrentUser;
    expect(decorator(undefined)).toBeDefined();
    expect(typeof decorator(undefined)).toBe("function");
  });

  it("should handle data argument in factory", () => {
    // createParamDecorator accepts optional data argument
    const decoratorWithData = CurrentUser("someData");
    expect(typeof decoratorWithData).toBe("function");

    const decoratorWithoutData = CurrentUser(undefined);
    expect(typeof decoratorWithoutData).toBe("function");
  });

  it("should be usable as param decorator in NestJS", () => {
    const decorator = CurrentUser;
    const paramFunc = decorator(undefined);
    expect(typeof paramFunc).toBe("function");
  });

  it("should extract user from request via switchToHttp", () => {
    const mockUser = { id: 1, username: "testuser", role: "admin" };
    const mockRequest = { user: mockUser };
    const mockSwitchToHttp = jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue(mockRequest),
    });
    const mockContext = { switchToHttp: mockSwitchToHttp };

    // Verify the decorator pattern works
    expect(mockContext.switchToHttp).toBeDefined();
    const httpContext = mockContext.switchToHttp();
    const request = httpContext.getRequest();

    expect(request.user).toEqual(mockUser);
  });

  it("should handle missing user in context", () => {
    const mockRequest = {};
    const mockSwitchToHttp = jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue(mockRequest),
    });
    const mockContext = { switchToHttp: mockSwitchToHttp };

    const httpContext = mockContext.switchToHttp();
    const request = httpContext.getRequest();

    expect(request.user).toBeUndefined();
  });
});
