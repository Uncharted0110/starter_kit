const SupplyChainTracker = artifacts.require('./SupplyChainTracker.sol');

contract('SupplyChainTracker', (accounts) => {
  let tracker;

  before(async () => {
    tracker = await SupplyChainTracker.deployed();
  });

  describe('deployment', async () => {
    it('deploys successfully', async () => {
      const address = tracker.address;
      assert.notEqual(address, 0x0);
      assert.notEqual(address, '');
      assert.notEqual(address, null);
      assert.notEqual(address, undefined);
    });
  });

  describe('product management', async () => {
    const productId = 'DRUG001';
    const name = 'Paracetamol';
    const batch = 'BATCH42';
    const price = web3.utils.toWei('1', 'ether');
    const status = 'Manufactured';
    const ipfsHash = 'QmSomeIPFSHash';

    it('adds a product', async () => {
      const result = await tracker.addProduct(
        productId,
        name,
        batch,
        price,
        status,
        ipfsHash,
        { from: accounts[0] }
      );

      const event = result.logs[0].args;
      assert.equal(event.id, productId);
      assert.equal(event.name, name);
      assert.equal(event.manufacturer, accounts[0]);
    });

    it('gets the product details', async () => {
  try {
    const product = await tracker.getProduct(productId);

    assert.equal(product[0], name);                             // name
    assert.equal(product[1], batch);                            // batch
    assert.equal(product[2], accounts[0]);                      // manufacturer
    assert.equal(product[3], accounts[0]);                      // currentHolder
    assert.equal(product[4].toString(), price.toString());      // price
    assert.equal(product[5], status);                           // status
    assert.equal(product[6], ipfsHash);                         // ipfsHash
    assert.equal(product[7][0], accounts[0]);                   // history[0]
    assert.equal(product[8], false);                            // sold
  } catch (error) {
    console.error("Error getting product details:", error);
  }
});

  });

  describe('buying products', async () => {
    const seller = accounts[0];
    const buyer = accounts[1];
    const price = web3.utils.toWei('1', 'ether');

    it('allows a user to buy a product', async () => {
      const productId = 'DRUG002';
      await tracker.addProduct(
        productId,
        'Ibuprofen',
        'BATCH99',
        price,
        'Manufactured',
        'QmSomeOtherHash',
        { from: seller }
      );

      const result = await tracker.purchaseProduct(productId, { from: buyer, value: price });
      const product = await tracker.getProduct(productId);
      assert.equal(product[3], buyer);
      assert.equal(product[8], true); // sold should be true
    });

    it('prevents a user from buying their own product', async () => {
      const productId = 'DRUG003';
      await tracker.addProduct(
        productId,
        'Amoxicillin',
        'BATCH100',
        price,
        'Manufactured',
        'QmHashAmox',
        { from: seller }
      );

      try {
        await tracker.purchaseProduct(productId, { from: seller, value: price });
        assert.fail('The transaction should have failed');
      } catch (error) {
        assert.include(error.message, 'Cannot buy your own product');
      }
    });

    it('prevents a user from buying a product without enough Ether', async () => {
      const productId = 'DRUG004';
      await tracker.addProduct(
        productId,
        'Ciprofloxacin',
        'BATCH101',
        price,
        'Manufactured',
        'QmHashCipro',
        { from: seller }
      );

      try {
        await tracker.purchaseProduct(productId, { from: buyer, value: web3.utils.toWei('0.5', 'ether') });
        assert.fail('The transaction should have failed');
      } catch (error) {
        assert.include(error.message, 'Insufficient Ether sent');
      }
    });
  });
});
