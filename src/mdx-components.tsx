import type { MDXComponents } from "mdx/types";

const components: MDXComponents = {
  h1: (props) => (
    <h1 className="mt-10 mb-4 text-3xl font-semibold tracking-tight" {...props} />
  ),
  h2: (props) => (
    <h2 className="mt-10 mb-3 text-2xl font-semibold tracking-tight" {...props} />
  ),
  h3: (props) => (
    <h3 className="mt-8 mb-2 text-xl font-semibold tracking-tight" {...props} />
  ),
  p: (props) => <p className="my-4 leading-7 text-zinc-700 dark:text-zinc-300" {...props} />,
  ul: (props) => <ul className="my-4 list-disc pl-6 space-y-2" {...props} />,
  ol: (props) => <ol className="my-4 list-decimal pl-6 space-y-2" {...props} />,
  a: (props) => (
    <a className="text-zinc-900 underline underline-offset-4 dark:text-zinc-100" {...props} />
  ),
  code: (props) => (
    <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-sm dark:bg-zinc-800" {...props} />
  ),
  pre: (props) => (
    <pre className="my-4 overflow-x-auto rounded-lg bg-zinc-100 p-4 text-sm dark:bg-zinc-800" {...props} />
  ),
  blockquote: (props) => (
    <blockquote className="my-4 border-l-2 pl-4 text-zinc-600 dark:text-zinc-400" {...props} />
  ),
};

export function useMDXComponents(): MDXComponents {
  return components;
}
