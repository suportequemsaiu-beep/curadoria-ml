import { SCORE_ROWS } from "@/lib/score";
import { ScoreResult } from "@/lib/types";

export default function ScoreBreakdown({ result }: { result: ScoreResult }) {
  return (
    <div className="score-breakdown">
      {SCORE_ROWS.map((r) => (
        <div className="score-breakdown-row" key={r.key}>
          <span className="sb-label">
            {r.label} <span className="sb-weight">({r.weight}%)</span>
          </span>
          <span className="sb-points">
            {Math.round(result.points[r.key])} pts
            {!result.available[r.key] && <span className="sb-na"> · não disponível (não entra no cálculo)</span>}
          </span>
        </div>
      ))}
      <div className="score-breakdown-row sb-final">
        <span className="sb-label">Score final</span>
        <span className="sb-points">{result.score}/100</span>
      </div>
      <p className="score-breakdown-note">
        O score organiza opções para análise e não garante qualidade, preço ou disponibilidade.
      </p>
    </div>
  );
}
