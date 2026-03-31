const sdk = require('@defillama/sdk');
const { sumTokensExport } = require('../helper/sumTokens');
const { getConfig } = require('../helper/cache');
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')


const ADA_ADDRESSES = [
  "addr1qyn4lcv64v40a4667j7x3gjmc4wt32dejakwnwxx2geyemp8tlse42e2lmt44a9udz39h32uhz5mn9mvaxuvv53jfnkqc00vz5",
  "addr1vx6h5wyagdu70ecth9xmcnlnq9jct42nj4mm4ej3fmrcmvgaycmzh",
  "addr1vxwzm0hd3vpsxg9p7mm386ahul8l08jvq2v6cm7v5gg9p3cx8al02"
];

const XRP_ADDRESSES = [
    "rKopBmtBSMmUD6NCFNwGTG3b9ZxNzf7Tt4",
    "rU1DGbMWhrFSJLPcrtKuV5iPyD1wrVgeaU",
    "rMbVVXFHaBpSpJhdR1xvy7dkQL1gtnkopg",
    "rGsMk4nK4M8MtcjVbjUeaJBppjjKpXyJ7F"
];

const DOGE_ADDRESSES = [
  "DLuceb7v8vHknepvYRTzz5bSMUAqax8vTN",
  "DCqkF26vcqG1FGJiB7L73jyTDeFkjeEPvJ",
  "DNhLqkURqaQDW4f4J9wxtVzRw1XxhkjZ6m"
  ];

async function btcTvl(api) {
  const config = await getConfig('coinbase-cbbtc-proof-of-reserves', 'https://www.coinbase.com/cbbtc/proof-of-reserves.json')
  const balances = {}
  const totalBtc = config.reserveAddresses.reduce((sum, item) => sum + parseFloat(item.balance.amount), 0)
  sdk.util.sumSingleBalance(balances, 'bitcoin', totalBtc)
  return balances
}



module.exports = {
    methodology: "TVL tracks wrapped tokens backed 1:1 by assets held by Coinbase",
    cardano: {
      tvl: sdk.util.sumChainTvls([
        sumTokensExport({ owners: ADA_ADDRESSES }),
      ]),
    },
    ripple: {
      tvl: sdk.util.sumChainTvls([
        sumTokensExport({ owners: XRP_ADDRESSES }),
      ]),
    },
    bitcoin: {
        tvl: btcTvl,
    },
    litecoin: {
        tvl: sdk.util.sumChainTvls([
          sumTokensExport({ owners: bitcoinAddressBook.coinbaseltc }),
        ]),
    },
    doge: {
      tvl: sumTokensExport({ owners: DOGE_ADDRESSES }),
    },
  };
