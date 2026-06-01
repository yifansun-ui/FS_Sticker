/* ============================================================
   LPコメント機能 - クライアント側（シンプル版）
   index.htmlの</body>直前に追加: <script src="comments.js"></script>
   ============================================================ */

(function () {
  const STORAGE_KEY = "lp-comments-v1";

  // ====== localStorage 操作 ======
  function loadAll() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch (e) {
      return {};
    }
  }

  function saveAll(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new Event("lp-comments-updated"));
  }

  function addComment(c) {
    const all = loadAll();
    const id = "c" + Date.now() + Math.floor(Math.random() * 10000);
    all[id] = {
      ...c,
      id: id,
      createdAt: Date.now()
    };
    saveAll(all);
    return id;
  }

  function removeComment(id) {
    const all = loadAll();
    delete all[id];
    saveAll(all);
  }

  // ====== 投稿済みコメント読み込み ======
  let postedComments = [];
  fetch("comments-posted.json")
    .then(r => r.ok ? r.json() : [])
    .catch(e => [])
    .then(data => {
      postedComments = Array.isArray(data) ? data : [];
      render();
    });

  // ====== スタイル ======
  function injectStyles() {
    const css = `
      #lp-comments-toolbar {
        position: fixed; top: 16px; right: 16px; z-index: 999999;
        background: #fff; border: 1px solid #ccc; border-radius: 12px;
        padding: 12px 14px; box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        font-size: 13px; display: flex; gap: 8px; align-items: center;
        color: #111; flex-wrap: wrap;
      }
      #lp-comments-toolbar button {
        background: #0066cc; color: #fff; border: none; padding: 7px 14px;
        border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 500;
        transition: background 0.2s; white-space: nowrap;
      }
      #lp-comments-toolbar button:hover { background: #0052a3; }
      #lp-comments-toolbar button.active { background: #dc2626; }
      #lp-comments-toolbar button.secondary { background: #6b7280; }
      #lp-comments-toolbar button.secondary:hover { background: #4b5563; }
      #lp-comments-toolbar input {
        border: 1px solid #ccc; border-radius: 6px;
        padding: 6px 10px; font-size: 13px; width: 100px;
        color: #111; background: #fff;
      }
      #lp-comments-toolbar .count {
        color: #666; font-size: 12px; font-weight: 500;
      }
      
      body.lp-comments-mode-on, body.lp-comments-mode-on * { cursor: crosshair !important; }
      
      .lp-comment-pin {
        position: absolute; width: 32px; height: 32px;
        background: #dc2626; color: #fff; border-radius: 50% 50% 50% 0;
        transform: translate(-50%, -100%) rotate(-45deg);
        display: flex; align-items: center; justify-content: center;
        font-weight: bold; font-size: 13px; cursor: pointer;
        box-shadow: 0 3px 8px rgba(0,0,0,0.3); z-index: 99998;
        font-family: -apple-system, sans-serif; transition: all 0.2s;
      }
      .lp-comment-pin:hover { transform: translate(-50%, -100%) rotate(-45deg) scale(1.1); }
      .lp-comment-pin span { transform: rotate(45deg); display: block; }
      .lp-comment-pin.posted { background: #16a34a; }
      
      .lp-comment-popup {
        position: absolute; min-width: 280px; max-width: 340px;
        background: #fff; border: 1px solid #ddd; border-radius: 10px;
        padding: 14px; box-shadow: 0 6px 28px rgba(0,0,0,0.2);
        z-index: 99999; font-family: -apple-system, sans-serif;
        font-size: 13px; color: #111;
      }
      .lp-comment-popup .cr-meta { font-size: 11px; color: #999; margin-bottom: 8px; }
      .lp-comment-popup .cr-body { margin-bottom: 10px; white-space: pre-wrap; word-break: break-word; line-height: 1.5; }
      .lp-comment-popup .cr-actions { display: flex; gap: 6px; justify-content: flex-end; margin-top: 10px; }
      .lp-comment-popup button { background: #0066cc; color: #fff; border: none; padding: 5px 12px; border-radius: 5px; cursor: pointer; font-size: 12px; }
      .lp-comment-popup button:hover { background: #0052a3; }
      .lp-comment-popup button.close { background: #999; }
      .lp-comment-popup button.close:hover { background: #666; }
      .lp-comment-popup button.delete { background: #dc2626; }
      .lp-comment-popup button.delete:hover { background: #b91c1c; }
      .lp-comment-popup .status { background: #f0fdf4; border: 1px solid #86efac; border-radius: 4px; padding: 6px 8px; margin-bottom: 8px; font-size: 12px; color: #166534; }
    `;
    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
  }

  // ====== UI 初期化 ======
  function setupUI() {
    injectStyles();

    const savedName = localStorage.getItem("lp-comments-name") || "";

    const toolbar = document.createElement("div");
    toolbar.id = "lp-comments-toolbar";
    toolbar.innerHTML = `
      <input id="lp-comments-name" type="text" placeholder="名前（省略可）" value="${escapeHTML(savedName)}" />
      <button id="lp-comments-toggle">💬 コメント</button>
      <button id="lp-comments-download" class="secondary">📥 送信</button>
      <button id="lp-comments-hide" class="secondary">👁 表示</button>
      <span class="count" id="lp-comments-count">0件</span>
    `;
    document.body.appendChild(toolbar);

    const toggleBtn = document.getElementById("lp-comments-toggle");
    const downloadBtn = document.getElementById("lp-comments-download");
    const hideBtn = document.getElementById("lp-comments-hide");
    const nameInput = document.getElementById("lp-comments-name");
    const countEl = document.getElementById("lp-comments-count");

    nameInput.addEventListener("input", (e) => {
      localStorage.setItem("lp-comments-name", e.target.value);
    });

    let placingMode = false;
    let pinsVisible = true;

    toggleBtn.addEventListener("click", () => {
      placingMode = !placingMode;
      document.body.classList.toggle("lp-comments-mode-on", placingMode);
      toggleBtn.classList.toggle("active", placingMode);
      toggleBtn.textContent = placingMode ? "✕ キャンセル" : "💬 コメント";
    });

    downloadBtn.addEventListener("click", () => {
      const all = loadAll();
      const unsent = Object.values(all);
      if (!unsent.length) {
        alert("コメントがありません");
        return;
      }

      const json = unsent.map(c => ({
        name: c.name || "匿名",
        text: c.text,
        x: c.x,
        y: c.y,
        url: c.url,
        createdAt: c.createdAt
      }));

      const blob = new Blob([JSON.stringify(json, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "lp-feedback.json";
      a.click();
      URL.revokeObjectURL(url);

      alert("lp-feedback.json をダウンロードしました。\nGitHub にアップロードしてください。");
    });

    hideBtn.addEventListener("click", () => {
      pinsVisible = !pinsVisible;
      const display = pinsVisible ? "" : "none";
      document.querySelectorAll(".lp-comment-pin, .lp-comment-popup").forEach(el => {
        el.style.display = display;
      });
      hideBtn.textContent = pinsVisible ? "👁 表示" : "🙈 非表示";
    });

    // クリックでピン配置
    document.addEventListener("click", (e) => {
      if (!placingMode) return;
      if (e.target.closest("#lp-comments-toolbar")) return;
      if (e.target.closest(".lp-comment-pin")) return;
      if (e.target.closest(".lp-comment-popup")) return;

      e.preventDefault();
      e.stopPropagation();

      const text = prompt("コメント内容を入力してください:");
      
      placingMode = false;
      document.body.classList.remove("lp-comments-mode-on");
      toggleBtn.classList.remove("active");
      toggleBtn.textContent = "💬 コメント";

      if (!text || !text.trim()) return;

      const docHeight = document.documentElement.scrollHeight;
      const docWidth = document.documentElement.scrollWidth;
      const xPercent = (e.pageX / docWidth) * 100;
      const yPercent = (e.pageY / docHeight) * 100;

      addComment({
        x: xPercent,
        y: yPercent,
        text: text.trim(),
        name: nameInput.value.trim() || "匿名",
        url: location.pathname + location.search
      });
    }, true);

    // リアルタイム描画
    function render() {
      document.querySelectorAll(".lp-comment-pin, .lp-comment-popup").forEach(el => el.remove());
      const all = loadAll();
      const entries = Object.entries(all).sort((a, b) => a[1].createdAt - b[1].createdAt);
      countEl.textContent = `${entries.length}件`;

      const docHeight = document.documentElement.scrollHeight;
      const docWidth = document.documentElement.scrollWidth;

      entries.forEach(([id, c], i) => {
        const pin = document.createElement("div");
        pin.className = "lp-comment-pin";
        pin.style.left = ((c.x / 100) * docWidth) + "px";
        pin.style.top = ((c.y / 100) * docHeight) + "px";
        pin.innerHTML = `<span>${i + 1}</span>`;
        pin.addEventListener("click", (e) => {
          e.stopPropagation();
          showPopup(pin, id, c);
        });
        document.body.appendChild(pin);
      });

      // 投稿済みコメント
      postedComments.forEach(({ x, y, text, name, createdAt }) => {
        const pin = document.createElement("div");
        pin.className = "lp-comment-pin posted";
        pin.style.left = ((x / 100) * docWidth) + "px";
        pin.style.top = ((y / 100) * docHeight) + "px";
        pin.innerHTML = `<span>✓</span>`;
        pin.addEventListener("click", (e) => {
          e.stopPropagation();
          showPopup(pin, null, { text, name, createdAt }, false);
        });
        document.body.appendChild(pin);
      });
    }

    function showPopup(pin, id, data, canDelete) {
      document.querySelectorAll(".lp-comment-popup").forEach(p => p.remove());

      const popup = document.createElement("div");
      popup.className = "lp-comment-popup";

      const left = parseFloat(pin.style.left);
      const top = parseFloat(pin.style.top);
      popup.style.left = (left + 25) + "px";
      popup.style.top = (top + 5) + "px";

      const date = new Date(data.createdAt).toLocaleString("ja-JP");
      const statusHtml = !canDelete
        ? `<div class="status">✓ GitHub に投稿済み</div>`
        : `<div class="status">⏳ 未送信</div>`;

      const actions = canDelete
        ? `<button class="close" data-act="close">閉じる</button>
           <button class="delete" data-act="delete">削除</button>`
        : `<button class="close" data-act="close">閉じる</button>`;

      popup.innerHTML = `
        ${statusHtml}
        <div class="cr-meta">${escapeHTML(data.name || "匿名")} ・ ${date}</div>
        <div class="cr-body">${escapeHTML(data.text)}</div>
        <div class="cr-actions">
          ${actions}
        </div>
      `;
      document.body.appendChild(popup);

      popup.querySelector('[data-act="close"]').onclick = () => popup.remove();
      if (canDelete) {
        popup.querySelector('[data-act="delete"]').onclick = () => {
          if (confirm("このコメントを削除しますか？")) {
            removeComment(id);
          }
        };
      }

      const rect = popup.getBoundingClientRect();
      if (rect.right > window.innerWidth) {
        popup.style.left = (left - rect.width - 25) + "px";
      }
      if (rect.bottom > window.innerHeight) {
        popup.style.top = (top - rect.height - 25) + "px";
      }
    }

    window.addEventListener("lp-comments-updated", render);
    window.addEventListener("storage", (e) => {
      if (e.key === STORAGE_KEY) render();
    });

    render();
  }

  function escapeHTML(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // ====== 初期化 ======
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupUI);
  } else {
    setupUI();
  }
})();
