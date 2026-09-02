document.addEventListener('DOMContentLoaded', () => {
  if (!window.KNOWLEDGE_DATA) return;

  const gridContainer = document.getElementById('knowledge-grid');
  const searchInput = document.getElementById('knowledge-search');
  const filtersContainer = document.getElementById('knowledge-filters');
  const emptyState = document.getElementById('knowledge-empty');

  if (!gridContainer) return;

  // Render Knowledge Cards
  const renderCards = () => {
    gridContainer.innerHTML = '';
    
    window.KNOWLEDGE_DATA.forEach(item => {
      const card = document.createElement('div');
      card.className = 'knowledge-card';
      card.setAttribute('data-category', item.category);
      card.setAttribute('data-id', item.id);
      
      card.innerHTML = `
        <div class="knowledge-card-header">
          <div class="knowledge-card-icon"><i class="${item.icon}"></i></div>
          <div class="knowledge-card-info">
            <h3>${item.title}</h3>
            <p>${item.summary}</p>
          </div>
          <div class="knowledge-card-toggle">
            <i class="ri-arrow-down-s-line"></i>
          </div>
        </div>
        <div class="knowledge-card-body">
          <div class="knowledge-card-content">
            ${item.content}
          </div>
        </div>
      `;
      
      gridContainer.appendChild(card);
    });
    
    attachInteractions();
    highlightCodeBlocks();
  };

  // Attach Expand/Collapse Interactions
  const attachInteractions = () => {
    const headers = gridContainer.querySelectorAll('.knowledge-card-header');
    
    headers.forEach(header => {
      header.addEventListener('click', () => {
        const card = header.closest('.knowledge-card');
        const body = card.querySelector('.knowledge-card-body');
        const isExpanded = card.classList.contains('expanded');
        
        // Accordion behavior (optional: close others)
        // gridContainer.querySelectorAll('.knowledge-card.expanded').forEach(expandedCard => {
        //   if (expandedCard !== card) {
        //     expandedCard.classList.remove('expanded');
        //     expandedCard.querySelector('.knowledge-card-body').style.maxHeight = '0px';
        //   }
        // });
        
        if (isExpanded) {
          card.classList.remove('expanded');
          body.style.maxHeight = '0px';
        } else {
          card.classList.add('expanded');
          body.style.maxHeight = body.scrollHeight + 'px';
        }
      });
    });
  };

  // Search and Filter Logic
  const stripHtml = (html) => {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const applyFilters = () => {
    const query = (searchInput ? searchInput.value.toLowerCase() : '');
    let activeCategory = 'all';
    
    if (filtersContainer) {
      const activeBtn = filtersContainer.querySelector('.active');
      if (activeBtn) {
        activeCategory = activeBtn.getAttribute('data-filter') || 'all';
      }
    }
    
    let visibleCount = 0;
    const cards = gridContainer.querySelectorAll('.knowledge-card');
    
    cards.forEach(card => {
      const category = card.getAttribute('data-category');
      const id = card.getAttribute('data-id');
      const itemData = window.KNOWLEDGE_DATA.find(k => k.id === id);
      
      let matchesCategory = (activeCategory === 'all' || category === activeCategory);
      let matchesSearch = true;
      
      if (query && itemData) {
        const titleStr = itemData.title.toLowerCase();
        const summaryStr = itemData.summary.toLowerCase();
        const contentStr = stripHtml(itemData.content).toLowerCase();
        
        matchesSearch = titleStr.includes(query) || 
                        summaryStr.includes(query) || 
                        contentStr.includes(query);
      }
      
      if (matchesCategory && matchesSearch) {
        card.style.display = 'block';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });
    
    if (emptyState) {
      emptyState.style.display = visibleCount === 0 ? 'block' : 'none';
    }
  };

  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }

  if (filtersContainer) {
    const filterButtons = filtersContainer.querySelectorAll('button');
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        applyFilters();
      });
    });
  }

  // Simple Regex-based Code Block Highlighting
  const highlightCodeBlocks = () => {
    const codeBlocks = gridContainer.querySelectorAll('pre code');
    
    codeBlocks.forEach(block => {
      let html = block.innerHTML;
      
      // SQL Keywords (very basic subset)
      const sqlKeywords = ['SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'ON', 'GROUP BY', 'HAVING', 'ORDER BY', 'ASC', 'DESC', 'LIMIT', 'AS', 'AND', 'OR', 'NOT', 'IN', 'IS NULL', 'IS NOT NULL', 'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'CREATE', 'TABLE', 'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'DROP'];
      const keywordRegex = new RegExp(`\\b(${sqlKeywords.join('|')})\\b`, 'gi');
      
      // Strings (single and double quotes)
      const stringRegex = /('.*?'|".*?")/g;
      
      // Comments (--)
      const commentRegex = /(--.*$)/gm;
      
      // Order matters to avoid overlapping spans. Easiest is to parse carefully or just apply sequentially with care.
      // We'll use a hacky sequential approach for this simple highlighter:
      // 1. Extract comments and strings
      // 2. Highlight keywords
      // 3. Re-insert strings and comments
      
      const tokens = [];
      let tokenIdx = 0;
      
      // Replace comments
      html = html.replace(commentRegex, (match) => {
        const id = `__TOKEN_${tokenIdx++}__`;
        tokens.push({ id, type: 'comment', value: match });
        return id;
      });
      
      // Replace strings
      html = html.replace(stringRegex, (match) => {
        const id = `__TOKEN_${tokenIdx++}__`;
        tokens.push({ id, type: 'string', value: match });
        return id;
      });
      
      // Highlight keywords
      html = html.replace(keywordRegex, (match) => {
        return `<span style="color: var(--color-accent, #00ffff); font-weight: bold;">${match}</span>`;
      });
      
      // Re-insert tokens
      tokens.forEach(token => {
        let replacement = '';
        if (token.type === 'comment') {
          replacement = `<span style="color: var(--color-text-muted, #888); font-style: italic;">${token.value}</span>`;
        } else if (token.type === 'string') {
          replacement = `<span style="color: var(--color-accent-warm, #ffaa00);">${token.value}</span>`;
        }
        html = html.replace(token.id, replacement);
      });
      
      block.innerHTML = html;
    });
  };

  // Initial render
  renderCards();
});
