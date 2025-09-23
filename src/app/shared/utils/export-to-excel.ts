import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

/**
 * exportToExcel
 *
 * Exports an array of objects (`data`) to an Excel file (.xlsx).
 * Allows customization of displayed columns and headers using `displayedColumns` and `headerMapping`.
 *
 * Uses:
 * - `xlsx` for sheet generation
 * - `file-saver` to trigger download
 *
 * @template T Type of data in the array
 * @param data - The data array to be exported
 * @param displayedColumns - Keys to be exported from each object (and order of columns)
 * @param headerMapping - Optional mapping of column keys to human-readable headers
 * @param fileName - Optional name for the exported Excel file (default: "report.xlsx")
 */
export function exportToExcel<T>(
  data: T[],
  displayedColumns: string[],
  headerMapping: { [key: string]: string } = {},
  fileName: string = 'report.xlsx'
): void {
  const formattedData = data.map((item) => {
    const ordered: any = {};
    displayedColumns.forEach((col) => {
      ordered[headerMapping[col] || toTitleCase(col)] = (item as any)[col] ?? '';
    });
    return ordered;
  });

  const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(formattedData);
  const workbook: XLSX.WorkBook = {
    Sheets: { data: worksheet },
    SheetNames: ['data'],
  };

  const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
  saveAs(blob, fileName);
}

function toTitleCase(text: string): string {
  return text
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .trim();
}
