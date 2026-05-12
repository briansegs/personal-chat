import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";

import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Message } from "@/app/types";

type MessagesContainerProps = {
  messages: Message[];
};

export function MessagesContainer({ messages }: MessagesContainerProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-gutter-stable scroll-smooth">
      {messages.map((msg, i) => (
        <div
          key={i}
          className={`p-3 rounded-lg whitespace-pre-wrap ${
            msg.role === "user" ? "bg-blue-100 ml-auto w-fit" : ""
          }`}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code(props) {
                const { children, className } = props;

                const match = /language-(\w+)/.exec(className || "");

                return match ? (
                  <SyntaxHighlighter
                    PreTag="div"
                    language={match[1]}
                    style={oneDark}
                  >
                    {String(children).replace(/\n$/, "")}
                  </SyntaxHighlighter>
                ) : (
                  <code className="bg-gray-200 px-1 py-0.5 rounded">
                    {children}
                  </code>
                );
              },
            }}
          >
            {msg.content}
          </ReactMarkdown>
        </div>
      ))}
    </div>
  );
}
