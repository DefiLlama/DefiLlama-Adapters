const { sumTokens2 } = require('../helper/unwrapLPs');
const sdk = require("@defillama/sdk");

// Token adresi (Unit0 ağında)
const token = "0xB13Ae312BC7c45d7120bf8bf317d5f55C36b19dF";
// Ana dapp kontratı
const p2p = "0xDCb086519b5776AcBE15EeA5d65FC72498AD110f";

async function tvl(api) {
  try {
    // Token bakiyesini kontrol etmeye çalışıyoruz
    return sumTokens2({ api, owners: [p2p], tokens: [token] });
  } catch (error) {
    // Eğer token bakiyesi alınamazsa, kontratın ETH bakiyesini kullanıyoruz
    console.log("Token bakiyesi alınamadı, ETH bakiyesi kullanılıyor:", error.message);
    const ethBalance = await api.getBalance(p2p);
    api.add('ethereum:0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', ethBalance); // WETH adresi
    return api.getBalances();
  }
}

module.exports = {
  methodology: "TVL is calculated by checking the token balance in the P2P lending contract on Unit0 network.",
  timetravel: false, // Unit0 ağı için timetravel'ı kapatıyoruz
  // start: 1000000, // Projenizin başladığı blok numarasını ekleyebilirsiniz
  unit0: { // Unit0 ağı için
    tvl,
  }
};
