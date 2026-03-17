const express = require('express');
const router = express.Router();
const { Server, Networks, TransactionBuilder, Asset } = require('stellar-sdk');

// Get network info
router.get('/network', (req, res) => {
  try {
    const network = process.env.STELLAR_NETWORK === 'mainnet' 
      ? Networks.PUBLIC 
      : Networks.TESTNET;

    res.json({
      success: true,
      data: {
        network: process.env.STELLAR_NETWORK,
        horizonUrl: process.env.STELLAR_HORIZON_URL,
        sorobanRpcUrl: process.env.STELLAR_SOROBAN_RPC_URL,
        passphrase: network
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get account info
router.get('/account/:publicKey', async (req, res) => {
  try {
    const { publicKey } = req.params;
    const server = new Server(process.env.STELLAR_HORIZON_URL);
    const account = await server.loadAccount(publicKey);

    res.json({
      success: true,
      data: {
        publicKey: account.publicKey(),
        sequence: account.sequence(),
        balances: account.balances()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Create transaction
router.post('/transaction', async (req, res) => {
  try {
    const { from, to, amount, asset } = req.body;
    
    const server = new Server(process.env.STELLAR_HORIZON_URL);
    const sourceAccount = await server.loadAccount(from);

    let transaction;
    if (asset && asset !== 'XLM') {
      // Custom asset transaction
      const customAsset = new Asset(asset.code, asset.issuer);
      transaction = new TransactionBuilder(sourceAccount, {
        fee: process.env.STELLAR_NETWORK === 'mainnet' ? 100 : 100,
        networkPassphrase: process.env.STELLAR_NETWORK === 'mainnet' 
          ? Networks.PUBLIC 
          : Networks.TESTNET
      })
        .addOperation({
          type: 'payment',
          destination: to,
          asset: customAsset,
          amount: amount
        })
        .setTimeout(30)
        .build();
    } else {
      // XLM transaction
      transaction = new TransactionBuilder(sourceAccount, {
        fee: process.env.STELLAR_NETWORK === 'mainnet' ? 100 : 100,
        networkPassphrase: process.env.STELLAR_NETWORK === 'mainnet' 
          ? Networks.PUBLIC 
          : Networks.TESTNET
      })
        .addOperation({
          type: 'payment',
          destination: to,
          amount: amount
        })
        .setTimeout(30)
        .build();
    }

    res.json({
      success: true,
      data: {
        xdr: transaction.toXDR(),
        operations: transaction.operations.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Submit transaction
router.post('/submit', async (req, res) => {
  try {
    const { xdr } = req.body;
    
    const server = new Server(process.env.STELLAR_HORIZON_URL);
    const transaction = TransactionBuilder.fromXDR(xdr);
    
    const result = await server.submitTransaction(transaction);
    
    res.json({
      success: true,
      data: {
        hash: result.hash,
        ledger: result.ledger,
        operations: result.operations
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Transaction failed',
      error: error.message
    });
  }
});

module.exports = router;
