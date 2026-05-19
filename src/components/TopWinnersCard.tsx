type TopWinnerItem = {
  name: string;
  countryCode: string;
  wins: number;
  profileUrl?: string;
};

type TopWinnersCardProps = {
  title: string;
  items: TopWinnerItem[];
  emptyMessage: string;
};

export default function TopWinnersCard({
  title,
  items,
  emptyMessage,
}: TopWinnersCardProps) {
  return (
    <section className="panel-card details-card">
      <h3 className="panel-title">{title}</h3>

      {items.length === 0 ? (
        <p>{emptyMessage}</p>
      ) : (
        <ol className="top-surfers-list">
          {items.map((surfer, index) => (
            <li
              key={`${surfer.name}-${surfer.countryCode}`}
              className="top-surfers-item"
            >
              <span className="top-surfers-rank">{index + 1}.</span>

              <span className="top-surfers-name">
                {surfer.profileUrl ? (
                  <a
                    href={surfer.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="surfer-profile-link"
                  >
                    {surfer.name}
                  </a>
                ) : (
                  surfer.name
                )}{" "}
                ({surfer.countryCode})
              </span>

              <span className="top-surfers-wins">{surfer.wins}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
