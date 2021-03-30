## <small>1.6.1 (2021-03-30)</small>

* fix(project): fix wrong month for created/modified fields ([1a8ff72](https://github.com/trompamusic/ce-api/commit/1a8ff72))
* chore(project): update JWT development token ([ad031ef](https://github.com/trompamusic/ce-api/commit/ad031ef))



## 1.6.0 (2021-03-22)

* fix: upgrade graphql-tag from 2.11.0 to 2.12.1 ([3a53241](https://github.com/trompamusic/ce-api/commit/3a53241))
* fix: upgrade neo4j-driver from 4.2.1 to 4.2.2 ([19f0727](https://github.com/trompamusic/ce-api/commit/19f0727))
* fix: upgrade validator from 12.1.0 to 12.2.0 ([3483048](https://github.com/trompamusic/ce-api/commit/3483048))
* fix: upgrade walk-sync from 2.0.2 to 2.2.0 ([ff13b9c](https://github.com/trompamusic/ce-api/commit/ff13b9c))
* feat(jsonld): extend @type with additionalType ([8513e9f](https://github.com/trompamusic/ce-api/commit/8513e9f)), closes [#85](https://github.com/trompamusic/ce-api/issues/85)
* feat(project): add green licenses check ([cfcb70f](https://github.com/trompamusic/ce-api/commit/cfcb70f))
* feat(project): create property and propertyValue `wasDerivedFrom` relation ([3587415](https://github.com/trompamusic/ce-api/commit/3587415))
* feat(project): update dependencies ([dbef14b](https://github.com/trompamusic/ce-api/commit/dbef14b))
* feat(schema): add skos:broader to DefinedTerm ([40b25c7](https://github.com/trompamusic/ce-api/commit/40b25c7))
* feat(schema): Add Web Annotations ([17d4834](https://github.com/trompamusic/ce-api/commit/17d4834))
* feat(schema): make memberOf and member inverses ([7b52dde](https://github.com/trompamusic/ce-api/commit/7b52dde))
* chore(project): add green licenses allow list and replace concatenate dependency ([25974c6](https://github.com/trompamusic/ce-api/commit/25974c6))
* chore(project): fix eslint warnings ([c95fc49](https://github.com/trompamusic/ce-api/commit/c95fc49))
* chore(project): prevent usage of private properties ([38730f3](https://github.com/trompamusic/ce-api/commit/38730f3))
* chore(project): run yarn install in github action ([d6f2b9e](https://github.com/trompamusic/ce-api/commit/d6f2b9e))
* doc(project): add snyk and code style badges ([8e96690](https://github.com/trompamusic/ce-api/commit/8e96690))



## <small>1.5.1 (2021-03-12)</small>

* fix(project): fix error when updating or creating a node without created and modified properties ([e4cbcb3](https://github.com/trompamusic/ce-api/commit/e4cbcb3))
* fix(search): register all searchable types with fulltext search dynamically ([45bfb6e](https://github.com/trompamusic/ce-api/commit/45bfb6e))
* chore(project): add docker-compose.debug.yml ([8cb1796](https://github.com/trompamusic/ce-api/commit/8cb1796))



## 1.5.0 (2021-03-11)

* chore(project): update modified for merge action ([c7fb21f](https://github.com/trompamusic/ce-api/commit/c7fb21f))
* feat(project): automatically set created and modified properties ([3029fb1](https://github.com/trompamusic/ce-api/commit/3029fb1)), closes [#112](https://github.com/trompamusic/ce-api/issues/112)
* feat(schema): Add Rating "templates" ([ef53fb9](https://github.com/trompamusic/ce-api/commit/ef53fb9))
* feat(schema): Use Neo4j DateTime type for created and modfied fields ([021ea58](https://github.com/trompamusic/ce-api/commit/021ea58))
* fix(api): fix error when requesting a node ([6158127](https://github.com/trompamusic/ce-api/commit/6158127))
* fix(search): search query improvements ([1bbff3a](https://github.com/trompamusic/ce-api/commit/1bbff3a))



## 1.4.0 (2021-03-09)

* chore(project): remove deprecated environment variable ([98af0b0](https://github.com/trompamusic/ce-api/commit/98af0b0))
* chore(project): use default value before validating valueRequired ([9f700a8](https://github.com/trompamusic/ce-api/commit/9f700a8))
* feat(jsonld):  use configs instead of descriptions for JSON-LD output ([b6f1e9c](https://github.com/trompamusic/ce-api/commit/b6f1e9c))
* feat(project): throw UserInputError on validation errors ([de858b5](https://github.com/trompamusic/ce-api/commit/de858b5)), closes [#129](https://github.com/trompamusic/ce-api/issues/129)
* feat(project): update neo4j and neo4j-graphql-js ([1459d27](https://github.com/trompamusic/ce-api/commit/1459d27))
* feat(project): use default values when requesting a control action ([9950c40](https://github.com/trompamusic/ce-api/commit/9950c40))
* feat(QueryHelper): simplify interface matcher ([76e9f84](https://github.com/trompamusic/ce-api/commit/76e9f84))
* feat(schema): Make Organization.legalName optional ([d2c0fb6](https://github.com/trompamusic/ce-api/commit/d2c0fb6))
* feat(search): improve search results for searchMetadataText ([d5f144b](https://github.com/trompamusic/ce-api/commit/d5f144b))
* feat(search): improve search without specific type ([df051e2](https://github.com/trompamusic/ce-api/commit/df051e2))
* fix(project): make migrations backwards compatible ([b2ba53f](https://github.com/trompamusic/ce-api/commit/b2ba53f))



## 1.3.0 (2021-02-26)

* chore(MusicPlaylist): rename relation name to be more specific ([e5b7e7c](https://github.com/trompamusic/ce-api/commit/e5b7e7c))
* feat(project): update dependencies with vulnerabilities ([df1420c](https://github.com/trompamusic/ce-api/commit/df1420c))
* feat(project): update Docker to use node-14.16.0 ([6959c18](https://github.com/trompamusic/ce-api/commit/6959c18))
* feat(schema): Align ItemListOrder enum with schema.org values ([ea66dda](https://github.com/trompamusic/ce-api/commit/ea66dda))
* fix: multiple control actions generated when match query returns multiple items ([2b1de56](https://github.com/trompamusic/ce-api/commit/2b1de56)), closes [#138](https://github.com/trompamusic/ce-api/issues/138)
* fix(MusicPlaylist): add trackItemList property ([e4e9ebd](https://github.com/trompamusic/ce-api/commit/e4e9ebd))



## 1.2.0 (2021-02-12)

* fix(search): fix allResults query error ([da7f85f](https://github.com/trompamusic/ce-api/commit/da7f85f))
* Add EXAMPLE_OF_WORK relations that link directly to Audio/MediaObject ([3d4f9a8](https://github.com/trompamusic/ce-api/commit/3d4f9a8))
* copy name field from Property to PropertyValue ([17b5798](https://github.com/trompamusic/ce-api/commit/17b5798))
* Remove custom URL scalar ([8be87f2](https://github.com/trompamusic/ce-api/commit/8be87f2))
* chore(deps-dev): bump node-fetch from 2.3.0 to 2.6.1 ([2af8452](https://github.com/trompamusic/ce-api/commit/2af8452))
* chore(deps): bump ini from 1.3.5 to 1.3.8 ([6e0302d](https://github.com/trompamusic/ce-api/commit/6e0302d))
* chore(schema): fix schema errors and update neo4j-graphql-js ([3214aef](https://github.com/trompamusic/ce-api/commit/3214aef))
* refactor(schema): use SearchableInterface for searchMetadataText query ([c8003c5](https://github.com/trompamusic/ce-api/commit/c8003c5))
* feat(project): remove CreativeWork type from schema ([aa9ad2f](https://github.com/trompamusic/ce-api/commit/aa9ad2f))
* feat(schema): merge Thing and Metadata interface ([084e0f4](https://github.com/trompamusic/ce-api/commit/084e0f4))



## 1.1.0 (2020-11-12)

* feat(project): run Neo4j migrations before starting the server ([b05622e](https://github.com/trompamusic/ce-api/commit/b05622e))
* feat(project): update dc terms and rdf urls ([7b88001](https://github.com/trompamusic/ce-api/commit/7b88001))
* feat(schema): add dc terms Agent to Person type ([b8da7b2](https://github.com/trompamusic/ce-api/commit/b8da7b2)), closes [#111](https://github.com/trompamusic/ce-api/issues/111)
* feat(schema): allow creator and endTime properties in RequestControlAction ([b1a4453](https://github.com/trompamusic/ce-api/commit/b1a4453))
* feat(schema): remove pending from subjectOf and url ([2cfb886](https://github.com/trompamusic/ce-api/commit/2cfb886))
* feat(search): improve the search algorithm ([d638f2c](https://github.com/trompamusic/ce-api/commit/d638f2c))
* fix(project): fix migrations failing due to Cypher issues ([1529872](https://github.com/trompamusic/ce-api/commit/1529872))
* fix(project): fix mixed schema/data migrations not working ([b4dbb27](https://github.com/trompamusic/ce-api/commit/b4dbb27))
* fix(schema): make isPartOf the inverse of hasPart ([e3f92bd](https://github.com/trompamusic/ce-api/commit/e3f92bd))
* chore(project): remove debug line ([b5baf60](https://github.com/trompamusic/ce-api/commit/b5baf60))
* chore(project): remove unused import ([ef7fc3f](https://github.com/trompamusic/ce-api/commit/ef7fc3f))



## 1.0.0 (2020-04-21)

* fix: add necessary labels to requested ControlActions ([d5fbe57](https://github.com/trompamusic/ce-api/commit/d5fbe57))
* fix: default actionStatus for RequestControlAction mutation ([0c31f39](https://github.com/trompamusic/ce-api/commit/0c31f39))
* fix: ensure actionStatus is set on RequestControlAction query ([c381750](https://github.com/trompamusic/ce-api/commit/c381750))
* fix: fix searchMetadataText query ([c7af3b8](https://github.com/trompamusic/ce-api/commit/c7af3b8))
* fix: RequestControlAction query without properties ([f4af89b](https://github.com/trompamusic/ce-api/commit/f4af89b))
* fix: Update and Merge mutations updating the wrong nodes ([2acd84b](https://github.com/trompamusic/ce-api/commit/2acd84b))
* fix(auth): add Authorization to the allowed CORS headers ([90febbd](https://github.com/trompamusic/ce-api/commit/90febbd))
* fix(auth): parse JWT_AUTH_KEYS instead of stringifying ([aac919a](https://github.com/trompamusic/ce-api/commit/aac919a))
* fix(docker): fix docker container ([9a2334b](https://github.com/trompamusic/ce-api/commit/9a2334b))
* fix(graphql): fix error when deleting non-existing node ([8c67543](https://github.com/trompamusic/ce-api/commit/8c67543))
* fix(json-ld): fix type not being discovered properly by the get type query ([7f40a03](https://github.com/trompamusic/ce-api/commit/7f40a03))
* fix(mutation): remove custom UpdateControlAction mutation ([c872bfd](https://github.com/trompamusic/ce-api/commit/c872bfd))
* fix(project): add Content-Type to CORS allowed headers ([bbe7e73](https://github.com/trompamusic/ce-api/commit/bbe7e73))
* fix(project): fix RequestControlAction mutation ([ab0e72e](https://github.com/trompamusic/ce-api/commit/ab0e72e))
* fix(project): fix RequestControlAction mutation query not working ([aa0812e](https://github.com/trompamusic/ce-api/commit/aa0812e))
* fix(project): install neo4j-graphql-js in dockerfile ([ec9957b](https://github.com/trompamusic/ce-api/commit/ec9957b))
* fix(schema): fix prov namespace URL ([e8defd9](https://github.com/trompamusic/ce-api/commit/e8defd9))
* fix(schema): fix queries and filters for interfaced types ([5691433](https://github.com/trompamusic/ce-api/commit/5691433))
* fix(schema): fix RequestControlAction query when property param is not defined ([aa71ebe](https://github.com/trompamusic/ce-api/commit/aa71ebe))
* fix(schema): make creator required in MetadataInterface ([734d5db](https://github.com/trompamusic/ce-api/commit/734d5db))
* fix(schema): Make name fields optional on all types ([000662f](https://github.com/trompamusic/ce-api/commit/000662f)), closes [#97](https://github.com/trompamusic/ce-api/issues/97)
* fix(schema): make ratingValue and bestRating required ([7154185](https://github.com/trompamusic/ce-api/commit/7154185))
* fix(search): fix pagination in searchMetadataText query ([7898d41](https://github.com/trompamusic/ce-api/commit/7898d41))
* fix(search): fix searchMetadataText query when offset or first is not given ([b44df14](https://github.com/trompamusic/ce-api/commit/b44df14))
* ci: Set up travis ([d9af5f3](https://github.com/trompamusic/ce-api/commit/d9af5f3))
* chore: add commit message linting ([0210aac](https://github.com/trompamusic/ce-api/commit/0210aac))
* chore(auth): fix eslint warning ([f7a658e](https://github.com/trompamusic/ce-api/commit/f7a658e))
* chore(auth): remove eslint comment and update error message ([3561889](https://github.com/trompamusic/ce-api/commit/3561889))
* chore(project): add auth environment variables to docker-compose file ([7ddc22d](https://github.com/trompamusic/ce-api/commit/7ddc22d))
* chore(project): fix livereload for start script ([35e7fa6](https://github.com/trompamusic/ce-api/commit/35e7fa6))
* chore(project): remove custom neo4j-graphql-js build in dockerfile ([2f110d4](https://github.com/trompamusic/ce-api/commit/2f110d4))
* chore(project): remove unused import ([7d31dbe](https://github.com/trompamusic/ce-api/commit/7d31dbe))
* chore(project): update docker scripts ([754c6f0](https://github.com/trompamusic/ce-api/commit/754c6f0))
* chore(schema): grammar ([5596682](https://github.com/trompamusic/ce-api/commit/5596682))
* chore(schema): re-add allowUndefinedInResolve ([b5ff459](https://github.com/trompamusic/ce-api/commit/b5ff459))
* chore(subscriptions): remove console.log ([3ee579e](https://github.com/trompamusic/ce-api/commit/3ee579e))
* feat(auth): allow changing the jwt expiration ([d934a61](https://github.com/trompamusic/ce-api/commit/d934a61))
* feat(auth): change the scope format to operation:type:action ([43d0bdd](https://github.com/trompamusic/ce-api/commit/43d0bdd))
* feat(auth): disable authentication if JWT_SECRET is missing ([bb61f82](https://github.com/trompamusic/ce-api/commit/bb61f82))
* feat(json-ld): convert agent and participant to Person objects ([6bd9bc9](https://github.com/trompamusic/ce-api/commit/6bd9bc9))
* feat(neo4j): disable lossless integers ([76add58](https://github.com/trompamusic/ce-api/commit/76add58))
* feat(project): bump neo4j-graphql-js to 2.13.0 ([cd480bb](https://github.com/trompamusic/ce-api/commit/cd480bb))
* feat(project): implement jwt authorization ([e061c16](https://github.com/trompamusic/ce-api/commit/e061c16))
* feat(project): update build and start scripts ([26399c4](https://github.com/trompamusic/ce-api/commit/26399c4))
* feat(project): wip authentication ([47a7969](https://github.com/trompamusic/ce-api/commit/47a7969))
* feat(schema): Add DefinedTermSet and DefinedTerm ([123f1a4](https://github.com/trompamusic/ce-api/commit/123f1a4))
* feat(schema): add input to override potentialAction ([28134e0](https://github.com/trompamusic/ce-api/commit/28134e0))
* feat(schema): Add Rating from schema.org ([39182ad](https://github.com/trompamusic/ce-api/commit/39182ad))
* feat(schema): add url param to UpdateControlAction mutation ([a968158](https://github.com/trompamusic/ce-api/commit/a968158))
* feat(schema): align actionStatusType enum with schema.org ([d085989](https://github.com/trompamusic/ce-api/commit/d085989)), closes [#29](https://github.com/trompamusic/ce-api/issues/29)
* feat(schema): default potentialAction actionStatus to PotentialActionStatus ([4bfa619](https://github.com/trompamusic/ce-api/commit/4bfa619))
* feat(schema): make ControlAction agent and participant properties of type String ([8220fc8](https://github.com/trompamusic/ce-api/commit/8220fc8))
* feat(schema): make description property optional ([5f77848](https://github.com/trompamusic/ce-api/commit/5f77848))
* feat(schema): make title property optional ([47707dd](https://github.com/trompamusic/ce-api/commit/47707dd))
* feat(subscriptions): implement generic subscription for create mutations ([5d7436f](https://github.com/trompamusic/ce-api/commit/5d7436f))
* feat(subscriptions): refactor subscription query and add MediaObject specific queries ([7f20b5e](https://github.com/trompamusic/ce-api/commit/7f20b5e))
* test(auth): add unit tests for auth functions ([b64be97](https://github.com/trompamusic/ce-api/commit/b64be97))
* test(schema): add unit tests for parseFieldName ([79fd6d2](https://github.com/trompamusic/ce-api/commit/79fd6d2))
* refactor: rename resolve to createResolver ([6a90870](https://github.com/trompamusic/ce-api/commit/6a90870))
* refactor(auth): move auth related functions to auth.js ([9f73d5b](https://github.com/trompamusic/ce-api/commit/9f73d5b))
* refactor(project): refactor subscriptions and authentication to field transformers ([e0fc526](https://github.com/trompamusic/ce-api/commit/e0fc526))
* docs(auth): add token for development environment ([178fd10](https://github.com/trompamusic/ce-api/commit/178fd10))
* docs(auth): added expiration and more environment variables ([bae2ecf](https://github.com/trompamusic/ce-api/commit/bae2ecf))
* docs(auth): update authentication documentation ([486466b](https://github.com/trompamusic/ce-api/commit/486466b))
* Enable all trompa supported languages ([ef868a6](https://github.com/trompamusic/ce-api/commit/ef868a6))
* make language optional ([9510c83](https://github.com/trompamusic/ce-api/commit/9510c83))
* Make name optional on some data types ([7529814](https://github.com/trompamusic/ce-api/commit/7529814))
* Make subject optional ([730604b](https://github.com/trompamusic/ce-api/commit/730604b))
* Update docs/authentication.md ([c75b136](https://github.com/trompamusic/ce-api/commit/c75b136))
* use dcterms:modified for the datetime that an item was modified/changed ([9bf4d13](https://github.com/trompamusic/ce-api/commit/9bf4d13))



## <small>0.6.1 (2020-01-13)</small>

* fix(project): install git in Dockerfile ([7be1dda](https://github.com/trompamusic/ce-api/commit/7be1dda))



## 0.6.0 (2020-01-13)

* chore: remove redundant code ([4482822](https://github.com/trompamusic/ce-api/commit/4482822))
* chore(project): revert including neo4j-graphql-js ([d646e70](https://github.com/trompamusic/ce-api/commit/d646e70))
* feat(project): remove a lot of redundant code after neo4j-graphql-js interfaces fix ([9d8dfd5](https://github.com/trompamusic/ce-api/commit/9d8dfd5))
* feat(project): temporarily add neo4j-graphql-js library to project ([0df5674](https://github.com/trompamusic/ce-api/commit/0df5674))
* feat(schema): exlude queries and mutations on interfaces ([8581cd1](https://github.com/trompamusic/ce-api/commit/8581cd1))
* fix(schema): add an identifier property to all interfaces ([45498c2](https://github.com/trompamusic/ce-api/commit/45498c2))
* fix(schema): fix performer property in Event type ([6be36eb](https://github.com/trompamusic/ce-api/commit/6be36eb))
* fix(schema): revert exclude interface mutations ([8330fb3](https://github.com/trompamusic/ce-api/commit/8330fb3))



## 0.5.0 (2020-01-09)

* feat: Make workExample relation the inverse of exampleOfWork ([5cf6e67](https://github.com/trompamusic/ce-api/commit/5cf6e67))
* feat(docker): add package-lock.json to Dockerfile ([4270257](https://github.com/trompamusic/ce-api/commit/4270257))
* feat(project): update dependencies ([2c697e4](https://github.com/trompamusic/ce-api/commit/2c697e4))
* fix: import debug helpers from logger util ([f14353f](https://github.com/trompamusic/ce-api/commit/f14353f))
* chore: add repository to package.json ([e79e9f2](https://github.com/trompamusic/ce-api/commit/e79e9f2))
* Bump lodash from 4.17.11 to 4.17.15 ([f76f567](https://github.com/trompamusic/ce-api/commit/f76f567))
* Bump mixin-deep from 1.3.1 to 1.3.2 ([141626d](https://github.com/trompamusic/ce-api/commit/141626d))



## 0.4.0 (2019-10-11)

* chore: fix eslint errors 4b58d3a
* chore: import debug helpers from logger util b7cfcdd
* chore(project): add missing dependencies fbd3572
* chore(project): npm security fixes cbfef93
* chore(project): update docker-compose file 94c1361
* fix: make subscriptions work again c993ac6
* fix(routes): fix accept header for JSON LD 3a6af41
* Bump eslint-utils from 1.3.1 to 1.4.2 c9d37c3
* Bump lodash.template from 4.4.0 to 4.5.0 3433db9
* Format DateTime objects in ISO8601 format 4d9817d
* Use the predicate as defined in the ontology as json key 96a58bc
* feat(project): add JSON-LD response handler 4caffea
* feat(schema): add name param in Person query ad1892d, closes #19
* refactor(project): refactor rest logic 8a12f03
* refactor(types): cleanup vocabularies in types c5c4637



## <small>0.3.2 (2019-04-15)</small>

* add basic node data response ([4041eb7](https://bitbucket.org/videodock/ce-api/commits/4041eb7))
* add CORS support ([d359091](https://bitbucket.org/videodock/ce-api/commits/d359091))
* add interfaces, unions and object handling ([f422535](https://bitbucket.org/videodock/ce-api/commits/f422535))
* add OPTIONS and additional request checks ([6abc108](https://bitbucket.org/videodock/ce-api/commits/6abc108))
* add premature 1 level deep output ([776e6b2](https://bitbucket.org/videodock/ce-api/commits/776e6b2))
* add query creation ([d85f64b](https://bitbucket.org/videodock/ce-api/commits/d85f64b))
* add returns ([2dd8a29](https://bitbucket.org/videodock/ce-api/commits/2dd8a29))
* add skeleton GetRequest ([0889d5d](https://bitbucket.org/videodock/ce-api/commits/0889d5d))
* Add types for ordered and unordered itemlists ([d8b8a02](https://bitbucket.org/videodock/ce-api/commits/d8b8a02))
* Add update action types (provenance tracking) ([c757790](https://bitbucket.org/videodock/ce-api/commits/c757790))
* adding unions to query ([5850b54](https://bitbucket.org/videodock/ce-api/commits/5850b54))
* allow graphql path ([b2f287e](https://bitbucket.org/videodock/ce-api/commits/b2f287e))
* auto code review correction ([36ffd2e](https://bitbucket.org/videodock/ce-api/commits/36ffd2e))
* clean up ([d596978](https://bitbucket.org/videodock/ce-api/commits/d596978))
* clean up ([096ae33](https://bitbucket.org/videodock/ce-api/commits/096ae33))
* clean up ([5f89c77](https://bitbucket.org/videodock/ce-api/commits/5f89c77))
* clean up ([1359ffa](https://bitbucket.org/videodock/ce-api/commits/1359ffa))
* correct Dockerfile ([6c48349](https://bitbucket.org/videodock/ce-api/commits/6c48349))
* debug pipelines ([ea4b3be](https://bitbucket.org/videodock/ce-api/commits/ea4b3be))
* fixed Person bug ([70dc595](https://bitbucket.org/videodock/ce-api/commits/70dc595))
* improve find node queries ([d347fa6](https://bitbucket.org/videodock/ce-api/commits/d347fa6))
* improve not found error ([01e503b](https://bitbucket.org/videodock/ce-api/commits/01e503b))
* improve Person type ([2353a03](https://bitbucket.org/videodock/ce-api/commits/2353a03))
* improve REST GetRequest handling ([ede6abc](https://bitbucket.org/videodock/ce-api/commits/ede6abc))
* include express ([b7b5429](https://bitbucket.org/videodock/ce-api/commits/b7b5429))
* include middleware ([f9eb449](https://bitbucket.org/videodock/ce-api/commits/f9eb449))
* intercept REST request for /<UUID> ([81a1117](https://bitbucket.org/videodock/ce-api/commits/81a1117))
* make deep nodes work for Unions ([0e07a28](https://bitbucket.org/videodock/ce-api/commits/0e07a28))
* prepare node full properties & relations query ([02a0bb5](https://bitbucket.org/videodock/ce-api/commits/02a0bb5))
* progress determining (deeper) property types ([3226526](https://bitbucket.org/videodock/ce-api/commits/3226526))
* progress on recursive typePropertiesClause() ([87d5012](https://bitbucket.org/videodock/ce-api/commits/87d5012))
* refactor ([07e462a](https://bitbucket.org/videodock/ce-api/commits/07e462a))
* refactor findNodeQuery ([4873e71](https://bitbucket.org/videodock/ce-api/commits/4873e71))
* refactor GetRequest ([1b45cd8](https://bitbucket.org/videodock/ce-api/commits/1b45cd8))
* remove redundant properties ([2cd07c8](https://bitbucket.org/videodock/ce-api/commits/2cd07c8))
* return 405 on usupported REST method ([7e9219f](https://bitbucket.org/videodock/ce-api/commits/7e9219f))
* use generateRelationClause for AddQuery ([d259b9b](https://bitbucket.org/videodock/ce-api/commits/d259b9b))
* use generateRelationClause for RemoveQuery ([ac2673c](https://bitbucket.org/videodock/ce-api/commits/ac2673c))



## <small>0.3.1 (2019-04-01)</small>

* feat(project): allow querying ControlAction by target property ([01dc3ac](https://bitbucket.org/videodock/ce-api/commits/01dc3ac))
* feat(project): make code style project wide ([106902b](https://bitbucket.org/videodock/ce-api/commits/106902b))
* feat(project): restructure directories ([232a07a](https://bitbucket.org/videodock/ce-api/commits/232a07a))
* feat(project): update babel dependencies ([be480e7](https://bitbucket.org/videodock/ce-api/commits/be480e7))
* style(project): lint babel config ([e59588e](https://bitbucket.org/videodock/ce-api/commits/e59588e))
* chore(api): update default neo4j password ([d54c032](https://bitbucket.org/videodock/ce-api/commits/d54c032))
* chore(project): add eslint ignore and lint script ([d3a715d](https://bitbucket.org/videodock/ce-api/commits/d3a715d))
* chore(project): fix package vulnerabilities ([766d07c](https://bitbucket.org/videodock/ce-api/commits/766d07c))
* refactor(project): use targetIdentifier in ControlAction query ([33e5de5](https://bitbucket.org/videodock/ce-api/commits/33e5de5))
* add docblocks ([b4a982c](https://bitbucket.org/videodock/ce-api/commits/b4a982c))
* add docblocks to Get and SearchQuery ([c70176e](https://bitbucket.org/videodock/ce-api/commits/c70176e))
* clean up ([322eb82](https://bitbucket.org/videodock/ce-api/commits/322eb82))
* improve UpdateControlAction by honouring resolveInfo ([1be6677](https://bitbucket.org/videodock/ce-api/commits/1be6677))
* refactor add query ([354c2c5](https://bitbucket.org/videodock/ce-api/commits/354c2c5))
* refactor remove relation query ([058b923](https://bitbucket.org/videodock/ce-api/commits/058b923))
* refactor UpdateControlAction query ([596cfb9](https://bitbucket.org/videodock/ce-api/commits/596cfb9))
* v0.3.0 ([9480230](https://bitbucket.org/videodock/ce-api/commits/9480230))
* fix(search): fix parse error when using an empty string ([6fc6508](https://bitbucket.org/videodock/ce-api/commits/6fc6508))



## 0.3.0 (2019-03-28)

* Action.error is a String ([2e414b2](https://github.com/trompamusic/ce-api/commits/2e414b2))
* add .gitignore file ([3cb9b1f](https://github.com/trompamusic/ce-api/commits/3cb9b1f))
* add add legalPerson functionalities ([42aab38](https://github.com/trompamusic/ce-api/commits/42aab38))
* add AddCreativeWorkInterfaceLegalPerson functionality ([0ca6faf](https://github.com/trompamusic/ce-api/commits/0ca6faf))
* add AddMediaObjectInterfaceCreativeWorkInterface functionality ([2787cd8](https://github.com/trompamusic/ce-api/commits/2787cd8))
* add AddMusicCompositionExampleOfWork mutation, clean up code ([4ddb521](https://github.com/trompamusic/ce-api/commits/4ddb521))
* add aliases to subquery ([2caad03](https://github.com/trompamusic/ce-api/commits/2caad03))
* add and apply standard linter ([6a23204](https://github.com/trompamusic/ce-api/commits/6a23204))
* add and implement ProvenanceActivityInterface ([c450eb4](https://github.com/trompamusic/ce-api/commits/c450eb4))
* add and implement ProvenanceEntityInterface ([328be1d](https://github.com/trompamusic/ce-api/commits/328be1d))
* add asyncProcess subscription - not working ([23be8b0](https://github.com/trompamusic/ce-api/commits/23be8b0))
* add base class for SearchQuery ([9262e9a](https://github.com/trompamusic/ce-api/commits/9262e9a))
* add basic function to add MusicComposition author (relate to Union type) ([71b8a22](https://github.com/trompamusic/ce-api/commits/71b8a22))
* add basic search query on Person ([1ba8c23](https://github.com/trompamusic/ce-api/commits/1ba8c23))
* add basic subscription to RequestControlAction ([f515abd](https://github.com/trompamusic/ce-api/commits/f515abd))
* add ControlAction creation ([fc02f5a](https://github.com/trompamusic/ce-api/commits/fc02f5a))
* add ControlAction creation query ([03cb730](https://github.com/trompamusic/ce-api/commits/03cb730))
* Add fulltext index search query ([ce2505e](https://github.com/trompamusic/ce-api/commits/ce2505e))
* add generate-query logic for automated propertyType retrieval ([43294a6](https://github.com/trompamusic/ce-api/commits/43294a6))
* add last Interfaced relation handling ([26b4a6c](https://github.com/trompamusic/ce-api/commits/26b4a6c))
* add metadata properties as viable parameters to GET requests ([3aab74e](https://github.com/trompamusic/ce-api/commits/3aab74e))
* add more interfacedType mutation functionality ([04aca64](https://github.com/trompamusic/ce-api/commits/04aca64))
* add package lock file ([0f96358](https://github.com/trompamusic/ce-api/commits/0f96358))
* add POC query alternatives for querying related Interfaced/Union types ([61204ab](https://github.com/trompamusic/ce-api/commits/61204ab))
* add Property and PropertyValue types ([1263be8](https://github.com/trompamusic/ce-api/commits/1263be8))
* add provenance Action types ([ea9e53b](https://github.com/trompamusic/ce-api/commits/ea9e53b))
* add ProvenanceAgentInterface and implementation ([093ab64](https://github.com/trompamusic/ce-api/commits/093ab64))
* add raw clause for single deeper node ([b46d396](https://github.com/trompamusic/ce-api/commits/b46d396))
* Add remove interface relation functionalities ([df667a9](https://github.com/trompamusic/ce-api/commits/df667a9))
* add request objects validation ([c1913ec](https://github.com/trompamusic/ce-api/commits/c1913ec))
* add retrieval of represented types for Union and Interface propertyTypes ([5bafcc1](https://github.com/trompamusic/ce-api/commits/5bafcc1))
* add search pagination ([ee7329c](https://github.com/trompamusic/ce-api/commits/ee7329c))
* add search query using APOC, ordered by weight ([e23eb32](https://github.com/trompamusic/ce-api/commits/e23eb32))
* add SoftwareApplication type ([30010d3](https://github.com/trompamusic/ce-api/commits/30010d3))
* add some fields to template ControlAction ([674d460](https://github.com/trompamusic/ce-api/commits/674d460))
* add ThingInterfacePotentialAction functionality ([79cbed6](https://github.com/trompamusic/ce-api/commits/79cbed6))
* add update functionality for ControlAction ([a7798a2](https://github.com/trompamusic/ce-api/commits/a7798a2))
* add working functionality for mutation subscription on ControlAction ([499f958](https://github.com/trompamusic/ce-api/commits/499f958))
* allow related type properties as arrays and single ([bccdfac](https://github.com/trompamusic/ce-api/commits/bccdfac))
* apply ProvenanceEntityInterface to all types ([8721bfa](https://github.com/trompamusic/ce-api/commits/8721bfa))
* auto generate search query with onFields and onTypes parameters ([0101f7c](https://github.com/trompamusic/ce-api/commits/0101f7c))
* automatically set relation direction on generated query ([3048b5a](https://github.com/trompamusic/ce-api/commits/3048b5a))
* clean up ([7ecf572](https://github.com/trompamusic/ce-api/commits/7ecf572))
* clean up ([4f5b944](https://github.com/trompamusic/ce-api/commits/4f5b944))
* clean up ([4ff110a](https://github.com/trompamusic/ce-api/commits/4ff110a))
* clean up ([d0a40fe](https://github.com/trompamusic/ce-api/commits/d0a40fe))
* clean up ([7ab88d0](https://github.com/trompamusic/ce-api/commits/7ab88d0))
* clean up ([6464f3b](https://github.com/trompamusic/ce-api/commits/6464f3b))
* clean up ([c2c1932](https://github.com/trompamusic/ce-api/commits/c2c1932))
* clean up GetQuery ([b156a89](https://github.com/trompamusic/ce-api/commits/b156a89))
* cleanup ([abc185d](https://github.com/trompamusic/ce-api/commits/abc185d))
* cleanup ([855932c](https://github.com/trompamusic/ce-api/commits/855932c))
* convert another string to template lteral ([2b60734](https://github.com/trompamusic/ce-api/commits/2b60734))
* convert searchQuery to neo4j 3.5 and improve subString handling ([bd34de9](https://github.com/trompamusic/ce-api/commits/bd34de9))
* create AddMusicCompositionAuthor support ([b89e46d](https://github.com/trompamusic/ce-api/commits/b89e46d))
* create class for getQuery ([0ce0238](https://github.com/trompamusic/ce-api/commits/0ce0238))
* create custom get query up to first properties, not deeper node ([8394269](https://github.com/trompamusic/ce-api/commits/8394269))
* create SearchQuery class ([1fb9e88](https://github.com/trompamusic/ce-api/commits/1fb9e88))
* create StringHelper and SchemaHelper classes ([e015c13](https://github.com/trompamusic/ce-api/commits/e015c13))
* create working example query for nodes with _schemaType property and deeper nodes resolved also when ([a00986e](https://github.com/trompamusic/ce-api/commits/a00986e))
* debug ([379ee05](https://github.com/trompamusic/ce-api/commits/379ee05))
* debug ([a72c385](https://github.com/trompamusic/ce-api/commits/a72c385))
* debug auto direction setting ([d536bcb](https://github.com/trompamusic/ce-api/commits/d536bcb))
* debug ControlActionUpdate subscription ([d174fb5](https://github.com/trompamusic/ce-api/commits/d174fb5))
* debug DELETE function ([ba1dae9](https://github.com/trompamusic/ce-api/commits/ba1dae9))
* debug description ([20b99b2](https://github.com/trompamusic/ce-api/commits/20b99b2))
* debug EntryPoint logic and retrieval ([a65c486](https://github.com/trompamusic/ce-api/commits/a65c486))
* debug interfaced relations ([e0ccc3c](https://github.com/trompamusic/ce-api/commits/e0ccc3c))
* debug RequestControlAction subscription ([56e99a4](https://github.com/trompamusic/ce-api/commits/56e99a4))
* debug search query builder ([f2be9f4](https://github.com/trompamusic/ce-api/commits/f2be9f4))
* debug updateControlAction ([7171560](https://github.com/trompamusic/ce-api/commits/7171560))
* deconstruct query result records before returning ([17796e3](https://github.com/trompamusic/ce-api/commits/17796e3))
* divide graphql into separate files ([e6c79b6](https://github.com/trompamusic/ce-api/commits/e6c79b6))
* do experiments with MusicComposition.exampleOfWork ([7aaa0d8](https://github.com/trompamusic/ce-api/commits/7aaa0d8))
* do standard lint ([17d0996](https://github.com/trompamusic/ce-api/commits/17d0996))
* enhance schema to express full available algorithm and properties ([3d7b1ef](https://github.com/trompamusic/ce-api/commits/3d7b1ef))
* experiment generating get query ([e6009bb](https://github.com/trompamusic/ce-api/commits/e6009bb))
* experiment with custom get queries ([9ca3934](https://github.com/trompamusic/ce-api/commits/9ca3934))
* experiment with custom resolver ([9784463](https://github.com/trompamusic/ce-api/commits/9784463))
* experiment with deconstructing resolveInfo parameters ([4106a96](https://github.com/trompamusic/ce-api/commits/4106a96))
* experiment with implementing union resolver ([48cf005](https://github.com/trompamusic/ce-api/commits/48cf005))
* extend and refine value enums ([30b6a6d](https://github.com/trompamusic/ce-api/commits/30b6a6d))
* extend ControlAction stati ([50666bf](https://github.com/trompamusic/ce-api/commits/50666bf))
* extend get queries to all types ([33d89ad](https://github.com/trompamusic/ce-api/commits/33d89ad))
* fix file ([8213e5b](https://github.com/trompamusic/ce-api/commits/8213e5b))
* generalize exampleOfWork mutation ([126f91a](https://github.com/trompamusic/ce-api/commits/126f91a))
* get tutorial example working ([884f6ee](https://github.com/trompamusic/ce-api/commits/884f6ee))
* identifier paremeter for all root type GET requests ([834e953](https://github.com/trompamusic/ce-api/commits/834e953))
* implement literal template on SearchQuery ([1d37182](https://github.com/trompamusic/ce-api/commits/1d37182))
* implement template literals ([12e7e53](https://github.com/trompamusic/ce-api/commits/12e7e53))
* improve debug/console ([ceb2bd1](https://github.com/trompamusic/ce-api/commits/ceb2bd1))
* improve naming ([3bd9cc2](https://github.com/trompamusic/ce-api/commits/3bd9cc2))
* improve payload and query ([17f8adf](https://github.com/trompamusic/ce-api/commits/17f8adf))
* improve query direction clause ([0ae6387](https://github.com/trompamusic/ce-api/commits/0ae6387))
* improve resolver aggregation ([e24319b](https://github.com/trompamusic/ce-api/commits/e24319b))
* improve schema file recovery ([16310cb](https://github.com/trompamusic/ce-api/commits/16310cb))
* improve schemaType resolving ([8d3a31b](https://github.com/trompamusic/ce-api/commits/8d3a31b))
* intercept library private NamedTypes like _Neo4jDate ([c29afad](https://github.com/trompamusic/ce-api/commits/c29afad))
* make GET query generation work (yet without relation to interface-type, and relation direction handl ([59acd34](https://github.com/trompamusic/ce-api/commits/59acd34))
* make nodeMutation subscription generic ([60d556c](https://github.com/trompamusic/ce-api/commits/60d556c))
* make RequestControlAction create query work ([9bfcb86](https://github.com/trompamusic/ce-api/commits/9bfcb86))
* make Union and Interface GET queries work ([657f071](https://github.com/trompamusic/ce-api/commits/657f071))
* make weight a 'private' property ([8029bc9](https://github.com/trompamusic/ce-api/commits/8029bc9))
* make working dynamic GetQuery class ([1adce93](https://github.com/trompamusic/ce-api/commits/1adce93))
* move generic code out from GetQuery ([6df22fc](https://github.com/trompamusic/ce-api/commits/6df22fc))
* npm install to update version in package-lock.json ([623f891](https://github.com/trompamusic/ce-api/commits/623f891))
* organize files ([422a59e](https://github.com/trompamusic/ce-api/commits/422a59e))
* progress auto generate create ControlAction query ([5d25203](https://github.com/trompamusic/ce-api/commits/5d25203))
* progress auto-generating RequestControlAction query ([dfa192d](https://github.com/trompamusic/ce-api/commits/dfa192d))
* progress ControlActionRequest subscription ([d5dc8fc](https://github.com/trompamusic/ce-api/commits/d5dc8fc))
* progress on requestControlAction ([a8cc854](https://github.com/trompamusic/ce-api/commits/a8cc854))
* progress to auto generating Create ControlAction from template ([ec00500](https://github.com/trompamusic/ce-api/commits/ec00500))
* progress to autogenerating improved Create ControlAction query ([db83e7a](https://github.com/trompamusic/ce-api/commits/db83e7a))
* progress to RequestControlAction implementation ([b05cee5](https://github.com/trompamusic/ce-api/commits/b05cee5))
* rationalise and cleanup ([1ec89d5](https://github.com/trompamusic/ce-api/commits/1ec89d5))
* refactor ([38e6b15](https://github.com/trompamusic/ce-api/commits/38e6b15))
* refactor SearchQuery ([622a608](https://github.com/trompamusic/ce-api/commits/622a608))
* refactor SearchQuery ([083149a](https://github.com/trompamusic/ce-api/commits/083149a))
* reinstate package lock ([2c0f842](https://github.com/trompamusic/ce-api/commits/2c0f842))
* remove _package-lock.json ([4f64e0e](https://github.com/trompamusic/ce-api/commits/4f64e0e))
* remove large schema file ([b83b5e7](https://github.com/trompamusic/ce-api/commits/b83b5e7))
* remove redundancy ([25363c5](https://github.com/trompamusic/ce-api/commits/25363c5))
* remove redundant code ([eecc819](https://github.com/trompamusic/ce-api/commits/eecc819))
* remove redundant debug imports ([6d1c827](https://github.com/trompamusic/ce-api/commits/6d1c827))
* remove redundant query lines ([860c15a](https://github.com/trompamusic/ce-api/commits/860c15a))
* rename _weight property ([5c5a08a](https://github.com/trompamusic/ce-api/commits/5c5a08a))
* rename function ([dd9e951](https://github.com/trompamusic/ce-api/commits/dd9e951))
* revert to v0.1 ([b6aa202](https://github.com/trompamusic/ce-api/commits/b6aa202))
* revert v0.1 ([bc2e589](https://github.com/trompamusic/ce-api/commits/bc2e589))
* rework pagination parameter handling ([d1b3736](https://github.com/trompamusic/ce-api/commits/d1b3736))
* schema corrections ([bf84ceb](https://github.com/trompamusic/ce-api/commits/bf84ceb))
* simplify function ([da27fd3](https://github.com/trompamusic/ce-api/commits/da27fd3))
* solve properties with null values ([70695d8](https://github.com/trompamusic/ce-api/commits/70695d8))
* standard --fix ([6fd9c3f](https://github.com/trompamusic/ce-api/commits/6fd9c3f))
* turn off all available languages except English ([c539ac6](https://github.com/trompamusic/ce-api/commits/c539ac6))
* update interfaced properties ([853517b](https://github.com/trompamusic/ce-api/commits/853517b))
* update neo4j-grapql library ([39fd9ee](https://github.com/trompamusic/ce-api/commits/39fd9ee))
* update npm ([ce51008](https://github.com/trompamusic/ce-api/commits/ce51008))
* update npm ([cb9dc25](https://github.com/trompamusic/ce-api/commits/cb9dc25))
* update package title and version ([a9a8748](https://github.com/trompamusic/ce-api/commits/a9a8748))
* update packages, simplify Action entities, add ActionInterface resolver ([55cfb8d](https://github.com/trompamusic/ce-api/commits/55cfb8d))
* update schema to handle new types and relations ([6604b43](https://github.com/trompamusic/ce-api/commits/6604b43))
* update to neo4j-graphql-js v3.2.* will solve the maximum call stack size error ([f26008f](https://github.com/trompamusic/ce-api/commits/f26008f))
* v0.3.0 ([682b24c](https://github.com/trompamusic/ce-api/commits/682b24c))
* weed out nodeSelectionSets for implementationTypes (broken) ([e852cbe](https://github.com/trompamusic/ce-api/commits/e852cbe))
* feat(project): add test framework ([480d8a9](https://github.com/trompamusic/ce-api/commits/480d8a9))
* chore(project): fix docker-compose build ([fa5ed93](https://github.com/trompamusic/ce-api/commits/fa5ed93))



## 0.2.0 (2018-12-13)

* chore(root): init npm and graphql files ([4805742](https://github.com/trompamusic/ce-api/commits/4805742))



## <small>0.1.1 (2018-12-13)</small>

* chore(root): empty changelog ([80271c0](https://github.com/trompamusic/ce-api/commits/80271c0))



