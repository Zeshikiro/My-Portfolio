window.QUIZ_DATA = [
  // Database (8)
  {
    id: 1,
    question: 'Which normal form eliminates transitive dependencies?',
    options: ['1NF', '2NF', '3NF', 'BCNF'],
    correct: 2,
    category: 'database',
    explanation: '3NF (Third Normal Form) eliminates transitive dependencies where non-key attributes depend on other non-key attributes.'
  },
  {
    id: 2,
    question: 'In the ACID properties, what does Atomicity guarantee?',
    options: ['Data is always available', 'Transactions are "all or nothing"', 'Concurrent transactions do not interfere', 'Committed data is saved permanently'],
    correct: 1,
    category: 'database',
    explanation: 'Atomicity ensures that all operations within a transaction are completed successfully, or none of them are applied.'
  },
  {
    id: 3,
    question: 'Which index structure is best suited for exact match queries but poor for range queries?',
    options: ['B-Tree Index', 'Bitmap Index', 'Hash Index', 'Clustered Index'],
    correct: 2,
    category: 'database',
    explanation: 'Hash indexes use a hash function to map keys directly to locations, making exact matches fast, but they cannot efficiently support range queries (like < or >).'
  },
  {
    id: 4,
    question: 'What isolation level prevents Dirty Reads but allows Non-Repeatable Reads?',
    options: ['Read Uncommitted', 'Read Committed', 'Repeatable Read', 'Serializable'],
    correct: 1,
    category: 'database',
    explanation: 'Read Committed ensures you only read committed data (no dirty reads), but if you read the same row twice, another transaction might have updated it in between (non-repeatable read).'
  },
  {
    id: 5,
    question: 'According to the CAP Theorem, if a system prioritizes Consistency and Partition Tolerance (CP), what is sacrificed during a network failure?',
    options: ['Durability', 'Availability', 'Atomicity', 'Isolation'],
    correct: 1,
    category: 'database',
    explanation: 'In a CP system, when a partition occurs, the system will refuse to return a response (sacrificing Availability) rather than return potentially stale or inconsistent data.'
  },
  {
    id: 6,
    question: 'What is the primary purpose of a Foreign Key constraint?',
    options: ['To automatically index the column', 'To ensure data encrypted securely', 'To maintain referential integrity between tables', 'To generate surrogate keys automatically'],
    correct: 2,
    category: 'database',
    explanation: 'A Foreign Key ensures referential integrity by requiring that the value in one table must match an existing primary key value in another table.'
  },
  {
    id: 7,
    question: 'Which of the following best describes an OLTP system?',
    options: ['Optimized for complex read-heavy analytical queries', 'Stores data in a highly denormalized format', 'Optimized for fast, short, transactional write operations', 'Typically uses a Star Schema'],
    correct: 2,
    category: 'database',
    explanation: 'Online Transaction Processing (OLTP) systems are optimized for managing a high volume of short, atomic transactions (inserts, updates, deletes).'
  },
  {
    id: 8,
    question: 'What database anomaly happens when a new row is added by one transaction, and appears in a range query of another concurrently running transaction?',
    options: ['Dirty Read', 'Non-Repeatable Read', 'Phantom Read', 'Lost Update'],
    correct: 2,
    category: 'database',
    explanation: 'A Phantom Read occurs when a transaction reads a set of rows satisfying a condition, and a second transaction inserts a new row satisfying that condition before the first transaction finishes.'
  },

  // SQL (10)
  {
    id: 9,
    question: 'Which SQL JOIN returns all rows from the left table, and matching rows from the right table?',
    options: ['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL JOIN'],
    correct: 1,
    category: 'sql',
    explanation: 'A LEFT JOIN guarantees all rows from the left table are included. If there is no match in the right table, NULL values are returned for the right table columns.'
  },
  {
    id: 10,
    question: 'What clause is used to filter the results of a GROUP BY aggregation?',
    options: ['WHERE', 'FILTER', 'HAVING', 'QUALIFY'],
    correct: 2,
    category: 'sql',
    explanation: 'The HAVING clause is used to filter groups based on aggregate functions (like SUM or COUNT), whereas WHERE filters individual rows before aggregation.'
  },
  {
    id: 11,
    question: 'Which window function assigns a unique sequential integer to rows, without any gaps for ties?',
    options: ['RANK()', 'DENSE_RANK()', 'ROW_NUMBER()', 'NTILE()'],
    correct: 2,
    category: 'sql',
    explanation: 'ROW_NUMBER() assigns a unique, sequential number to each row within a partition. RANK() and DENSE_RANK() can assign the same value to tied rows.'
  },
  {
    id: 12,
    question: 'What does the SQL command TRUNCATE do?',
    options: ['Deletes the table structure entirely', 'Removes all rows from a table quickly without logging individual row deletions', 'Removes specific rows based on a condition', 'Removes leading and trailing spaces from a string'],
    correct: 1,
    category: 'sql',
    explanation: 'TRUNCATE is a DDL command that quickly removes all rows from a table by deallocating the data pages, rather than logging individual row deletions like DELETE does.'
  },
  {
    id: 13,
    question: 'How do you correctly check if a column value is NULL in SQL?',
    options: ['column = NULL', 'column == NULL', 'ISNULL(column)', 'column IS NULL'],
    correct: 3,
    category: 'sql',
    explanation: 'In SQL, NULL represents an unknown value. You cannot use equality operators (=) to check for NULL; you must use the IS NULL operator.'
  },
  {
    id: 14,
    question: 'What is a Common Table Expression (CTE)?',
    options: ['A permanently stored query in the database', 'A temporary named result set defined within the execution scope of a single statement', 'A table that automatically caches frequent queries', 'A materialized view'],
    correct: 1,
    category: 'sql',
    explanation: 'A CTE, created using the WITH keyword, is a temporary result set that you can reference within another SELECT, INSERT, UPDATE, or DELETE statement.'
  },
  {
    id: 15,
    question: 'Which of the following is a DDL (Data Definition Language) statement?',
    options: ['INSERT', 'UPDATE', 'CREATE', 'GRANT'],
    correct: 2,
    category: 'sql',
    explanation: 'CREATE is a DDL statement used to define database structures (tables, indexes, etc.). INSERT and UPDATE are DML (Data Manipulation). GRANT is DCL (Data Control).'
  },
  {
    id: 16,
    question: 'What does the UNION operator do?',
    options: ['Combines columns from two tables horizontally', 'Combines the result sets of two queries vertically, removing duplicates', 'Returns only the rows that appear in both queries', 'Performs a Cartesian product of two tables'],
    correct: 1,
    category: 'sql',
    explanation: 'UNION combines the results of two or more SELECT statements vertically and removes duplicate rows. UNION ALL includes duplicates.'
  },
  {
    id: 17,
    question: 'If you want to access the value of the PREVIOUS row in a result set without self-joining, which function do you use?',
    options: ['LEAD()', 'PREVIOUS()', 'LAG()', 'OFFSET()'],
    correct: 2,
    category: 'sql',
    explanation: 'The LAG() window function allows you to access data from a previous row in the same result set without using a self-join.'
  },
  {
    id: 18,
    question: 'What is a correlated subquery?',
    options: ['A subquery that returns multiple columns', 'A subquery that can run independently of the outer query', 'A subquery that references columns from the outer query', 'A subquery used inside a CTE'],
    correct: 2,
    category: 'sql',
    explanation: 'A correlated subquery contains a reference to a table in the outer query. It must be evaluated once for each row processed by the outer query.'
  },

  // Modeling (8)
  {
    id: 19,
    question: 'In a Star Schema, what type of table stores quantitative measurements or metrics?',
    options: ['Dimension Table', 'Fact Table', 'Bridge Table', 'Lookup Table'],
    correct: 1,
    category: 'modeling',
    explanation: 'Fact tables store the numerical measurements (facts) of the business, along with foreign keys referencing the dimension tables.'
  },
  {
    id: 20,
    question: 'Which schema type is characterized by highly normalized dimension tables?',
    options: ['Star Schema', 'Snowflake Schema', 'Data Vault', 'Flat Table'],
    correct: 1,
    category: 'modeling',
    explanation: 'A Snowflake Schema normalizes dimensions into multiple related tables (e.g., Customer -> City -> State), resembling a snowflake shape.'
  },
  {
    id: 21,
    question: 'What is a surrogate key?',
    options: ['A natural business key used across systems', 'A composite key made of multiple columns', 'An artificial, system-generated primary key (usually an integer)', 'A foreign key that references another database'],
    correct: 2,
    category: 'modeling',
    explanation: 'Surrogate keys are meaningless integers assigned by the data warehouse to uniquely identify rows, insulating the warehouse from changes in source system business keys.'
  },
  {
    id: 22,
    question: 'Which Slowly Changing Dimension (SCD) type tracks historical data by creating multiple records for a given natural key with start and end dates?',
    options: ['Type 0', 'Type 1', 'Type 2', 'Type 3'],
    correct: 2,
    category: 'modeling',
    explanation: 'SCD Type 2 adds a new row for every change, using effective dates (start/end) and/or a current flag to preserve the complete history of changes.'
  },
  {
    id: 23,
    question: 'In Data Vault 2.0 modeling, which entity type contains the descriptive attributes and historization?',
    options: ['Hub', 'Link', 'Satellite', 'Reference'],
    correct: 2,
    category: 'modeling',
    explanation: 'Satellites store the descriptive context and track changes over time (historization) for the business keys (Hubs) or relationships (Links).'
  },
  {
    id: 24,
    question: 'What defines the "grain" of a fact table?',
    options: ['The total size of the table in gigabytes', 'The level of detail represented by a single row in the fact table', 'The number of foreign keys it contains', 'The frequency at which data is loaded'],
    correct: 1,
    category: 'modeling',
    explanation: 'The grain is the fundamental definition of what a single row represents (e.g., "one row per line item on an invoice"). It is the most critical design decision.'
  },
  {
    id: 25,
    question: 'SCD Type 1 handles dimension changes by:',
    options: ['Adding a new row with new dates', 'Adding a new column to store the old value', 'Overwriting the existing value with no history kept', 'Moving the old record to a history table'],
    correct: 2,
    category: 'modeling',
    explanation: 'SCD Type 1 simply overwrites the old attribute value with the new one, making it impossible to query the data as it was in the past.'
  },
  {
    id: 26,
    question: 'Which modeling approach is specifically designed to be agile and easily adapt to absorbing new source systems without schema refactoring?',
    options: ['3rd Normal Form (Inmon)', 'Dimensional Modeling (Kimball)', 'Data Vault', 'OLAP Cubes'],
    correct: 2,
    category: 'modeling',
    explanation: 'Data Vault is designed for massive scale and agility. By separating business keys (Hubs) from context (Satellites), new sources can be added by simply attaching new Satellites.'
  },

  // Cloud (7)
  {
    id: 27,
    question: 'Which of the following is a fully-managed, serverless data warehouse offered by Google Cloud?',
    options: ['Redshift', 'Snowflake', 'BigQuery', 'Synapse Analytics'],
    correct: 2,
    category: 'cloud',
    explanation: 'BigQuery is Google Cloud\'s serverless enterprise data warehouse that abstracts away underlying infrastructure.'
  },
  {
    id: 28,
    question: 'What is the primary function of dbt (data build tool)?',
    options: ['Extracting data from APIs', 'Loading data into the warehouse', 'Transforming data already loaded in the warehouse', 'Visualizing data on dashboards'],
    correct: 2,
    category: 'cloud',
    explanation: 'dbt handles the Transformation step in an ELT process. It allows analysts to write SQL SELECT statements that dbt materializes as tables or views in the warehouse.'
  },
  {
    id: 29,
    question: 'In Apache Airflow, what does DAG stand for?',
    options: ['Data Analytics Gateway', 'Directed Acyclic Graph', 'Distributed Aggregation Group', 'Dynamic Automation Grid'],
    correct: 1,
    category: 'cloud',
    explanation: 'A Directed Acyclic Graph (DAG) is a collection of all the tasks you want to run, organized in a way that reflects their relationships and dependencies.'
  },
  {
    id: 30,
    question: 'How does an ELT architecture differ from traditional ETL?',
    options: ['Data is transformed before it is loaded into the target system', 'Data is loaded directly into the target system and transformed there', 'ELT only handles structured data', 'ELT requires less storage space'],
    correct: 1,
    category: 'cloud',
    explanation: 'In ELT (Extract, Load, Transform), raw data is loaded into the data warehouse first. The processing power of the modern cloud warehouse is then used to perform transformations.'
  },
  {
    id: 31,
    question: 'What is table partitioning in a cloud data warehouse?',
    options: ['Splitting a table into smaller views', 'Dividing a large table into smaller physical segments based on a column (often date)', 'Replicating a table across multiple regions', 'Encrypting parts of a table'],
    correct: 1,
    category: 'cloud',
    explanation: 'Partitioning physically divides data based on a key (like event_date). Queries filtering on the partition key scan much less data, saving time and money.'
  },
  {
    id: 32,
    question: 'Which architecture combines the scalability of data lakes with the ACID transactions of data warehouses?',
    options: ['Data Mesh', 'Lambda Architecture', 'Data Lakehouse', 'Operational Data Store'],
    correct: 2,
    category: 'cloud',
    explanation: 'A Data Lakehouse (often using technologies like Delta Lake or Apache Iceberg) provides warehouse-like features (ACID, schema enforcement) directly on cheap data lake object storage.'
  },
  {
    id: 33,
    question: 'Which cloud warehouse is notable for its architecture that strictly separates storage, compute, and cloud services layers?',
    options: ['Amazon Redshift', 'Snowflake', 'PostgreSQL', 'Teradata'],
    correct: 1,
    category: 'cloud',
    explanation: 'Snowflake\'s architecture cleanly separates centralized storage from compute (Virtual Warehouses), allowing independent scaling and workload isolation.'
  },

  // Governance (7)
  {
    id: 34,
    question: 'Which Data Quality dimension measures if all required data is present (e.g., no missing email addresses)?',
    options: ['Accuracy', 'Completeness', 'Validity', 'Uniqueness'],
    correct: 1,
    category: 'governance',
    explanation: 'Completeness measures the degree to which all required data is known and recorded.'
  },
  {
    id: 35,
    question: 'What type of metadata includes database schemas, table definitions, and data types?',
    options: ['Business Metadata', 'Operational Metadata', 'Technical Metadata', 'Process Metadata'],
    correct: 2,
    category: 'governance',
    explanation: 'Technical metadata describes the technical characteristics of data, such as structure, format, and physical location.'
  },
  {
    id: 36,
    question: 'Under GDPR, what does the principle of "Data Minimization" mean?',
    options: ['Data must be compressed to save storage', 'Organizations should collect only the personal data strictly necessary for their purpose', 'Data retention should be kept to a minimum of 30 days', 'Only minimal security is required for public data'],
    correct: 1,
    category: 'governance',
    explanation: 'Data Minimization dictates that data collection must be adequate, relevant, and limited to what is necessary in relation to the purposes for which they are processed.'
  },
  {
    id: 37,
    question: 'What is the purpose of Data Lineage?',
    options: ['To track the origin of data and its movement/transformations over time', 'To calculate the monetary value of a dataset', 'To assign access permissions to users', 'To encrypt data at rest'],
    correct: 0,
    category: 'governance',
    explanation: 'Data lineage maps the journey of data from its source to its destination, including all transformations along the way, crucial for debugging and impact analysis.'
  },
  {
    id: 38,
    question: 'What role is typically responsible for the day-to-day management, quality, and proper use of a specific data domain?',
    options: ['Data Engineer', 'Data Steward', 'Database Administrator', 'Data Scientist'],
    correct: 1,
    category: 'governance',
    explanation: 'A Data Steward is a business-facing role responsible for ensuring data quality, defining business terms, and enforcing governance policies within their domain.'
  },
  {
    id: 39,
    question: 'Which of the following is an example of PII (Personally Identifiable Information)?',
    options: ['Company Name', 'Aggregated sales totals', 'Social Security Number', 'Product ID'],
    correct: 2,
    category: 'governance',
    explanation: 'PII is any information that can be used to distinguish or trace an individual\'s identity, such as a Social Security Number, email address, or phone number.'
  },
  {
    id: 40,
    question: 'What is the main function of a Data Catalog?',
    options: ['To store raw data files', 'To process real-time streaming data', 'To provide a searchable inventory of data assets and their metadata', 'To host the company\'s BI dashboards'],
    correct: 2,
    category: 'governance',
    explanation: 'A data catalog serves as a centralized repository allowing users to search, discover, and understand the organization\'s data assets through metadata.'
  }
];
