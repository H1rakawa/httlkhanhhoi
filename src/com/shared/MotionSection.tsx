export function MotionSection({
  children,
  className,
  id,
}: React.PropsWithChildren<{ className?: string; id?: string }>) {
  return (
    <section id={id} className={className}>
      {children}
    </section>
  );
}

export function MotionGroup({
  children,
  className,
}: React.PropsWithChildren<{ className?: string }>) {
  return <div className={className}>{children}</div>;
}

export function MotionItem({
  children,
  className,
}: React.PropsWithChildren<{ className?: string }>) {
  return <div className={className}>{children}</div>;
}
