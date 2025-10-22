const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk');
const { sumTokens2 } = require('../helper/unwrapLPs');
const { staking } = require('../helper/staking');

const LUSD = ADDRESSES.ethereum.LUSD;
const WETH = ADDRESSES.ethereum.WETH;
const USDC = ADDRESSES.ethereum.USDC;
const LQTY = '0x6DEA81C8171D0bA574754EF6F8b412F2Ed88c54D';
const YEARN_VAULT = '0x4fe4bf4166744bcbc13c19d959722ed4540d3f6a'; // deprecated, keep it for historical data
const LIQUITY_VAULT = '0x91a6194f1278f6cf25ae51b604029075695a74e5'; // deprecated, keep it for historical data
// const WETH_VAULT = '0x1Fc623b96c8024067142Ec9c15D669E5c99c5e9D'; // never in frontend or facing user
// const USDC_VAULT = '0x1038Ff057b7092f17807358c6f68b42661d15caB'; // never in frontend or facing user
const JADE = '0x00C567D2b1E23782d388c8f58E64937CA11CeCf1'; // in production
const AMETHYST = '0x8c0792Bfee67c80f0E7D4A2c5808edBC9af85e6F'; // in production
const EMERALD = '0x4c406C068106375724275Cbff028770C544a1333'; // in production
const OPAL = '0x096697720056886b905D0DEB0f06AfFB8e4665E5'; // in production
const AMBER = '0xdb369eEB33fcfDCd1557E354dDeE7d6cF3146A11'; // in production

const LIQUITY_STABILITY_POOL = '0x66017D22b0f8556afDd19FC67041899Eb65a21bb';

const v1Vaults = [YEARN_VAULT, LIQUITY_VAULT, JADE, AMETHYST];
const v2Vaults = [EMERALD, OPAL, AMBER];
const liquityVaults = [LIQUITY_VAULT, JADE, AMETHYST, AMBER];

async function tvl(api) {
  // v1 vaults assets
  const v1VaultBalances = await api.multiCall({    abi: 'uint256:totalUnderlying',    calls: v1Vaults,  })
  api.add(LUSD, v1VaultBalances)

  // v2 vaults assets
  const v2VaultBalances = await api.multiCall({    abi: 'uint256:totalAssets',    calls: v2Vaults,  })
  api.add(WETH, v2VaultBalances[0])
  api.add(USDC, v2VaultBalances[1])
  api.add(LUSD, v2VaultBalances[2])

  // LQTY balances in liquity vaults
  await api.sumTokens({ owners: liquityVaults, tokens: [LQTY], })

  // LQTY gains of liquity vaults in the stability pool
  const lqtyGains = await api.multiCall({    abi: 'function getDepositorLQTYGain(address) external view returns (uint256)',    target: LIQUITY_STABILITY_POOL, calls: liquityVaults,  });
  api.add(LQTY, lqtyGains)
}

module.exports = {
    methodology: 'add underlying asset balances in all the vaults together.',
  doublecounted: true,
  ethereum: {
    tvl,
    staking: staking("0x0a36f9565c6fb862509ad8d148941968344a55d8", "0xba8a621b4a54e61c442f5ec623687e2a942225ef")
  }
};