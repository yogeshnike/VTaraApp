// Basic table components - you might want to enhance these
export const Table = ({ children }: { children: React.ReactNode }) => (
    <table className="min-w-full divide-y divide-gray-200">{children}</table>
  );
  
  export const TableHeader = ({ children }: { children: React.ReactNode }) => (
    <thead className="bg-gray-50">{children}</thead>
  );
  
  export const TableBody = ({ children }: { children: React.ReactNode }) => (
    <tbody className="bg-white divide-y divide-gray-200">{children}</tbody>
  );
  
  export const TableRow = ({ children }: { children: React.ReactNode }) => (
    <tr>{children}</tr>
  );
  
  export const TableHead = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <th className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${className}`}>
      {children}
    </th>
  );
  
  export const TableCell = ({ children }: { children: React.ReactNode }) => (
    <td className="px-6 py-4 whitespace-nowrap">{children}</td>
  );