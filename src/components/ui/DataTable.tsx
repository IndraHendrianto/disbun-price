import { type ReactNode } from 'react';

export interface Column<T> {
  key: string;
  header: string;
  render: (item: T) => ReactNode;
  className?: string;
  headerClassName?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  currentPage?: number;
  totalItems?: number;
  itemsPerPage?: number;
  caption?: string;
}

export default function DataTable<T>({
  columns,
  data,
  currentPage = 1,
  totalItems,
  itemsPerPage = 5,
  caption,
}: DataTableProps<T>) {
  const total = totalItems ?? data.length;
  const start = (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(currentPage * itemsPerPage, total);
  const totalPages = Math.ceil(total / itemsPerPage);

  return (
    <div className="bg-white rounded-xl border border-[var(--border-light)] overflow-hidden shadow-sm">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          {caption && (
            <caption className="sr-only">{caption}</caption>
          )}
          <thead>
            <tr className="bg-gradient-to-r from-[var(--surface-alt)] to-[var(--surface)]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-5 py-3.5 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider border-b border-[var(--border-light)] ${col.headerClassName || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-light)]">
            {data.map((item, idx) => (
              <tr
                key={idx}
                className="group hover:bg-[var(--surface-hover)] transition-colors duration-150"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-5 py-4 text-sm ${col.className || ''}`}
                  >
                    {col.render(item)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-[var(--surface-alt)] border-t border-[var(--border-light)]">
        <p className="text-xs text-[var(--text-tertiary)]">
          Menampilkan <span className="font-semibold text-[var(--text-secondary)]">{start}-{end}</span> dari{' '}
          <span className="font-semibold text-[var(--text-secondary)]">{total}</span> komoditas
        </p>

        <div className="flex items-center gap-1">
          <button
            disabled={currentPage <= 1}
            className="p-1.5 rounded-lg text-[var(--text-tertiary)] hover:bg-white hover:text-[var(--text-primary)] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
          >
            <span className="material-symbols-outlined text-lg">chevron_left</span>
          </button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={`min-w-[32px] h-8 rounded-lg text-xs font-semibold transition-all duration-200 ${
                page === currentPage
                  ? 'bg-[var(--primary)] text-white shadow-md'
                  : 'text-[var(--text-secondary)] hover:bg-white'
              }`}
            >
              {page}
            </button>
          ))}
          <button
            disabled={currentPage >= totalPages}
            className="p-1.5 rounded-lg text-[var(--text-tertiary)] hover:bg-white hover:text-[var(--text-primary)] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
          >
            <span className="material-symbols-outlined text-lg">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  );
}
