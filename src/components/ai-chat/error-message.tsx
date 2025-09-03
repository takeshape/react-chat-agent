import type { MouseEventHandler, ReactNode } from 'react';

export function ErrorMessage({
  children,
  retry
}: {
  children: ReactNode;
  retry?: MouseEventHandler;
}) {
  return (
    <div className={`mx-auto px-4 mb-4 max-w-2xl text-red-600`}>
      {children}
      {retry && (
        <button
          type="button"
          className="ml-2 text-blue-600 hover:underline cursor-pointer"
          onClick={retry}
        >
          Retry
        </button>
      )}
    </div>
  );
}
