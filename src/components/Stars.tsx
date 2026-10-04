interface StarsProps {
  value: number;
}

export default function Stars({ value }: StarsProps) {
  const full = Math.round(value);
  return (
    <span className="stars" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} viewBox="0 0 24 24" width="14" height="14">
          <path
            className={i <= full ? "star-full" : "star-empty"}
            d="M12 3 14.6 9.1 21.2 9.6 16.1 13.9 17.7 20.4 12 16.8 6.3 20.4 7.9 13.9 2.8 9.6 9.4 9.1Z"
          />
        </svg>
      ))}
    </span>
  );
}
