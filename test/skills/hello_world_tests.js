let assert = require('assert');
let sinon = require('sinon');
let expect = require('chai').expect;
let hello_world = require('../../skills/hello_world.js')

describe('hello world', () => {
  let controller = { hears: sinon.spy() };

  hello_world(controller);

  it('should register hear action on controller', () => {
    expect(controller.hears.calledOnce).to.be.true;
  });
});