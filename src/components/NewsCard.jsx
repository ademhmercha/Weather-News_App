import { ArrowUpRight } from 'lucide-react';

export default function NewsCard({ article }) {
  const pub = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
      })
    : null;

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex gap-4 p-4 rounded-xl border border-white/[0.05] hover:border-white/[0.10] hover:bg-slate-800/40 transition-all duration-200 animate-fade-in"
    >
      {article.urlToImage && (
        <img
          src={article.urlToImage}
          alt=""
          className="w-20 h-16 object-cover rounded-lg flex-shrink-0 bg-slate-800"
          onError={e => { e.currentTarget.style.display = 'none'; }}
        />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-slate-200 text-sm font-medium leading-snug line-clamp-2 group-hover:text-white transition-colors">
          {article.title}
        </p>
        <div className="flex items-center gap-2 mt-2">
          {article.source?.name && (
            <span className="text-xs text-blue-400 font-medium">{article.source.name}</span>
          )}
          {pub && <span className="text-xs text-slate-600">{pub}</span>}
        </div>
        {article.description && (
          <p className="text-slate-500 text-xs mt-1 line-clamp-1 leading-relaxed">{article.description}</p>
        )}
      </div>
      <ArrowUpRight
        size={16}
        className="text-slate-700 group-hover:text-slate-400 flex-shrink-0 self-start mt-0.5 transition-colors"
      />
    </a>
  );
}
