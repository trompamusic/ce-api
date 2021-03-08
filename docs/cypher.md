# Useful Cypher queries

**Get all nodes with duplicate identifiers**

```cypher
MATCH (n:ThingInterface)
WITH n.identifier AS identifier, COLLECT(n) AS nodelist, COUNT(*) AS count
WHERE count > 1
RETURN identifier, count
```

**Update all duplicate nodes with an unique identifier**

```cypher
MATCH (n:ThingInterface)
WITH n.identifier AS identifier, COLLECT(n) AS nodelist, COUNT(*) AS count
WHERE count > 1
FOREACH (a IN nodelist | SET a.identifier = apoc.create.uuid())
RETURN identifier, count
```

**Get Neo4j version**

```cypher
CALL dbms.components() 
YIELD versions UNWIND versions AS version 
RETURN version
```

**List all indexes**

```cypher
CALL db.indexes
```
