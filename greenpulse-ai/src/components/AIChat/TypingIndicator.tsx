export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 rounded-xl bg-surface-sunken px-3.5 py-3">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-faint"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}
