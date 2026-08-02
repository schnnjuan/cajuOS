type Props = {
  body: string;
};

export function MarkdownPreview({ body }: Props) {
  return (
    <div>
      <label className="mb-1 block text-sm text-muted">Preview</label>
      <pre className="max-h-96 overflow-auto whitespace-pre-wrap break-words rounded-md border border-border bg-accent/5 px-3 py-2 font-mono text-xs leading-relaxed text-muted">
        {body || "Nada para mostrar ainda."}
      </pre>
    </div>
  );
}
