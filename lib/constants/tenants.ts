export type TenantOption = {
  description: string;
  label: string;
  value: string;
};

export const tenantOptions: TenantOption[] = [
  { description: 'npx create-next-app', label: 'Next.js', value: 'next' },
  { description: 'npm create vite@latest', label: 'Vite', value: 'vite' },
  { description: 'npm create astro@latest', label: 'Astro', value: 'astro' },
  { description: 'npx create-remix', label: 'Remix', value: 'remix' },
];

export const defaultTenant = tenantOptions[0];
