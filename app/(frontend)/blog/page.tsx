import type { Metadata } from "next";
import { listPosts } from "@/lib/content";

export const metadata: Metadata = {
  title: "Van Life Guides | Papago Vans",
  description:
    "What we have learned building hundreds of camper vans: costs, layouts, power systems, insurance and where to park.",
};

export default async function BlogIndex() {
  const posts = await listPosts();
  return (
    <div className="article wrap">
      <p className="article-eyebrow">Guides</p>
      <h1>What We Have Learned Building Vans</h1>
      <p className="blog-lede">
        {posts.length} guides from the shop floor. Costs, layouts, power, insurance,
        and the questions owners only think to ask afterwards.
      </p>

      <ul className="blog-list">
        {posts.map((p) => (
          <li key={p.slug}>
            <a href={`/blog/${p.slug}/`}>
              <h2>{p.title}</h2>
              <p className="blog-excerpt">{p.summary}</p>
              <p className="blog-date">
                {new Date(p.publishedDate).toLocaleDateString("en-US", {
                  year: "numeric", month: "long", day: "numeric", timeZone: "UTC",
                })}
              </p>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
