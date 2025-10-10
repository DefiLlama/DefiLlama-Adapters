const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs');
const sdk = require("@defillama/sdk");

// USDT token adresi (Unit0 ağında)
const usdt = ADDRESSES.unit0.USDT; // Unit0 ağındaki USDT adresi
// Ana dapp kontratı
const p2p = "0xDCb086519b5776AcBE15EeA5d65FC72498AD110f";

async function tvl(api) {
  // USDT bakiyesini kontrol ediyoruz
  return sumTokens2({ api, owners: [p2p], tokens: [usdt] });
}

module.exports = {
  methodology: "TVL is calculated by checking the USDT balance in the P2P lending contract on Unit0 network.",
  timetravel: false, // Unit0 ağı için timetravel'ı kapatıyoruz
  // start: 1000000, // Projenizin başladığı blok numarasını ekleyebilirsiniz
  unit0: { // Unit0 ağı için
    tvl,
  }
};
