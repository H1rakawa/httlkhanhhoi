import { LibraryResource, previewKind } from "@/com/library/libraryData";

/** Xem trực tiếp tài liệu: YouTube, video, âm thanh hoặc PDF. Trả về null nếu không xem được. */
export default function LibraryResourcePreview({
  resource,
  className = "",
}: {
  resource: LibraryResource;
  className?: string;
}) {
  const kind = previewKind(resource);
  if (!kind) return null;

  const frame = `relative overflow-hidden bg-[#07111f] shadow-[0_22px_50px_rgba(7,17,31,0.22)] ${className}`;

  if (kind === "embed") {
    return (
      <div className={`${frame} aspect-[16/9]`}>
        <iframe
          src={resource.embedUrl}
          title={resource.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>
    );
  }

  if (kind === "video") {
    return (
      <div className={`${frame} aspect-[16/9]`}>
        <video
          src={resource.url}
          poster={resource.image || undefined}
          controls
          preload="metadata"
          className="absolute inset-0 h-full w-full"
        />
      </div>
    );
  }

  if (kind === "audio") {
    return (
      <div className={`${frame} flex flex-col justify-end gap-4 p-5`}>
        <p className="text-sm font-semibold text-white">{resource.title}</p>
        <audio src={resource.url} controls preload="metadata" className="w-full" />
      </div>
    );
  }

  return (
    <div className={`${frame} aspect-[3/4] bg-white sm:aspect-[4/3]`}>
      <iframe
        src={`${resource.url}#view=FitH`}
        title={resource.title}
        className="absolute inset-0 h-full w-full border-0"
      />
    </div>
  );
}
