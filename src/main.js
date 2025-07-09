class VotingSystem {
  constructor() {
    this.votes = {
      pizza: 0,
      burger: 0,
      salad: 0
    };
    this.voters = new Set();
    this.init();
  }

  init() {
    this.loadVotes();
    
    document.getElementById('pizza-btn').addEventListener('click', () => this.vote('pizza'));
    document.getElementById('burger-btn').addEventListener('click', () => this.vote('burger'));
    document.getElementById('salad-btn').addEventListener('click', () => this.vote('salad'));
    
    this.updateResults();
    this.checkVotingStatus();
  }

  vote(option) {
    const voterId = this.getVoterId();
    
    if (this.voters.has(voterId)) {
      this.showMessage('Ви вже проголосували!', 'warning');
      return;
    }

    this.votes[option]++;
    this.voters.add(voterId);
    
    this.saveVotes();
    this.updateResults();
    this.disableVoting();
    
    const optionNames = {
      pizza: 'Піца',
      burger: 'Бургер', 
      salad: 'Салат'
    };
    this.showMessage(`Дякуємо за голос за "${optionNames[option]}"!`, 'success');
  }

  updateResults() {
    const resultsDisplay = document.getElementById('results-display');
    const total = Object.values(this.votes).reduce((sum, count) => sum + count, 0);
    
    const optionNames = {
      pizza: 'Піца',
      burger: 'Бургер',
      salad: 'Салат'
    };

    resultsDisplay.innerHTML = '';
    
    const sortedResults = Object.entries(this.votes)
      .sort(([,a], [,b]) => b - a);

    sortedResults.forEach(([option, count]) => {
      const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
      
      const resultItem = document.createElement('div');
      resultItem.className = 'result-item';
      resultItem.innerHTML = `
        <span>${optionNames[option]}</span>
        <div>
          <span style="margin-right: 10px; color: #666;">${percentage}%</span>
          <span>${count}</span>
        </div>
      `;
      
      const progressBar = document.createElement('div');
      progressBar.style.cssText = `
        width: 100%;
        height: 4px;
        background-color: #e9ecef;
        border-radius: 2px;
        margin-top: 5px;
        overflow: hidden;
      `;
      
      const progress = document.createElement('div');
      progress.style.cssText = `
        width: ${percentage}%;
        height: 100%;
        background-color: #007bff;
        transition: width 0.5s ease;
      `;
      
      progressBar.appendChild(progress);
      resultItem.appendChild(progressBar);
      resultsDisplay.appendChild(resultItem);
    });

    const totalVotes = document.createElement('div');
    totalVotes.style.cssText = `
      margin-top: 20px;
      padding: 15px;
      background-color: #f8f9fa;
      border-radius: 5px;
      font-weight: bold;
      color: #495057;
    `;
    totalVotes.textContent = `Загалом голосів: ${total}`;
    resultsDisplay.appendChild(totalVotes);
  }

  getVoterId() {
    let voterId = localStorage.getItem('voterId');
    if (!voterId) {
      voterId = 'voter_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('voterId', voterId);
    }
    return voterId;
  }

  checkVotingStatus() {
    const voterId = this.getVoterId();
    if (this.voters.has(voterId)) {
      this.disableVoting();
      this.showMessage('Ви вже проголосували в цьому опитуванні', 'info');
    }
  }

  disableVoting() {
    const buttons = document.querySelectorAll('.options button');
    buttons.forEach(button => {
      button.disabled = true;
      button.style.opacity = '0.6';
      button.style.cursor = 'not-allowed';
    });
  }

  saveVotes() {
    localStorage.setItem('votes', JSON.stringify(this.votes));
    localStorage.setItem('voters', JSON.stringify([...this.voters]));
  }

  loadVotes() {
    const savedVotes = localStorage.getItem('votes');
    const savedVoters = localStorage.getItem('voters');
    
    if (savedVotes) {
      this.votes = JSON.parse(savedVotes);
    }
    
    if (savedVoters) {
      this.voters = new Set(JSON.parse(savedVoters));
    }
  }

  showMessage(text, type = 'info') {
    const existingMessage = document.querySelector('.message');
    if (existingMessage) {
      existingMessage.remove();
    }

    const message = document.createElement('div');
    message.className = 'message';
    
    const colors = {
      success: '#d4edda',
      warning: '#fff3cd',
      info: '#d1ecf1',
      error: '#f8d7da'
    };
    
    const textColors = {
      success: '#155724',
      warning: '#856404',
      info: '#0c5460',
      error: '#721c24'
    };

    message.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background-color: ${colors[type]};
      color: ${textColors[type]};
      padding: 15px 20px;
      border-radius: 5px;
      border: 1px solid ${colors[type]};
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      z-index: 1000;
      font-weight: 500;
      max-width: 300px;
      animation: slideIn 0.3s ease;
    `;

    message.textContent = text;
    document.body.appendChild(message);

    setTimeout(() => {
      if (message.parentNode) {
        message.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => message.remove(), 300);
      }
    }, 4000);
  }

  resetVoting() {
    if (confirm('Ви впевнені, що хочете скинути всі голоси?')) {
      this.votes = { pizza: 0, burger: 0, salad: 0 };
      this.voters.clear();
      localStorage.removeItem('votes');
      localStorage.removeItem('voters');
      localStorage.removeItem('voterId');
      
      const buttons = document.querySelectorAll('.options button');
      buttons.forEach(button => {
        button.disabled = false;
        button.style.opacity = '1';
        button.style.cursor = 'pointer';
      });
      
      this.updateResults();
      this.showMessage('Голосування скинуто!', 'success');
    }
  }
}

const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
  
  .options button:disabled {
    transform: none !important;
  }
  
  .options button:not(:disabled):hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  }
  
  .result-item {
    transition: all 0.3s ease;
  }
  
  .result-item:hover {
    transform: translateX(5px);
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
`;
document.head.appendChild(style);

document.addEventListener('DOMContentLoaded', () => {
  const votingSystem = new VotingSystem();
  
  let clickCount = 0;
  document.querySelector('h1').addEventListener('click', () => {
    clickCount++;
    if (clickCount === 2) {
      votingSystem.resetVoting();
      clickCount = 0;
    }
    setTimeout(() => clickCount = 0, 500);
  });
  
  const info = document.createElement('div');
  info.style.cssText = `
    position: fixed;
    bottom: 10px;
    right: 10px;
    font-size: 12px;
    color: #999;
    background: rgba(255,255,255,0.9);
    padding: 5px 10px;
    border-radius: 3px;
  `;
  info.textContent = 'Подвійний клік на заголовок для скидання';
  document.body.appendChild(info);
});

window.VotingSystem = VotingSystem;