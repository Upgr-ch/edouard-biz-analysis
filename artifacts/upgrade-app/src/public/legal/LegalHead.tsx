interface LegalHeadProps {
  canonicalPath: string;
  description: string;
  title: string;
}

export default function LegalHead({
  canonicalPath,
  description,
  title,
}: LegalHeadProps) {
  return (
    <>
      <title>{title}</title>
      <meta content={description} name="description" />
      <link
        href={`https://edouard-consultant.ch${canonicalPath}`}
        rel="canonical"
      />
    </>
  );
}