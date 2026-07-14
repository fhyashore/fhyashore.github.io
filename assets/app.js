/* 这个文件负责站点的轻量交互，包括导航高亮和本地讨论区原型。 */

(function () {
  const storageKey = "snowball-community-posts";

  // 这个函数用于根据当前页面地址高亮导航。
  function setActiveNav() {
    const current = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll("[data-nav]").forEach((link) => {
      if (link.getAttribute("href") === current) {
        link.classList.add("active");
      }
    });
  }

  // 这个函数用于提供默认讨论数据，避免页面初次打开为空。
  function getSeedPosts() {
    return [
      {
        id: "seed-1",
        nickname: "市场观察者",
        title: "这个产品最容易被误解的地方是“高票息=稳拿收益”",
        category: "风险看法",
        content:
          "我觉得这个网站最有价值的部分应该是把净收益和毛收益分开讲。很多人只看票息，不看费用和触发条件，最后对产品的理解就会偏掉。",
        likes: 6,
        createdAt: "2026-07-14 09:10",
      },
      {
        id: "seed-2",
        nickname: "指数派",
        title: "如果市场持续震荡，这类结构反而比直接持有更容易被理解",
        category: "收益讨论",
        content:
          "对普通投资者来说，直接接受波动并不容易。如果网站能把“不同路径下的结果”讲清楚，反而更有助于大家做取舍。",
        likes: 3,
        createdAt: "2026-07-14 10:05",
      },
      {
        id: "seed-3",
        nickname: "产品新人",
        title: "建议首页就明确说明它不是存款替代品",
        category: "产品理解",
        content:
          "我第一次接触雪球类产品时，最怕的是页面只讲亮点不讲风险。把风险说在前面，反而更让我愿意继续看下去。",
        likes: 5,
        createdAt: "2026-07-14 11:22",
      },
    ];
  }

  // 这个函数用于读取当前浏览器里保存的讨论数据。
  function loadPosts() {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      const seeds = getSeedPosts();
      window.localStorage.setItem(storageKey, JSON.stringify(seeds));
      return seeds;
    }
    try {
      return JSON.parse(raw);
    } catch (error) {
      const seeds = getSeedPosts();
      window.localStorage.setItem(storageKey, JSON.stringify(seeds));
      return seeds;
    }
  }

  // 这个函数用于把最新讨论数据写回浏览器本地存储。
  function savePosts(posts) {
    window.localStorage.setItem(storageKey, JSON.stringify(posts));
  }

  // 这个函数用于生成单条帖子卡片。
  function renderPost(post) {
    return `
      <article class="forum-card reveal">
        <div class="forum-meta">
          <span class="forum-tag">${post.category}</span>
          <span>${post.nickname}</span>
          <span>${post.createdAt}</span>
        </div>
        <h3>${post.title}</h3>
        <p>${post.content}</p>
        <div class="forum-actions">
          <span class="micro-note">这是一版本地讨论原型，当前内容只保存在你打开网页的浏览器里。</span>
          <button class="mini-btn" data-like="${post.id}">赞同 ${post.likes}</button>
        </div>
      </article>
    `;
  }

  // 这个函数用于按分类渲染讨论列表。
  function renderCommunity(filter = "全部") {
    const container = document.querySelector("[data-post-list]");
    if (!container) {
      return;
    }

    const posts = loadPosts().sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
    const visiblePosts = filter === "全部" ? posts : posts.filter((post) => post.category === filter);

    if (visiblePosts.length === 0) {
      container.innerHTML = `
        <div class="note-card">
          <h3>当前分类还没有内容</h3>
          <p>你可以切换回“全部”，或者直接发起第一个观点。</p>
        </div>
      `;
      return;
    }

    container.innerHTML = visiblePosts.map(renderPost).join("");
  }

  // 这个函数用于新增帖子。
  function handleSubmit() {
    const form = document.querySelector("[data-community-form]");
    if (!form) {
      return;
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const nickname = form.querySelector("[name='nickname']").value.trim() || "匿名访客";
      const title = form.querySelector("[name='title']").value.trim();
      const category = form.querySelector("[name='category']").value;
      const content = form.querySelector("[name='content']").value.trim();

      if (!title || !content) {
        window.alert("请先写好标题和观点内容。");
        return;
      }

      const posts = loadPosts();
      posts.unshift({
        id: `post-${Date.now()}`,
        nickname,
        title,
        category,
        content,
        likes: 0,
        createdAt: new Date().toLocaleString("zh-CN", { hour12: false }),
      });

      savePosts(posts);
      form.reset();
      renderCommunity(getCurrentFilter());
    });
  }

  // 这个函数用于读取当前选中的分类。
  function getCurrentFilter() {
    const active = document.querySelector(".filter-chip.active");
    return active ? active.dataset.filter : "全部";
  }

  // 这个函数用于处理分类筛选。
  function handleFilters() {
    const chips = document.querySelectorAll(".filter-chip");
    if (!chips.length) {
      return;
    }

    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        chips.forEach((item) => item.classList.remove("active"));
        chip.classList.add("active");
        renderCommunity(chip.dataset.filter);
      });
    });
  }

  // 这个函数用于处理点赞操作。
  function handleLikes() {
    document.addEventListener("click", (event) => {
      const button = event.target.closest("[data-like]");
      if (!button) {
        return;
      }

      const posts = loadPosts();
      const target = posts.find((post) => post.id === button.dataset.like);
      if (!target) {
        return;
      }

      target.likes += 1;
      savePosts(posts);
      renderCommunity(getCurrentFilter());
    });
  }

  setActiveNav();
  handleSubmit();
  handleFilters();
  handleLikes();
  renderCommunity();
})();
