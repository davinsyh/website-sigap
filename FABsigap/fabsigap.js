// FAB SIAPI - Direct Chat Button

(function () {
  "use strict";

  function createFABButton() {
    const fabContainer = document.createElement("div");
    fabContainer.id = "fab-sigap-container";
    fabContainer.className = "fab-sigap-container";
    fabContainer.innerHTML = `
      <button class="fab-main" id="fab-main-btn" aria-label="Chat dengan TemanKu">
        <i class="fas fa-comments fab-icon"></i>
      </button>
      <span class="fab-tooltip">Chat TemanKu</span>
    `;
    document.body.appendChild(fabContainer);
  }

  function initEventListeners() {
    const mainBtn = document.getElementById("fab-main-btn");
    if (!mainBtn) return;

    mainBtn.addEventListener("click", function () {
      if (window.TemanKuChatbot && window.TemanKuChatbot.open) {
        window.TemanKuChatbot.open();
      }
    });
  }

  function init() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", function () {
        createFABButton();
        initEventListeners();
      });
    } else {
      createFABButton();
      initEventListeners();
    }
  }

  init();

  window.FABSigap = {
    open: function () {
      if (window.TemanKuChatbot && window.TemanKuChatbot.open) {
        window.TemanKuChatbot.open();
      }
    },
  };
})();
