# TROMPA Contributor Environment - GraphQL API

## Quick Start

#### System requirements

The CE api runs in [Node.js](https://nodejs.org/en/) v10 

#### Install dependencies:

In the `./api` folder:

```
npm install
```

#### Configure:

The CE-api will need a Neo4j graph database to connect to.

The CE-api application takes its configuration values from the environment variables.
Set your Neo4j connection credentials in your environment variables. For example (Linux/Mac):

```
export NEO4J_URI="bolt://127.0.0.1:7687"
export NEO4J_USER="neo4j"
export NEO4J_PASSWORD="letmein"
export GRAPHQL_LISTEN_PORT=4000
export GRAPHQL_URI="http://localhost:4000"
```

#### Neo4j instance:

Download and install [Neo4j Desktop](https://neo4j.com/download/). Follow the [manual](https://neo4j.com/developer/neo4j-desktop/#_installing_and_starting_neo4j_desktop) to create a new database using the example configuration values.

Run the following Cypher query after the Neo4j instance has started in the Neo4j Browser (http://localhost:7474/browser/):

```
CALL db.index.fulltext.createNodeIndex('metadataSearchFields', ['Person','CreativeWork','Article','DigitalDocument','MediaObject','Review','AudioObject','DataDownload','Dataset','ImageObject','MusicComposition','MusicPlaylist','MusicRecording','VideoObject','Event','Organization','MusicGroup','Product','Place'],['title','creator','description','subject'],{eventually_consistent:true, analyzer:'english'})
```

#### Start the GraphQL service:

```
npm start
```

This will start the GraphQL service (by default on localhost:4000) where you can issue GraphQL requests or access the GraphQL Playground in the browser:
![GraphQL Playground](img/graphql-playground.png)

Check if the database connection works by entering the following query in the left section of the interface:

```
{
  __schema {
    types {
      name
    }
  }
}
```

## Run with docker

Run the CE-api docker container from the CE-api root folder:

```
docker-compose up --build
```

This docker container includes a preconfigured Neo4j instance.

Run the following Cypher query after the Neo4j instance has started in the Neo4j Browser (http://localhost:7474/browser/):

```
CALL db.index.fulltext.createNodeIndex('metadataSearchFields', ['Person','CreativeWork','Article','DigitalDocument','MediaObject','Review','AudioObject','DataDownload','Dataset','ImageObject','MusicComposition','MusicPlaylist','MusicRecording','VideoObject','Event','Organization','MusicGroup','Product','Place'],['title','creator','description','subject'],{eventually_consistent:true, analyzer:'english'})
```
