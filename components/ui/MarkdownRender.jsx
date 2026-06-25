"use client";
import { Icon } from "@iconify/react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";

const CodeBlock = ({ inline, className, children, ...props }) => {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || "");
  const language = match ? match[1] : "";
  const code = String(children).replace(/\n$/, "");

  if (inline) {
    return (
      <code
        className="bg-slate-100 text-rose-600 rounded px-1.5 py-0.5 text-[0.85em] font-mono"
        {...props}
      >
        {children}
      </code>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="relative group my-4 rounded-xl overflow-hidden border border-slate-700/50 bg-slate-900 not-prose">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 text-slate-300 text-xs font-mono">
        <span>{language || "code"}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
        >
          <Icon
            icon={copied ? "mdi:check" : "mdi:content-copy"}
            className="w-3.5 h-3.5"
          />
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm leading-relaxed text-slate-100">
        <code className={className} {...props}>
          {children}
        </code>
      </pre>
    </div>
  );
};

const LinkRenderer = (props) => {
  const { href, children } = props;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 hover:text-blue-700 underline underline-offset-2 font-medium"
    >
      {children}
    </a>
  );
};

const MarkdownRenderer = ({ content }) => {
  if (!content) return null;

  return (
    <div className="markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSanitize]}
        components={{
          // Headings
          h1: ({ children }) => (
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-6 mb-4 pb-2 border-b border-gray-200">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-6 mb-3">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mt-5 mb-2">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-base sm:text-lg font-semibold text-gray-800 mt-4 mb-2">
              {children}
            </h4>
          ),

          // Paragraphs & text
          p: ({ children }) => (
            <p className="text-gray-700 leading-relaxed my-3">{children}</p>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-gray-900">{children}</strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          del: ({ children }) => (
            <del className="text-gray-400 line-through">{children}</del>
          ),

          // Links
          a: LinkRenderer,

          // Lists
          ul: ({ children }) => (
            <ul className="list-disc pl-6 my-3 space-y-1.5 text-gray-700">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-6 my-3 space-y-1.5 text-gray-700">
              {children}
            </ol>
          ),
          li: ({ children, ...props }) => {
            // Task list items (- [ ] / - [x]) get checkbox rendering via remark-gfm
            if (props.className?.includes("task-list-item")) {
              return (
                <li
                  className="flex items-start gap-2 list-none -ml-6"
                  {...props}
                >
                  {children}
                </li>
              );
            }
            return <li className="leading-relaxed">{children}</li>;
          },
          input: ({ checked, ...props }) => (
            <input
              type="checkbox"
              checked={checked}
              readOnly
              className="mt-1.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              {...props}
            />
          ),

          // Blockquote
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-blue-300 bg-blue-50/50 pl-4 pr-3 py-2 my-4 text-gray-600 italic rounded-r-lg">
              {children}
            </blockquote>
          ),

          // Horizontal rule
          hr: () => <hr className="my-6 border-gray-200" />,

          // Code (inline + block)
          code: CodeBlock,

          // Tables
          table: ({ children }) => (
            <div className="my-5 overflow-x-auto rounded-xl border border-gray-200 shadow-sm not-prose">
              <table className="w-full text-sm text-left border-collapse">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-gray-50 border-b border-gray-200">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-gray-100">{children}</tbody>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-gray-50 transition-colors">{children}</tr>
          ),
          th: ({ children }) => (
            <th className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-3 text-gray-700 align-top">{children}</td>
          ),

          // Images
          img: ({ src, alt }) => (
            <img
              src={src}
              alt={alt}
              className="rounded-xl my-4 max-w-full border border-gray-200 shadow-sm"
              loading="lazy"
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
