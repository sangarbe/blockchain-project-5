// Test if a new solution can be added for contract - SolnSquareVerifier

// Test if an ERC721 token can be minted for contract - SolnSquareVerifier

const fs = require('fs');
const SquareVerifier = artifacts.require('SquareVerifier');
const SolnSquareVerifier = artifacts.require('SolnSquareVerifier');
const {expectRevert} = require("@openzeppelin/test-helpers");
const {proof, inputs} = JSON.parse(fs.readFileSync(__dirname + '/../../zokrates/code/square/proof.json', 'utf-8'))

contract('SolnSquareVerifier', accounts => {

  const deployer = accounts[0];
  const holder1 = accounts[1];

  describe('mint with verification', () => {
    before(async () => {
      const verifier = await SquareVerifier.new({from: deployer})
      this.contract = await SolnSquareVerifier.new(verifier.address);
    })

    it('verifies and mints a token', async () => {
      await this.contract.mint(holder1, 1, proof, inputs, {from: deployer});
      const owner = await this.contract.ownerOf(1);
      assert.equal(owner, holder1);
    })

    it('can not reuse a solution proof', async () => {
      await expectRevert(this.contract.mint(holder1, 2, proof, inputs, {from: deployer}), "SolnSquareVerifier: solution already used");
      await expectRevert(this.contract.ownerOf(2),"ERC721: token does not exist");
    })
  })
})