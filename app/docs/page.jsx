import Link from "next/link";
import { ArrowLeft, LayoutDashboard, BookOpen, Code2, FileText } from "lucide-react";
import fs from 'fs';
import path from 'path';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';

export default async function DocsPage({ searchParams }) {
  const params = await searchParams;
  const selectedDoc = params.doc || 'overview';
  
  // Read the selected markdown file
  const docsPath = path.join(process.cwd(), 'docs');
  let markdownContent = '';
  let currentCategory = '';
  let currentTitle = '';
  
  try {
    if (selectedDoc === 'overview') {
      markdownContent = fs.readFileSync(path.join(docsPath, 'overview.md'), 'utf8');
      currentCategory = 'Overview';
      currentTitle = 'Project Overview';
    } else if (selectedDoc.startsWith('user-')) {
      const fileName = selectedDoc.replace('user-', '');
      markdownContent = fs.readFileSync(path.join(docsPath, 'user', `${fileName}.md`), 'utf8');
      currentCategory = 'User Guide';
      currentTitle = getTitle(fileName);
    } else if (selectedDoc.startsWith('dev-')) {
      const fileName = selectedDoc.replace('dev-', '');
      markdownContent = fs.readFileSync(path.join(docsPath, 'developer', `${fileName}.md`), 'utf8');
      currentCategory = 'Developer Guide';
      currentTitle = getTitle(fileName);
    }
  } catch (error) {
    markdownContent = '# Not Found\n\nThe requested documentation page could not be found.';
    currentTitle = 'Not Found';
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Navbar */}
      <nav className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">Back to home</span>
            </Link>
            <div className="flex items-center gap-2">
              <div className="bg-zinc-900 dark:bg-zinc-100 p-2 rounded-lg">
                <LayoutDashboard className="h-5 w-5 text-white dark:text-zinc-900" />
              </div>
              <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                EpiTrello Docs
              </span>
            </div>
            <div className="w-24"></div>
          </div>
        </div>
      </nav>

      <div className="w-full mx-auto px-6 py-12 flex gap-8 max-w-[1800px]">
        {/* Sidebar - LEFT */}
        <aside className="w-64 flex-shrink-0">
          <nav className="sticky top-24 space-y-8">
            {/* Overview */}
            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
                <BookOpen className="h-4 w-4" />
                Overview
              </h3>
              <Link
                href="/docs"
                className={`block py-2 px-3 text-sm rounded-md transition-colors ${
                  selectedDoc === 'overview'
                    ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                Project Overview
              </Link>
            </div>

            {/* User Guide */}
            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
                <FileText className="h-4 w-4" />
                User Guide
              </h3>
              <div className="space-y-1">
                <Link
                  href="/docs?doc=user-account"
                  className={`block py-2 px-3 text-sm rounded-md transition-colors ${
                    selectedDoc === 'user-account'
                      ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  Account Management
                </Link>
              </div>
            </div>

            {/* Developer Guide */}
            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
                <Code2 className="h-4 w-4" />
                Developer Guide
              </h3>
              <div className="space-y-1">
                <Link
                  href="/docs?doc=dev-setup"
                  className={`block py-2 px-3 text-sm rounded-md transition-colors ${
                    selectedDoc === 'dev-setup'
                      ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  Setup Guide
                </Link>
                <Link
                  href="/docs?doc=dev-database"
                  className={`block py-2 px-3 text-sm rounded-md transition-colors ${
                    selectedDoc === 'dev-database'
                      ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  Database Schema
                </Link>
                <Link
                  href="/docs?doc=dev-api"
                  className={`block py-2 px-3 text-sm rounded-md transition-colors ${
                    selectedDoc === 'dev-api'
                      ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  API Reference
                </Link>
                <Link
                  href="/docs?doc=dev-frontend"
                  className={`block py-2 px-3 text-sm rounded-md transition-colors ${
                    selectedDoc === 'dev-frontend'
                      ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  Frontend Pages
                </Link>
                <Link
                  href="/docs?doc=dev-docker"
                  className={`block py-2 px-3 text-sm rounded-md transition-colors ${
                    selectedDoc === 'dev-docker'
                      ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  Docker Configuration
                </Link>
              </div>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-8 md:p-12 min-h-screen w-full">
            {/* Breadcrumb */}
            {currentCategory && (
              <div className="text-sm text-zinc-500 dark:text-zinc-600 mb-6">
                {currentCategory} / {currentTitle}
              </div>
            )}
            
            {/* Markdown Content */}
            <article className="prose prose-zinc dark:prose-invert max-w-none
              prose-headings:font-bold prose-headings:text-zinc-900 dark:prose-headings:text-zinc-100
              prose-h1:text-4xl prose-h1:mb-8 prose-h1:mt-0 prose-h1:pb-4 prose-h1:border-b prose-h1:border-zinc-200 dark:prose-h1:border-zinc-800
              prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:pb-2 prose-h2:border-b prose-h2:border-zinc-200 dark:prose-h2:border-zinc-800
              prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4
              prose-h4:text-lg prose-h4:mt-6 prose-h4:mb-3
              prose-p:text-zinc-700 dark:prose-p:text-zinc-300 prose-p:leading-7 prose-p:mb-6 prose-p:text-base prose-p:whitespace-pre-wrap
              prose-a:text-zinc-900 dark:prose-a:text-zinc-100 prose-a:underline hover:prose-a:no-underline prose-a:font-medium
              prose-strong:text-zinc-900 dark:prose-strong:text-zinc-100 prose-strong:font-semibold
              prose-code:text-zinc-900 dark:prose-code:text-zinc-100 prose-code:bg-zinc-100 dark:prose-code:bg-zinc-800 prose-code:px-2 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-code:before:content-[''] prose-code:after:content-[''] prose-code:whitespace-nowrap
              prose-pre:bg-zinc-900 dark:prose-pre:bg-black prose-pre:text-zinc-100 prose-pre:border prose-pre:border-zinc-800 prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto prose-pre:my-6
              prose-pre:shadow-lg prose-pre:whitespace-pre-wrap
              prose-ul:text-zinc-700 dark:prose-ul:text-zinc-300 prose-ul:my-6 prose-ul:space-y-2
              prose-ol:text-zinc-700 dark:prose-ol:text-zinc-300 prose-ol:my-6 prose-ol:space-y-2
              prose-li:my-2 prose-li:leading-7
              prose-li>prose-p:my-2
              prose-blockquote:border-l-4 prose-blockquote:border-zinc-300 dark:prose-blockquote:border-zinc-700 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-zinc-600 dark:prose-blockquote:text-zinc-400 prose-blockquote:my-6
              prose-hr:border-zinc-200 dark:prose-hr:border-zinc-800 prose-hr:my-8
              prose-table:border-collapse prose-table:w-full prose-table:my-6
              prose-th:border prose-th:border-zinc-300 dark:prose-th:border-zinc-700 prose-th:bg-zinc-100 dark:prose-th:bg-zinc-800 prose-th:p-2 prose-th:text-left
              prose-td:border prose-td:border-zinc-300 dark:prose-td:border-zinc-700 prose-td:p-2
            " style={{whiteSpace: 'pre-wrap'}}>
              <ReactMarkdown 
                remarkPlugins={[remarkGfm, remarkBreaks]}
                components={{
                  a: ({node, children, href, ...props}) => {
                    // Convert markdown links to docs page links
                    if (href && href.startsWith('./')) {
                      const docName = href.replace('./', '').replace('.md', '');
                      const currentPath = selectedDoc.startsWith('user-') ? 'user' : selectedDoc.startsWith('dev-') ? 'dev' : '';
                      const newHref = `/docs?doc=${currentPath ? `${currentPath.substring(0, currentPath.length > 4 ? 3 : 4)}-` : ''}${docName}`;
                      return <Link href={newHref} className="text-zinc-900 dark:text-zinc-100 underline hover:no-underline">{children}</Link>;
                    }
                    return <a href={href} {...props}>{children}</a>;
                  },
                  p: ({node, children, ...props}) => {
                    return <p style={{whiteSpace: 'pre-wrap', marginBottom: '1.5rem'}} {...props}>{children}</p>;
                  },
                  br: () => <br />
                }}
              >
                {markdownContent}
              </ReactMarkdown>
            </article>
          </div>
        </main>
      </div>
    </div>
  );
}

function getTitle(fileName) {
  const titles = {
    'account': 'Account Management',
    'setup': 'Setup Guide',
    'database': 'Database Schema',
    'api': 'API Reference',
    'frontend': 'Frontend Pages',
    'docker': 'Docker Configuration'
  };
  return titles[fileName] || fileName;
}

