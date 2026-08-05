import { describe, test, expect } from "@jest/globals";
import { validatePortfolioLinkContent } from "../../validators/portfolio.validator.js";

describe("portfolio.validator: validatePortfolioLinkContent", () => {
  test("accepts link only", () => {
    expect(validatePortfolioLinkContent({ link: "https://example.com", content: null })).toBeNull();
  });

  test("accepts content only", () => {
    expect(validatePortfolioLinkContent({ link: null, content: "<p>doc</p>" })).toBeNull();
  });

  test("rejects both link and content", () => {
    expect(validatePortfolioLinkContent({ link: "https://example.com", content: "<p>doc</p>" })).toBe(
      "Provide either a Project Link or a Document, not both."
    );
  });

  test("rejects neither link nor content by default", () => {
    expect(validatePortfolioLinkContent({ link: null, content: null })).toBe(
      "A Project Link or a Document is required."
    );
  });

  test("allowNeither lets a payload that touches neither field pass", () => {
    expect(validatePortfolioLinkContent({ link: null, content: null, allowNeither: true })).toBeNull();
  });
});
