const sdk = require('@defillama/sdk');
const { sumTokensExport } = require('../helper/sumTokens');
const { sumTokens } = require('../helper/chain/bitcoin.js');
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
    const response = await fetch("https://www.coinbase.com/cbbtc/proof-of-reserves.json", {
      "headers": {
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "accept-language": "en-US,en;q=0.5",
        "cache-control": "no-cache",
        "pragma": "no-cache",
        "priority": "u=0, i",
        "sec-ch-ua": "\"Not)A;Brand\";v=\"8\", \"Chromium\";v=\"138\", \"Brave\";v=\"138\"",
        "sec-ch-ua-arch": "\"x86\"",
        "sec-ch-ua-bitness": "\"64\"",
        "sec-ch-ua-full-version-list": "\"Not)A;Brand\";v=\"8.0.0.0\", \"Chromium\";v=\"138.0.0.0\", \"Brave\";v=\"138.0.0.0\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-model": "\"\"",
        "sec-ch-ua-platform": "\"Linux\"",
        "sec-ch-ua-platform-version": "\"6.2.0\"",
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "none",
        "sec-fetch-user": "?1",
        "sec-gpc": "1",
        "upgrade-insecure-requests": "1",
      },
      "body": null,
      "method": "GET"
    });
  
    const res = await response.json();
  
    const bitcoinWallets = res.reserveAddresses.map(item => item.address)
  
    return sumTokens({ timestamp: api.timestamp, owners: bitcoinWallets })
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
