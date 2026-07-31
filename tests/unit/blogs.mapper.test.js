import { describe, test, expect } from "@jest/globals";
import { stripHtml, buildExcerpt, extractContent, normalizeBlog } from "../../services/blogs/blogs.mapper.js";

describe("blogs.mapper", () => {
  test("stripHtml removes tags and collapses whitespace", () => {
    expect(stripHtml("<p>Hello   <b>world</b></p>")).toBe("Hello world");
  });

  test("stripHtml handles empty input", () => {
    expect(stripHtml(null)).toBe("");
    expect(stripHtml("")).toBe("");
  });

  test("buildExcerpt truncates to default max length", () => {
    const long = "x".repeat(300);
    expect(buildExcerpt(long).length).toBe(200);
  });

  test("buildExcerpt respects a custom max length", () => {
    expect(buildExcerpt("hello world", 5)).toBe("hello");
  });

  test("extractContent handles string and object payloads", () => {
    expect(extractContent("<p>abc</p>")).toBe("<p>abc</p>");
    expect(extractContent({ html: "<p>abc</p>" })).toBe("<p>abc</p>");
    expect(extractContent(undefined)).toBe("");
  });

  test("normalizeBlog shapes a row consistently", () => {
    const row = {
      id: "1",
      title: "T",
      slug: "t",
      cover_image_url: null,
      content: "<p>" + "y".repeat(250) + "</p>",
      published: true,
      created_at: "2026-01-01",
      updated_at: "2026-01-01"
    };

    const result = normalizeBlog(row);

    expect(result).toMatchObject({ id: "1", title: "T", slug: "t", published: true });
    expect(result.excerpt.length).toBeLessThanOrEqual(200);
  });
});
