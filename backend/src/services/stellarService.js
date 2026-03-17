const { Server, Networks, TransactionBuilder, Asset } = require('stellar-sdk');
const logger = require('../utils/logger');

class StellarService {
  constructor() {
    this.server = new Server(process.env.STELLAR_HORIZON_URL);
    this.network = process.env.STELLAR_NETWORK === 'mainnet' 
      ? Networks.PUBLIC 
      : Networks.TESTNET;
  }

  // Get account information
  async getAccount(publicKey) {
    try {
      const account = await this.server.loadAccount(publicKey);
      return {
        success: true,
        data: {
          publicKey: account.publicKey(),
          sequence: account.sequence(),
          balances: account.balances(),
          subentryCount: account.subentry_count
        }
      };
    } catch (error) {
      logger.error('Error getting account:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Create payment transaction
  async createPayment(fromKeypair, toAddress, amount, asset = null, memo = null) {
    try {
      const sourceAccount = await this.server.loadAccount(fromKeypair.publicKey());
      
      let transaction = new TransactionBuilder(sourceAccount, {
        fee: process.env.STELLAR_NETWORK === 'mainnet' ? 100 : 100,
        networkPassphrase: this.network
      });

      if (asset && asset !== 'XLM') {
        // Custom asset payment
        const customAsset = new Asset(asset.code, asset.issuer);
        transaction = transaction
          .addOperation({
            type: 'payment',
            destination: toAddress,
            asset: customAsset,
            amount: parseFloat(amount)
          });
      } else {
        // XLM payment
        transaction = transaction
          .addOperation({
            type: 'payment',
            destination: toAddress,
            amount: parseFloat(amount)
          });
      }

      if (memo) {
        transaction.addMemo(memo);
      }

      const builtTransaction = transaction
        .setTimeout(30)
        .build();

      const signedTransaction = builtTransaction.sign(fromKeypair);
      
      return {
        success: true,
        data: {
          xdr: signedTransaction.toXDR(),
          hash: signedTransaction.hash()
        }
      };
    } catch (error) {
      logger.error('Error creating payment:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Submit transaction to network
  async submitTransaction(transactionXdr) {
    try {
      const transaction = TransactionBuilder.fromXDR(transactionXdr);
      const result = await this.server.submitTransaction(transaction);
      
      return {
        success: true,
        data: {
          hash: result.hash,
          ledger: result.ledger,
          operations: result.operations
        }
      };
    } catch (error) {
      logger.error('Error submitting transaction:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get transaction status
  async getTransactionStatus(transactionHash) {
    try {
      const transaction = await this.server.transactions()
        .transaction(transactionHash)
        .call();
      
      return {
        success: true,
        data: {
          hash: transaction.hash,
          successful: transaction.successful,
          ledger: transaction.ledger,
          created_at: transaction.created_at,
          memo: transaction.memo
        }
      };
    } catch (error) {
      logger.error('Error getting transaction status:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get account transactions
  async getAccountTransactions(publicKey, limit = 10, cursor = null) {
    try {
      const transactions = await this.server
        .transactions()
        .forAccount(publicKey)
        .limit(limit)
        .order('desc')
        .cursor(cursor)
        .call();
      
      return {
        success: true,
        data: {
          transactions: transactions.records,
          next_cursor: transactions.next
        }
      };
    } catch (error) {
      logger.error('Error getting account transactions:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get network info
  getNetworkInfo() {
    return {
      success: true,
      data: {
        network: process.env.STELLAR_NETWORK,
        horizonUrl: process.env.STELLAR_HORIZON_URL,
        sorobanRpcUrl: process.env.STELLAR_SOROBAN_RPC_URL,
        passphrase: this.network
      }
    };
  }

  // Validate address
  validateAddress(address) {
    try {
      const { StrKey } = require('stellar-sdk');
      return StrKey.isValidEd25519PublicKey(address);
    } catch (error) {
      return false;
    }
  }
}

module.exports = new StellarService();
