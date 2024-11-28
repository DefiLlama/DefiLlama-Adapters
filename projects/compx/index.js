const { get } = require("../helper/http");
const { lookupAccountByID, lookupTransactionsByID, getAssetInfoWithoutReserve, lookupApplicationsBox, lookupApplications } = require("../helper/chain/algorand");

async function tvl() {
  await getAssetPrices();

  // Token Streams
  const [algoStreamTVL, asaStreamTVL, cdpTVL] = await Promise.all([getAlgoStreamTVL(), getASAStreamTVL(), getCDPVaultTokens()]);
  const tokenStreamTVL = algoStreamTVL.amount + asaStreamTVL.amount;

  const totalTvlUsd = tokenStreamTVL + cdpTVL;

  return { tether: totalTvlUsd };
}

const stakingPools = [
  // xUSD
  'EW6JAJOFRIXWURIIPCOCEXJ6SQ5QW2BQ7REE5CYEL4PSNYHUSIH2G55ZRI',
  // NIKO
  'XZOKYETGUQKIJJG4LSBAFYLDQRKCT6PQUO5CZJQ37VUD2VYMWRHH2LK7MI',
  // TinymanPool2.0 xMcRib-ALGO
  'RNL5YCWQDLYX4WXMM43ARQVFVNO4PSGWCLNKORUUVFCXQLR2LIURETDCDI'
];

async function staking() {
  await getAssetPrices();

  const ignoredAssets = [];
  const asaFeeRecipientBalances = await getASAFeeRecipientBalances(stakingPools);
  let totalUSD = 0;

  for (const recipient of asaFeeRecipientBalances) {
    const asaTotal = await getASABalancesUSDValue(recipient.asaBalances, ignoredAssets);
    totalUSD += asaTotal;
  }

  const algoFeeTotal = await getAlgoFeeTotal(asaFeeRecipientBalances.map((a) => a.algoBalance));
  
  const algoAssetId = 0;
  const algoFeeTVL = priceData[algoAssetId].max * algoFeeTotal / 10 ** 6;

  return {
    tether: totalUSD + algoFeeTVL
  };
}

module.exports = {
  algorand: {
    tvl,
    staking
  },
};

let priceData = {};
let assetInfo = {};

const vaults = [
    // Minting wallet
    "XN4OX5OFLZFLDBI4J36EGOIMKGR4NISEVFCQRXDTC4WT35GPBM5EJI7IOA",

    // gAlgo Vault
    "ABU4ZY2UAPJWIZPE5FZP6GWVXTIP77YNAF3KBWBNW6KNBZALKRKPZL6HLM",

    // Link Vault
    "YVQRJKC7TUD3XB3XCAA7SMY5OG7AHOTU465DI7HIOL4NQZMG52NXLBOMYA",

    // AVAX Vault
    "RQ4MNDFSG4CCCWEJMRNGE5ZRNV3F2PHZSDJZ5X266MXA65HMLRFFXNAW5Y",

    // Sol Vault
    "ODJPJKPAHL7NPRJC5XF42SWFHB37ECCQEGFJIA4TFWOXGKJQA6M7S5NL2M",

    // goBTC Vault
    "UVSJVQXX3KYYWTQVXPRTIA5QXYAM6Y26JI2P2NZP25RSJTVMP3X7ODNC5Q",

    // goETH Vault
    "DMVBFMMH3RIKCS3V77DCETWJDA2HW4LPEBURBUD7RQNVK5SKH5QZG6ZF4Q",

    // Silver Vault
    "H4437RZ3W2Q7JXIRPDIEFO65QNNTH4SICMNWT4SSEHNQ4UPIMAO63DNZGI",

    // Gold Vault
    "MJET3QJDM5MXC5ZREAPW5PUK4HN73VRYMAFGMPWG7VEIRQIHFQPSMA6CUQ",

    // mAlgo Vault
    "XXLNQOR5XNJU57W2TQ3WEJTL2RGQ2ABCSAU2CX4NSZZGPHB5WSOTT6BZXA",

    // Chips Vault
    "RJQNFSLZWSZ3W6N5TJCS2F6KNEWTXUQDFI7GXDXXCOC5UDIPYYN3W665YE",

    // Coop Vault
    "QTFSX7MJLUBP4TLCRNGMEQCOCG6Z2O5A7RAUREW5S5RYIGMGYDLDYYSMAQ",

    // Algo Vault
    "HVDIX7FCCJGH3XFJNTEAQZ22CQTD2LUD7NKN7JCY37SGFA2763A4NHUHRQ",

    // Deprecated Algo Vault
    "I4O4APZDX7R7GL26JA2G6ENO5KZHIN4ZLRJR4DANXJC6GU7A2SI6VNY6LA"
];

async function getCDPVaultTokens() {
  // Don't count xUSD
  const ignoredAssets = [760037151];
  const asaFeeRecipientBalances = await getASAFeeRecipientBalances(vaults);
  let totalUSD = 0;

  for (const recipient of asaFeeRecipientBalances) {
    const asaTotal = await getASABalancesUSDValue(recipient.asaBalances, ignoredAssets);
    totalUSD += asaTotal;
  }

  const algoFeeTotal = await getAlgoFeeTotal(asaFeeRecipientBalances.map((a) => a.algoBalance));
  
  const algoAssetId = 0;
  const algoFeeTVL = priceData[algoAssetId].max * algoFeeTotal / 10 ** 6;

  return totalUSD + algoFeeTVL;
}

async function getAlgoStreamTVL() {
  const algoRecipients = await getAlgoRecipients();
  const algoRecipientBalances = await getAlgoFeeRecipientBalances(algoRecipients);
  const algoFeeTotal = getAlgoFeeTotal(algoRecipientBalances);
  const algoAssetId = 0;
  const algoFeeTVL = priceData[algoAssetId].max * algoFeeTotal / 10 ** 6;

  return {
    amount: algoFeeTVL,
    totalStreams: algoRecipients.length,
  }
}

async function getASAStreamTVL() {
  const asaFeeRecipients = await getASARecipients();
  const asaFeeRecipientBalances = await getASAFeeRecipientBalances(asaFeeRecipients);

  let totalUSD = 0;
  for (const recipient of asaFeeRecipientBalances) {
    const asaTotal = await getASABalancesUSDValue(recipient.asaBalances);
    totalUSD += asaTotal;
  }

  let algoFeeTotal = await getAlgoFeeTotal(
    asaFeeRecipientBalances.map((a) => a.algoBalance)
  );

  const algoAssetId = 0;
  const algoFeeTVL = priceData[algoAssetId].max * algoFeeTotal / 10 ** 6;

  return {
    amount: totalUSD + algoFeeTVL,
    totalStreams: asaFeeRecipients.length,
  };
}

async function getASABalancesUSDValue(asas = [], ignoredAssets = []) {
  return asas.reduce((acc, curr) => {
    if (curr.balance === 0) {
      return acc;
    }

    if (ignoredAssets.includes(curr.assetId)) {
      return acc;
    }

    if (!priceData[curr.assetId]) {
      return acc;
    }

    return (
      acc +
      (curr.balance / 10 ** curr.decimals) * (priceData[curr.assetId]?.max || 0)
    );
  }, 0);
}

async function getAssetPrices() {
  if (!Object.keys(priceData).length) {
    priceData = await get("https://api-general.compx.io/api/prices");
  }

  return priceData;
}

async function getAlgoRecipients() {
  const { transactions } = await lookupTransactionsByID({
      'tx-type': 'pay',
      'address': 'KYYHXY5CANPEOH4WA4ZSISEMD5QYYBP6DOG3HNWJJIJNNKARYF5JYCNSNE',
      'address-role': 'sender',
      'exclude-close-to': 'true',
  });

  const uniqueRecipients = new Set(transactions.map((txn) => txn["inner-txns"][0]["inner-txns"][0]["payment-transaction"]["receiver"]));
  
  return Array.from(uniqueRecipients);
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

async function getAlgoFeeRecipientBalances(recipients = []) {
  const balances = [];
  for (const recipient of recipients) {
    const response = await lookupAccountByID(recipient);
    balances.push(response.account.amount);
  }

  return balances;
}

async function getASAFeeRecipientBalances(recipients = []) {
  const batchSize = 10;
  const promises = [];
  
  for (let i = 0; i < recipients.length; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize);
    promises.push(
      Promise.all(batch.map(async (recipient) => {
        const response = await lookupAccountByID(recipient);
        const algoBalance = response.account.amount;
        const asaBalances = await Promise.all(
          response.account.assets
            .map(async (asset) => {
              const assetId = asset["asset-id"];

              if (!assetInfo[assetId]) {
                assetInfo[assetId] = await getAssetInfoWithoutReserve(assetId);
              }

              return {
                balance: asset.amount,
                assetId: assetId,
                decimals: assetInfo[assetId].params.decimals,
              };
            })
        );
        return { algoBalance, asaBalances };
      }))
    );
  }

  const balances = (await Promise.all(promises)).flat();
  
  return balances;
}

function getAlgoFeeTotal(balances = []) {
  return balances.reduce((acc, balance) => acc + balance, 0);
}