import React from 'react';

interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
}

export function Table<T extends { id: string }>({ columns, data, onRowClick, emptyMessage = 'No hay datos' }: TableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b">
            {columns.map((col, i) => (
              <th key={i} className="px-4 py-3 text-left font-medium text-gray-600">{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr><td colSpan={columns.length} className="px-4 py-8 text-center text-gray-400">{emptyMessage}</td></tr>
          ) : (
            data.map((row) => (
              <tr key={row.id} onClick={() => onRowClick?.(row)} className={`border-b hover:bg-gray-50 ${onRowClick ? 'cursor-pointer' : ''}`}>
                {columns.map((col, i) => (
                  <td key={i} className="px-4 py-3">
                    {typeof col.accessor === 'function' ? col.accessor(row) : String(row[col.accessor] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
