import { describe, test, expect } from "@jest/globals";
import { mapPortfolioListItem, resolvePortfolioLinkContent } from "../../services/portfolio/portfolio.mapper.js";

describe("portfolio.mapper", () => {
  test("mapPortfolioListItem includes content alongside link", () => {
    const row = {
      id: 1,
      title: "T",
      capability: "Engineering",
      subcategory: "Web",
      cover_image_url: null,
      link: "https://example.com",
      content: null,
      company_name: "Acme",
      description: "desc",
      featured: false
    };

    expect(mapPortfolioListItem(row)).toMatchObject({ link: "https://example.com", content: null });
  });

  test("resolvePortfolioLinkContent: create with link only", () => {
    expect(resolvePortfolioLinkContent({ link: "https://example.com" }, null)).toEqual({
      link: "https://example.com",
      content: null
    });
  });

  test("resolvePortfolioLinkContent: create with content only", () => {
    expect(resolvePortfolioLinkContent({ content: "<p>doc</p>" }, null)).toEqual({
      link: null,
      content: "<p>doc</p>"
    });
  });

  test("resolvePortfolioLinkContent: create with both passes both through for the validator to reject", () => {
    expect(resolvePortfolioLinkContent({ link: "https://example.com", content: "<p>doc</p>" }, null)).toEqual({
      link: "https://example.com",
      content: "<p>doc</p>"
    });
  });

  test("resolvePortfolioLinkContent: create with neither resolves to nulls for the validator to reject", () => {
    expect(resolvePortfolioLinkContent({}, null)).toEqual({ link: null, content: null });
  });

  test("resolvePortfolioLinkContent: update untouched keeps existing values", () => {
    const existing = { link: "https://example.com", content: null };
    expect(resolvePortfolioLinkContent({ title: "New title" }, existing)).toEqual(existing);
  });

  test("resolvePortfolioLinkContent: update switching link to content clears link", () => {
    const existing = { link: "https://example.com", content: null };
    expect(resolvePortfolioLinkContent({ content: "<p>doc</p>" }, existing)).toEqual({
      link: null,
      content: "<p>doc</p>"
    });
  });

  test("resolvePortfolioLinkContent: update switching content to link clears content", () => {
    const existing = { link: null, content: "<p>doc</p>" };
    expect(resolvePortfolioLinkContent({ link: "https://example.com" }, existing)).toEqual({
      link: "https://example.com",
      content: null
    });
  });

  test("resolvePortfolioLinkContent: update clearing link with no replacement resolves to neither", () => {
    const existing = { link: "https://example.com", content: null };
    expect(resolvePortfolioLinkContent({ link: "" }, existing)).toEqual({ link: null, content: null });
  });
});
