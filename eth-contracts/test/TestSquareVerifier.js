const fs = require('fs')
const SquareVerifier = artifacts.require('SquareVerifier');
const {proof, inputs} = JSON.parse(fs.readFileSync(__dirname + '/../../zokrates/code/square/proof.json', 'utf-8'))

contract('SquareVerifier', accounts => {

  const deployer = accounts[0];

  describe('test verification', () => {
    beforeEach(async () => {
      this.contract = await SquareVerifier.new({from: deployer});
    })

    it('should verify a correct proof', async () => {
      const verified = await this.contract.verifyTx.call(proof, inputs);
      assert.equal(verified, true);
    })

    it('should not verify an incorrect proof', async () => {
      inputs[1] = "0x0000000000000000000000000000000000000000000000000000000000000002";
      const verified = await this.contract.verifyTx.call(proof, inputs);
      assert.equal(verified, false);
    })
  })
})