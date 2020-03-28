const config = require('config');

const log = require('../lib/log');
const serviceHelper = require('./serviceHelper');
const zelcashService = require('./zelcashService');

const mongoUrl = `mongodb://${config.database.url}:${config.database.port}/`;

const addressIndexCollection = config.database.zelcash.collections.addressIndex;
const scannedHeightCollection = config.database.zelcash.collections.scannedHeight;

async function getSender(txid, vout) {
  const verbose = 1;
  const txContent = await zelcashService.getRawTransaction(txid, verbose);
  console.log(txContent);
  if (txContent.status === 'success') {
    const sender = txContent.data.vout[vout];
    return sender;
  }
  log.error(txContent.data);
  // TODO error
}

async function getTransaction(hash) {
  let transactionDetail = {};
  const verbose = 1;
  const txContent = await zelcashService.getRawTransaction(hash, verbose);
  console.log(txContent);
  if (txContent.status === 'success') {
    transactionDetail = txContent.data;
    const sendersToFetch = [];
    if (transactionDetail.version < 5 && transactionDetail.version > 0) {
      transactionDetail.vin.forEach((vin) => {
        if (!vin.coinbase) {
          // we need an address who sent those coins and amount of it.
          sendersToFetch.push(vin);
        }
      });
    }
    const senders = []; // Can put just value and address
    await Promise.all(sendersToFetch.map(async (sender) => {
      const senderInformation = await getSender(sender.txid, sender.vout);
      senders.push(senderInformation);
    }));
    transactionDetail.senders = senders;
    // transactionDetail now contains senders. So then going through senders and vouts when generating indexes.
    return transactionDetail;
  }
  log.error(txContent.data);
  // TODO error
}

async function getBlockTransactions(txidsArray) {
  const transactions = [];
  await Promise.all(txidsArray.map(async (transaction) => {
    const txContent = await getTransaction(transaction);
    if (txContent.status === 'success') {
      transactions.push(txContent.data);
    } else {
      log.error(txContent.data);
      // TODO error
    }
  }));
  return transactions;
}

async function getBlock(heightOrHash) {
  const verbosity = 1;
  const blockInfo = await zelcashService.getBlock(heightOrHash, verbosity);
  if (blockInfo.status === 'success') {
    return blockInfo.data;
  }
  log.error(blockInfo.data);
  // TODO error
}

async function processBlock(blockHeight) {
  // prepare database
  const db = await serviceHelper.connectMongoDb(mongoUrl).catch((error) => {
    log.error(error);
    throw error;
  });
  const database = db.db(config.database.zelcash.database);

  // get Block information
  const blockData = await getBlock(blockHeight);
  // get Block transactions information
  const transactions = await getBlockTransactions(blockData.tx);
  // now we have verbose transactions of the block extended for senders (vout type). So we go through senders (basically better vin) and vout.
  console.log(transactions);
  db.close();
}

module.exports = {
  processBlock,
};