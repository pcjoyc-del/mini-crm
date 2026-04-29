type PaginationControlsProps = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (nextPage: number) => void;
};

export function PaginationControls({ page, pageSize, total, onPageChange }: PaginationControlsProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[#E3D8C8] bg-white p-4 text-sm text-[#4D443B] md:flex-row md:items-center md:justify-between">
      <p>
        Total <span className="font-semibold text-[#2E2E2E]">{total}</span> leads
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="min-h-11 rounded-xl border border-[#CDB89F] px-4 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </button>
        <span className="px-2">Page {page} / {totalPages}</span>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="min-h-11 rounded-xl border border-[#CDB89F] px-4 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
