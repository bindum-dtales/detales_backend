import { describe, test, expect, jest, beforeAll } from "@jest/globals";
import request from "supertest";
import express from "express";
import { createChainableQuery } from "../setup/mockSupabase.js";
import { makeTestToken } from "../setup/authToken.js";
import { portfolioRow } from "../fixtures/portfolio.fixtures.js";
import errorHandler from "../../middleware/errorHandler.js";

let app;
let mockQueryResult;

beforeAll(async () => {
  jest.unstable_mockModule("../../config/supabase.js", () => ({
    getSupabaseClient: jest.fn(() => ({
      from: jest.fn(() => createChainableQuery(mockQueryResult))
    }))
  }));

  jest.unstable_mockModule("fs/promises", () => ({
    default: {
      readFile: jest.fn(async () => JSON.stringify([portfolioRow])),
      writeFile: jest.fn(async () => undefined),
      mkdir: jest.fn(async () => undefined),
      unlink: jest.fn(async () => undefined)
    }
  }));

  const { default: portfolioRoutes } = await import("../../routes/portfolio.js");

  app = express();
  app.use(express.json());
  app.use("/api/portfolio", portfolioRoutes);
  app.use(errorHandler);
});

const authHeader = `Bearer ${makeTestToken()}`;

describe("GET /api/portfolio", () => {
  test("existing link-only records keep working and content is present in the payload shape", async () => {
    const res = await request(app).get("/api/portfolio");

    expect(res.status).toBe(200);
    expect(res.body.data[0]).toMatchObject({ id: portfolioRow.id, link: portfolioRow.link });
  });
});

describe("POST /api/portfolio", () => {
  test("rejects with 401 when unauthenticated", async () => {
    const res = await request(app).post("/api/portfolio").send({ title: "t", capability: "c", subcategory: "s" });
    expect(res.status).toBe(401);
  });

  test("link only succeeds", async () => {
    mockQueryResult = { data: { id: 1, link: "https://example.com", content: null }, error: null };

    const res = await request(app)
      .post("/api/portfolio")
      .set("Authorization", authHeader)
      .send({ title: "t", capability: "c", subcategory: "s", link: "https://example.com" });

    expect(res.status).toBe(201);
  });

  test("document only succeeds", async () => {
    mockQueryResult = { data: { id: 2, link: null, content: "<p>doc</p>" }, error: null };

    const res = await request(app)
      .post("/api/portfolio")
      .set("Authorization", authHeader)
      .send({ title: "t", capability: "c", subcategory: "s", content: "<p>doc</p>" });

    expect(res.status).toBe(201);
  });

  test("both link and document are rejected", async () => {
    const res = await request(app)
      .post("/api/portfolio")
      .set("Authorization", authHeader)
      .send({ title: "t", capability: "c", subcategory: "s", link: "https://example.com", content: "<p>doc</p>" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Provide either a Project Link or a Document, not both.");
  });

  test("neither link nor document is rejected", async () => {
    const res = await request(app)
      .post("/api/portfolio")
      .set("Authorization", authHeader)
      .send({ title: "t", capability: "c", subcategory: "s" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("A Project Link or a Document is required.");
  });
});

describe("PUT /api/portfolio/:id", () => {
  test("switching from an existing link to a document is accepted", async () => {
    mockQueryResult = { data: { id: 1, link: "https://example.com", content: null }, error: null };

    const res = await request(app)
      .put("/api/portfolio/1")
      .set("Authorization", authHeader)
      .send({ title: "t", capability: "c", subcategory: "s", content: "<p>doc</p>" });

    expect(res.status).toBe(200);
  });

  test("clearing the link with no replacement document is rejected", async () => {
    mockQueryResult = { data: { id: 1, link: "https://example.com", content: null }, error: null };

    const res = await request(app)
      .put("/api/portfolio/1")
      .set("Authorization", authHeader)
      .send({ title: "t", capability: "c", subcategory: "s", link: "" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("A Project Link or a Document is required.");
  });

  test("providing both link and document is rejected", async () => {
    const res = await request(app)
      .put("/api/portfolio/1")
      .set("Authorization", authHeader)
      .send({ title: "t", capability: "c", subcategory: "s", link: "https://example.com", content: "<p>doc</p>" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Provide either a Project Link or a Document, not both.");
  });
});
