const { lookupTransactionsByID, sumTokens } = require("../helper/chain/algorand");

module.exports = {
  algorand: {
    tvl: getAlgoStreamTVL,
    vesting: getASAStreamTVL,
  },
};

async function getAlgoStreamTVL() {
  const { transactions } = await lookupTransactionsByID({
    'tx-type': 'pay',
    'address': 'KYYHXY5CANPEOH4WA4ZSISEMD5QYYBP6DOG3HNWJJIJNNKARYF5JYCNSNE',
    'address-role': 'sender',
    'exclude-close-to': 'true',
  });

  const uniqueRecipients = new Set(transactions.map((txn) => txn["inner-txns"][0]["inner-txns"][0]["payment-transaction"]["receiver"]));

  const algoRecipients = Array.from(uniqueRecipients);
  return sumTokens({ owners: algoRecipients, });
}

async function getASAStreamTVL() {
  const asaFeeRecipients = await getASARecipients();
  return sumTokens({ owners: asaFeeRecipients, });
}

async function getASARecipients() {
  let transactions = [];
  let nextToken = null;

  do {
    let query = {
      'tx-type': 'axfer',
      'address': 'JBV23ATJIL4MWXIJXZ6L2EJSJZOMP7YENNGUNQZAUTEN7QYSPC5ZHPR6SY',
      'address-role': 'sender',
      'exclude-close-to': 'true',
    };

    if (nextToken) {
      query['next'] = nextToken;
    }

    const response = await lookupTransactionsByID(query);

    transactions = transactions.concat(response.transactions);

    nextToken = response['next-token'];

  } while (nextToken);

  const uniqueRecipients = new Set();

  transactions.forEach((txn) => {
    const innerTxns = txn["inner-txns"][0]["inner-txns"];
    if (innerTxns && innerTxns.length >= 2) {
      uniqueRecipients.add(innerTxns[2]["asset-transfer-transaction"]["receiver"]);
    } else if (!innerTxns && txn["inner-txns"][0]["asset-transfer-transaction"]) {
      uniqueRecipients.add(txn["inner-txns"][0]["asset-transfer-transaction"]["receiver"]);
    }
  });

  return Array.from(uniqueRecipients);
}
