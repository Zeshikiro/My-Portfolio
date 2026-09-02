window.ROADMAP_DATA = [
  {
    id: 'sql-basics',
    title: 'SQL Basics',
    icon: 'ri-terminal-box-line',
    tier: 'foundation',
    description: 'Learn SELECT, INSERT, UPDATE, DELETE and basic query writing.',
    prerequisites: []
  },
  {
    id: 'relational-db',
    title: 'Relational Databases',
    icon: 'ri-database-2-line',
    tier: 'foundation',
    description: 'Tables, rows, columns, relationships, RDBMS concepts.',
    prerequisites: []
  },
  {
    id: 'er-diagrams',
    title: 'ER Diagrams',
    icon: 'ri-node-tree',
    tier: 'foundation',
    description: 'Entity-Relationship modeling, cardinality, notation.',
    prerequisites: []
  },
  {
    id: 'normalization',
    title: 'Normalization',
    icon: 'ri-layout-masonry-line',
    tier: 'foundation',
    description: '1NF, 2NF, 3NF, BCNF, denormalization trade-offs.',
    prerequisites: []
  },
  {
    id: 'data-types',
    title: 'Data Types & Constraints',
    icon: 'ri-text-spacing',
    tier: 'foundation',
    description: 'VARCHAR, INT, DATE, PRIMARY KEY, FOREIGN KEY, UNIQUE, NOT NULL, CHECK.',
    prerequisites: []
  },
  {
    id: 'indexing',
    title: 'Indexing & Performance',
    icon: 'ri-flashlight-line',
    tier: 'foundation',
    description: 'B-tree indexes, query plans, EXPLAIN, optimization basics.',
    prerequisites: []
  },
  {
    id: 'data-warehousing',
    title: 'Data Warehousing',
    icon: 'ri-server-line',
    tier: 'intermediate',
    description: 'OLAP vs OLTP, fact tables, dimension tables, MPP architectures.',
    prerequisites: ['relational-db', 'normalization']
  },
  {
    id: 'etl-elt',
    title: 'ETL/ELT Pipelines',
    icon: 'ri-arrow-left-right-line',
    tier: 'intermediate',
    description: 'Extract-Transform-Load patterns, batch vs streaming, tools overview.',
    prerequisites: ['sql-basics', 'relational-db']
  },
  {
    id: 'dimensional-modeling',
    title: 'Dimensional Modeling',
    icon: 'ri-shape-line',
    tier: 'intermediate',
    description: 'Star schema, snowflake schema, slowly changing dimensions.',
    prerequisites: ['normalization', 'er-diagrams', 'data-warehousing']
  },
  {
    id: 'nosql-databases',
    title: 'NoSQL Databases',
    icon: 'ri-hard-drive-2-line',
    tier: 'intermediate',
    description: 'Document, key-value, column-family, graph databases.',
    prerequisites: ['relational-db', 'data-types']
  },
  {
    id: 'cloud-databases',
    title: 'Cloud Databases',
    icon: 'ri-cloud-windy-line',
    tier: 'intermediate',
    description: 'AWS RDS/Redshift, GCP BigQuery, Azure SQL, Snowflake.',
    prerequisites: ['relational-db', 'indexing']
  },
  {
    id: 'data-integration',
    title: 'Data Integration',
    icon: 'ri-links-line',
    tier: 'intermediate',
    description: 'APIs, CDC, data virtualization, message queues.',
    prerequisites: ['etl-elt']
  },
  {
    id: 'data-governance',
    title: 'Data Governance',
    icon: 'ri-government-line',
    tier: 'advanced',
    description: 'Policies, standards, stewardship, frameworks (DAMA-DMBOK).',
    prerequisites: ['data-warehousing']
  },
  {
    id: 'master-data',
    title: 'Master Data Management',
    icon: 'ri-medal-line',
    tier: 'advanced',
    description: 'MDM patterns, golden record, hierarchy management.',
    prerequisites: ['data-governance', 'data-integration']
  },
  {
    id: 'data-quality',
    title: 'Data Quality',
    icon: 'ri-shield-star-line',
    tier: 'advanced',
    description: 'Profiling, cleansing, validation rules, DQ dimensions.',
    prerequisites: ['data-governance']
  },
  {
    id: 'data-lineage',
    title: 'Data Lineage & Cataloging',
    icon: 'ri-route-line',
    tier: 'advanced',
    description: 'Metadata management, impact analysis, data catalogs.',
    prerequisites: ['etl-elt', 'data-governance']
  },
  {
    id: 'security-compliance',
    title: 'Security & Compliance',
    icon: 'ri-lock-2-line',
    tier: 'advanced',
    description: 'Encryption, masking, RBAC, GDPR, HIPAA.',
    prerequisites: ['data-governance', 'cloud-databases']
  },
  {
    id: 'enterprise-arch',
    title: 'Enterprise Data Architecture',
    icon: 'ri-building-4-line',
    tier: 'advanced',
    description: 'Reference architectures, standards, modeling patterns.',
    prerequisites: ['dimensional-modeling', 'data-governance']
  },
  {
    id: 'system-design',
    title: 'System Design at Scale',
    icon: 'ri-drag-drop-line',
    tier: 'expert',
    description: 'Distributed systems, CAP theorem, partitioning, replication.',
    prerequisites: ['enterprise-arch', 'cloud-databases']
  },
  {
    id: 'data-mesh',
    title: 'Data Mesh',
    icon: 'ri-share-forward-box-line',
    tier: 'expert',
    description: 'Domain-oriented ownership, data products, federated governance.',
    prerequisites: ['data-governance', 'enterprise-arch']
  },
  {
    id: 'data-lakehouse',
    title: 'Data Lakehouse',
    icon: 'ri-drop-line',
    tier: 'expert',
    description: 'Delta Lake, Apache Iceberg, Hudi, medallion architecture.',
    prerequisites: ['data-warehousing', 'cloud-databases', 'enterprise-arch']
  },
  {
    id: 'realtime-arch',
    title: 'Real-time Architectures',
    icon: 'ri-timer-flash-line',
    tier: 'expert',
    description: 'Kafka, Flink, event sourcing, CQRS, Lambda/Kappa architecture.',
    prerequisites: ['etl-elt', 'system-design']
  },
  {
    id: 'ml-feature-stores',
    title: 'ML Feature Stores',
    icon: 'ri-brain-line',
    tier: 'expert',
    description: 'Feature engineering, online/offline stores, ML pipelines.',
    prerequisites: ['data-lakehouse', 'data-quality']
  },
  {
    id: 'arch-patterns',
    title: 'Architecture Patterns & Decision-Making',
    icon: 'ri-git-merge-line',
    tier: 'expert',
    description: 'Evaluating trade-offs, ADRs, technology selection.',
    prerequisites: ['system-design', 'data-mesh']
  }
];
