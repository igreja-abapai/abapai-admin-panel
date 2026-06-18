<template>
  <div
    :style="wrapperStyle"
    :class="[
      'shrink-0 overflow-hidden flex items-center justify-center font-semibold text-white',
      roundedClass,
      sizeClass,
      !photoUrl && getMemberAvatarColor(name),
      wrapperClass,
    ]"
  >
    <img
      v-if="photoUrl"
      :src="imageSrc"
      :alt="`Foto de ${name}`"
      class="h-full w-full object-cover"
    />
    <span v-else class="select-none">{{ getMemberInitials(name) }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getMemberAvatarColor, getMemberInitials } from '@/utils/memberAvatar'
import { getImageUrl } from '@/utils/imageUrl'

const props = withDefaults(
  defineProps<{
    name: string
    photoUrl?: string | null
    size?: '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'profile'
    rounded?: 'full' | 'lg'
    wrapperClass?: string
    wrapperStyle?: Record<string, string | number>
  }>(),
  {
    photoUrl: undefined,
    size: 'md',
    rounded: 'full',
    wrapperClass: '',
    wrapperStyle: undefined,
  },
)

const sizeClass = computed(() => {
  const sizes = {
    '2xs': 'h-7 w-7 text-[10px]',
    xs: 'h-8 w-8 text-xs',
    sm: 'h-9 w-9 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-sm',
    xl: 'h-16 w-16 text-base',
    profile: 'w-24 h-28 text-xl',
  }

  return sizes[props.size]
})

const roundedClass = computed(() => (props.rounded === 'lg' ? 'rounded-lg' : 'rounded-full'))

const imageSrc = computed(() => getImageUrl(props.photoUrl || undefined))
</script>
