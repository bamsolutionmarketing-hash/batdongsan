import Link from "next/link";
import { listPublishedProjects } from "@/lib/repo/projects";
import { MarketingHeader } from "@/components/landing/MarketingHeader";
import { HeroPreview } from "@/components/landing/HeroPreview";
import { Reveal } from "@/components/landing/Reveal";
import { CaptionDemo } from "@/components/landing/CaptionDemo";
import { GraphTeaser } from "@/components/landing/GraphTeaser";
import { PhoneMock } from "@/components/landing/PhoneMock";
import { Counter } from "@/components/landing/Counter";
import { Footer } from "@/components/landing/Footer";
import { FlipCard } from "@/components/landing/FlipCard";
import { ScrollStory } from "@/components/landing/ScrollStory";

const FEATURES = [
  { icon: "🗺️", title: "Bản đồ tri thức", desc: "Chọn 1–4 điểm, máy dựng bài quanh đúng câu chuyện.", back: "112 điểm tri thức, nối theo quan hệ thật — chạm là ra góc kể." },
  { icon: "☀️", title: "Gợi ý “Hôm Nay”", desc: "Mỗi sáng một gợi ý theo nhịp tuần và deadline.", back: "Kèm chuỗi ngày đăng đều và đếm ngược các mốc sắp tới." },
  { icon: "✅", title: "Soạn đúng dữ liệu", desc: "Chỉ dùng số liệu đã xác thực. Không bịa, không sai pháp lý.", back: "640 mẫu câu, mỗi câu gắn dữ kiện đã kiểm — sai số là bị chặn." },
  { icon: "🤖", title: "Prompt AI", desc: "Một cú dán sang ChatGPT/Gemini là ra bài chuẩn.", back: "6 khối ràng buộc để AI chỉ dùng dữ liệu cho sẵn — không thêm thắt." },
  { icon: "🖼️", title: "Ảnh đóng logo", desc: "Tự tạo ảnh feed + story 9:16 có logo, watermark.", back: "Có placeholder kể cả khi bạn chưa có ảnh thật." },
  { icon: "🗓️", title: "Lịch & deadline", desc: "Theo dõi đã đăng theo ngày, nhắc hạn chiến dịch.", back: "Đánh dấu ngày đã đăng + đếm ngược hạn để không lỡ sóng." },
];

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">{children}</p>;
}

export default async function Home() {
  const res = await listPublishedProjects();
  const projects = res.ok ? res.data : [];

  return (
    <div className="min-h-screen bg-background">
      <MarketingHeader />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 sm:px-6 sm:py-24 lg:grid-cols-2">
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background-subtle px-3 py-1 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-brand" /> Không bịa số liệu · không sai pháp lý
          </span>
          <h1 className="mt-6 text-5xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-7xl">
            Tiết kiệm hàng giờ <span className="text-muted-foreground">nghĩ nội dung</span> bán BĐS.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Gợi ý bài mỗi sáng, soạn caption đúng dữ liệu đã xác thực, kèm ảnh đóng logo. Dán sang AI là xong.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link href="/signup" className="rounded-md bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90">Dùng thử miễn phí →</Link>
            <a href="#demo" className="rounded-md border border-border px-5 py-3 text-sm font-medium text-foreground transition hover:bg-accent">Xem demo</a>
          </div>
        </div>
        <div className="animate-fade-up [animation-delay:120ms]">
          <HeroPreview />
        </div>
      </section>

      {/* ── Features (flip cards) ────────────────────────────────────────── */}
      <section id="features" className="border-t border-border bg-background-subtle">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-6 sm:py-28">
          <Reveal>
            <div className="text-center">
              <Eyebrow>Tính năng</Eyebrow>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-5xl">Một quy trình, đủ mọi việc</h2>
              <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">Lật từng thẻ để xem chi tiết — từ ý tưởng đến bài đăng và hình ảnh.</p>
            </div>
          </Reveal>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={(i % 3) * 80}>
                <FlipCard
                  height="h-52"
                  front={
                    <div className="flex h-full flex-col justify-between rounded-lg border border-border bg-card p-6 shadow-card">
                      <div className="grid h-11 w-11 place-items-center rounded-lg bg-muted text-xl">{f.icon}</div>
                      <div>
                        <h3 className="text-lg font-semibold tracking-tight text-foreground">{f.title}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
                        <span className="mt-3 inline-block text-xs text-brand">Lật xem →</span>
                      </div>
                    </div>
                  }
                  back={
                    <div className="flex h-full flex-col justify-center rounded-lg border border-border bg-foreground p-6 text-background">
                      <h3 className="text-lg font-semibold tracking-tight">{f.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed opacity-90">{f.back}</p>
                    </div>
                  }
                />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Interactive demos ────────────────────────────────────────────── */}
      <section id="demo" className="mx-auto max-w-6xl px-5 py-20 sm:px-6 sm:py-28">
        <Reveal>
          <div className="text-center">
            <Eyebrow>Demo trực tiếp</Eyebrow>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-5xl">Thử ngay — không cần đăng nhập</h2>
          </div>
        </Reveal>
        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <Reveal>
            <div>
              <Eyebrow>Máy tạo caption</Eyebrow>
              <div className="mt-3"><CaptionDemo /></div>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div>
              <Eyebrow>Bản đồ tri thức</Eyebrow>
              <div className="mt-3"><GraphTeaser /></div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── How it works (sticky scrollytelling) ─────────────────────────── */}
      <div className="border-t border-border bg-background pt-20 sm:pt-28">
        <div className="mx-auto max-w-6xl px-5 text-center sm:px-6">
          <Reveal>
            <Eyebrow>Quy trình</Eyebrow>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-5xl">Ba bước, cuộn để xem</h2>
          </Reveal>
        </div>
      </div>
      <ScrollStory />

      {/* ── Mobile + stats ───────────────────────────────────────────────── */}
      <section className="border-y border-border bg-background-subtle">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 sm:px-6 sm:py-28 lg:grid-cols-2">
          <Reveal>
            <div>
              <Eyebrow>Trên di động</Eyebrow>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Làm việc gọn trong lòng bàn tay</h2>
              <p className="mt-4 max-w-md leading-relaxed text-muted-foreground">
                Mở app buổi sáng, nhận gợi ý, tạo bài và tải ảnh — giữ chuỗi đăng đều mỗi ngày.
              </p>
              <div className="mt-10 grid grid-cols-3 gap-4">
                <Counter to={112} label="Điểm tri thức" />
                <Counter to={640} label="Mẫu câu" />
                <Counter to={12} label="Giọng × định dạng" />
              </div>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <PhoneMock />
          </Reveal>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────────────── */}
      <section id="pricing" className="mx-auto max-w-6xl px-5 py-20 sm:px-6 sm:py-28">
        <Reveal>
          <div className="text-center">
            <Eyebrow>Bảng giá</Eyebrow>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-5xl">Bắt đầu miễn phí</h2>
            <p className="mt-4 text-muted-foreground">Nâng cấp khi cần ảnh sạch & nhiều bài hơn.</p>
          </div>
        </Reveal>
        <div className="mt-12 grid gap-5 sm:grid-cols-3">
          {[
            { name: "Free", price: "0đ", unit: "", items: ["2 dự án demo", "3 bài/ngày", "ảnh có watermark"], cta: "Bắt đầu", href: "/signup", hot: false },
            { name: "Pro", price: "199K", unit: "/tháng", items: ["Mọi dự án", "50 bài/ngày", "ảnh sạch + story"], cta: "Nâng cấp", href: "/pricing", hot: true },
            { name: "Team", price: "999K", unit: "/tháng", items: ["5 thành viên", "như Pro", "(seats: Phase 2)"], cta: "Liên hệ", href: "/contact", hot: false },
          ].map((t, i) => (
            <Reveal key={t.name} delay={i * 80}>
              <div className={`flex h-full flex-col rounded-lg border bg-card p-6 shadow-card ${t.hot ? "border-foreground" : "border-border"}`}>
                {t.hot && <span className="mb-3 inline-block w-fit rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-medium text-primary-foreground">Phổ biến</span>}
                <h3 className="text-lg font-semibold tracking-tight text-foreground">{t.name}</h3>
                <p className="mt-1 text-3xl font-bold tracking-tight text-foreground">{t.price}<span className="text-base font-normal text-muted-foreground">{t.unit}</span></p>
                <ul className="mt-4 flex flex-1 flex-col gap-1.5 text-sm text-muted-foreground">
                  {t.items.map((it) => <li key={it} className="flex items-center gap-2"><span className="text-brand">✓</span>{it}</li>)}
                </ul>
                <Link href={t.href} className={`mt-6 rounded-md px-4 py-2.5 text-center text-sm font-medium transition ${t.hot ? "bg-primary text-primary-foreground hover:bg-primary/90" : "border border-border text-foreground hover:bg-accent"}`}>{t.cta}</Link>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Demo projects ────────────────────────────────────────────────── */}
      {projects.length > 0 && (
        <section className="border-t border-border bg-background-subtle">
          <div className="mx-auto max-w-6xl px-5 py-20 sm:px-6 sm:py-28">
            <Reveal>
              <Eyebrow>Dự án mẫu</Eyebrow>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Khám phá bản đồ tri thức</h2>
            </Reveal>
            <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((p, i) => (
                <Reveal key={p.id} delay={(i % 3) * 80}>
                  <Link
                    href={`/p/${p.slug}`}
                    className="group block rounded-lg border border-border bg-card p-6 shadow-card transition hover:-translate-y-0.5 hover:shadow-card-hover"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-lg font-semibold tracking-tight text-foreground">{p.name}</h3>
                      {p.phase && <span className="shrink-0 rounded-full border border-border bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">{p.phase}</span>}
                    </div>
                    {p.locationText && <p className="mt-1.5 text-sm text-muted-foreground">{p.locationText}</p>}
                    {(p.priceMin || p.priceMax) && <p className="mt-3 text-sm font-medium text-foreground">{priceLabel(p.priceMin, p.priceMax)}</p>}
                    <span className="mt-4 inline-flex items-center gap-1 text-xs text-muted-foreground transition group-hover:text-brand">Mở bản đồ →</span>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Final CTA ────────────────────────────────────────────────────── */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-3xl px-5 py-24 text-center sm:px-6 sm:py-28">
          <Reveal>
            <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">Sẵn sàng đăng bài mỗi ngày?</h2>
            <p className="mx-auto mt-5 max-w-xl leading-relaxed text-muted-foreground">Tạo tài khoản miễn phí, set thương hiệu, và có bài đầu tiên trong vài phút.</p>
            <Link href="/signup" className="mt-9 inline-block rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90">Dùng thử miễn phí →</Link>
          </Reveal>
        </div>
      </section>

      <Footer />
    </div>
  );
}

// VND/m² (bigint) → "x–y tr/m²".
function priceLabel(min: number | null, max: number | null): string {
  const m = (v: number) => Math.round(v / 1_000_000);
  if (min && max) return `${m(min)}–${m(max)} tr/m²`;
  if (min) return `từ ${m(min)} tr/m²`;
  if (max) return `đến ${m(max)} tr/m²`;
  return "";
}
