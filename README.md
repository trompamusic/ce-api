# TROMPA Contributor Environment - GraphQL API

[![Known Vulnerabilities][snyk-image]][snyk-url]
[![Code Style][cst-image]][cst-url]

## Documentation

- [Authentication](docs/authentication.md)

## Quick Start

#### System requirements

Docker should be installed on your local machine.

The easiest way to start the CE API including a Neo4j database, is by using Docker compose. By running the following command, two docker containers will be created locally and started locally.

```
docker-compose up --build
```

## Development

#### System requirements

The CE api runs in [Node.js](https://nodejs.org/en/) v10

#### Install dependencies:

Run the following command to install all dependencies:

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
```

#### Neo4j instance:

Download and install [Neo4j Desktop](https://neo4j.com/download/). Follow the [manual](https://neo4j.com/developer/neo4j-desktop/#_installing_and_starting_neo4j_desktop) to create a new database using the example configuration values.

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

## Contributing

The CE API is an open source project which is being developed for the [TROMPA](https://trompamusic.eu/) project. If you would like to contribute to this project, please make sure you've read the following sections:

### Branches

The CE API repository is using two branches; the **staging** branch which is being used for Pull Requests and testing. Whenever a new version is released, the staging branch gets merged into the **master** branch. Commits should not be pushed directly to the master branch.

### Code style

The CE API project implements the [Standard JS](https://standardjs.com/) code style. Before each commit, all changes will be linted and fixed whenever possible. It's also possible to manually run the linter by using the following command: `$ npm start lint`.

### Commits

Commits must validate to the [Angular Commit Guidelines](https://github.com/angular/angular/blob/22b96b9/CONTRIBUTING.md#-commit-message-guidelines). This helps us, amongst others, to auto-generate the [CHANGELOG](CHANGELOG.md).   

### Pull request

If you would like to submit a proposal/change/fix, submit a Pull request to the [trompamusic/ce-api](https://github.com/trompamusic/ce-api) repository.

[snyk-image]: https://snyk.io/test/github/trompamusic/ce-api/badge.svg
[snyk-url]: https://snyk.io/test/github/trompamusic/ce-api
[cst-image]: https://img.shields.io/badge/code_style-standard-brightgreen.svg
[cst-url]: https://standardjs.com/
