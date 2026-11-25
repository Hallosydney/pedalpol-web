import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleReaderClient } from "@/components/ArticleReaderClient";
import { ArticleCoverArt } from "@/components/ArtIllustrations";
import { getArticleBySlug, listArticles } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: "Artikel Tidak Ditemukan" };
  return {
    title: article.title,
    description: article.excerpt,
  };
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [article, all] = await Promise.all([
    getArticleBySlug(slug),
    listArticles(),
  ]);

  if (!article) notFound();

  const related = all.filter((a) => a.slug !== article.slug).slice(0, 2);

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between gap-3 pb-4 mb-7 border-b-2 border-[#14101C]">
        <Link
          href="/zine"
          className="font-stamp text-xs font-bold uppercase px-3.5 py-2 border-2 border-[#14101C] bg-[#EBE3D3] hover:bg-[#14101C] hover:text-[#92FA66] transition-colors"
        >
          ← Kembali ke Zine PedalPol
        </Link>
        <span
          className="font-stamp text-xs font-bold uppercase px-3 py-1 border-2 border-[#14101C]"
          style={{ background: article.tagBg, color: article.tagFg }}
        >
          {article.rubrik}
        </span>
      </div>

      <header className="mb-7">
        <div className="font-stamp text-xs uppercase text-[#5B5269] mb-2.5">
          {article.dateLabel} • OLEH {article.author.toUpperCase()} • {article.readTime}
        </div>
        <h1 className="font-poster text-4xl sm:text-5xl uppercase text-[#14101C] leading-tight mb-4">
          {article.title}
        </h1>
        <p className="font-editorial text-lg sm:text-xl italic text-[#3F374C] leading-relaxed">
          {article.subtitle}
        </p>
      </header>

      <div className="border-2 border-[#14101C] riso-shadow mb-8 overflow-hidden">
        <ArticleCoverArt
          coverKey={article.coverKey}
          coverImageUrl={article.coverImageUrl}
          title={article.title}
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-4 bg-[#EBE3D3] border-2 border-[#14101C] font-stamp text-xs mb-8">
        <div>
          <span className="text-[#5B5269]">LOKASI</span>
          <br />
          <strong>{article.location}</strong>
        </div>
        <div>
          <span className="text-[#5B5269]">JARAK / FORMAT</span>
          <br />
          <strong>{article.distance}</strong>
        </div>
        <div>
          <span className="text-[#5B5269]">SEPEDA</span>
          <br />
          <strong>{article.bikeTag}</strong>
        </div>
        <div>
          <span className="text-[#5B5269]">PENULIS</span>
          <br />
          <strong>{article.author}</strong>
        </div>
      </div>

      <div className="font-editorial text-[17px] leading-[1.85] text-[#1E1928] space-y-5 mb-10">
        {article.paragraphs.map((p, idx) => (
          <div key={idx}>
            <p>{p}</p>
            {idx === 1 && article.quote && (
              <blockquote className="my-6 p-5 bg-[#92FA66] border-2 border-[#14101C] riso-shadow font-poster text-2xl sm:text-3xl not-italic uppercase text-[#14101C] leading-snug">
                {article.quote}
              </blockquote>
            )}
          </div>
        ))}
      </div>

      <ArticleReaderClient slug={article.slug} initialApplause={article.applause} />

      {related.length > 0 && (
        <div className="pt-6 border-t-2 border-dashed border-[#14101C]/40">
          <div className="font-stamp text-xs font-bold uppercase text-[#4B4258] mb-4">
            BACA CERITA LAINNYA
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {related.map((r) => (
              <Link
                key={r.slug}
                href={`/zine/${r.slug}`}
                className="text-left p-4 bg-[#F5F0E6] border-2 border-[#14101C] riso-shadow hover:bg-[#EBE3D3] transition-colors block"
              >
                <div className="font-stamp text-[10px] font-bold uppercase text-[#6C2BD9] mb-1">
                  {r.rubrik} • {r.readTime}
                </div>
                <div className="font-poster text-xl uppercase text-[#14101C]">
                  {r.title}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
