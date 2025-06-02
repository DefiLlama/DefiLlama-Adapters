const sdk = require("@defillama/sdk");
const { compoundExports2 } = require('../helper/compound')
const { uniTvlExport } = require('../helper/calculateUniTvl.js');
const { staking } = require('../helper/staking')

const stONEAddr = "0x22D62b19b7039333ad773b7185BB61294F3AdC19"; // stONE ERC20 contract

const { tvl: _tvl, borrowed } = compoundExports2({ comptroller: '0x6a82A17B48EF6be278BBC56138F35d04594587E3', cether: '0x34b9aa82d89ae04f0f546ca5ec9c93efe1288940' })

async function tvl(api) {
  // Add ONE amount locked in Liquid Staking
  // https://docs.tranquil.finance/liquid-staking-stone/tranquil-stone
  const stoneBalance = await api.call({ target: stONEAddr, abi: 'erc20:totalSupply', })
  api.add(stONEAddr, stoneBalance)
  return api.getBalances()
}

const xtranqToken = "0xb4aa8c8e555b3a2f1bfd04234ff803c011760e59";
const stakingContract = "0x59a4d6b2a944e8acabbd5d2571e731388918669f";

module.exports = {
  methodology: "TVL includes values locked into TqTokens. Pool2 are the liquidity in the TRANQ-WONE SUSHI LPs. Staking TVL are the xTRANQ tokens locked into the staking contract.",
  harmony: {
    tvl: sdk.util.sumChainTvls([
      _tvl,
      tvl,
      uniTvlExport('0xF166939E9130b03f721B0aE5352CCCa690a7726a', 'harmony', true),
    ]),
    borrowed: borrowed,
    pool2: () => ({}),
    staking: staking(stakingContract, xtranqToken),
  },
  hallmarks: [
    [1655991120, "Horizon bridge Hack $100m"],
  ],
};
