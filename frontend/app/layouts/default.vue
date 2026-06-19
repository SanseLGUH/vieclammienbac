<template>

  <div class="layout">
    <AppNavbar />
    <main class="layout__main">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>

<style scoped>
	.layout {
	  display: flex;
	  flex-direction: column;
	  min-height: 100vh;
	}

	.layout__main {
	  flex: 1;
	  padding-top: var(--nav-height); /* Отступ под фиксированный навбар */
	}
</style>
