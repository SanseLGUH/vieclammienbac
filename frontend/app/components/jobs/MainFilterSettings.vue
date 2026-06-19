<template>

  <RollContainer
    height="500px"
    header-height="50px"
    border-radius="12px"
    :breakpoint="960"
    style="margin-top: 20px;"
  >
    <template #header>
      <span style="padding-left: 16px;">Tiền lương</span>
    </template>
  </RollContainer>


  <RollContainer
    height="500px"
    header-height="50px"
    border-radius="12px"
    :breakpoint="960"
    style="margin-top: 20px; margin-bottom: 20px;"
  >
    <template #header>
      <span style="padding-left: 16px;">Loại</span>
    </template>
  </RollContainer>
</template>