const sdk = require("@defillama/sdk");
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

const calculateTvl = async (vaults, chain, block) => {
  const balances = {};
  const bals = await sdk.api2.abi.multiCall({
    abi,
    calls: vaults,
    chain,
    block,
  });

  bals.forEach((i) =>
    sdk.util.sumSingleBalance(balances, 'tether', i / 1e18, 'coingecko')
  );

  return balances;
};

module.exports = {
  misrepresentedTokens: true,
  methodology: 'staked gmd + vault balance',
  arbitrum: {
    staking: staking(arbitrum_staking, [arbitrum_esGMD, arbitrum_GMD]),
    tvl: async (ts, _, { arbitrum: block }) =>
      calculateTvl(
        [arbitrum_vault, arbitrum_vault2],
        'arbitrum',
        block
      ),
  },
  avax: {
    staking: staking(avax_staking, [avax_esGMD, avax_GMD]),
    tvl: async (ts, _, { avax: block }) =>
      calculateTvl(
        [avax_vault],
        'avax',
        block
      ),
  },
};



