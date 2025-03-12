const { sumTokens2 } = require('../helper/unwrapLPs');
const sdk = require("@defillama/sdk");

// Token adresi (Unit0 ağında)
const token = "0xB13Ae312BC7c45d7120bf8bf317d5f55C36b19dF";
// Ana dapp kontratı
const p2p = "0xDCb086519b5776AcBE15EeA5d65FC72498AD110f";

async function tvl(api) {
  // Token bakiyesini kontrol ediyoruz
  return sumTokens2({ api, owners: [p2p], tokens: [token] });
}

module.exports = {
  methodology: "TVL is calculated by checking the token balance in the P2P lending contract on Unit0 network.",
  timetravel: false, // Unit0 ağı için timetravel'ı kapatıyoruz
  // start: 1000000, // Projenizin başladığı blok numarasını ekleyebilirsiniz
  unit0: { // Unit0 ağı için
    tvl,
  }
};
