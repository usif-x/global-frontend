// components/ui/MarkdownRenderer.js
"use client";

import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

// A simple component to render markdown content with proper styling
const MarkdownRenderer = ({ content }) => {
  return (
    <div className="prose prose-slate max-w-none prose-a:text-cyan-600 prose-headings:font-semibold">
      <ReactMarkdown rehypePlugins={[rehypeRaw]} remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
