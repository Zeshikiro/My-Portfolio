document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // TAB SWITCHING
  // ==========================================
  const tabs = document.querySelectorAll('.arena-tab');
  const panels = document.querySelectorAll('.arena-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      
      tab.classList.add('active');
      const target = tab.getAttribute('data-tab');
      const panel = document.getElementById(`panel-${target}`);
      if (panel) panel.classList.add('active');
    });
  });

  // ==========================================
  // QUIZ ENGINE
  // ==========================================
  let currentQuestions = [];
  let currentIndex = 0;
  let score = 0;
  let answered = false;

  const categorySelect = document.getElementById('quiz-category');
  const questionText = document.getElementById('quiz-question-text');
  const optionsContainer = document.getElementById('quiz-options');
  const nextBtn = document.getElementById('quiz-next');
  const restartBtn = document.getElementById('quiz-restart');
  const progressFill = document.getElementById('quiz-progress-fill');
  const scoreDisplay = document.getElementById('quiz-score');
  const feedbackEl = document.getElementById('quiz-feedback');

  // Shuffle array utility
  function shuffle(array) {
    let currentIndex = array.length, randomIndex;
    while (currentIndex != 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
  }

  function initQuiz() {
    if (!window.QUIZ_DATA || !categorySelect) return;
    
    categorySelect.addEventListener('change', loadCategory);
    if (nextBtn) nextBtn.addEventListener('click', nextQuestion);
    if (restartBtn) restartBtn.addEventListener('click', () => loadCategory());
    
    loadCategory();
  }

  function loadCategory() {
    const category = categorySelect ? categorySelect.value : 'all';
    let filtered = window.QUIZ_DATA;
    
    if (category !== 'all') {
      filtered = window.QUIZ_DATA.filter(q => q.category === category);
    }
    
    currentQuestions = shuffle([...filtered]);
    currentIndex = 0;
    score = 0;
    
    if (restartBtn) restartBtn.style.display = 'none';
    if (nextBtn) {
      nextBtn.style.display = 'inline-block';
      nextBtn.disabled = true;
    }
    
    updateScoreDisplay();
    loadQuestion();
  }

  function loadQuestion() {
    if (currentIndex >= currentQuestions.length) {
      endQuiz();
      return;
    }

    const q = currentQuestions[currentIndex];
    answered = false;
    
    if (questionText) questionText.textContent = q.question;
    if (optionsContainer) optionsContainer.innerHTML = '';
    if (feedbackEl) {
      feedbackEl.textContent = '';
      feedbackEl.className = 'quiz-feedback hidden';
    }
    if (nextBtn) nextBtn.disabled = true;

    // Update progress
    if (progressFill) {
      progressFill.style.width = `${(currentIndex / currentQuestions.length) * 100}%`;
    }

    const letters = ['A', 'B', 'C', 'D'];
    
    q.options.forEach((optText, i) => {
      const btn = document.createElement('button');
      btn.className = 'quiz-option';
      btn.setAttribute('data-index', i);
      
      btn.innerHTML = `
        <span class="option-letter">${letters[i] || ''}</span>
        <span class="option-text">${optText}</span>
      `;
      
      btn.addEventListener('click', () => selectOption(btn, i, q));
      if (optionsContainer) optionsContainer.appendChild(btn);
    });
  }

  function selectOption(btn, index, q) {
    if (answered) return;
    answered = true;
    
    const isCorrect = index === q.correct;
    const allOptions = optionsContainer.querySelectorAll('.quiz-option');
    
    allOptions.forEach(opt => opt.classList.add('disabled'));
    
    if (isCorrect) {
      score++;
      btn.classList.add('correct');
      if (feedbackEl) {
        feedbackEl.innerHTML = `<strong>Correct!</strong> ${q.explanation || ''}`;
        feedbackEl.className = 'quiz-feedback success';
      }
    } else {
      btn.classList.add('wrong');
      allOptions[q.correct].classList.add('correct');
      if (feedbackEl) {
        feedbackEl.innerHTML = `<strong>Incorrect.</strong> ${q.explanation || ''}`;
        feedbackEl.className = 'quiz-feedback error';
      }
    }
    
    updateScoreDisplay();
    if (nextBtn) nextBtn.disabled = false;
    
    // Save to global state if available
    if (window.PathToFuture && window.PathToFuture.state) {
      window.PathToFuture.state.quizScores.total++;
      if (isCorrect) window.PathToFuture.state.quizScores.correct++;
      window.PathToFuture.save('quizScores', window.PathToFuture.state.quizScores);
    }
  }

  function nextQuestion() {
    currentIndex++;
    loadQuestion();
  }

  function endQuiz() {
    if (progressFill) progressFill.style.width = '100%';
    if (questionText) questionText.textContent = 'Quiz Completed!';
    if (optionsContainer) {
      const percentage = currentQuestions.length > 0 ? Math.round((score / currentQuestions.length) * 100) : 0;
      optionsContainer.innerHTML = `
        <div class="quiz-summary">
          <h3>Your Score: ${score} / ${currentQuestions.length}</h3>
          <p class="quiz-percentage">${percentage}%</p>
        </div>
      `;
    }
    if (feedbackEl) feedbackEl.className = 'quiz-feedback hidden';
    if (nextBtn) nextBtn.style.display = 'none';
    if (restartBtn) restartBtn.style.display = 'inline-block';
    
    if (window.PathToFuture && window.PathToFuture.notify) {
      window.PathToFuture.notify('p2f:quiz-completed', { correct: score, total: currentQuestions.length });
    }
  }

  function updateScoreDisplay() {
    if (scoreDisplay) scoreDisplay.textContent = `Score: ${score}`;
  }


  // ==========================================
  // NORMALIZATION PUZZLE
  // ==========================================
  const NORMALIZATION_PUZZLES = [
    {
      id: 1,
      title: 'Student Enrollment Database',
      scenario: 'A university stores student enrollment data in a single table, leading to update anomalies and data redundancy.',
      table: {
        name: 'StudentEnrollments',
        columns: ['StudentID', 'StudentName', 'CourseID', 'CourseName', 'InstructorName', 'InstructorEmail', 'Grade'],
        rows: [
          ['101', 'Alice', 'CS101', 'Intro to CS', 'Dr. Smith', 'smith@uni.edu', 'A'],
          ['101', 'Alice', 'MATH10', 'Calculus', 'Dr. Jones', 'jones@uni.edu', 'B'],
          ['102', 'Bob', 'CS101, PHYS20', 'Intro to CS, Physics 1', 'Dr. Smith, Dr. Brown', 'smith@uni.edu, brown@uni.edu', 'B, C']
        ],
        primaryKey: ['StudentID', 'CourseID']
      },
      steps: [
        {
          from: 'unf',
          to: '1nf',
          question: 'What violation of 1NF exists in this table?',
          choices: [
            { text: 'Repeating groups — multiple courses stored in one cell', correct: true },
            { text: 'Missing primary key', correct: false },
            { text: 'NULL values in columns', correct: false },
            { text: 'Too many columns', correct: false }
          ],
          explanation: '1NF requires atomic values. Here, one student row (Bob) contains multiple courses and grades as comma-separated lists.',
          resultTable: {
             name: 'StudentEnrollments_1NF',
             columns: ['StudentID', 'StudentName', 'CourseID', 'CourseName', 'InstructorName', 'InstructorEmail', 'Grade'],
             rows: [
               ['101', 'Alice', 'CS101', 'Intro to CS', 'Dr. Smith', 'smith@uni.edu', 'A'],
               ['101', 'Alice', 'MATH10', 'Calculus', 'Dr. Jones', 'jones@uni.edu', 'B'],
               ['102', 'Bob', 'CS101', 'Intro to CS', 'Dr. Smith', 'smith@uni.edu', 'B'],
               ['102', 'Bob', 'PHYS20', 'Physics 1', 'Dr. Brown', 'brown@uni.edu', 'C']
             ],
             primaryKey: ['StudentID', 'CourseID']
          }
        },
        {
          from: '1nf',
          to: '2nf',
          question: 'Which attribute has a partial dependency (depends on only part of the composite key [StudentID, CourseID])?',
          choices: [
            { text: 'Grade', correct: false },
            { text: 'StudentName', correct: true },
            { text: 'InstructorEmail', correct: false },
            { text: 'None of the above', correct: false }
          ],
          explanation: 'StudentName depends only on StudentID, which is just a part of the primary key. This violates 2NF.',
          resultTable: {
            name: 'Tables in 2NF',
            html: '<p>Split into Students(<u>StudentID</u>, StudentName) and Enrollments(<u>StudentID, CourseID</u>, CourseName, InstructorName, InstructorEmail, Grade)</p>'
          }
        },
        {
          from: '2nf',
          to: '3nf',
          question: 'Which attribute has a transitive dependency in the Enrollments table?',
          choices: [
            { text: 'Grade depends on CourseID', correct: false },
            { text: 'InstructorEmail depends on InstructorName', correct: true },
            { text: 'CourseName depends on StudentID', correct: false },
            { text: 'There are no transitive dependencies', correct: false }
          ],
          explanation: 'InstructorEmail depends on InstructorName, which in turn depends on CourseID. Non-key attributes must depend ONLY on the primary key for 3NF.',
          resultTable: {
            name: 'Final 3NF Tables',
            html: '<ul><li>Students(<u>StudentID</u>, StudentName)</li><li>Courses(<u>CourseID</u>, CourseName, InstructorID)</li><li>Instructors(<u>InstructorID</u>, InstructorName, InstructorEmail)</li><li>Enrollments(<u>StudentID, CourseID</u>, Grade)</li></ul>'
          }
        }
      ]
    },
    {
      id: 2,
      title: 'Order Management Database',
      scenario: 'An e-commerce business stores order info, including customer details and products purchased.',
      table: {
        name: 'Orders_UNF',
        columns: ['OrderID', 'OrderDate', 'CustID', 'CustName', 'ItemIDs', 'ItemNames', 'ItemPrices'],
        rows: [
          ['1001', '2023-10-01', 'C1', 'John Doe', 'P1, P2', 'Widget, Gadget', '10.00, 20.00'],
          ['1002', '2023-10-02', 'C2', 'Jane Roe', 'P1', 'Widget', '10.00']
        ],
        primaryKey: ['OrderID']
      },
      steps: [
        {
          from: 'unf',
          to: '1nf',
          question: 'How do we fix the 1NF violation?',
          choices: [
            { text: 'Create a new table for customers', correct: false },
            { text: 'Split comma-separated ItemIDs, ItemNames, and ItemPrices into separate rows', correct: true },
            { text: 'Remove ItemPrices', correct: false },
            { text: 'Make CustID the primary key', correct: false }
          ],
          explanation: '1NF requires removing repeating groups by ensuring each cell holds a single atomic value.',
          resultTable: {
            name: 'Orders_1NF (PK: OrderID, ItemID)',
            columns: ['OrderID', 'OrderDate', 'CustID', 'CustName', 'ItemID', 'ItemName', 'ItemPrice'],
            rows: [
              ['1001', '2023-10-01', 'C1', 'John Doe', 'P1', 'Widget', '10.00'],
              ['1001', '2023-10-01', 'C1', 'John Doe', 'P2', 'Gadget', '20.00'],
              ['1002', '2023-10-02', 'C2', 'Jane Roe', 'P1', 'Widget', '10.00']
            ]
          }
        },
        {
          from: '1nf',
          to: '2nf',
          question: 'Identify the partial dependency given the composite key (OrderID, ItemID).',
          choices: [
            { text: 'ItemName depends only on ItemID', correct: true },
            { text: 'CustName depends only on ItemID', correct: false },
            { text: 'OrderDate depends on both OrderID and ItemID', correct: false },
            { text: 'ItemPrice depends only on OrderID', correct: false }
          ],
          explanation: 'ItemName and ItemPrice depend solely on ItemID. OrderDate, CustID, and CustName depend solely on OrderID.',
          resultTable: {
             name: '2NF Tables',
             html: '<p>Orders(<u>OrderID</u>, OrderDate, CustID, CustName)<br>Items(<u>ItemID</u>, ItemName, ItemPrice)<br>OrderDetails(<u>OrderID, ItemID</u>)</p>'
          }
        },
        {
          from: '2nf',
          to: '3nf',
          question: 'What transitive dependency exists in the Orders table (OrderID, OrderDate, CustID, CustName)?',
          choices: [
            { text: 'OrderDate -> CustID', correct: false },
            { text: 'CustName -> OrderDate', correct: false },
            { text: 'CustID -> CustName', correct: true },
            { text: 'OrderID -> CustID', correct: false }
          ],
          explanation: 'CustName depends on CustID, which is not the primary key of the Orders table.',
          resultTable: {
            name: '3NF Tables',
            html: '<ul><li>Customers(<u>CustID</u>, CustName)</li><li>Orders(<u>OrderID</u>, OrderDate, CustID)</li><li>Items(<u>ItemID</u>, ItemName, ItemPrice)</li><li>OrderDetails(<u>OrderID, ItemID</u>)</li></ul>'
          }
        }
      ]
    },
    {
      id: 3,
      title: 'Library System Database',
      scenario: 'A library tracks book loans. The current table has redundancy.',
      table: {
        name: 'LibraryLoans',
        columns: ['LoanID', 'BorrowerID', 'BorrowerName', 'BookID', 'BookTitle', 'AuthorName', 'DueDate'],
        rows: [
          ['L1', 'B1', 'Alice', 'BK1', 'Dune', 'Frank Herbert', '2023-11-01'],
          ['L2', 'B1', 'Alice', 'BK2', 'Foundation', 'Isaac Asimov', '2023-11-05'],
          ['L3', 'B2', 'Bob', 'BK1', 'Dune', 'Frank Herbert', '2023-11-10']
        ],
        primaryKey: ['LoanID']
      },
      steps: [
        {
          from: 'unf',
          to: '1nf',
          question: 'Does this table satisfy 1NF?',
          choices: [
            { text: 'No, it has repeating groups', correct: false },
            { text: 'Yes, all values are atomic and there is a primary key', correct: true },
            { text: 'No, BookTitle is not atomic', correct: false },
            { text: 'No, BorrowerName is duplicated', correct: false }
          ],
          explanation: 'The table is already in 1NF because every cell holds a single value and LoanID uniquely identifies each row.',
          resultTable: {
            name: 'Still 1NF',
            html: '<p>Table remains unchanged.</p>'
          }
        },
        {
          from: '1nf',
          to: '2nf',
          question: 'Are there any partial dependencies?',
          choices: [
            { text: 'Yes, BookTitle depends on BookID', correct: false },
            { text: 'Yes, BorrowerName depends on BorrowerID', correct: false },
            { text: 'No, because the primary key (LoanID) is a single attribute', correct: true },
            { text: 'Yes, DueDate depends on LoanID', correct: false }
          ],
          explanation: 'Partial dependencies only exist when the primary key is composite. Since LoanID is a single column, there are no partial dependencies, so it is in 2NF automatically.',
          resultTable: {
            name: 'Still 2NF',
            html: '<p>Table remains unchanged.</p>'
          }
        },
        {
          from: '2nf',
          to: '3nf',
          question: 'Identify the transitive dependencies to achieve 3NF.',
          choices: [
            { text: 'BorrowerName depends on BorrowerID, BookTitle and AuthorName depend on BookID', correct: true },
            { text: 'DueDate depends on BorrowerID', correct: false },
            { text: 'BorrowerID depends on BookID', correct: false },
            { text: 'There are no transitive dependencies', correct: false }
          ],
          explanation: 'BorrowerName depends on BorrowerID, and BookTitle/AuthorName depend on BookID. Both are non-key attributes depending on other non-key attributes.',
          resultTable: {
            name: '3NF Tables',
            html: '<ul><li>Borrowers(<u>BorrowerID</u>, BorrowerName)</li><li>Books(<u>BookID</u>, BookTitle, AuthorName)</li><li>Loans(<u>LoanID</u>, BorrowerID, BookID, DueDate)</li></ul>'
          }
        }
      ]
    }
  ];

  let currentPuzzleIndex = 0;
  let currentStepIndex = 0;

  const scenarioEl = document.getElementById('norm-scenario');
  const tableAreaEl = document.getElementById('norm-table-area');
  const questionEl = document.getElementById('norm-question');
  const choicesEl = document.getElementById('norm-choices');
  const counterEl = document.getElementById('norm-puzzle-counter');
  const prevPuzzleBtn = document.getElementById('norm-prev-puzzle');
  const nextPuzzleBtn = document.getElementById('norm-next-puzzle');
  const stepIndicators = document.querySelectorAll('.norm-step');
  const normFeedbackEl = document.getElementById('norm-feedback');

  function initNormalization() {
    if (!scenarioEl) return;
    
    if (prevPuzzleBtn) prevPuzzleBtn.addEventListener('click', () => changePuzzle(-1));
    if (nextPuzzleBtn) nextPuzzleBtn.addEventListener('click', () => changePuzzle(1));
    
    loadPuzzle();
  }

  function changePuzzle(dir) {
    currentPuzzleIndex += dir;
    if (currentPuzzleIndex < 0) currentPuzzleIndex = NORMALIZATION_PUZZLES.length - 1;
    if (currentPuzzleIndex >= NORMALIZATION_PUZZLES.length) currentPuzzleIndex = 0;
    
    currentStepIndex = 0;
    loadPuzzle();
  }

  function loadPuzzle() {
    const puzzle = NORMALIZATION_PUZZLES[currentPuzzleIndex];
    if (counterEl) counterEl.textContent = `Puzzle ${currentPuzzleIndex + 1} of ${NORMALIZATION_PUZZLES.length}: ${puzzle.title}`;
    if (scenarioEl) scenarioEl.textContent = puzzle.scenario;
    if (normFeedbackEl) normFeedbackEl.className = 'norm-feedback hidden';
    
    updateStepIndicators();
    renderStep();
  }

  function renderTableHTML(tableObj) {
    if (tableObj.html) return tableObj.html;
    
    let html = `<h4>${tableObj.name}</h4><table class="norm-table"><thead><tr>`;
    tableObj.columns.forEach(col => {
      let isPk = tableObj.primaryKey && tableObj.primaryKey.includes(col);
      html += `<th>${isPk ? '<u>' + col + '</u>' : col}</th>`;
    });
    html += '</tr></thead><tbody>';
    
    tableObj.rows.forEach(row => {
      html += '<tr>';
      row.forEach(val => html += `<td>${val}</td>`);
      html += '</tr>';
    });
    html += '</tbody></table>';
    return html;
  }

  function renderStep() {
    const puzzle = NORMALIZATION_PUZZLES[currentPuzzleIndex];
    
    // Render current table based on step
    if (currentStepIndex === 0) {
      if (tableAreaEl) tableAreaEl.innerHTML = renderTableHTML(puzzle.table);
    } else {
      if (tableAreaEl) tableAreaEl.innerHTML = renderTableHTML(puzzle.steps[currentStepIndex - 1].resultTable);
    }

    if (currentStepIndex < puzzle.steps.length) {
      const step = puzzle.steps[currentStepIndex];
      if (questionEl) questionEl.textContent = step.question;
      if (choicesEl) {
        choicesEl.innerHTML = '';
        step.choices.forEach((choice, i) => {
          const btn = document.createElement('button');
          btn.className = 'norm-choice';
          btn.textContent = choice.text;
          btn.addEventListener('click', () => handleNormChoice(btn, choice, step));
          choicesEl.appendChild(btn);
        });
      }
    } else {
      // Puzzle complete
      if (questionEl) questionEl.textContent = 'Puzzle Completed! Great job normalizing this schema.';
      if (choicesEl) choicesEl.innerHTML = '';
      if (normFeedbackEl) normFeedbackEl.className = 'norm-feedback hidden';
    }
  }

  function handleNormChoice(btn, choice, step) {
    const allChoices = choicesEl.querySelectorAll('.norm-choice');
    allChoices.forEach(c => c.classList.add('disabled'));
    
    if (choice.correct) {
      btn.classList.add('correct');
      if (normFeedbackEl) {
        normFeedbackEl.innerHTML = `<strong>Correct!</strong> ${step.explanation}`;
        normFeedbackEl.className = 'norm-feedback success';
      }
      setTimeout(() => {
        currentStepIndex++;
        updateStepIndicators();
        renderStep();
      }, 2500);
    } else {
      btn.classList.add('wrong');
      if (normFeedbackEl) {
        normFeedbackEl.innerHTML = `<strong>Incorrect.</strong> Try again!`;
        normFeedbackEl.className = 'norm-feedback error';
      }
      setTimeout(() => {
        allChoices.forEach(c => c.classList.remove('disabled'));
        btn.classList.remove('wrong');
        if (normFeedbackEl) normFeedbackEl.className = 'norm-feedback hidden';
      }, 1500);
    }
  }

  function updateStepIndicators() {
    stepIndicators.forEach((ind, i) => {
      ind.classList.remove('active', 'completed');
      if (i < currentStepIndex) {
        ind.classList.add('completed');
      } else if (i === currentStepIndex) {
        ind.classList.add('active');
      }
    });
  }

  // Initialize modules
  initQuiz();
  initNormalization();
});
