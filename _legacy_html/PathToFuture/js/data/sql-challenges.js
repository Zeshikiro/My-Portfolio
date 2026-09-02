window.SQL_CHALLENGES = {
  seedSQL: `
    CREATE TABLE departments (
      department_id INTEGER PRIMARY KEY,
      department_name TEXT,
      location TEXT
    );

    CREATE TABLE employees (
      employee_id INTEGER PRIMARY KEY,
      first_name TEXT,
      last_name TEXT,
      department_id INTEGER,
      salary REAL,
      hire_date TEXT,
      FOREIGN KEY (department_id) REFERENCES departments(department_id)
    );

    CREATE TABLE projects (
      project_id INTEGER PRIMARY KEY,
      project_name TEXT,
      department_id INTEGER,
      budget REAL,
      start_date TEXT,
      end_date TEXT,
      FOREIGN KEY (department_id) REFERENCES departments(department_id)
    );

    CREATE TABLE employee_projects (
      employee_id INTEGER,
      project_id INTEGER,
      role TEXT,
      hours_worked INTEGER,
      FOREIGN KEY (employee_id) REFERENCES employees(employee_id),
      FOREIGN KEY (project_id) REFERENCES projects(project_id)
    );

    INSERT INTO departments (department_id, department_name, location) VALUES 
      (1, 'Engineering', 'Manila'),
      (2, 'Sales', 'Cebu'),
      (3, 'Marketing', 'Davao'),
      (4, 'HR', 'Makati');

    INSERT INTO employees (employee_id, first_name, last_name, department_id, salary, hire_date) VALUES 
      (1, 'Juan', 'Santos', 1, 85000, '2021-01-15'),
      (2, 'Maria', 'Cruz', 1, 92000, '2020-05-10'),
      (3, 'Pedro', 'Reyes', 2, 75000, '2022-03-20'),
      (4, 'Ana', 'Bautista', 2, 80000, '2021-11-05'),
      (5, 'Carlos', 'Ocampo', 3, 68000, '2023-01-10'),
      (6, 'Elena', 'Garcia', 4, 72000, '2022-08-15');

    INSERT INTO projects (project_id, project_name, department_id, budget, start_date, end_date) VALUES 
      (1, 'System Upgrade', 1, 150000, '2023-01-01', '2023-12-31'),
      (2, 'Mobile App', 1, 120000, '2023-03-15', '2024-03-15'),
      (3, 'Q3 Expansion', 2, 50000, '2023-07-01', '2023-09-30'),
      (4, 'Rebranding', 3, 80000, '2023-05-01', '2023-11-30'),
      (5, 'Campus Hiring', 4, 30000, '2023-02-01', '2023-06-30');

    INSERT INTO employee_projects (employee_id, project_id, role, hours_worked) VALUES 
      (1, 1, 'Lead Developer', 120),
      (2, 1, 'Senior Developer', 100),
      (1, 2, 'Consultant', 40),
      (2, 2, 'Lead Developer', 80),
      (3, 3, 'Sales Lead', 60),
      (4, 3, 'Sales Associate', 40),
      (5, 4, 'Marketing Specialist', 90),
      (6, 5, 'HR Coordinator', 50);
  `,

  schema: `-- Schema Definition
-- employees (employee_id PK, first_name, last_name, department_id FK, salary, hire_date)
-- departments (department_id PK, department_name, location)
-- projects (project_id PK, project_name, department_id FK, budget, start_date, end_date)
-- employee_projects (employee_id FK, project_id FK, role, hours_worked)`,

  challenges: [
    {
      id: 1,
      title: 'Select All Employees',
      description: 'Write a query to retrieve all columns from the employees table.',
      difficulty: 'easy',
      initialQuery: 'SELECT ',
      hint: 'Use SELECT * FROM to get all columns.',
      validateFn: `function(results) { 
        return results.length > 0 && results[0].values.length === 6 && results[0].columns.length === 6; 
      }`
    },
    {
      id: 2,
      title: 'Filter by Department',
      description: 'Find all employees who work in department 1 (Engineering).',
      difficulty: 'easy',
      initialQuery: 'SELECT * FROM employees\nWHERE ',
      hint: 'Use a WHERE clause to filter by department_id.',
      validateFn: `function(results) { 
        if(results.length === 0) return false;
        const vals = results[0].values;
        return vals.length === 2 && vals.every(row => row[3] === 1); 
      }`
    },
    {
      id: 3,
      title: 'Sort by Salary',
      description: 'List all employees ordered by their salary in descending order.',
      difficulty: 'easy',
      initialQuery: 'SELECT * FROM employees\nORDER BY ',
      hint: 'Use ORDER BY salary DESC.',
      validateFn: `function(results) { 
        if(results.length === 0 || results[0].values.length < 6) return false;
        const vals = results[0].values;
        return vals[0][4] >= vals[1][4] && vals[0][4] === 92000; 
      }`
    },
    {
      id: 4,
      title: 'JOIN Basics',
      description: 'Write a query to list employee first names and their department names.',
      difficulty: 'medium',
      initialQuery: 'SELECT e.first_name, d.department_name\nFROM employees e\n',
      hint: 'Use INNER JOIN (or just JOIN) departments d ON e.department_id = d.department_id.',
      validateFn: `function(results) { 
        if(results.length === 0) return false;
        const cols = results[0].columns;
        const vals = results[0].values;
        return cols.length === 2 && vals.length === 6 && cols.includes('first_name') && cols.includes('department_name');
      }`
    },
    {
      id: 5,
      title: 'Aggregate Functions',
      description: 'Find the average salary for each department. Return department_id and the average salary.',
      difficulty: 'medium',
      initialQuery: 'SELECT department_id, \nFROM employees\nGROUP BY ',
      hint: 'Use AVG(salary) and GROUP BY department_id.',
      validateFn: `function(results) { 
        if(results.length === 0) return false;
        const vals = results[0].values;
        return vals.length === 4 && vals.some(row => row[0] === 1 && row[1] === 88500);
      }`
    },
    {
      id: 6,
      title: 'COUNT & GROUP BY',
      description: 'Count the number of employees in each department. Return department_id and the count.',
      difficulty: 'medium',
      initialQuery: 'SELECT department_id, \nFROM employees\n',
      hint: 'Use COUNT(employee_id) or COUNT(*) with a GROUP BY clause.',
      validateFn: `function(results) { 
        if(results.length === 0) return false;
        const vals = results[0].values;
        return vals.length === 4 && vals.some(row => row[0] === 1 && row[1] === 2) && vals.some(row => row[0] === 3 && row[1] === 1);
      }`
    },
    {
      id: 7,
      title: 'HAVING Clause',
      description: 'Find departments (just the department_id) that have more than 1 employee.',
      difficulty: 'medium',
      initialQuery: 'SELECT department_id\nFROM employees\nGROUP BY department_id\n',
      hint: 'Use HAVING COUNT(*) > 1 after the GROUP BY clause.',
      validateFn: `function(results) { 
        if(results.length === 0) return false;
        const vals = results[0].values;
        return vals.length === 2 && vals.some(row => row[0] === 1) && vals.some(row => row[0] === 2);
      }`
    },
    {
      id: 8,
      title: 'Multi-table JOIN',
      description: 'Show employee first names, their department names, and the project names they work on.',
      difficulty: 'medium',
      initialQuery: 'SELECT e.first_name, d.department_name, p.project_name\nFROM employees e\n',
      hint: 'You need to JOIN departments, employee_projects, and projects tables.',
      validateFn: `function(results) { 
        if(results.length === 0) return false;
        const cols = results[0].columns;
        const vals = results[0].values;
        return cols.length === 3 && vals.length === 8;
      }`
    },
    {
      id: 9,
      title: 'Subquery',
      description: 'Find the first names and salaries of employees who earn MORE than the company average salary.',
      difficulty: 'hard',
      initialQuery: 'SELECT first_name, salary\nFROM employees\nWHERE salary > (\n  \n)',
      hint: 'Use a subquery in the WHERE clause: (SELECT AVG(salary) FROM employees).',
      validateFn: `function(results) { 
        if(results.length === 0) return false;
        const vals = results[0].values;
        return vals.length === 3 && vals.some(row => row[0] === 'Juan') && vals.some(row => row[0] === 'Maria');
      }`
    },
    {
      id: 10,
      title: 'Window Function',
      description: 'Rank employees by salary (descending) within their department. Return first_name, department_id, salary, and the rank.',
      difficulty: 'hard',
      initialQuery: 'SELECT first_name, department_id, salary,\n  RANK() OVER(\n    \n  ) as salary_rank\nFROM employees;',
      hint: 'Use PARTITION BY department_id ORDER BY salary DESC inside the OVER() clause.',
      validateFn: `function(results) { 
        if(results.length === 0) return false;
        const vals = results[0].values;
        const cols = results[0].columns;
        const mariaRow = vals.find(row => row[0] === 'Maria');
        const juanRow = vals.find(row => row[0] === 'Juan');
        return cols.length === 4 && mariaRow && mariaRow[3] === 1 && juanRow && juanRow[3] === 2;
      }`
    },
    {
      id: 11,
      title: 'Complex JOIN',
      description: 'Find the total hours worked per project. Return the project_name and the total hours.',
      difficulty: 'hard',
      initialQuery: 'SELECT p.project_name, SUM(ep.hours_worked) as total_hours\nFROM projects p\n',
      hint: 'JOIN projects with employee_projects, then GROUP BY project_name.',
      validateFn: `function(results) { 
        if(results.length === 0) return false;
        const vals = results[0].values;
        const sysUpgrade = vals.find(row => row[0] === 'System Upgrade');
        return vals.length === 5 && sysUpgrade && sysUpgrade[1] === 220;
      }`
    },
    {
      id: 12,
      title: 'Advanced Filtering',
      description: 'Find department names where the total budget of all their projects combined exceeds 100,000.',
      difficulty: 'hard',
      initialQuery: 'SELECT d.department_name\nFROM departments d\nJOIN projects p ON d.department_id = p.department_id\n',
      hint: 'Group by department_name and use HAVING SUM(budget) > 100000.',
      validateFn: `function(results) { 
        if(results.length === 0) return false;
        const vals = results[0].values;
        return vals.length === 1 && vals[0][0] === 'Engineering';
      }`
    }
  ]
};
