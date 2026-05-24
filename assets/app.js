(function () {
  // ── Loading gate ──────────────────────────────────────────────────────────
  const gate = document.getElementById('security-gate');
  const bar = document.getElementById('security-progress-bar');
  const status = document.getElementById('security-status');
  const substatus = document.getElementById('security-substatus');

  const stages = [
    ['Checking page integrity...', 'Loading support content.', '38%'],
    ['Preparing known fixes...', 'No account data is requested on this page.', '68%'],
    ['Ready', 'Opening known issues.', '100%']
  ];
  let i = 0;
  const tick = window.setInterval(function () {
    const stage = stages[i++];
    if (!stage) {
      window.clearInterval(tick);
      if (gate) gate.classList.add('hidden');
      document.body.classList.remove('security-lock');
      return;
    }
    if (status) status.textContent = stage[0];
    if (substatus) substatus.textContent = stage[1];
    if (bar) bar.style.width = stage[2];
  }, 360);

  // ── Search + filter ───────────────────────────────────────────────────────
  const search = document.getElementById('issue-search');
  const cards = Array.from(document.querySelectorAll('.issue-card'));
  const chips = Array.from(document.querySelectorAll('.chip'));
  const countEl = document.getElementById('search-count');
  const noResultsEl = document.getElementById('no-results');

  let activeFilter = 'all';
  let activeQuery = '';

  // Card categories may contain multiple space-separated values (e.g. "install security").
  function cardMatchesFilter(card, filter) {
    if (filter === 'all') return true;
    const cats = (card.dataset.category || '').split(/\s+/).filter(Boolean);
    return cats.indexOf(filter) !== -1;
  }

  function cardMatchesQuery(card, query) {
    if (!query) return true;
    const haystack = (card.textContent + ' ' + (card.dataset.keywords || '')).toLowerCase();
    // Multi-word: every word must appear somewhere (AND search).
    const words = query.split(/\s+/).filter(Boolean);
    for (const w of words) {
      if (haystack.indexOf(w) === -1) return false;
    }
    return true;
  }

  function applyFilters() {
    let visible = 0;
    cards.forEach(function (card) {
      const show = cardMatchesFilter(card, activeFilter) && cardMatchesQuery(card, activeQuery);
      card.classList.toggle('hidden', !show);
      if (show) visible++;
    });
    if (countEl) {
      if (activeQuery || activeFilter !== 'all') {
        countEl.textContent = visible + ' of ' + cards.length + ' shown';
      } else {
        countEl.textContent = '';
      }
    }
    if (noResultsEl) noResultsEl.hidden = visible > 0;
  }

  if (search) {
    search.addEventListener('input', function () {
      activeQuery = search.value.trim().toLowerCase();
      applyFilters();
    });
  }

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      chips.forEach(function (c) {
        c.classList.remove('active');
        c.setAttribute('aria-selected', 'false');
      });
      chip.classList.add('active');
      chip.setAttribute('aria-selected', 'true');
      activeFilter = chip.dataset.filter || 'all';
      applyFilters();
    });
  });

  // ── Copy buttons ──────────────────────────────────────────────────────────
  document.querySelectorAll('.copy-btn').forEach(function (button) {
    button.addEventListener('click', async function () {
      const text = button.getAttribute('data-copy') || '';
      try {
        await navigator.clipboard.writeText(text);
        const old = button.textContent;
        button.textContent = 'Copied';
        window.setTimeout(function () { button.textContent = old; }, 1200);
      } catch {
        button.textContent = 'Select text';
      }
    });
  });
}());
