// Clear all
MATCH (n)
OPTIONAL MATCH (n)-[r]-()
WITH n,r LIMIT 50000
DELETE n,r
RETURN count(n) as deletedNodesCount;

// Drop metadataSearchFields index
CALL db.index.fulltext.drop('metadataSearchFields');

// Make all indexes
CALL db.index.fulltext.createNodeIndex('metadataSearchFields', ['Person','CreativeWork','Article','DigitalDocument','MediaObject','Review','AudioObject','DataDownload','Dataset','ImageObject','MusicComposition','MusicPlaylist','MusicRecording','VideoObject','Event','Organization','MusicGroup','Product','Place'],['title','creator','description','subject'],{eventually_consistent:true, analyzer:'english'});

// import persons.csv
LOAD CSV WITH HEADERS FROM 'https://trompa-ce-import.s3.amazonaws.com/persons.csv' AS line
CREATE (:Person { identifier: line.identifier, name: line.name });
