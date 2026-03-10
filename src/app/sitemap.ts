import type { MetadataRoute } from "next";
import { BLOG_POSTS } from "@/lib/blog";
import { TOOL_RESOURCE_CONTENT } from "@/lib/tool-resource-content";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tunevid-final-di29.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/blog",
    "/tools",
    "/create",
    "/about",
    "/contact",
    "/resources",
    "/editorial-policy",
    "/privacy-policy",
    "/terms",
    "/pricing",
  ];

  const toolRoutes = Object.keys(TOOL_RESOURCE_CONTENT).map((slug) => `/tools/${slug}`);
  const blogRoutes = BLOG_POSTS.map((post) => `/blog/${post.slug}`);

  const staticEntries = staticRoutes.map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
  }));

  const toolEntries = toolRoutes.map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
  }));

  const blogEntries = BLOG_POSTS.map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: post.publishedAt,
  }));

  return [...staticEntries, ...toolEntries, ...blogEntries];
}
