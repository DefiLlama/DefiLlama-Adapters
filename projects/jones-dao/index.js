const { pool2s } = require("../helper/pool2");
const { stakings } = require("../helper/staking");
const addresses = require("./addresses.json");
const { sumTokens2 } = require("../helper/unwrapLPs");

const jTokenToToken = {
  "0x662d0f9ff837a51cf89a1fe7e0882a906dac08a3": "arbitrum:0x82af49447d8a07e3bd95bd0d56f35241523fbab1", // jETH
  "0x5375616bb6c52a90439ff96882a986d8fcdce421": "arbitrum:0x8d9ba570d6cb60c7e3e0f31343efe75ab8e65fb1", // jgOHM,
  "0xf018865b26ffab9cd1735dcca549d95b0cb9ea19": "arbitrum:0x6c2c06790b3e3e3c38e12ee22f8183b37a13ee55", // jDPX
  "0x1f6fa7a58701b3773b08a1a16d06b656b0eccb23": "arbitrum:0x32eb7902d4134bf98a28b963d26de779af92a212" // jrdpx
}

async function tvl(timestamp, block, chainBlocks, { api }) {
  let metaVaultsAddresses = [addresses.DpxEthBullVault, addresses.DpxEthBearVault, addresses.RdpxEthBullVault, addresses.RdpxEthBearVault];

  const [
    tokens, bals, vAssets, vBals,
  ] = await Promise.all([
    api.multiCall({  abi: 'address:depositToken', calls: metaVaultsAddresses}),
    api.multiCall({  abi: 'uint256:workingBalance', calls: metaVaultsAddresses}),
    api.multiCall({ abi: 'address:asset', calls: addresses.vaults }),
    api.multiCall({ abi: 'uint256:totalAssets', calls: addresses.vaults }),
  ])
  const toa = []
  api.addTokens(tokens,bals)
  api.addTokens(vAssets,vBals)
  Object.values(addresses.trackers).map(tracker => toa.push([tracker.token, tracker.holder]))
  toa.push([addresses.glp, addresses.strategy,])
  return sumTokens2({ api, tokensAndOwners: toa, });
}

module.exports = {
  arbitrum: {
    tvl,
    pool2: pool2s(addresses.lpStaking, addresses.lps, "arbitrum", addr => {
      addr = addr.toLowerCase();
      if (jTokenToToken[addr] !== undefined) {
        return jTokenToToken[addr];
      }
      return `arbitrum:${addr}`;
    }),
    staking: stakings(addresses.jonesStaking, addresses.jones)
  }
}
// node test.js projects/jones-dao/index.js