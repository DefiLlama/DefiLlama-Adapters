const { sumTokens2 } = require('../helper/unwrapLPs');
const sdk = require("@defillama/sdk");

// USDT token adresi (Unit0 ağında)
// NOT: Lütfen bu adresi Unit0 ağındaki gerçek USDT adresi ile değiştirin
const usdt = "0xdAC17F958D2ee523a2206206994597C13D831ec7"; // Bu Ethereum'daki USDT adresi, Unit0 için güncelleyin
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
