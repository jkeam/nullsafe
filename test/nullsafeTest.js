const chai = require('chai');
const nullsafe = require('../nullsafe');
const NullsafeProxy = require('../models/nullsafeProxy');
const expect = chai.expect;

describe('nullsafe', function() {
  it('should get value', function() {
    const wrapped = nullsafe({id: 50});
    expect(wrapped.get('id').value).to.equal(50);
  });

  it('should call function after wrapping and unwrapping', function() {
    const wrapped = nullsafe({getName: () => 'Jon'});
    expect(wrapped.call('getName').value).to.equal('Jon');
  });

  it('should wrap object', function() {
    const wrapped = nullsafe({});
    expect(wrapped instanceof NullsafeProxy).to.equal(true);
  });

  it('can get null attributes', function() {
    const wrapped = nullsafe({id: 1});
    expect(wrapped.get('name').value).to.equal(null);
  });

  it('can chain null attributes', function() {
    const wrapped = nullsafe({id: 1});
    expect(wrapped.get('subobject').get('name').value).to.equal(null);
  });

  it('can apply null function', function() {
    const wrapped = nullsafe({id: 1});
    expect(wrapped.apply('calculate').value).to.equal(null);
  });

  it('can call null function', function() {
    const wrapped = nullsafe({id: 1});
    expect(wrapped.call('calculate', 1, 2).value).to.equal(null);
  });

  it('can apply and chain null function', function() {
    const wrapped = nullsafe({id: 1});
    expect(wrapped.apply('calculate').get('junk').value).to.equal(null);
  });

  it('can call and chain null function', function() {
    const wrapped = nullsafe({id: 1});
    expect(wrapped.call('calculate', 1, 2).get('junk').value).to.equal(null);
  });

  it('can chain multiple attributes', function() {
    const wrapped = nullsafe({id: 1});
    expect(wrapped.get('name').get('junk').value).to.equal(null);
  });

  it('can chain multiple function calls', function() {
    const wrapped = nullsafe({id: 1});
    expect(wrapped.call('name').call('junk').value).to.equal(null);
  });

  it('can chain multiple function applies', function() {
    const wrapped = nullsafe({id: 1});
    expect(wrapped.apply('name').apply('junk').value).to.equal(null);
  });

  it('can chain function call and apply and gets', function() {
    const wrapped = nullsafe({id: 1});
    expect(wrapped.apply('name').call('junk').get('stuff').value).to.equal(null);
  });

  it('can chain partial failing gets', function() {
    const wrapped = nullsafe({id: 1});
    expect(wrapped.get('id').call('junk').get('stuff').value).to.equal(null);
  });

  it('can chain partial failing function', function() {
    const wrapped = nullsafe({getName: () => 'Jon'});
    expect(wrapped.get('getName').call('junk').get('stuff').value).to.equal(null);
  });

  it('can get array', function() {
    const wrapped = nullsafe({ids: [1, 2, 3]});
    expect(wrapped.get('ids', 1).value).to.equal(2);
  });

  it('can chain array', function() {
    const wrapped = nullsafe({ids: [1, 2, 3]});
    expect(wrapped.get('ids', 1).get('junk').value).to.equal(null);
  });

  it('can chain array with functions', function() {
    const wrapped = nullsafe({ids: [1, 2, 3]});
    expect(wrapped.get('ids', 1).call('junk').value).to.equal(null);
  });

  it('can chain array with function and gets', function() {
    const wrapped = nullsafe({ids: [1, 2, 3]});
    expect(wrapped.get('ids', 1).call('junk').get('stuff').value).to.equal(null);
  });
});
