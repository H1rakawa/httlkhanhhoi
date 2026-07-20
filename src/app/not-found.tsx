import type { Metadata } from "next";
import NotFoundScene from "@/com/not-found/NotFoundScene";

export const metadata: Metadata = {
  title: "Không tìm thấy trang | HTTL. Khánh Hội",
};

export default function NotFound() {
  return <NotFoundScene />;
}
