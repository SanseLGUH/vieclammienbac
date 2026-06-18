export default defineNuxtRouteMiddleware(async () => {
  const { public: { apiBase } } = useRuntimeConfig();
  const headers = useRequestHeaders(['cookie']);

  try {
    await $fetch(`${apiBase}/auth/validate`, {
      credentials: 'include',
      headers,
    });
  } catch {
    return navigateTo('/login');
  }
});