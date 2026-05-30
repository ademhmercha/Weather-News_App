import { ExternalLink } from 'lucide-react';

function relativeTime(dateStr) {
  if (!dateStr) return null;
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  if (d < 7) return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function NewsCard({ article, featured = false }) {
  const time = relativeTime(article.publishedAt);

  if (featured && article.urlToImage) {
    return (
      <a href={article.url} target="_blank" rel="noopener noreferrer"
        className="group block rounded-2xl overflow-hidden animate-fade-in"
        style={{ background:'rgba(0,0,0,0.28)', border:'1px solid rgba(255,255,255,0.07)' }}>
        <div className="relative h-44 overflow-hidden">
          <img src={article.urlToImage} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={e => { e.currentTarget.parentElement.style.display = 'none'; }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"/>
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <p className="text-white text-sm font-semibold line-clamp-2 leading-snug">{article.title}</p>
          </div>
        </div>
        <div className="px-3 py-2 flex items-center gap-1.5">
          {article.source?.name && <span className="text-blue-400 text-xs font-medium">{article.source.name}</span>}
          {time && <><span className="text-white/25 text-xs">•</span><span className="text-white/40 text-xs">{time}</span></>}
          <ExternalLink size={11} className="text-white/20 group-hover:text-white/50 ml-auto transition-colors"/>
        </div>
      </a>
    );
  }

  return (
    <a href={article.url} target="_blank" rel="noopener noreferrer"
      className="group flex gap-3 p-3 rounded-xl transition-all duration-150 animate-fade-in"
      style={{ background:'rgba(0,0,0,0.22)', border:'1px solid rgba(255,255,255,0.06)' }}>
      {article.urlToImage && (
        <img src={article.urlToImage} alt=""
          className="w-20 h-14 object-cover rounded-lg flex-shrink-0 bg-white/10"
          onError={e => { e.currentTarget.style.display = 'none'; }} />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-white/90 text-sm font-medium leading-snug line-clamp-2 group-hover:text-white transition-colors">
          {article.title}
        </p>
        <div className="flex items-center gap-1.5 mt-1.5">
          {article.source?.name && <span className="text-blue-400 text-xs">{article.source.name}</span>}
          {time && <><span className="text-white/20 text-xs">•</span><span className="text-white/35 text-xs">{time}</span></>}
        </div>
      </div>
      <ExternalLink size={13} className="text-white/20 group-hover:text-white/50 flex-shrink-0 self-start mt-0.5 transition-colors"/>
    </a>
  );
}
