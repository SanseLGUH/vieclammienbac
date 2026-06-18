<template>
  <div class="brand-side">
    <div class="brand-inner">
      <h1 class="brand-name">ViecLamMienBac</h1>
      <p class="brand-tagline">
        "Tương lai thuộc về những ai tin vào vẻ đẹp của ước mơ. Thành công không phải là thứ được ban tặng — nó được tạo ra bởi sự chăm chỉ, cống hiến và lòng dũng cảm để tiếp tục tiến bước dù con đường phía trước còn nhiều gian nan. Mọi sự nghiệp vĩ đại đều bắt đầu từ một bước nhỏ, một quyết định dám thử. Dù bạn xuất phát từ đâu, dù hôm nay bạn đang đứng ở đâu, cơ hội luôn nằm trong tầm tay của những người sẵn sàng nỗ lực. Tài năng của bạn là hạt giống, nhưng chính sự cố gắng mới là nguồn nước nuôi dưỡng nó lớn lên. Đừng chờ đợi thời điểm hoàn hảo — hãy tự tạo ra nó. Miền Bắc đầy ắp cơ hội, và vị trí của bạn đang chờ đợi bạn."
        — Lấy cảm hứng từ Winston Churchill
      </p>


</div>
</div>
</template>

<style scoped>
    .brand-side {
      flex: 1;
      min-width: 300px;
      display: flex;
      align-items: center;
      padding: 48px;
      position: relative;
  }

  .brand-inner {
      max-width: 420px;
  }

  .brand-name {
      font-family: 'Bungee', cursive;
      font-size: clamp(2rem, 3.5vw, 2.8rem);
      color: #fff;
      line-height: 1.1;
      margin-bottom: 16px;
      animation: fadeUp 0.7s ease 0.05s both;
  }

  .brand-tagline {
      font-size: 1rem;
      color: rgba(255,255,255,0.72);
      line-height: 1.7;
      margin-bottom: 48px;
      font-weight: 300;
      animation: fadeUp 0.7s ease 0.1s both;
  }

  .brand-stats {
      display: flex;
      align-items: center;
      gap: 24px;
      animation: fadeUp 0.7s ease 0.15s both;
  }

  .stat {
      display: flex;
      flex-direction: column;
      gap: 4px;
  }

  .stat-num {
      font-family: 'Bungee', cursive;
      font-size: 1.5rem;
      color: #fff;
  }

  .stat-label {
      font-size: 0.75rem;
      color: rgba(255,255,255,0.6);
      font-weight: 400;
      letter-spacing: 0.02em;
  }

  .stat-divider {
      width: 1px;
      height: 36px;
      background: rgba(255,255,255,0.25);
  }

  @keyframes fadeUp {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
  }

  @media (max-width: 960px) {
      .brand-side {
        flex: unset;
        min-width: unset;
        padding: 28px 24px 20px;
        justify-content: center;
        text-align: center;
    }
    .brand-stats { justify-content: center; }
    .brand-inner { max-width: 100%; }
    .brand-tagline { margin-bottom: 20px; }
}

@media (max-width: 480px) {
  .brand-side { padding: 20px 20px 16px; }
  .brand-name { font-size: 1.5rem; margin-bottom: 8px; }
  .brand-tagline { font-size: 0.85rem; margin-bottom: 16px; }
  .stat-num { font-size: 1.1rem; }
  .stat-label { font-size: 0.7rem; }
  .brand-stats { gap: 16px; }
  .stat-divider { height: 28px; }
}
</style>