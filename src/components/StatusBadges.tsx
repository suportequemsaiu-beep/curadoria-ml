import { STATUS_META } from "@/lib/data";
import { Status } from "@/lib/types";
import Icon from "./Icon";

export function StatusPill({ status }: { status: Status }) {
  const m = STATUS_META[status];
  return (
    <span className={"status-pill " + m.cls}>
      <Icon name={m.icon} size={12} /> {m.label}
    </span>
  );
}

export function StatusChip({ status, count }: { status: Status; count: number }) {
  const m = STATUS_META[status];
  return (
    <div className={"summary-chip " + m.cls}>
      <Icon name={m.icon} size={14} />
      <span className="summary-count">{count}</span>
      <span className="summary-label">{m.label}</span>
    </div>
  );
}
