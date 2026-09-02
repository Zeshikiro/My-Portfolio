document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // DASHBOARD SYSTEM
  // ==========================================
  
  let radarChart = null;

  const BADGES = [
    { id: 'first-skill', name: 'First Step', icon: '🌱', desc: 'Complete your first skill', check: (s) => Object.values(s.roadmap).filter(Boolean).length >= 1 },
    { id: 'foundation-complete', name: 'Foundation Builder', icon: '🧱', desc: 'Complete all Foundation skills', check: (s) => {
        const foundationSkills = ['sql-basics', 'relational-db', 'er-diagrams', 'normalization', 'data-types', 'indexing'];
        return foundationSkills.every(id => s.roadmap[id]);
      } 
    },
    { id: 'quiz-starter', name: 'Quiz Rookie', icon: '📝', desc: 'Complete your first quiz', check: (s) => s.quizScores && s.quizScores.total >= 10 },
    { id: 'quiz-master', name: 'Quiz Master', icon: '🏆', desc: 'Score 80%+ on a quiz', check: (s) => s.quizScores && s.quizScores.total > 0 && (s.quizScores.correct / s.quizScores.total) >= 0.8 },
    { id: 'sql-beginner', name: 'SQL Apprentice', icon: '💾', desc: 'Complete 3 SQL challenges', check: (s) => s.sqlProgress && Object.values(s.sqlProgress).filter(Boolean).length >= 3 },
    { id: 'sql-master', name: 'SQL Sensei', icon: '⚡', desc: 'Complete all SQL challenges', check: (s) => s.sqlProgress && Object.values(s.sqlProgress).filter(Boolean).length >= 12 },
    { id: 'streak-3', name: 'On Fire', icon: '🔥', desc: '3-day learning streak', check: (s) => s.streak >= 3 },
    { id: 'streak-7', name: 'Dedicated', icon: '💪', desc: '7-day learning streak', check: (s) => s.streak >= 7 },
    { id: 'half-way', name: 'Halfway There', icon: '🎯', desc: 'Complete 12 skills', check: (s) => Object.values(s.roadmap).filter(Boolean).length >= 12 },
    { id: 'architect', name: 'Data Architect', icon: '👑', desc: 'Complete all 24 skills', check: (s) => Object.values(s.roadmap).filter(Boolean).length >= 24 }
  ];

  function calculateSkillScores(state) {
    // Map roadmap items to radar categories
    // 6 axes: Database, SQL, Modeling, Cloud, Governance, Architecture
    const categories = {
      Database: ['sql-basics', 'relational-db', 'data-types', 'indexing'],
      SQL: [], // Will use quiz scores as proxy
      Modeling: ['er-diagrams', 'normalization', 'dimensional-modeling', 'enterprise-arch'],
      Cloud: ['cloud-databases', 'nosql-databases', 'data-warehousing', 'etl-elt', 'data-integration'],
      Governance: ['data-governance', 'master-data', 'data-quality', 'data-lineage', 'security-compliance'],
      Architecture: ['system-design', 'data-mesh', 'data-lakehouse', 'realtime-arch', 'arch-patterns', 'ml-feature-stores']
    };

    const scores = { Database: 0, SQL: 0, Modeling: 0, Cloud: 0, Governance: 0, Architecture: 0 };
    
    // Helper to calculate % completed in a category array
    const calcCategory = (arr) => {
      if (!arr.length) return 0;
      let done = 0;
      arr.forEach(skill => {
        if (state.roadmap[skill]) done++;
      });
      return Math.round((done / arr.length) * 100);
    };

    scores.Database = calcCategory(categories.Database);
    scores.Modeling = calcCategory(categories.Modeling);
    scores.Cloud = calcCategory(categories.Cloud);
    scores.Governance = calcCategory(categories.Governance);
    scores.Architecture = calcCategory(categories.Architecture);
    
    // Use SQL challenges for SQL score
    const sqlTotal = 12; // assumed max from badge definition
    const sqlDone = state.sqlProgress ? Object.values(state.sqlProgress).filter(Boolean).length : 0;
    scores.SQL = Math.min(100, Math.round((sqlDone / sqlTotal) * 100));

    return [scores.Database, scores.SQL, scores.Modeling, scores.Cloud, scores.Governance, scores.Architecture];
  }

  function updateRadarChart(scores) {
    const ctx = document.getElementById('skill-radar-chart');
    if (!ctx) return;

    if (radarChart) {
      radarChart.data.datasets[0].data = scores;
      radarChart.update();
      return;
    }

    if (typeof Chart === 'undefined') {
      console.warn('Chart.js not loaded');
      return;
    }

    radarChart = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: ['Database', 'SQL', 'Modeling', 'Cloud', 'Governance', 'Architecture'],
        datasets: [{
          label: 'Your Progress',
          data: scores,
          backgroundColor: 'rgba(0, 229, 255, 0.1)',
          borderColor: 'rgba(0, 229, 255, 0.8)',
          borderWidth: 2,
          pointBackgroundColor: '#00e5ff',
          pointBorderColor: '#00e5ff',
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          r: {
            beginAtZero: true,
            max: 100,
            ticks: { display: false },
            grid: { color: 'rgba(0, 229, 255, 0.08)' },
            angleLines: { color: 'rgba(0, 229, 255, 0.08)' },
            pointLabels: {
              color: '#94a3b8',
              font: { size: 11, family: 'Inter' }
            }
          }
        },
        plugins: {
          legend: { display: false }
        }
      }
    });
  }

  function evaluateBadges(state) {
    if (!state.badges) state.badges = [];
    let updated = false;

    BADGES.forEach(badge => {
      const earned = state.badges.includes(badge.id);
      if (!earned && badge.check(state)) {
        state.badges.push(badge.id);
        updated = true;
      }
    });

    if (updated && window.PathToFuture) {
      window.PathToFuture.save('badges', state.badges);
    }
    
    return state.badges;
  }

  function renderBadges(earnedIds) {
    const container = document.getElementById('badges-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    BADGES.forEach(badge => {
      const isEarned = earnedIds.includes(badge.id);
      const div = document.createElement('div');
      div.className = `badge-item ${isEarned ? 'earned' : 'locked'}`;
      
      div.innerHTML = `
        <span class="badge-icon">${badge.icon}</span>
        <span class="badge-name">${badge.name}</span>
        <span class="badge-desc">${badge.desc}</span>
      `;
      container.appendChild(div);
    });
  }

  function updateDashboard() {
    if (!window.PathToFuture || !window.PathToFuture.state) return;
    const state = window.PathToFuture.state;

    // 1. Stats Update
    const statTopics = document.getElementById('stat-topics');
    const statQuiz = document.getElementById('stat-quiz-score');
    const statStreak = document.getElementById('stat-streak');
    const statBadges = document.getElementById('stat-badges');

    if (statTopics) {
      statTopics.textContent = Object.values(state.roadmap || {}).filter(Boolean).length;
    }
    
    if (statQuiz) {
      const q = state.quizScores || { correct: 0, total: 0 };
      statQuiz.textContent = q.total > 0 ? (q.correct / q.total * 100).toFixed(0) + '%' : '0%';
    }
    
    if (statStreak) {
      statStreak.textContent = state.streak || 0;
    }

    // 2. Badges Eval
    const earnedBadges = evaluateBadges(state);
    if (statBadges) {
      statBadges.textContent = earnedBadges.length;
    }
    renderBadges(earnedBadges);

    // 3. Radar Chart
    const scores = calculateSkillScores(state);
    updateRadarChart(scores);
  }

  // Bind Reset Progress
  const resetBtn = document.getElementById('reset-progress');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to completely reset all your progress? This cannot be undone.')) {
        // Clear local storage prefix p2f_
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i);
          if (key && key.startsWith('p2f_')) {
            localStorage.removeItem(key);
          }
        }
        window.location.reload();
      }
    });
  }

  // Listen to events to update dashboard
  document.addEventListener('p2f:roadmap-updated', updateDashboard);
  document.addEventListener('p2f:quiz-completed', updateDashboard);
  document.addEventListener('p2f:sql-completed', updateDashboard);

  // Wait a bit for Chart.js to initialize if it's from CDN, then initial update
  setTimeout(updateDashboard, 500);
});
