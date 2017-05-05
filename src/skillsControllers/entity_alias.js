const supportedEntityAlias = {
  problem: { table: 'problem', description: 'Problem' },
  incident: { table: 'incident', description: 'Incident' },
  cr: { table: 'change_request', description: 'Change Request' },
};

module.exports = {
  get: (alias) => {
    const cleanAlias = alias.toLowerCase().trim();
    return supportedEntityAlias[cleanAlias];
  },
};
