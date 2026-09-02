window.KNOWLEDGE_DATA = [
  // --- Database Category ---
  {
    id: 'acid-properties',
    title: 'ACID Properties',
    category: 'database',
    icon: 'ri-shield-check-line',
    summary: 'The four guarantees of reliable database transactions.',
    content: `<h4>What is ACID?</h4>
<p>ACID is a set of properties of database transactions intended to guarantee data validity despite errors, power failures, and other mishaps.</p>
<ul>
  <li><strong>Atomicity:</strong> Transactions are "all or nothing". If one part of the transaction fails, the entire transaction fails, and the database state is left unchanged.</li>
  <li><strong>Consistency:</strong> Ensures that a transaction can only bring the database from one valid state to another, maintaining database invariants (like constraints and triggers).</li>
  <li><strong>Isolation:</strong> Concurrent execution of transactions leaves the database in the same state that would have been obtained if the transactions were executed sequentially.</li>
  <li><strong>Durability:</strong> Once a transaction has been committed, it will remain so, even in the event of power loss, crashes, or errors.</li>
</ul>
<pre><code>BEGIN TRANSACTION;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT; -- If either UPDATE fails, we ROLLBACK instead</code></pre>
<div class="note">Most Relational Database Management Systems (RDBMS) like PostgreSQL and MySQL are ACID compliant by design.</div>`
  },
  {
    id: 'cap-theorem',
    title: 'CAP Theorem',
    category: 'database',
    icon: 'ri-node-tree',
    summary: 'Consistency, Availability, Partition Tolerance trade-offs.',
    content: `<h4>Understanding the CAP Theorem</h4>
<p>The CAP theorem, also named Brewer's theorem, states that any distributed data store can provide only two of the following three guarantees:</p>
<ul>
  <li><strong>Consistency:</strong> Every read receives the most recent write or an error.</li>
  <li><strong>Availability:</strong> Every request receives a (non-error) response, without the guarantee that it contains the most recent write.</li>
  <li><strong>Partition Tolerance:</strong> The system continues to operate despite an arbitrary number of messages being dropped (or delayed) by the network between nodes.</li>
</ul>
<p>Because network partitions are a fact of life in distributed systems (Partition Tolerance is mandatory), you usually have to choose between Consistency (CP) and Availability (AP).</p>
<div class="note"><strong>CP Systems (e.g., MongoDB, HBase):</strong> Prefer to reject requests rather than return stale data when partitioned. <br><strong>AP Systems (e.g., Cassandra, DynamoDB):</strong> Prefer to return stale data over rejecting requests.</div>`
  },
  {
    id: 'indexes-deep-dive',
    title: 'Indexes Deep Dive',
    category: 'database',
    icon: 'ri-flashlight-line',
    summary: 'B-tree, hash, composite, covering indexes, when to use and avoid.',
    content: `<h4>Database Indexing Concepts</h4>
<p>Indexes are special lookup tables that the database search engine can use to speed up data retrieval. Simply put, an index is a pointer to data in a table.</p>
<ul>
  <li><strong>B-Tree Indexes:</strong> The default for most systems. Excellent for exact matches and range queries (<code>=, &lt;, &gt;, BETWEEN</code>).</li>
  <li><strong>Hash Indexes:</strong> Used for exact equality matches (<code>=</code>). Not useful for range queries.</li>
  <li><strong>Composite Indexes:</strong> Indexes on multiple columns. Order matters! (e.g., an index on <code>(A, B)</code> can be used for queries on <code>A</code>, or <code>A AND B</code>, but not <code>B</code> alone).</li>
  <li><strong>Covering Indexes:</strong> An index that contains all the columns needed for a query, meaning the database doesn't need to fetch the actual table row.</li>
</ul>
<pre><code>-- Creating a composite index
CREATE INDEX idx_user_status ON users(status, last_login);

-- This query can use the covering index without reading the table
SELECT status, last_login FROM users WHERE status = 'active';</code></pre>
<div class="note">Avoid over-indexing! Every index consumes disk space and adds overhead to INSERT, UPDATE, and DELETE operations.</div>`
  },
  {
    id: 'transactions-isolation',
    title: 'Transaction Isolation Levels',
    category: 'database',
    icon: 'ri-lock-unlock-line',
    summary: 'Read Uncommitted, Read Committed, Repeatable Read, Serializable.',
    content: `<h4>Transaction Isolation Levels</h4>
<p>Isolation levels define the degree to which a transaction must be isolated from the data modifications made by any other transaction in the database system.</p>
<ul>
  <li><strong>Read Uncommitted:</strong> Lowest level. Allows <em>Dirty Reads</em> (reading uncommitted changes from other transactions).</li>
  <li><strong>Read Committed:</strong> Default in PostgreSQL/SQL Server. A transaction only sees committed changes. Prevents Dirty Reads but allows <em>Non-Repeatable Reads</em> (re-reading a row gets a different value if another transaction committed an update).</li>
  <li><strong>Repeatable Read:</strong> Default in MySQL (InnoDB). Ensures that if a row is read twice in the same transaction, the value is the same. Allows <em>Phantom Reads</em> (new rows added by other transactions might appear in range queries).</li>
  <li><strong>Serializable:</strong> Highest level. Emulates purely sequential execution of transactions. No concurrency anomalies, but lowest performance.</li>
</ul>
<pre><code>-- Setting isolation level in PostgreSQL
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
BEGIN;
-- Perform critical operations
COMMIT;</code></pre>`
  },

  // --- SQL Category ---
  {
    id: 'joins-masterclass',
    title: 'SQL Joins Masterclass',
    category: 'sql',
    icon: 'ri-merge-cells-horizontal',
    summary: 'INNER, LEFT, RIGHT, FULL, CROSS, SELF joins with examples.',
    content: `<h4>Mastering SQL Joins</h4>
<p>Joins are used to combine rows from two or more tables, based on a related column between them.</p>
<ul>
  <li><strong>INNER JOIN:</strong> Returns records that have matching values in both tables.</li>
  <li><strong>LEFT (OUTER) JOIN:</strong> Returns all records from the left table, and the matched records from the right table. The result is NULL from the right side if there is no match.</li>
  <li><strong>RIGHT (OUTER) JOIN:</strong> Returns all records from the right table, and the matched records from the left table.</li>
  <li><strong>FULL (OUTER) JOIN:</strong> Returns all records when there is a match in either left or right table.</li>
  <li><strong>CROSS JOIN:</strong> Returns the Cartesian product of the sets of records from the two joined tables.</li>
  <li><strong>SELF JOIN:</strong> A regular join, but the table is joined with itself.</li>
</ul>
<pre><code>-- Find all employees and their department names (if they belong to one)
SELECT e.first_name, e.last_name, d.department_name
FROM employees e
LEFT JOIN departments d ON e.department_id = d.department_id;</code></pre>`
  },
  {
    id: 'window-functions',
    title: 'Window Functions',
    category: 'sql',
    icon: 'ri-layout-row-line',
    summary: 'ROW_NUMBER, RANK, DENSE_RANK, LAG, LEAD, SUM OVER.',
    content: `<h4>Understanding Window Functions</h4>
<p>A window function performs a calculation across a set of table rows that are somehow related to the current row. Unlike aggregate functions, window functions do not cause rows to become grouped into a single output row.</p>
<ul>
  <li><strong>ROW_NUMBER():</strong> Assigns a unique sequential integer to rows within a partition.</li>
  <li><strong>RANK():</strong> Assigns a rank to rows within a partition, with gaps in rank values for ties.</li>
  <li><strong>DENSE_RANK():</strong> Similar to RANK(), but without gaps for ties.</li>
  <li><strong>LAG() / LEAD():</strong> Accesses data from a previous or subsequent row in the same result set.</li>
</ul>
<pre><code>-- Rank employees by salary within each department
SELECT 
  first_name, 
  department_id, 
  salary,
  RANK() OVER(PARTITION BY department_id ORDER BY salary DESC) as dept_salary_rank
FROM employees;</code></pre>`
  },
  {
    id: 'cte-subqueries',
    title: 'CTEs & Subqueries',
    category: 'sql',
    icon: 'ri-parentheses-line',
    summary: 'Common Table Expressions, recursive CTEs, correlated subqueries.',
    content: `<h4>Structuring Complex Queries</h4>
<p>Both CTEs and Subqueries are used to create temporary result sets that can be referenced in a larger query.</p>
<p><strong>Subqueries</strong> are nested queries. A <em>Correlated Subquery</em> references columns from the outer query and runs once for each row in the outer query (can be slow).</p>
<p><strong>Common Table Expressions (CTEs)</strong>, defined using the <code>WITH</code> clause, are generally more readable than subqueries, especially when referenced multiple times. <em>Recursive CTEs</em> can query hierarchical data like organizational charts.</p>
<pre><code>-- Using a CTE to simplify a complex query
WITH HighEarners AS (
  SELECT employee_id, first_name, salary 
  FROM employees 
  WHERE salary > 100000
)
SELECT e.first_name, p.project_name
FROM HighEarners e
JOIN employee_projects ep ON e.employee_id = ep.employee_id
JOIN projects p ON ep.project_id = p.project_id;</code></pre>`
  },
  {
    id: 'query-optimization',
    title: 'Query Optimization',
    category: 'sql',
    icon: 'ri-speed-up-line',
    summary: 'EXPLAIN plans, index usage, avoiding SELECT *.',
    content: `<h4>SQL Query Optimization Best Practices</h4>
<p>Writing efficient SQL is critical for application performance and reducing warehouse costs.</p>
<ul>
  <li><strong>Avoid <code>SELECT *</code>:</strong> Only retrieve the columns you need. It reduces network I/O and memory usage.</li>
  <li><strong>Understand <code>EXPLAIN</code>:</strong> Use your database's EXPLAIN plan feature to see how the optimizer executes your query (table scans vs. index seeks).</li>
  <li><strong>Filter Early:</strong> Apply <code>WHERE</code> clauses before aggregations or joins to reduce the dataset size early in the pipeline.</li>
  <li><strong>Beware of Functions on Indexed Columns:</strong> <code>WHERE YEAR(created_at) = 2023</code> might prevent index usage (SARGability). Use <code>WHERE created_at >= '2023-01-01' AND created_at < '2024-01-01'</code> instead.</li>
  <li><strong>Avoid N+1 Query Problems:</strong> Fetch related data in bulk using JOINs rather than running a loop of individual SELECT statements in your application code.</li>
</ul>`
  },

  // --- Modeling Category ---
  {
    id: 'star-schema',
    title: 'Star Schema',
    category: 'modeling',
    icon: 'ri-star-line',
    summary: 'Fact tables, dimension tables, surrogate keys.',
    content: `<h4>The Star Schema</h4>
<p>The Star Schema is the simplest style of data mart schema and is the approach most widely used to develop data warehouses and dimensional data marts.</p>
<p>It consists of one or more <strong>Fact Tables</strong> referencing any number of <strong>Dimension Tables</strong>.</p>
<ul>
  <li><strong>Fact Table:</strong> Contains quantitative data (metrics, measurements) for analysis (e.g., Sales Amount, Quantity Sold). It contains foreign keys to dimension tables.</li>
  <li><strong>Dimension Tables:</strong> Contain descriptive attributes related to fact data (e.g., Customer, Product, Date). They are typically heavily denormalized.</li>
  <li><strong>Surrogate Keys:</strong> Dimension tables usually use system-generated integer keys (surrogate keys) instead of natural business keys for performance and to handle changing data.</li>
</ul>
<p>It's called a "star" schema because the ER diagram resembles a star, with the fact table in the center.</p>`
  },
  {
    id: 'snowflake-schema',
    title: 'Snowflake Schema',
    category: 'modeling',
    icon: 'ri-snowflake-line',
    summary: 'Normalized dimensions, when to use vs star schema.',
    content: `<h4>The Snowflake Schema</h4>
<p>A Snowflake Schema is a logical arrangement of tables in a multidimensional database such that the entity-relationship diagram resembles a snowflake shape.</p>
<p>It is a variant of the star schema where <strong>dimension tables are normalized</strong> into multiple related tables.</p>
<p>For example, in a Star Schema, a <code>Location</code> dimension might have <code>city</code>, <code>state</code>, and <code>country</code> in one table. In a Snowflake Schema, <code>Location</code> would link to a <code>State</code> table, which links to a <code>Country</code> table.</p>
<div class="note"><strong>Pros:</strong> Saves storage space, easier to maintain dimension data.<br><strong>Cons:</strong> Query complexity increases due to more JOINs, often leading to slower read performance compared to a Star Schema.</div>`
  },
  {
    id: 'data-vault',
    title: 'Data Vault 2.0',
    category: 'modeling',
    icon: 'ri-safe-2-line',
    summary: 'Hubs, links, satellites, historization.',
    content: `<h4>Data Vault Modeling</h4>
<p>Data Vault is an agile data modeling method designed specifically for enterprise data warehouses to handle enterprise-scale integration, historization, and auditing.</p>
<p>It decomposes the data warehouse into three primary entity types:</p>
<ul>
  <li><strong>Hubs:</strong> Represent core business entities (e.g., Customer, Product). They store a unique business key, a surrogate hash key, and load metadata. No descriptive attributes.</li>
  <li><strong>Links:</strong> Represent relationships or transactions between Hubs (e.g., a Customer buys a Product).</li>
  <li><strong>Satellites:</strong> Contain the descriptive attributes and historization (time-variant data) for Hubs or Links. This is where the context and history live.</li>
</ul>
<p>Data Vault excels at absorbing structural changes in source systems without requiring massive refactoring of the warehouse schema.</p>`
  },
  {
    id: 'scd-types',
    title: 'Slowly Changing Dimensions',
    category: 'modeling',
    icon: 'ri-history-line',
    summary: 'Type 0, 1, 2, 3, 4, 6 with examples and trade-offs.',
    content: `<h4>Slowly Changing Dimensions (SCD)</h4>
<p>SCDs are techniques to manage changes to dimension attributes over time.</p>
<ul>
  <li><strong>Type 0 (Retain Original):</strong> The dimension attribute value never changes (e.g., Date of Birth).</li>
  <li><strong>Type 1 (Overwrite):</strong> The old value is overwritten with the new value. No history is kept. Used for corrections.</li>
  <li><strong>Type 2 (Add New Row):</strong> The most common for tracking history. A new record is inserted with the updated attributes, and the old record is marked as expired (usually using <code>start_date</code>, <code>end_date</code>, and <code>is_current</code> flag).</li>
  <li><strong>Type 3 (Add New Column):</strong> A new column is added to keep the previous value. Limited history (usually just "previous" and "current").</li>
  <li><strong>Type 4 (History Table):</strong> Current data is in the main dimension table, and historical data is stored in a separate history table.</li>
</ul>`
  },

  // --- Cloud Category ---
  {
    id: 'cloud-warehouses',
    title: 'Cloud Data Warehouses',
    category: 'cloud',
    icon: 'ri-cloud-line',
    summary: 'Comparing BigQuery, Redshift, Snowflake.',
    content: `<h4>Modern Cloud Data Warehouses</h4>
<p>Cloud data warehouses revolutionized analytics by decoupling storage from compute and offering massive scalability.</p>
<ul>
  <li><strong>Snowflake:</strong> Known for its ease of use, zero-management, and unique architecture that completely separates storage, compute (virtual warehouses), and cloud services. Multi-cloud support.</li>
  <li><strong>Google BigQuery:</strong> A fully-managed, serverless data warehouse. You don't manage infrastructure at all; you just write SQL. It uses a distributed architecture (Dremel) and bills by data scanned (or flat-rate).</li>
  <li><strong>Amazon Redshift:</strong> Traditionally cluster-based (managing nodes), though serverless options exist now. Deeply integrated with the AWS ecosystem. Uses columnar storage and MPP (Massively Parallel Processing).</li>
</ul>
<p>Choosing between them often depends on existing cloud footprint, pricing model preferences, and required administrative control.</p>`
  },
  {
    id: 'dbt-overview',
    title: 'dbt (Data Build Tool)',
    category: 'cloud',
    icon: 'ri-tools-line',
    summary: 'Models, tests, docs generation for transformation.',
    content: `<h4>Transforming Data with dbt</h4>
<p>dbt is a transformation workflow that lets teams quickly and collaboratively deploy analytics code following software engineering best practices like modularity, portability, CI/CD, and documentation.</p>
<p>dbt handles the <strong>T</strong> in ELT (Extract, Load, Transform). You write <code>SELECT</code> statements in SQL, and dbt handles turning those statements into tables or views in your warehouse.</p>
<ul>
  <li><strong>Models:</strong> SQL files containing a single <code>SELECT</code> statement. dbt handles the DDL (CREATE TABLE/VIEW).</li>
  <li><strong>Refs:</strong> The <code>ref()</code> function allows models to depend on other models, enabling dbt to infer lineage and build models in the correct order.</li>
  <li><strong>Testing:</strong> Easily define assertions (e.g., unique, not null, accepted values) in YAML files to ensure data quality.</li>
</ul>
<pre><code>-- Example dbt model (stg_customers.sql)
SELECT
    id as customer_id,
    first_name,
    last_name,
    email
FROM {{ source('raw_system', 'customers') }}</code></pre>`
  },
  {
    id: 'data-pipeline-tools',
    title: 'Data Pipeline & Orchestration',
    category: 'cloud',
    icon: 'ri-git-branch-line',
    summary: 'Airflow, Prefect, Dagster comparison, DAGs.',
    content: `<h4>Data Orchestration</h4>
<p>Orchestration tools manage the scheduling, execution, and monitoring of data pipelines, often represented as Directed Acyclic Graphs (DAGs).</p>
<ul>
  <li><strong>Apache Airflow:</strong> The industry standard. Python-based DAG definition. Excellent ecosystem and operator library, but can be complex to manage and scale.</li>
  <li><strong>Prefect:</strong> Often seen as a modern alternative to Airflow. Focuses on Python-native task definitions, easier parameterization, and hybrid execution models (control plane vs. execution plane).</li>
  <li><strong>Dagster:</strong> Differentiates itself as a "data orchestrator" focusing heavily on data assets rather than just tasks. Great for defining data lineage and testing within the orchestration layer.</li>
</ul>
<p>A DAG ensures that tasks run in the correct order (e.g., Extract finishes before Load starts, which finishes before Transform starts) and handles retries upon failures.</p>`
  },

  // --- Governance Category ---
  {
    id: 'data-quality-dims',
    title: 'Data Quality Dimensions',
    category: 'governance',
    icon: 'ri-check-double-line',
    summary: 'Completeness, accuracy, consistency, timeliness.',
    content: `<h4>Dimensions of Data Quality</h4>
<p>Measuring data quality is critical for establishing trust. The core dimensions include:</p>
<ul>
  <li><strong>Completeness:</strong> Is all the required data present? (e.g., percentage of rows with non-null emails).</li>
  <li><strong>Accuracy:</strong> Does the data correctly describe the "real world" entity? (e.g., is the address actually correct?).</li>
  <li><strong>Consistency:</strong> Is the data uniform across different systems? (e.g., does the CRM status match the billing system status?).</li>
  <li><strong>Validity:</strong> Does the data conform to defined rules or formats? (e.g., is the age a positive integer, is the email formatted correctly?).</li>
  <li><strong>Uniqueness:</strong> Are there unwanted duplicates? (e.g., one customer record per actual person).</li>
  <li><strong>Timeliness:</strong> Is the data available when needed and is it up-to-date? (e.g., latency of streaming data).</li>
</ul>`
  },
  {
    id: 'metadata-management',
    title: 'Metadata Management',
    category: 'governance',
    icon: 'ri-book-read-line',
    summary: 'Technical, operational, business metadata, data catalogs.',
    content: `<h4>Managing Data Metadata</h4>
<p>Metadata is "data about data". Effective metadata management is the foundation of data discovery and governance.</p>
<ul>
  <li><strong>Technical Metadata:</strong> Database schemas, table names, column data types, index details. (Often automatically extracted).</li>
  <li><strong>Business Metadata:</strong> Business definitions, glossaries, rules, policies, and data ownership. (Often requires human input).</li>
  <li><strong>Operational Metadata:</strong> Execution logs, pipeline run times, row counts loaded, error rates.</li>
</ul>
<p><strong>Data Catalogs</strong> (like DataHub, Amundsen, Alation) aggregate this metadata, providing a search engine for your company's data. They allow analysts to find data, understand its lineage (where it came from), and trust its quality before using it.</p>`
  },
  {
    id: 'gdpr-data-privacy',
    title: 'Data Privacy & GDPR',
    category: 'governance',
    icon: 'ri-scales-3-line',
    summary: 'Key principles, rights, anonymization vs pseudonymization.',
    content: `<h4>Data Privacy Principles</h4>
<p>Frameworks like GDPR (Europe) and CCPA (California) impose strict rules on handling Personally Identifiable Information (PII).</p>
<p><strong>Key GDPR Principles:</strong></p>
<ul>
  <li><strong>Lawfulness, fairness and transparency:</strong> Data subject must be informed.</li>
  <li><strong>Purpose limitation:</strong> Data collected for specific, explicit purposes.</li>
  <li><strong>Data minimization:</strong> Only collect what is strictly necessary.</li>
  <li><strong>Storage limitation:</strong> Keep data only as long as necessary.</li>
</ul>
<p><strong>Anonymization vs. Pseudonymization:</strong></p>
<p><em>Anonymization</em> irreversibly destroys any way of identifying the data subject (e.g., replacing names with random noise). <em>Pseudonymization</em> substitutes the identity with a code or alias (e.g., a hashed ID), but the original data can be recovered if you have the key. GDPR considers pseudonymized data to still be personal data, while fully anonymized data is exempt.</p>`
  }
];
