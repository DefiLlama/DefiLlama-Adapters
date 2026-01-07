const { staking } = require("../helper/staking");

const abi = 'uint256:totalUSDvaults';

const arbitrum_vault = "0xA7Ce4434A29549864a46fcE8662fD671c06BA49a";
const arbitrum_vault2 = "0x8080B5cE6dfb49a6B86370d6982B3e2A86FBBb08";
const arbitrum_staking = "0x48c81451d1fddeca84b47ff86f91708fa5c32e93";
const arbitrum_GMD = "0x4945970EfeEc98D393b4b979b9bE265A3aE28A8B";
const arbitrum_esGMD = "0x49E050dF648E9477c7545fE1779B940f879B787A";

const avax_vault = "0x5517c5F22177BcF7b320A2A5daF2334344eFb38C"
const avax_staking = "0x4f2c414b76fd9cd45c000af7a449ade4125740ce";
const avax_GMD = "0x1FE70939c2cEc8F31E8F7729442658586B469972";
const avax_esGMD = "0xeE788a8b015376eC0185e1e40140af03029C8763";

module.exports = {
  misrepresentedTokens: true,
  methodology: 'staked gmd + vault balance',
  arbitrum: {
    staking: staking(arbitrum_staking, [arbitrum_esGMD, arbitrum_GMD]),
    tvl
  },
  avax: {
    staking: staking(avax_staking, [avax_esGMD, avax_GMD]),
    tvl
  },
};

const config = {
  avax: [avax_vault],
  arbitrum: [arbitrum_vault, arbitrum_vault2],
}

async function tvl(api) {
  const vaults = config[api.chain]
  const bals = (await api.multiCall({  abi , calls: vaults })).map(i=>i/1e18).reduce((a,b)=>a+b,0)
  api.addUSDValue(bals)
}