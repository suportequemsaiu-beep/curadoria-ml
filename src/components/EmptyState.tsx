import Icon from "./Icon";

export default function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="empty-state">
      <Icon name="filter" size={28} />
      <p>Nenhum produto corresponde a esses filtros.</p>
      <button type="button" className="btn btn-ghost" onClick={onClear}>
        Limpar filtros
      </button>
    </div>
  );
}
