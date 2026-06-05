import Link from "next/link";
import { listPublishedProjects } from "@/lib/repo/projects";
import { MarketingHeader } from "@/components/landing/MarketingHeader";
import { HeroScene } from "@/components/landing/HeroScene";
import { Reveal } from "@/components/landing/Reveal";
import { CaptionDemo } from "@/components/landing/CaptionDemo";
import { GraphTeaser } from "@/components/landing/GraphTeaser";
import { PhoneMock } from "@/components/landing/PhoneMock";
import { Counter } from "@/components/landing/Counter";
import { Footer } from "@/components/landing/Footer";
import { FlipCard } from "@/components/landing/FlipCard";
import { CursorGlow, Spotlight, Magnetic } from "@/components/landing/Interactive";

const GOLD_BTN = "rounded-full bg-gradient-to-r from-amber-200 to-amber-400 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-900/20 transition hover:from-amber-100 hover:to-amber-300";

const FEATURES = [
  { icon: "🗺️", title: "Bản đồ tri thức", desc: "Mỗi dự án là một bản đồ. Chọn 1–4 điểm, máy dựng bài quanh đúng câu chuyện.", back: "112 điểm tri thức, nối theo quan hệ thật — chạm là ra góc kể." },
  { icon: "☀️", title: "Gợi ý “Hôm Nay”", desc: "Mỗi sáng một gợi ý theo nhịp tuần và deadline chiến dịch.", back: "Kèm chuỗi ngày đăng đều và đếm ngược các mốc sắp tới." },
  { icon: "✅", title: "Soạn đúng dữ liệu", desc: "Engine chỉ dùng số liệu đã xác thực. Không bịa giá, không sai pháp lý.", back: "640 mẫu câu, mỗi câu gắn dữ kiện đã kiểm — sai số là bị chặn." },
  { icon: "🤖", title: "Prompt AI", desc: "Một cú dán sang ChatGPT/Gemini là ra bài chuẩn.", back: "6 khối ràng buộc để AI chỉ dùng dữ liệu cho sẵn — không thêm thắt." },
  { icon: "🖼️", title: "Ảnh đóng logo", desc: "Tự tạo ảnh feed + story 9:16 có logo, watermark.", back: "Có placeholder sang trọng kể cả khi bạn chưa có ảnh thật." },
  { icon: "🗓️", title: "Lịch & deadline", desc: "Theo dõi đã đăng theo ngày, nhắc hạn chiến dịch.", back: "Đánh dấu ngày đã đăng + đếm ngược hạn để không lỡ sóng." },
];

const STEPS = [
  { n: "01", title: "Chọn điểm", desc: "Chạm 1–4 điểm trên bản đồ tri thức của dự án." },
  { n: "02", title: "Soạn & đổi mẫu", desc: "Đổi hook / thân / CTA, chọn giọng & định dạng đến khi ưng." },
  { n: "03", title: "Tải bài + ảnh", desc: "Copy caption, tải ảnh đóng logo — đăng ngay." },
];

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="eyebrow">{children}</p>;
}

export default async function Home() {
  const res = await listPublishedProjects();
  const projects = res.ok ? res.data : [];

  return (
    <div className="relative min-h-screen">
      <CursorGlow />
      <MarketingHeader />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="lp-aurora pointer-events-none absolute inset-0" />
        <div className="lp-grid pointer-events-none absolute inset-0" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 sm:px-6 sm:py-28 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-700/40 bg-amber-950/20 px-3 py-1 text-xs text-amber-200">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> Không bịa số liệu · không sai pháp lý
            </span>
            <h1 className="font-display mt-6 text-5xl font-semibold leading-[1.05] tracking-tight text-amber-50 sm:text-7xl">
              Bán hàng mỗi ngày,<br /><span className="text-gold italic">đẳng cấp mỗi bài.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-400">
              Trợ lý nội dung bất động sản: gợi ý bài mỗi sáng, soạn caption đúng dữ liệu đã xác thực, kèm ảnh đóng logo. Dán sang AI là xong.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Magnetic><Link href="/signup" className={GOLD_BTN}>Dùng thử miễn phí →</Link></Magnetic>
              <Magnetic><a href="#demo" className="rounded-full border border-slate-700 px-6 py-3 text-sm font-medium text-slate-200 transition hover:border-amber-600/60 hover:text-amber-100">Xem demo</a></Magnetic>
            </div>
          </div>
          <HeroScene />
        </div>
      </section>

      <div className="lp-divider mx-auto max-w-6xl" />

      {/* ── Pain → solution ──────────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-5 py-20 sm:px-6 sm:py-24">
        <Reveal>
          <div className="text-center">
            <Eyebrow>Nỗi đau của môi giới</Eyebrow>
            <h2 className="font-display mt-3 text-3xl font-semibold text-amber-50 sm:text-4xl">Ba việc khó mỗi ngày</h2>
          </div>
        </Reveal>
        <div className="mt-12 grid gap-5 sm:grid-cols-3">
          {[
            ["😮‍💨", "Cạn ý tưởng", "Mỗi ngày phải nghĩ nội dung mới."],
            ["⚠️", "Sợ sai", "Lo đăng nhầm số liệu, sai pháp lý."],
            ["🎨", "Thiếu ảnh", "Không có designer làm hình."],
          ].map(([icon, h, text], i) => (
            <Reveal key={i} delay={i * 90}>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 text-center">
                <div className="text-3xl">{icon}</div>
                <h3 className="mt-3 font-display text-xl text-slate-100">{h}</h3>
                <p className="mt-1 text-sm text-slate-400">{text}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={120}>
          <p className="mx-auto mt-10 max-w-2xl text-center text-lg leading-relaxed text-slate-300">
            Trợ lý BĐS lo trọn cả ba — <span className="text-gold">ý tưởng, độ chính xác, và hình ảnh</span>.
          </p>
        </Reveal>
      </section>

      <div className="lp-divider mx-auto max-w-6xl" />

      {/* ── Features (flip cards) ────────────────────────────────────────── */}
      <section id="features" className="mx-auto max-w-6xl px-5 py-20 sm:px-6 sm:py-28">
        <Reveal>
          <div className="text-center">
            <Eyebrow>Tính năng</Eyebrow>
            <h2 className="font-display mt-3 text-3xl font-semibold text-amber-50 sm:text-5xl">Một quy trình, đủ mọi việc</h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-400">Lật từng thẻ để xem chi tiết — từ ý tưởng đến bài đăng và hình ảnh.</p>
          </div>
        </Reveal>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={(i % 3) * 90}>
              <FlipCard
                height="h-56"
                front={
                  <div className="flex h-full flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/50 p-6 shadow-sm shadow-slate-950/40">
                    <div className="grid h-12 w-12 place-items-center rounded-xl border border-amber-700/30 bg-amber-500/10 text-2xl">{f.icon}</div>
                    <div>
                      <h3 className="font-display text-2xl text-slate-100">{f.title}</h3>
                      <p className="mt-1 text-sm text-slate-400">{f.desc}</p>
                      <span className="mt-3 inline-block text-xs text-amber-400/80">Lật xem →</span>
                    </div>
                  </div>
                }
                back={
                  <div className="flex h-full flex-col justify-center rounded-2xl border border-amber-700/40 bg-gradient-to-br from-slate-900 to-amber-950/25 p-6">
                    <h3 className="font-display text-xl text-gold">{f.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-200">{f.back}</p>
                  </div>
                }
              />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Interactive demos ────────────────────────────────────────────── */}
      <section id="demo" className="relative border-y border-slate-800 bg-slate-900/30">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-6 sm:py-28">
          <Reveal>
            <div className="text-center">
              <Eyebrow>Demo trực tiếp</Eyebrow>
              <h2 className="font-display mt-3 text-3xl font-semibold text-amber-50 sm:text-5xl">Thử ngay — không cần đăng nhập</h2>
            </div>
          </Reveal>
          <div className="mt-12 grid gap-8 lg:grid-cols-2">
            <Reveal>
              <div>
                <h3 className="eyebrow mb-3">Máy tạo caption</h3>
                <CaptionDemo />
              </div>
            </Reveal>
            <Reveal delay={120}>
              <div>
                <h3 className="eyebrow mb-3">Bản đồ tri thức</h3>
                <GraphTeaser />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-5 py-20 sm:px-6 sm:py-28">
        <Reveal>
          <div className="text-center">
            <Eyebrow>Quy trình</Eyebrow>
            <h2 className="font-display mt-3 text-3xl font-semibold text-amber-50 sm:text-5xl">Ba bước, dưới một phút</h2>
          </div>
        </Reveal>
        <div className="mt-12 grid gap-5 sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 110}>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-7">
                <span className="font-display text-4xl text-gold">{s.n}</span>
                <h3 className="mt-3 font-display text-xl text-slate-100">{s.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-400">{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Mobile + stats ───────────────────────────────────────────────── */}
      <section className="border-y border-slate-800 bg-slate-900/30">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 sm:px-6 sm:py-28 lg:grid-cols-2">
          <Reveal>
            <div>
              <Eyebrow>Trên di động</Eyebrow>
              <h2 className="font-display mt-3 text-3xl font-semibold text-amber-50 sm:text-4xl">Làm việc gọn trong lòng bàn tay</h2>
              <p className="mt-4 max-w-md leading-relaxed text-slate-400">
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

      {/* ── Pricing teaser ───────────────────────────────────────────────── */}
      <section id="pricing" className="mx-auto max-w-6xl px-5 py-20 sm:px-6 sm:py-28">
        <Reveal>
          <div className="text-center">
            <Eyebrow>Bảng giá</Eyebrow>
            <h2 className="font-display mt-3 text-3xl font-semibold text-amber-50 sm:text-5xl">Bắt đầu miễn phí</h2>
            <p className="mt-4 text-slate-400">Nâng cấp khi cần ảnh sạch & nhiều bài hơn.</p>
          </div>
        </Reveal>
        <div className="mt-12 grid gap-5 sm:grid-cols-3">
          {[
            { name: "Free", price: "0đ", items: ["2 dự án demo", "3 bài/ngày", "ảnh có watermark"], cta: "Bắt đầu", href: "/signup", hot: false },
            { name: "Pro", price: "199K", unit: "/tháng", items: ["Mọi dự án", "50 bài/ngày", "ảnh sạch + story"], cta: "Nâng cấp", href: "/pricing", hot: true },
            { name: "Team", price: "999K", unit: "/tháng", items: ["5 thành viên", "như Pro", "(seats: Phase 2)"], cta: "Liên hệ", href: "/contact", hot: false },
          ].map((t, i) => (
            <Reveal key={t.name} delay={i * 90}>
              <div className={`flex h-full flex-col rounded-2xl border bg-slate-900/40 p-7 ${t.hot ? "border-amber-600/60 shadow-lg shadow-amber-900/15" : "border-slate-800"}`}>
                {t.hot && <span className="mb-3 inline-block w-fit rounded-full bg-gradient-to-r from-amber-200 to-amber-400 px-2.5 py-0.5 text-[11px] font-medium text-slate-950">Phổ biến</span>}
                <h3 className="font-display text-2xl text-slate-100">{t.name}</h3>
                <p className="mt-1 font-display text-3xl text-gold">{t.price}<span className="text-base text-slate-500">{t.unit ?? ""}</span></p>
                <ul className="mt-4 flex flex-1 flex-col gap-1.5 text-sm text-slate-400">
                  {t.items.map((it) => <li key={it} className="flex items-center gap-2"><span className="text-amber-400">✦</span>{it}</li>)}
                </ul>
                <Link href={t.href} className={`mt-6 rounded-full px-4 py-2.5 text-center text-sm font-medium transition ${t.hot ? "bg-gradient-to-r from-amber-200 to-amber-400 text-slate-950 hover:from-amber-100 hover:to-amber-300" : "border border-slate-700 text-slate-200 hover:border-amber-600/60 hover:text-amber-100"}`}>{t.cta}</Link>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Demo projects ────────────────────────────────────────────────── */}
      {projects.length > 0 && (
        <section className="mx-auto max-w-6xl px-5 py-20 sm:px-6 sm:py-28">
          <Reveal>
            <Eyebrow>Dự án mẫu</Eyebrow>
            <h2 className="font-display mt-3 text-3xl font-semibold text-amber-50 sm:text-4xl">Khám phá bản đồ tri thức</h2>
          </Reveal>
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p, i) => (
              <Reveal key={p.id} delay={(i % 3) * 90}>
                <Spotlight className="rounded-2xl">
                  <Link
                    href={`/p/${p.slug}`}
                    className="group block rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-sm shadow-slate-950/40 transition hover:-translate-y-0.5 hover:border-amber-700/40"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-display text-2xl text-slate-100 group-hover:text-amber-50">{p.name}</h3>
                      {p.phase && <span className="shrink-0 rounded-full border border-amber-700/50 bg-amber-950/30 px-2 py-0.5 text-[11px] text-amber-300">{p.phase}</span>}
                    </div>
                    {p.locationText && <p className="mt-1.5 text-sm text-slate-400">{p.locationText}</p>}
                    {(p.priceMin || p.priceMax) && <p className="mt-3 text-sm font-medium text-gold">{priceLabel(p.priceMin, p.priceMax)}</p>}
                    <span className="mt-4 inline-flex items-center gap-1 text-xs text-slate-500 transition group-hover:text-amber-400">Mở bản đồ →</span>
                  </Link>
                </Spotlight>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* ── Final CTA ────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-t border-slate-800">
        <div className="lp-aurora pointer-events-none absolute inset-0 opacity-90" />
        <div className="relative mx-auto max-w-3xl px-5 py-24 text-center sm:px-6 sm:py-28">
          <Reveal>
            <h2 className="font-display text-4xl font-semibold text-amber-50 sm:text-6xl">Sẵn sàng đăng bài mỗi ngày?</h2>
            <p className="mx-auto mt-5 max-w-xl leading-relaxed text-slate-300">Tạo tài khoản miễn phí, set thương hiệu, và có bài đầu tiên trong vài phút.</p>
            <Magnetic className="mt-9"><Link href="/signup" className={GOLD_BTN}>Dùng thử miễn phí →</Link></Magnetic>
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
