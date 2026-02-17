export function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 px-4 py-5">
      <div className="w-7 h-7 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0 text-xs font-bold">
        AI
      </div>
      <div className="flex items-center gap-1 pt-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}
