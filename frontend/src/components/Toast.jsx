import { useEffect } from 'react';

export default function Toast({ message, type = 'info', onClose }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => onClose && onClose(), 3000);
    return () => clearTimeout(t);
  }, [message]);

  if (!message) return null;

  const base = 'px-4 py-2 rounded shadow text-sm font-medium';
  const color = type === 'success' ? 'bg-green-600 text-white' : type === 'error' ? 'bg-red-600 text-white' : 'bg-gray-800 text-white';

  return (
    <div className="fixed inset-x-4 bottom-6 z-50 flex justify-center">
      <div className={`${base} ${color} max-w-xl w-full text-center`}>{message}</div>
    </div>
  );
}
