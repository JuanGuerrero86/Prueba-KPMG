interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  return (
    <div className="flex items-center gap-3 justify-end py-3">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="px-3 py-1 rounded border disabled:opacity-40 hover:bg-gray-50"
      >
        Anterior
      </button>
      <span className="text-sm text-gray-600">Página {page} de {totalPages}</span>
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="px-3 py-1 rounded border disabled:opacity-40 hover:bg-gray-50"
      >
        Siguiente
      </button>
    </div>
  );
}
