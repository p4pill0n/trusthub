interface PageHeaderProps {
  title: string;
  description: string;
  descriptionClassName?: string;
  action?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  descriptionClassName,
  action,
}: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1 className="page-title">{title}</h1>
        <p
          className={
            descriptionClassName ??
            "mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground"
          }
        >
          {description}
        </p>
      </div>
      {action}
    </div>
  );
}
