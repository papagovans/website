import type { Metadata } from "next";
import { listPages } from "@/lib/content";
import "../content.css";

export const metadata: Metadata = {
  title: "Van Life Guides | Papago Vans",
  description:
    "What we have learned building hundreds of camper vans: costs, layouts, power systems, insurance and where to park.",
};

export default async function BlogIndex() {
  const posts = await listPages("posts");
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
            <a href={p.path}>
              <h2>{p.title}</h2>
              {p.description && <p className="blog-excerpt">{p.description}</p>}
              {p.date && (
                <p className="blog-date">
                  {new Date(p.date).toLocaleDateString("en-US", {
                    year: "numeric", month: "long", day: "numeric",
                  })}
                </p>
              )}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
