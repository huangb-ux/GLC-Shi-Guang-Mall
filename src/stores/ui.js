import { reactive } from 'vue';

export const ui = reactive({
  toasts: [],
  confirm: null,
  chatItemId: null,
  chatPrefill: '',
  filtersOpen: false
});

let confirmResolver = null;
let toastSeed = 0;

export function toast(message) {
  const id = ++toastSeed;
  ui.toasts.push({ id, message });
  window.setTimeout(() => {
    ui.toasts = ui.toasts.filter(item => item.id !== id);
  }, 2600);
}

export function confirmAction(options) {
  ui.confirm = {
    title: options.title || '确认操作',
    text: options.text || '',
    confirmText: options.confirmText || '确认',
    danger: options.danger !== false
  };
  return new Promise(resolve => {
    confirmResolver = resolve;
  });
}

export function resolveConfirm(value) {
  const resolver = confirmResolver;
  confirmResolver = null;
  ui.confirm = null;
  if (resolver) resolver(value);
}

export function openChat(itemId, prefill = '') {
  ui.chatItemId = itemId;
  ui.chatPrefill = prefill;
}

export function closeChat() {
  ui.chatItemId = null;
  ui.chatPrefill = '';
}
