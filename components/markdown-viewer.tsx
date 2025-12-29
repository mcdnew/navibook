'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Link from 'next/link'

export function MarkdownViewer({ content }: { content: string }) {
  return (
    <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({node, ...props}) => (
            <h1 className="scroll-m-20 text-4xl font-bold tracking-tight mb-4 mt-8 first:mt-0" {...props} />
          ),
          h2: ({node, ...props}) => (
            <h2 className="scroll-m-20 text-3xl font-bold tracking-tight mb-3 mt-6" {...props} />
          ),
          h3: ({node, ...props}) => (
            <h3 className="scroll-m-20 text-2xl font-bold tracking-tight mb-2 mt-4" {...props} />
          ),
          h4: ({node, ...props}) => (
            <h4 className="scroll-m-20 text-xl font-bold tracking-tight mb-2 mt-3" {...props} />
          ),
          p: ({node, ...props}) => (
            <p className="leading-7 mb-4 [&:not(:first-child)]:mt-6" {...props} />
          ),
          a: ({node, href, ...props}) => (
            <a
              href={href}
              className="font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              target={href?.startsWith('http') ? '_blank' : undefined}
              rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
              {...props}
            />
          ),
          ul: ({node, ...props}) => (
            <ul className="my-4 ml-6 [&>li]:mt-2 list-disc space-y-2" {...props} />
          ),
          ol: ({node, ...props}) => (
            <ol className="my-4 ml-6 [&>li]:mt-2 list-decimal space-y-2" {...props} />
          ),
          li: ({node, ...props}) => (
            <li className="leading-7" {...props} />
          ),
          blockquote: ({node, ...props}) => (
            <blockquote className="mt-6 border-l-2 border-gray-300 dark:border-gray-700 pl-6 italic text-gray-600 dark:text-gray-400" {...props} />
          ),
          code: ({node, inline, className, ...props}: any) =>
            inline ? (
              <code className="relative rounded bg-gray-200 dark:bg-gray-800 px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold text-gray-900 dark:text-gray-100" {...props} />
            ) : (
              <code className="block bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto font-mono text-sm" {...props} />
            ),
          pre: ({node, ...props}) => (
            <pre className="mb-4 mt-6 overflow-x-auto rounded-lg bg-gray-100 dark:bg-gray-900 p-4" {...props} />
          ),
          table: ({node, ...props}) => (
            <div className="w-full overflow-y-auto my-6">
              <table className="w-full border-collapse border border-gray-300 dark:border-gray-700" {...props} />
            </div>
          ),
          thead: ({node, ...props}) => (
            <thead className="bg-gray-100 dark:bg-gray-800" {...props} />
          ),
          tbody: ({node, ...props}) => (
            <tbody {...props} />
          ),
          tr: ({node, ...props}) => (
            <tr className="border border-gray-300 dark:border-gray-700" {...props} />
          ),
          td: ({node, ...props}) => (
            <td className="border border-gray-300 dark:border-gray-700 px-4 py-2" {...props} />
          ),
          th: ({node, ...props}) => (
            <th className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left font-bold" {...props} />
          ),
          hr: ({node, ...props}) => (
            <hr className="my-8 border-gray-300 dark:border-gray-700" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
