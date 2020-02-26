module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules  : {
    'scope-enum': [
      2, 'always', [
        'project',
        'schema',
        'neo4j',
        'resolvers',
        'queries',
        'mutations',
        'subscriptions'
      ],
    ],
  },
};
