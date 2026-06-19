class FooterWidget extends HTMLElement {
  connectedCallback() {
    this.render();
  }

  render() {
    this.innerHTML = `
      <footer class="site-footer" style="height: 40px; width: 100%; background-color: #0d1b4b">
      </footer>
    `;
  }
}

customElements.define('vmb-mini-footer', FooterWidget);