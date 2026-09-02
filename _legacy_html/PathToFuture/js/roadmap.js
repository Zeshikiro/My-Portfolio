document.addEventListener('DOMContentLoaded', () => {
  // Check dependencies
  if (!window.ROADMAP_DATA || !window.PathToFuture) return;

  const roadmapContainer = document.getElementById('roadmap-tree');
  if (!roadmapContainer) return;

  const tiers = ['foundation', 'intermediate', 'advanced', 'expert'];
  const tierLabels = {
    'foundation': 'Phase 1 — Build the Foundation',
    'intermediate': 'Phase 2 — Level Up',
    'advanced': 'Phase 3 — Go Deeper',
    'expert': 'Phase 4 — Master the Craft'
  };

  const getSkillStatus = (skillId) => {
    const state = window.PathToFuture.state.roadmap;
    if (state[skillId] === true) return 'completed';
    
    const skill = window.ROADMAP_DATA.find(s => s.id === skillId);
    if (!skill) return 'locked';
    
    if (!skill.prerequisites || skill.prerequisites.length === 0) return 'available';
    
    const canUnlock = skill.prerequisites.every(prereqId => state[prereqId] === true);
    return canUnlock ? 'available' : 'locked';
  };

  const unmarkDependencies = (skillId) => {
    const state = window.PathToFuture.state.roadmap;
    window.ROADMAP_DATA.forEach(skill => {
      if (skill.prerequisites && skill.prerequisites.includes(skillId) && state[skill.id] === true) {
        state[skill.id] = false;
        unmarkDependencies(skill.id);
      }
    });
  };

  const updateProgress = () => {
    const state = window.PathToFuture.state.roadmap;
    const total = window.ROADMAP_DATA.length;
    let completed = 0;
    
    for (const key in state) {
      if (state[key] === true && window.ROADMAP_DATA.some(s => s.id === key)) {
        completed++;
      }
    }
    
    const percentage = Math.round((completed / total) * 100) || 0;
    
    const fillEl = document.getElementById('roadmap-progress-fill');
    const textEl = document.getElementById('roadmap-progress-text');
    const pctEl = document.getElementById('roadmap-progress-pct');
    
    if (fillEl) fillEl.style.width = `${percentage}%`;
    if (textEl) textEl.textContent = `${completed} / ${total} Skills`;
    if (pctEl) pctEl.textContent = `${percentage}%`;
    
    window.PathToFuture.notify('roadmap-updated', { completed, total });
  };

  const renderRoadmap = () => {
    roadmapContainer.innerHTML = '';
    
    tiers.forEach(tier => {
      const tierSkills = window.ROADMAP_DATA.filter(s => s.tier === tier);
      if (tierSkills.length === 0) return;
      
      const tierDiv = document.createElement('div');
      tierDiv.className = `roadmap-tier tier--${tier}`;
      
      const headerDiv = document.createElement('div');
      headerDiv.className = 'roadmap-tier-header';
      headerDiv.innerHTML = `
        <h3>${tier.charAt(0).toUpperCase() + tier.slice(1)}</h3>
        <div class="tier-label">${tierLabels[tier]}</div>
      `;
      tierDiv.appendChild(headerDiv);
      
      const nodesContainer = document.createElement('div');
      nodesContainer.className = 'roadmap-nodes';
      
      tierSkills.forEach(skill => {
        const status = getSkillStatus(skill.id);
        const nodeDiv = document.createElement('div');
        nodeDiv.className = `roadmap-node ${status}`;
        nodeDiv.setAttribute('data-skill-id', skill.id);
        nodeDiv.title = skill.description;
        
        let statusIcon = '';
        if (status === 'locked') statusIcon = '<i class="ri-lock-fill"></i>';
        else if (status === 'completed') statusIcon = '<i class="ri-check-line"></i>';
        else if (status === 'available') statusIcon = '<i class="ri-circle-line"></i>';
        
        nodeDiv.innerHTML = `
          <div class="roadmap-node-icon"><i class="${skill.icon}"></i></div>
          <div class="roadmap-node-info">
            <div class="roadmap-node-title">${skill.title}</div>
            <div class="roadmap-node-desc">${skill.description}</div>
          </div>
          <div class="roadmap-node-status">${statusIcon}</div>
        `;
        
        nodeDiv.addEventListener('click', () => {
          const currentStatus = getSkillStatus(skill.id);
          const state = window.PathToFuture.state.roadmap;
          
          if (currentStatus === 'available') {
            state[skill.id] = true;
            window.PathToFuture.save('roadmap', state);
            
            // Micro-animation
            nodeDiv.classList.add('glow-pulse');
            setTimeout(() => nodeDiv.classList.remove('glow-pulse'), 500);
            
            renderRoadmap();
          } else if (currentStatus === 'completed') {
            state[skill.id] = false;
            unmarkDependencies(skill.id);
            window.PathToFuture.save('roadmap', state);
            renderRoadmap();
          } else if (currentStatus === 'locked') {
            const missingPrereqs = skill.prerequisites.filter(pId => state[pId] !== true);
            const missingTitles = missingPrereqs.map(pId => {
              const pSkill = window.ROADMAP_DATA.find(s => s.id === pId);
              return pSkill ? pSkill.title : pId;
            });
            
            alert(`Locked! Complete prerequisites first:\n- ${missingTitles.join('\n- ')}`);
          }
        });
        
        nodesContainer.appendChild(nodeDiv);
      });
      
      tierDiv.appendChild(nodesContainer);
      roadmapContainer.appendChild(tierDiv);
    });
    
    updateProgress();
  };

  renderRoadmap();
});
