// Primary agent-app navigation, shared by the desktop top bar (NavLinks) and
// the mobile bottom tab bar (BottomNav).
// "Khách" thay chỗ "Ghi chú" trên thanh chính: việc của sale là tìm & theo
// khách. /notes vẫn dùng được — vào từ Hôm Nay (mục Việc hôm nay / lối tắt).
export const NAV_TABS: { href: string; label: string; icon: string }[] = [
  { href: "/dashboard", label: "Hôm Nay", icon: "🏠" },
  { href: "/customers", label: "Khách", icon: "👥" },
  { href: "/projects", label: "Dự án", icon: "🏢" },
  { href: "/posts", label: "Bài", icon: "📄" },
  { href: "/calculator", label: "Tài chính", icon: "🧮" },
  { href: "/calendar", label: "Lịch", icon: "🗓️" },
  { href: "/settings", label: "Hồ sơ", icon: "👤" },
];
