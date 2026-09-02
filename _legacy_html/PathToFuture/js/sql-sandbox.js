document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // SQL SANDBOX ENGINE
  // ==========================================
  let db = null;
  let currentChallengeIndex = 0;
  let challenges = [];

  const editorEl = document.getElementById('sql-editor');
  const runBtn = document.getElementById('sql-run');
  const clearBtn = document.getElementById('sql-clear');
  const resultsEl = document.getElementById('sql-results');
  const resultsInfoEl = document.getElementById('sql-results-info');
  const feedbackEl = document.getElementById('sql-feedback');
  const challengeTitleEl = document.getElementById('sql-challenge-title');
  const challengeDescEl = document.getElementById('sql-challenge-desc');
  const challengeDifficultyEl = document.getElementById('sql-challenge-difficulty');
  const counterEl = document.getElementById('sql-challenge-counter');
  const prevBtn = document.getElementById('sql-prev-challenge');
  const nextBtn = document.getElementById('sql-next-challenge');
  
  const schemaBtn = document.getElementById('sql-schema-btn');
  const schemaPanel = document.getElementById('sql-schema-panel');
  const schemaClose = document.getElementById('sql-schema-close');
  const schemaContent = document.getElementById('sql-schema-content');
  
  const hintBtn = document.getElementById('sql-hint-btn');
  const hintPanel = document.getElementById('sql-hint-panel');
  const hintClose = document.getElementById('sql-hint-close');

  async function initDatabase() {
    if (!window.SQL_CHALLENGES) {
      console.warn('SQL_CHALLENGES data not found.');
      return;
    }
    
    challenges = window.SQL_CHALLENGES.challenges || [];
    
    try {
      const SQL = await initSqlJs({
        locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
      });
      db = new SQL.Database();
      
      if (window.SQL_CHALLENGES.seedSQL) {
        db.run(window.SQL_CHALLENGES.seedSQL);
      }
      
      console.log('SQL database initialized successfully');
      
      if (schemaContent && window.SQL_CHALLENGES.schema) {
        schemaContent.textContent = window.SQL_CHALLENGES.schema;
      }
      
      loadChallenge();
      setupEventListeners();
    } catch (err) {
      console.error('Failed to initialize SQL database:', err);
      if (resultsEl) {
        resultsEl.innerHTML = '<p class="error-message">Failed to load SQL engine. Please refresh the page.</p>';
      }
    }
  }

  function setupEventListeners() {
    if (runBtn) runBtn.addEventListener('click', executeQuery);
    if (clearBtn) clearBtn.addEventListener('click', () => { if (editorEl) editorEl.value = ''; });
    
    if (prevBtn) prevBtn.addEventListener('click', () => navigateChallenge(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => navigateChallenge(1));
    
    if (editorEl) {
      editorEl.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
          executeQuery();
        }
      });
    }

    // UI Panels
    if (schemaBtn && schemaPanel) {
      schemaBtn.addEventListener('click', () => schemaPanel.classList.toggle('hidden'));
    }
    if (schemaClose && schemaPanel) {
      schemaClose.addEventListener('click', () => schemaPanel.classList.add('hidden'));
    }
    
    if (hintBtn && hintPanel) {
      hintBtn.addEventListener('click', () => {
        const c = challenges[currentChallengeIndex];
        if (c && c.hint) {
          hintPanel.querySelector('p').textContent = c.hint;
          hintPanel.classList.toggle('hidden');
        }
      });
    }
    if (hintClose && hintPanel) {
      hintClose.addEventListener('click', () => hintPanel.classList.add('hidden'));
    }
  }

  function navigateChallenge(dir) {
    currentChallengeIndex += dir;
    if (currentChallengeIndex < 0) currentChallengeIndex = challenges.length - 1;
    if (currentChallengeIndex >= challenges.length) currentChallengeIndex = 0;
    
    loadChallenge();
  }

  function loadChallenge() {
    if (!challenges.length) return;
    
    const challenge = challenges[currentChallengeIndex];
    
    if (challengeTitleEl) challengeTitleEl.textContent = challenge.title;
    if (challengeDescEl) challengeDescEl.textContent = challenge.description;
    
    if (challengeDifficultyEl) {
      challengeDifficultyEl.textContent = challenge.difficulty;
      challengeDifficultyEl.className = `difficulty-badge ${challenge.difficulty.toLowerCase()}`;
    }
    
    if (counterEl) {
      counterEl.textContent = `Challenge ${currentChallengeIndex + 1} of ${challenges.length}`;
    }
    
    if (editorEl) editorEl.value = challenge.initialQuery || '';
    if (resultsEl) resultsEl.innerHTML = '<p class="sql-results-placeholder">Run a query to see results.</p>';
    if (resultsInfoEl) resultsInfoEl.textContent = '';
    if (feedbackEl) {
      feedbackEl.textContent = '';
      feedbackEl.className = 'sql-feedback hidden';
    }
    if (hintPanel) hintPanel.classList.add('hidden');
  }

  function executeQuery() {
    if (!db) return;
    const query = editorEl ? editorEl.value.trim() : '';
    
    if (!query) {
      showError('Please enter a SQL query.');
      return;
    }

    const startTime = performance.now();
    try {
      const results = db.exec(query);
      const endTime = performance.now();
      const timeMs = (endTime - startTime).toFixed(1);

      if (results.length === 0) {
        if (resultsEl) resultsEl.innerHTML = '<p class="success-message">Query executed successfully. No results to display (INSERT/UPDATE/DELETE).</p>';
        if (resultsInfoEl) resultsInfoEl.textContent = `Executed in ${timeMs}ms`;
        validateResults([], query);
      } else {
        if (resultsEl) resultsEl.innerHTML = renderResultsTable(results);
        const rowCount = results[0].values.length;
        if (resultsInfoEl) resultsInfoEl.textContent = `${rowCount} rows returned in ${timeMs}ms`;
        validateResults(results[0], query);
      }
    } catch (err) {
      showError(err.message);
    }
  }

  function renderResultsTable(results) {
    if (!results || results.length === 0) return '<p class="sql-results-placeholder">No results.</p>';
    const { columns, values } = results[0];
    let html = '<table><thead><tr>';
    columns.forEach(col => html += `<th>${col}</th>`);
    html += '</tr></thead><tbody>';
    values.forEach(row => {
      html += '<tr>';
      row.forEach(val => html += `<td>${val === null ? 'NULL' : val}</td>`);
      html += '</tr>';
    });
    html += '</tbody></table>';
    return html;
  }

  function showError(msg) {
    if (resultsEl) resultsEl.innerHTML = `<p class="error-message">Error: ${msg}</p>`;
    if (resultsInfoEl) resultsInfoEl.textContent = '';
    if (feedbackEl) feedbackEl.className = 'sql-feedback hidden';
  }

  function validateResults(resultData, query) {
    const challenge = challenges[currentChallengeIndex];
    if (!challenge || !challenge.validateFn) return;

    try {
      // Evaluate validation function
      // validateFn string should be something like: "return results && results.values && results.values.length > 0;"
      const validator = new Function('results', 'query', challenge.validateFn);
      const isCorrect = validator(resultData, query);
      
      if (feedbackEl) {
        if (isCorrect) {
          feedbackEl.innerHTML = '<strong>Success!</strong> Your query produced the correct results.';
          feedbackEl.className = 'sql-feedback success';
          
          // Save progress
          if (window.PathToFuture && window.PathToFuture.state) {
            window.PathToFuture.state.sqlProgress[challenge.id] = true;
            window.PathToFuture.save('sqlProgress', window.PathToFuture.state.sqlProgress);
            
            const totalCompleted = Object.values(window.PathToFuture.state.sqlProgress).filter(Boolean).length;
            window.PathToFuture.notify('p2f:sql-completed', { challengeId: challenge.id, totalCompleted });
          }
        } else {
          feedbackEl.innerHTML = '<strong>Not quite.</strong> The query ran, but the results don\'t match the expected output. Try checking the hint!';
          feedbackEl.className = 'sql-feedback hint';
        }
      }
    } catch (err) {
      console.error('Validation error:', err);
    }
  }

  // Initialize
  if (typeof initSqlJs !== 'undefined') {
    initDatabase();
  } else {
    console.warn('sql.js is not loaded yet. Waiting...');
    // Simple wait mechanism in case CDN script loads slightly after DOMContentLoaded
    const checkInterval = setInterval(() => {
      if (typeof initSqlJs !== 'undefined') {
        clearInterval(checkInterval);
        initDatabase();
      }
    }, 100);
    setTimeout(() => clearInterval(checkInterval), 5000);
  }
});
