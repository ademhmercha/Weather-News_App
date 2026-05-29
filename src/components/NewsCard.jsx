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
      className="group flex gap-3 p-3.5 rounded-xl transition-all duration-200 animate-fade-in"
      style={{ background: 'rgba(0,0,0,0.28)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      {article.urlToImage && (
        <img
          src={article.urlToImage}
          alt=""
          className="w-20 h-16 object-cover rounded-lg flex-shrink-0 bg-white/10"
          onError={e => { e.currentTarget.style.display = 'none'; }}
        />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-white/90 text-sm font-medium leading-snug line-clamp-2 group-hover:text-white transition-colors">
          {article.title}
        </p>
        <div className="flex items-center gap-2 mt-1.5">
          {article.source?.name && (
            <span className="text-blue-400 text-xs font-medium">{article.source.name}</span>
          )}
          {pub && <span className="text-white/30 text-xs">{pub}</span>}
        </div>
        {article.description && (
          <p className="text-white/35 text-xs mt-1 line-clamp-1">{article.description}</p>
        )}
      </div>
      <ArrowUpRight size={14} className="text-white/25 group-hover:text-white/60 flex-shrink-0 self-start mt-0.5 transition-colors" />
    </a>
  );
}
