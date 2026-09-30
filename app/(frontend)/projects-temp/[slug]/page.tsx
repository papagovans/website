import BuildPage from "../../projects/[slug]/page";
import { TempChrome } from "@/components/TempChrome";

/*
 * Stopgap, 2026-09-29: each build page, reached from
 * /van-life-build-gallery-temp/, without the site's nav and footer. Same
 * component and data as /projects/[slug]/. Delete on launch day.
 */
export { generateMetadata, generateStaticParams } from "../../projects/[slug]/page";

export default function Page({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <>
      <BuildPage params={params} />
      <TempChrome />
    </>
  );
}
