import React from 'react';
import Markdown from 'react-markdown';

interface Props {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<Props> = ({ content, className = '' }) => {
  return (
    <div className={`prose prose-neutral dark:prose-invert max-w-none text-sm leading-relaxed ${className}`}>
      <Markdown>{content}</Markdown>
    </div>
  );
};
