const entityAlias = require('../../src/skillsControllers/entity_alias.js');
const expect = require('chai').expect;

describe('entity aliases', () => {
  ['incident', 'INCIDENT', '   IncidENT   '].forEach((incident) => {
    it(`should contain the ${incident} alias`, () => {
      expect(entityAlias.get(incident)).to.deep.equal({ table: 'incident', description: 'Incident' });
    });
  });

  ['problem', 'PROBLEM', '   PROblem   '].forEach((problem) => {
    it(`should contain the ${problem} alias`, () => {
      expect(entityAlias.get(problem)).to.deep.equal({ table: 'problem', description: 'Problem' });
    });
  });

  ['cr', 'CR', '   cR   '].forEach((cr) => {
    it(`should contain the ${cr} alias`, () => {
      expect(entityAlias.get(cr)).to.deep.equal({ table: 'change_request', description: 'Change Request' });
    });
  });


  it('should return undefined if unknown alias', () => {
    expect(entityAlias.get('no clue')).to.be.undefined;
  });
});
