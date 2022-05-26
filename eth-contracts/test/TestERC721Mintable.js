const {expectRevert} = require("@openzeppelin/test-helpers");

var ERC721Mintable = artifacts.require('ERC721Mintable');

contract('TestERC721Mintable', accounts => {

  const deployer = accounts[0];
  const holder1 = accounts[1];
  const holder2 = accounts[2];

  describe('match erc721 spec', function () {
    beforeEach(async function () {
      this.contract = await ERC721Mintable.new("SomeName", "SYM", "http://some.url/", {from: deployer});
      await this.contract.mint(holder1, 1, "", {from: deployer})
      await this.contract.mint(holder1, 2, "", {from: deployer})
      await this.contract.mint(holder1, 3, "", {from: deployer})
      await this.contract.mint(holder2, 4, "", {from: deployer})
    })

    it('should return total supply', async function () {
      const supply = await this.contract.totalSupply.call();
      assert.equal(supply, 4);
    })

    it('should get token balance', async function () {
      let balance = await this.contract.balanceOf.call(holder1);
      assert.equal(balance, 3);
      balance = await this.contract.balanceOf.call(holder2);
      assert.equal(balance, 1);
    })

    it('should return token uri', async function () {
      const uri = await this.contract.tokenURI.call(1)
      assert.equal(uri, "http://some.url/1");
    })

    it('should return deployer of token', async function () {
      let address = await this.contract.ownerOf.call(1)
      assert.equal(address, holder1);
      address = await this.contract.ownerOf.call(4)
      assert.equal(address, holder2);
    })

    it('should transfer token from one deployer to another', async function () {
      await this.contract.transferFrom(holder1, holder2, 1, {from: holder1})
      const address = await this.contract.ownerOf.call(1)
      assert.equal(address, holder2);
      const balance = await this.contract.balanceOf.call(holder2);
      assert.equal(balance, 2);
    })
  });

  describe('have ownership properties', function () {
    beforeEach(async function () {
      this.contract = await ERC721Mintable.new("SomeName", "SYM", "http://some.url/", {from: deployer});
    })

    it('should fail when minting when address is not contract deployer', async function () {
      await expectRevert(this.contract.mint(holder1, 1, "", {from: holder1}), "Ownable: caller is not the owner");
    })

    it('should return contract deployer', async function () {
      const owner = await this.contract.owner.call()
      assert.equal(owner, deployer);
    })
  });

  describe('have pausable capabilities', function () {
    beforeEach(async function () {
      this.contract = await ERC721Mintable.new("SomeName", "SYM", "http://some.url/", {from: deployer});
    })

    it('should be initially not paused', async function () {
      const paused =  await this.contract.paused.call()
      assert.equal(paused, false);
    })


    it('should be paused only by owner', async function () {
      await expectRevert(this.contract.pause({from: holder1}), "Ownable: caller is not the owner");
      await this.contract.pause({from: deployer})
      const paused =  await this.contract.paused.call()
      assert.equal(paused, true);
    })

    it('should not mint or transfer if contract is paused', async function () {
      await this.contract.mint(holder1, 1, "", {from: deployer})
      await this.contract.pause({from: deployer})

      await expectRevert(this.contract.mint(holder1, 2, "", {from: deployer}), "Pausable: paused");
      await expectRevert(this.contract.transferFrom(holder1, holder2, 1, {from: holder1}), "Pausable: paused");

      const supply = await this.contract.totalSupply.call();
      assert.equal(supply, 1);
    })
  });
})