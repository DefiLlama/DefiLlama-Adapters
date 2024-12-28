const ADDRESSES = require('../helper/coreAssets.json')
const { staking } = require("../helper/staking");
const { sumTokens2, nullAddress } = require("../helper/unwrapLPs");
const FACTORY_CONTRACT = "0x253924C4D0806Fd6A81f72e0bEa400CD97c64700";

const SLSD_LP = '0x712Ed536645e66d0d8605d3cB22d1ed3b2Dc255B';
const SLSD = '0xB668f51f1D63452b566456053fA348c3037E2B1F';
const eSLSD = '0x2dd8f7378fce12c9dfe36a6c155fc2446d18b3f9';
const abis = {
  "getStakingTokens": "function getStakingTokens() view returns (address[])",
  "getStakingPoolAddress": "function getStakingPoolAddress(address) view returns (address)",
}

async function tvl(api) {
  const tokens = await api.call({ abi: abis.getStakingTokens, target: FACTORY_CONTRACT, })
  const owners = await api.multiCall({ abi: abis.getStakingPoolAddress, target: FACTORY_CONTRACT, calls: tokens })
  tokens.forEach((v, i) => {
    if (v === nullAddress) {
      tokens.push(ADDRESSES.ethereum.WETH)
      owners.push(owners[i])
    }
  })
  return sumTokens2({ api, tokensAndOwners2: [tokens, owners], blacklistedTokens: [SLSD_LP, SLSD, eSLSD,] })
}

module.exports = {
  ethereum: {
    tvl,
    pool2: staking('0xBE13DC5235a64d090E9c62952654DBF3c65199d9', SLSD_LP)
  }
};
