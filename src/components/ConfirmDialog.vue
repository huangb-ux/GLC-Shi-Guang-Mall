<script setup>
import { resolveConfirm, ui } from '../stores/ui';
</script>

<template>
  <div v-if="ui.confirm" class="modal-backdrop" @click.self="resolveConfirm(false)">
    <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <h3 id="modal-title">{{ ui.confirm.title }}</h3>
      <p>{{ ui.confirm.text }}</p>
      <div class="modal-actions">
        <button class="btn btn-ghost" type="button" data-modal-cancel @click="resolveConfirm(false)">再想想</button>
        <button
          class="btn"
          :class="ui.confirm.danger ? 'btn-danger' : 'btn-primary'"
          type="button"
          data-modal-confirm
          @click="resolveConfirm(true)"
        >
          {{ ui.confirm.confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>
