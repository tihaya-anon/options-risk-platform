export function StatusPanel({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <section className="panel card status-panel">
      <div className="panel-head">
        <div>
          <h2>{title}</h2>
          <p>{message}</p>
        </div>
      </div>
    </section>
  );
}
