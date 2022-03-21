const Caver = require("caver-js");
const addressBookAbi = require("./abi/addressBook.json");
const { toUSDTBalances } = require("../helper/balances");

const coinAddress = "0x0000000000000000000000000000000000000000";
const addressBook = "0x380814144fA550B83A2Be6367c71e60660494cAa";
async function klaytn() {
  const provider = new Caver.providers.HttpProvider(
    "https://public-node-api.klaytnapi.com/v1/cypress"
  );
  const caver = new Caver(provider);
  let klaytnTVL = 0;

  const addressBookContract = new caver.klay.Contract(
    addressBookAbi,
    addressBook
  );
  const poolLength = await addressBookContract.methods.addressLength().call();
  for (let i = 0; i < poolLength; i++) {
    const tvl = await addressBookContract.methods
      .getTvl(i)
      .call()
      .catch((err) => 0);
    klaytnTVL += Number(tvl);

  }

  klaytnTVL = klaytnTVL / 1e18;
  return toUSDTBalances(klaytnTVL);
}
module.exports = {
  klaytn: {
    tvl: klaytn,
  },
};

