FROM neo4j:3.5.3

ENV NEO4J_PASSWD=letmein

COPY import-csv.cypher /var/lib/neo4j/import/import-csv.cypher

# TODO: replace sleep with connection tester
CMD sleep 25 && cat "import/import-csv.cypher" | NEO4J_USERNAME=neo4j NEO4J_PASSWORD=letmein bin/cypher-shell -a bolt://neo4j:7687 --fail-fast
