import swaggerJsdoc from "swagger-jsdoc";
import path from "path";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageJson = JSON.parse(readFileSync(path.resolve(__dirname, "../package.json"), "utf8"));

const standardErrorSchema = {
  type: "object",
  description: "Standardized error response produced by the centralized error handler for every route in the API.",
  properties: {
    success: { type: "boolean", example: false },
    code: { type: "string", example: "NOT_FOUND" },
    message: { type: "string", example: "Blog not found" },
    requestId: { type: "string", nullable: true, example: "b5f07c0e-37ee-4af2-8dcd-8057bd6d67f7" },
    details: { nullable: true, description: "Additional error context, when available." }
  },
  required: ["success", "code", "message", "requestId", "details"]
};

const standardSuccessSchema = (dataSchema) => ({
  type: "object",
  description: "Standardized success envelope returned by every blogs/case-studies/portfolio/uploads endpoint.",
  properties: {
    success: { type: "boolean", example: true },
    message: { type: "string" },
    data: dataSchema
  },
  required: ["success", "message", "data"]
});

const blogSchema = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    title: { type: "string" },
    slug: { type: "string", nullable: true },
    cover_image_url: { type: "string", nullable: true },
    excerpt: { type: "string" },
    content: { type: "string", description: "HTML content" },
    published: { type: "boolean" },
    created_at: { type: "string", format: "date-time" },
    updated_at: { type: "string", format: "date-time" }
  }
};

const caseStudySchema = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    title: { type: "string" },
    slug: { type: "string", nullable: true },
    cover_image_url: { type: "string", nullable: true },
    excerpt: { type: "string" },
    content: { type: "string", description: "HTML content" },
    published: { type: "boolean" },
    created_at: { type: "string", format: "date-time" },
    updated_at: { type: "string", format: "date-time" }
  }
};

const portfolioItemSchema = {
  type: "object",
  properties: {
    id: { type: "integer" },
    title: { type: "string" },
    category: { type: "string" },
    cover_image_url: { type: "string", nullable: true },
    link: { type: "string" }
  }
};

const uploadResultSchema = {
  type: "object",
  properties: {
    url: { type: "string", format: "uri" }
  },
  required: ["url"]
};

const healthStatusSchema = {
  type: "object",
  properties: {
    status: { type: "string", example: "OK" },
    uptime: { type: "number", description: "Process uptime in seconds" },
    timestamp: { type: "string", format: "date-time" }
  }
};

const readinessStatusSchema = {
  type: "object",
  properties: {
    ready: { type: "boolean" },
    checks: {
      type: "object",
      properties: {
        supabase: {
          type: "object",
          properties: {
            configured: { type: "boolean" },
            clientInitialized: { type: "boolean" }
          }
        }
      }
    },
    timestamp: { type: "string", format: "date-time" }
  }
};

const versionInfoSchema = {
  type: "object",
  properties: {
    version: { type: "string", example: packageJson.version },
    node: { type: "string", example: process.version },
    environment: { type: "string", example: "production" }
  }
};

const blogListResponseSchema = standardSuccessSchema({ type: "array", items: { $ref: "#/components/schemas/Blog" } });
const blogResponseSchema = standardSuccessSchema({ $ref: "#/components/schemas/Blog" });
const blogDeleteResponseSchema = standardSuccessSchema({ type: "object", nullable: true });

const caseStudyListResponseSchema = standardSuccessSchema({
  type: "array",
  items: { $ref: "#/components/schemas/CaseStudy" }
});
const caseStudyResponseSchema = standardSuccessSchema({ $ref: "#/components/schemas/CaseStudy" });
const caseStudyDeleteResponseSchema = standardSuccessSchema({ type: "object", nullable: true });

const portfolioListResponseSchema = standardSuccessSchema({
  type: "array",
  items: { $ref: "#/components/schemas/PortfolioItem" }
});
const portfolioItemResponseSchema = standardSuccessSchema({ $ref: "#/components/schemas/PortfolioItem" });

const uploadResultResponseSchema = standardSuccessSchema({ $ref: "#/components/schemas/UploadResult" });

const definition = {
  openapi: "3.0.3",
  info: {
    title: packageJson.name,
    version: packageJson.version,
    description: "Documentation for the dtales.tech backend API (blogs, case studies, portfolio, uploads, health)."
  },
  servers: [
    {
      url: "/",
      description: "Current deployment (unversioned API surface). Future versioned deployments can be added here, e.g. /api/v2."
    }
  ],
  tags: [
    { name: "Blogs", description: "Blog CRUD, backed by the JSON file cache." },
    { name: "Case Studies", description: "Case study CRUD, backed by the JSON file cache." },
    { name: "Portfolio", description: "Portfolio item CRUD, backed by the JSON file cache." },
    { name: "Uploads", description: "Direct-to-Supabase-Storage image/document uploads." },
    { name: "Health", description: "Liveness, readiness, and version endpoints." }
  ],
  components: {
    schemas: {
      ErrorResponse: standardErrorSchema,
      Blog: blogSchema,
      CaseStudy: caseStudySchema,
      PortfolioItem: portfolioItemSchema,
      UploadResult: uploadResultSchema,
      BlogListResponse: blogListResponseSchema,
      BlogResponse: blogResponseSchema,
      BlogDeleteResponse: blogDeleteResponseSchema,
      CaseStudyListResponse: caseStudyListResponseSchema,
      CaseStudyResponse: caseStudyResponseSchema,
      CaseStudyDeleteResponse: caseStudyDeleteResponseSchema,
      PortfolioListResponse: portfolioListResponseSchema,
      PortfolioItemResponse: portfolioItemResponseSchema,
      UploadResultResponse: uploadResultResponseSchema,
      HealthStatus: healthStatusSchema,
      ReadinessStatus: readinessStatusSchema,
      VersionInfo: versionInfoSchema
    }
  }
};

const options = {
  definition,
  apis: [path.join(__dirname, "paths", "*.docs.js")]
};

const openApiSpec = swaggerJsdoc(options);

export default openApiSpec;
