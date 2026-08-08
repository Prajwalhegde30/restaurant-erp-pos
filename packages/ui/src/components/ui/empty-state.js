import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
import { Button } from './button';
export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }) {
  return _jsxs('div', {
    className:
      'flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-zinc-950 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 h-full min-h-[300px]',
    children: [
      _jsx('div', {
        className:
          'w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mb-6 shadow-sm',
        children: _jsx(Icon, { className: 'w-8 h-8 text-zinc-400 dark:text-zinc-500' }),
      }),
      _jsx('h3', {
        className: 'text-lg font-semibold text-zinc-950 dark:text-zinc-50 tracking-tight',
        children: title,
      }),
      _jsx('p', {
        className: 'text-sm text-zinc-500 dark:text-zinc-400 mt-2 max-w-sm',
        children: description,
      }),
      actionLabel &&
        onAction &&
        _jsx(Button, { onClick: onAction, className: 'mt-6 shadow-sm', children: actionLabel }),
    ],
  });
}
