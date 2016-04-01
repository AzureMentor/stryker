'use strict';

var expect = require('chai').expect;
import Mutant from '../../../src/Mutant';
import RemoveConditionalsMutation from '../../../src/mutations/RemoveConditionalsMutation';
import * as parserUtils from '../../../src/utils/parserUtils';
require('mocha-sinon');

describe('RemoveConditionalsMutation', function() {
  var removeConditionalsMutation: RemoveConditionalsMutation;
  var code: string;
  var ast: ESTree.Program;
  var doWhileLoop: ESTree.DoWhileStatement;
  var forLoop: ESTree.ForStatement;
  var whileLoop: ESTree.WhileStatement;
  var ifStatement: ESTree.IfStatement;

  beforeEach(function() {
    this.sinon.stub(Mutant.prototype, 'save');

    removeConditionalsMutation = new RemoveConditionalsMutation();
    code =
    'var price = 99.95;\
    if(price > 25){\
      console.log("Too expensive");\
    }\
    while(price > 50){\
      price = price * 0.25;\
    }\
    do {\
      console.log("I\'m sorry. The price is still too high");\
      price = price - 5;\
    } while(price > 30);\
    for(var i = 0; i < 10; i++) {\
      console.log("I would like to buy the item");\
    }';

    ast = parserUtils.parse(code);
    ifStatement = <ESTree.IfStatement>ast.body[1];
    whileLoop = <ESTree.WhileStatement>ast.body[2];
    doWhileLoop = <ESTree.DoWhileStatement>ast.body[3];
    forLoop = <ESTree.ForStatement>ast.body[4];
  });

  function applyMutation(node: ESTree.IfStatement| ESTree.DoWhileStatement | ESTree.WhileStatement | ESTree.ForStatement){
    return removeConditionalsMutation.applyMutation('Hello.js', code, node, ast);
  }

  describe('should not generate an infinite loop', function() {
    it('when given a do-while loop', function() {
      var mutants = applyMutation(doWhileLoop);
      var mutatedCode = mutants[0].mutatedCode;

      expect(mutatedCode).to.not.contain('true');
    });

    it('when given a while loop', function() {
      var mutants = applyMutation(whileLoop);
      var mutatedCode = mutants[0].mutatedCode;

      expect(mutatedCode).to.not.contain('true');
    });

    it('when given a for loop', function() {
      var mutants = applyMutation(forLoop);
      var mutatedCode = mutants[0].mutatedCode;

      expect(mutatedCode).to.not.contain('true');
    });
  });

  describe('should generate a single mutant', function() {
    it('when given a do-while loop', function() {
      var mutants = applyMutation(doWhileLoop);

      expect(mutants.length).to.equal(1);
    });

    it('when given a while loop', function() {
      var mutants = applyMutation(whileLoop);

      expect(mutants.length).to.equal(1);
    });

    it('when given a for loop', function() {
      var mutants = applyMutation(forLoop);

      expect(mutants.length).to.equal(1);
    });
  });

  describe('should generate multiple mutants', function() {
    it('when given an if-statement', function() {
      var mutants = applyMutation(ifStatement);

      expect(mutants.length).to.be.greaterThan(1);
    });
  });

  describe('should not alter the original test statement', function() {
    it('when given an do-while loop', function() {
      var originalTest = doWhileLoop.test;

      applyMutation(doWhileLoop);
      var resultTest = doWhileLoop.test;

      expect(resultTest).to.equal(originalTest);
    });

    it('when given an while loop', function() {
      var originalTest = whileLoop.test;

      applyMutation(whileLoop);
      var resultTest = whileLoop.test;

      expect(resultTest).to.equal(originalTest);
    });

    it('when given an for loop', function() {
      var originalTest = forLoop.test;

      applyMutation(forLoop);
      var resultTest = forLoop.test;

      expect(resultTest).to.equal(originalTest);
    });

    it('when given an if-statement', function() {
      var originalTest = ifStatement.test;

      applyMutation(ifStatement);
      var resultTest = ifStatement.test;

      expect(resultTest).to.equal(originalTest);
    });
  });
});
