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
import { CursorGlow, Spotlight, Magnetic } from "@/components/landing/Interactive";

const GOLD_BTN = "rounded-md bg-gradient-to-r from-amber-300 to-yellow-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-900/30 transition hover:from-amber-200 hover:to-yellow-400";

const FEATURES = [
  { icon: "🗺️", title: "Bản đồ tri thức", desc: "Mỗi dự án là một bản đồ. Chọn 1–4 điểm, máy dựng bài quanh đúng câu chuyện bạn muốn kể." },
  { icon: "☀️", title: "Gợi ý “Hôm Nay”", desc: "Mỗi sáng một gợi ý theo nhịp tuần và deadline chiến dịch — hết cảnh bí ý tưởng." },
  { icon: "✅", title: "Soạn đúng dữ liệu", desc: "Engine chỉ dùng số liệu đã xác thực. Không bịa giá, không hứa lợi nhuận, không sai pháp lý." },
  { icon: "🤖", title: "Prompt AI copy-paste", desc: "Một cú dán sang ChatGPT/Gemini là ra bài chuẩn — kèm ràng buộc để AI không bịa." },
  { icon: "🖼️", title: "Ảnh đóng logo & story", desc: "Tự tạo ảnh feed + story 9:16 có logo, watermark — kể cả khi chưa có ảnh thật." },
  { icon: "🗓️", title: "Lịch & deadline", desc: "Theo dõi đã đăng theo ngày, nhắc hạn chiến dịch sắp tới để không lỡ sóng." },
];

const STEPS = [
  { n: "1", title: "Chọn điểm", desc: "Chạm 1–4 điểm trên bản đồ tri thức của dự án." },
  { n: "2", title: "Soạn & đổi mẫu", desc: "Đổi hook/thân/CTA, chọn giọng & định dạng đến khi ưng." },
  { n: "3", title: "Tải bài + ảnh", desc: "Copy caption, tải ảnh đóng logo — đăng ngay lên Facebook/Zalo." },
];

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
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-700/40 bg-amber-950/20 px-3 py-1 text-xs text-amber-200">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> Không bịa số liệu · không sai pháp lý
            </span>
            <h1 className="font-display mt-5 text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-6xl">
              Bán hàng mỗi ngày,<br /><span className="text-gold">đẳng cấp mỗi bài</span>.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-slate-400">
              Trợ lý nội dung BĐS: gợi ý bài mỗi sáng, soạn caption đúng dữ liệu đã xác thực, kèm ảnh đóng logo. Dán sang AI là xong.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Magnetic><Link href="/signup" className={GOLD_BTN}>Dùng thử miễn phí →</Link></Magnetic>
              <Magnetic><a href="#demo" className="rounded-md border border-slate-700 px-5 py-3 text-sm font-medium text-slate-200 transition hover:border-amber-600/60 hover:bg-amber-950/20">Xem demo</a></Magnetic>
            </div>
          </div>
          <HeroScene />
        </div>
      </section>

      {/* ── Pain → solution ──────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ["😮‍💨", "Mỗi ngày phải nghĩ nội dung mới — cạn ý."],
            ["⚠️", "Sợ đăng sai số liệu, sai pháp lý."],
            ["🎨", "Không có designer làm ảnh."],
          ].map(([icon, text], i) => (
            <Reveal key={i} delay={i * 80}>
              <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
                <div className="text-2xl">{icon}</div>
                <p className="mt-2 text-sm text-slate-300">{text}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={120}>
          <p className="mt-6 text-center text-lg text-slate-300">
            → Trợ lý BĐS lo cả ba: <span className="font-semibold text-gold">ý tưởng, độ chính xác, và hình ảnh</span>.
          </p>
        </Reveal>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <Reveal>
          <h2 className="font-display text-center text-3xl font-bold text-white sm:text-4xl">Một quy trình, đủ mọi việc</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-slate-400">Từ ý tưởng đến bài đăng + ảnh, mọi thứ trong một màn hình.</p>
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={(i % 3) * 80}>
              <Spotlight className="h-full rounded-2xl">
                <div className="group h-full rounded-2xl border border-slate-800 bg-slate-900/50 p-6 shadow-sm shadow-slate-950/40 transition hover:-translate-y-0.5 hover:border-amber-700/40">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-slate-800 text-xl transition group-hover:bg-amber-500/15">{f.icon}</div>
                  <h3 className="mt-4 text-lg font-semibold text-slate-100">{f.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{f.desc}</p>
                </div>
              </Spotlight>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Interactive demos ────────────────────────────────────────────── */}
      <section id="demo" className="border-y border-slate-800 bg-slate-900/30">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <Reveal>
            <h2 className="font-display text-center text-3xl font-bold text-white sm:text-4xl">Thử ngay — không cần đăng nhập</h2>
          </Reveal>
          <div className="mt-10 grid gap-8 lg:grid-cols-2">
            <Reveal>
              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-amber-400">Máy tạo caption</h3>
                <CaptionDemo />
              </div>
            </Reveal>
            <Reveal delay={120}>
              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-amber-400">Bản đồ tri thức</h3>
                <GraphTeaser />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <Reveal>
          <h2 className="font-display text-center text-3xl font-bold text-white sm:text-4xl">Ba bước, dưới một phút</h2>
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 100}>
              <div className="relative rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-amber-300 to-yellow-500 text-sm font-bold text-slate-950">{s.n}</span>
                <h3 className="mt-3 text-lg font-semibold text-slate-100">{s.title}</h3>
                <p className="mt-1 text-sm text-slate-400">{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Mobile + stats ───────────────────────────────────────────────── */}
      <section className="border-y border-slate-800 bg-slate-900/30">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2">
          <Reveal>
            <div>
              <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">Làm việc ngay trên điện thoại</h2>
              <p className="mt-3 max-w-md text-slate-400">
                Mở app buổi sáng, nhận gợi ý, tạo bài và tải ảnh — tất cả gọn trong lòng bàn tay, giữ chuỗi đăng đều mỗi ngày.
              </p>
              <div className="mt-8 grid grid-cols-3 gap-4">
                <Counter to={112} label="Điểm tri thức" />
                <Counter to={640} label="Mẫu câu" />
                <Counter to={12} label="Tổ hợp giọng × định dạng" />
              </div>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <PhoneMock />
          </Reveal>
        </div>
      </section>

      {/* ── Pricing teaser ───────────────────────────────────────────────── */}
      <section id="pricing" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <Reveal>
          <h2 className="font-display text-center text-3xl font-bold text-white sm:text-4xl">Bắt đầu miễn phí</h2>
          <p className="mt-3 text-center text-slate-400">Nâng cấp khi cần ảnh sạch & nhiều bài hơn.</p>
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            { name: "Free", price: "0đ", items: ["2 dự án demo", "3 bài/ngày", "ảnh có watermark"], cta: "Bắt đầu", href: "/signup", hot: false },
            { name: "Pro", price: "199K/tháng", items: ["Mọi dự án", "50 bài/ngày", "ảnh sạch + story"], cta: "Nâng cấp", href: "/pricing", hot: true },
            { name: "Team", price: "999K/tháng", items: ["5 thành viên", "như Pro", "(seats: Phase 2)"], cta: "Liên hệ", href: "/contact", hot: false },
          ].map((t, i) => (
            <Reveal key={t.name} delay={i * 80}>
              <div className={`flex h-full flex-col rounded-2xl border bg-slate-900/50 p-6 ${t.hot ? "border-amber-600/70 shadow-lg shadow-amber-900/20" : "border-slate-800"}`}>
                {t.hot && <span className="mb-2 inline-block w-fit rounded-full bg-gradient-to-r from-amber-300 to-yellow-500 px-2 py-0.5 text-[11px] font-medium text-slate-950">Phổ biến</span>}
                <h3 className="text-lg font-semibold text-slate-100">{t.name}</h3>
                <p className="font-display mt-1 text-2xl font-bold text-gold">{t.price}</p>
                <ul className="mt-3 flex flex-1 flex-col gap-1 text-sm text-slate-400">
                  {t.items.map((it) => <li key={it}>• {it}</li>)}
                </ul>
                <Link href={t.href} className={`mt-5 rounded-md px-4 py-2 text-center text-sm font-medium transition ${t.hot ? "bg-gradient-to-r from-amber-300 to-yellow-500 text-slate-950 hover:from-amber-200 hover:to-yellow-400" : "border border-slate-700 text-slate-200 hover:border-slate-500"}`}>{t.cta}</Link>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Demo projects ────────────────────────────────────────────────── */}
      {projects.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <Reveal>
            <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">Khám phá dự án mẫu</h2>
            <p className="mt-2 text-slate-400">Mở bản đồ tri thức của một dự án có sẵn.</p>
          </Reveal>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p, i) => (
              <Reveal key={p.id} delay={(i % 3) * 80}>
                <Spotlight className="rounded-lg">
                  <Link
                    href={`/p/${p.slug}`}
                    className="group block rounded-lg border border-slate-800 bg-slate-900 p-5 shadow-sm shadow-slate-950/40 transition hover:-translate-y-0.5 hover:border-amber-700/40"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-lg font-semibold text-slate-100 group-hover:text-white">{p.name}</h3>
                      {p.phase && <span className="shrink-0 rounded-full border border-amber-700/50 bg-amber-950/30 px-2 py-0.5 text-[11px] text-amber-300">{p.phase}</span>}
                    </div>
                    {p.locationText && <p className="mt-1 text-sm text-slate-400">{p.locationText}</p>}
                    {(p.priceMin || p.priceMax) && <p className="mt-3 text-sm font-medium text-amber-300">{priceLabel(p.priceMin, p.priceMax)}</p>}
                    <span className="mt-3 inline-flex items-center gap-1 text-xs text-slate-500 transition group-hover:text-amber-400">Mở bản đồ →</span>
                  </Link>
                </Spotlight>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* ── Final CTA ────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-t border-slate-800">
        <div className="lp-aurora pointer-events-none absolute inset-0 opacity-80" />
        <div className="relative mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
          <Reveal>
            <h2 className="font-display text-3xl font-bold text-white sm:text-5xl">Sẵn sàng đăng bài mỗi ngày?</h2>
            <p className="mx-auto mt-4 max-w-xl text-slate-300">Tạo tài khoản miễn phí, set thương hiệu, và có bài đầu tiên trong vài phút.</p>
            <Magnetic className="mt-8"><Link href="/signup" className={GOLD_BTN}>Dùng thử miễn phí →</Link></Magnetic>
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
