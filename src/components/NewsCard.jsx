export default function NewsCard({ article }) {
  const pub = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex gap-3 p-3 rounded-xl bg-gray-800/50 hover:bg-gray-700/60 border border-gray-700/30 hover:border-gray-600/50 transition-all animate-fade-in"
    >
      {article.urlToImage && (
        <img
          src={article.urlToImage}
          alt=""
          className="w-20 h-16 object-cover rounded-lg flex-shrink-0 bg-gray-700"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium leading-snug line-clamp-2 group-hover:text-blue-300 transition-colors">
          {article.title}
        </p>
        <div className="flex items-center gap-2 mt-1.5">
          {article.source?.name && (
            <span className="text-xs text-blue-400 font-medium truncate">
              {article.source.name}
            </span>
          )}
          {pub && (
            <span className="text-xs text-gray-500 flex-shrink-0">{pub}</span>
          )}
        </div>
        {article.description && (
          <p className="text-gray-400 text-xs mt-1 line-clamp-1">{article.description}</p>
        )}
      </div>
      <span className="text-gray-600 group-hover:text-gray-400 flex-shrink-0 self-center transition-colors">
        →
      </span>
    </a>
  );
}
