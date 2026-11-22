import { useState } from "react";
import Icon from "../ui/Icon";
import { inputClass } from "../ui/Field";
import { cx, fullName } from "../../lib/format";
import useUserSearch from "../../hooks/useUserSearch";

export default function UserSearch({ id, onSelect, excludeIds = [], placeholder = "Search by name or username", invalid, autoFocus = false }) {
  const [term, setTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const { results, loading } = useUserSearch(term);
  const visible = results.filter((u) => !excludeIds.includes(u.id));

  const pick = (u) => {
    onSelect(u);
    setTerm("");
    setActive(0);
  };

  const onKeyDown = (e) => {
    if (!visible.length) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); setActive((i) => (i + 1) % visible.length); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((i) => (i - 1 + visible.length) % visible.length); }
    else if (e.key === "Enter") { e.preventDefault(); pick(visible[active]); }
    else if (e.key === "Escape") setOpen(false);
  };

  const showList = open && term.trim().length >= 2;

  return (
    <div className="relative">
      <Icon name="search" size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
      <input
        id={id}
        value={term}
        onChange={(e) => { setTerm(e.target.value); setOpen(true); setActive(0); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)} // let clicks land first
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        autoFocus={autoFocus}
        autoComplete="off"
        role="combobox"
        aria-expanded={showList}
        aria-controls={`${id}-list`}
        className={cx(inputClass(invalid), "pl-9")}
      />
      {showList && (
        <ul id={`${id}-list`} role="listbox" className="absolute z-20 mt-1 max-h-72 w-full overflow-auto rounded-lg border border-line bg-surface py-1 shadow-lg">
          {loading && <li className="px-3.5 py-2 text-sm text-muted">Searching…</li>}
          {!loading && !visible.length && <li className="px-3.5 py-2 text-sm text-muted">No users found</li>}
          {!loading && visible.map((u, i) => (
            <li
              key={u.id}
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => { e.preventDefault(); pick(u); }}
              onMouseEnter={() => setActive(i)}
              className={cx("flex cursor-pointer flex-col px-3.5 py-2", i === active && "bg-surface-sunk")}
            >
              <span className="text-[15px] text-ink">{fullName(u) || u.id}</span>
              <span className="text-[13px] text-muted">@{u.id} · {u.email}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}