
const ADDRESSES = require('../helper/coreAssets.json')
const VAULT = "0x4cb280e63251b9ab24a54def74bf5995d82ff398";
const totalAssetsAbi = "uint256:totalAssets";

async function tvl(api) {
  const totalAssets = await api.call({
    target: VAULT,
    abi: totalAssetsAbi,
  });
  
  api.add(ADDRESSES.ethereum.USDT, totalAssets);
  return api.getBalances();
}

module.exports = {
  ethereum: { tvl },
  methodology:
    "",
};
