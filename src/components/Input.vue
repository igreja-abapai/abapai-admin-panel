<template>
  <input
    ref="inputRef"
    :type="type"
    :value="modelValue ?? ''"
    :class="inputClasses"
    v-bind="$attrs"
    @input="handleInput"
    @focus="handleFocus"
    @blur="handleBlur"
  />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

const paddingMap = {
  tight: 'py-2',
  normal: 'py-2.5',
  relaxed: 'py-3',
} as const;

type PaddingKey = keyof typeof paddingMap;

const props = withDefaults(
  defineProps<{
    modelValue: string | number | null | undefined;
    type?: string;
    padding?: PaddingKey;
    inputClass?: string;
  }>(),
  {
    type: 'text',
    padding: 'normal',
    inputClass: '',
  },
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number | null | undefined): void;
  (e: 'input', event: Event): void;
  (e: 'focus', event: FocusEvent): void;
  (e: 'blur', event: FocusEvent): void;
}>();

const baseClasses =
  'w-full px-3 border focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10 rounded-[5px] text-sm text-gray-800 bg-white transition-colors disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed disabled:opacity-75 placeholder:gray-500';

const paddingClass = computed(() => paddingMap[props.padding] ?? paddingMap.normal);

const inputClasses = computed(() =>
  [baseClasses, paddingClass.value, props.inputClass].join(' ').trim(),
);

const inputRef = ref<HTMLInputElement | null>(null);

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit('update:modelValue', target.value);
  emit('input', event);
};

const handleFocus = (event: FocusEvent) => emit('focus', event);
const handleBlur = (event: FocusEvent) => emit('blur', event);

// Expose the input element for parent components
defineExpose({
  inputElement: inputRef,
  focus: () => inputRef.value?.focus(),
});
</script>
