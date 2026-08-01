const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')
const { sumTokensExport } = require('../helper/unknownTokens')
const { staking, } = require("../helper/staking");
const lensAbi = {
    "allPools": "function allPools() view returns (address[])",
    "gaugeForPool": "function gaugeForPool(address) view returns (address)",
    "allActivePools": "function allActivePools() view returns (address[])",
    "allGauges": "function allGauges() view returns (address[])",
    "allStakingPositionsOf": "function allStakingPositionsOf(address) view returns (tuple(address gauge, uint256 balance, uint256 derivedBalance, tuple(address token, uint256 earned)[] userRewards)[] rewardsData)"
  };

// Ramses contracts
const ramsesLens = '0xAAA68f40515bCcd8e407EBB4dBdF5046D105621e';
const nfpManager = '0xAA277CB7914b7e5514946Da92cb9De332Ce610EF';

// Ennead contracts
// arbi
const neadRam = '0x40301951Af3f80b8C1744ca77E55111dd3c1dba1';
const neadStake = '0x7D07A61b8c18cb614B99aF7B90cBBc8cD8C72680';
const lpDepositor = '0x1863736c768f232189F95428b5ed9A51B0eCcAe5';
const neadNfpDepositor = '0xe99ead648Fb2893d1CFA4e8Fe8B67B35572d2581';
// avax
const neadStake_avax = '0xe99ead39204bd394e56502A3ad56d7061EE6B1c7';
const neadSnek = '0xe99ead9519239F3eAad9339292d8A399739Cd55d';
const neadSnekLp = '0x82360748aC3D7045812c6783f355b41193d3492E';
const snekView = '0xe99eadc22747c95c658f41a02F1c6C2CcAefA757';
const booster = '0xe99ead683Dcf1eF0C7F6612be5098BC5fDF4998d';

async function arbiTvl(api) {
    let poolsAddresses = await api.call({ target: ramsesLens, abi: lensAbi.allPools, })
    let gauges = await api.multiCall({ target: ramsesLens, calls: poolsAddresses, abi: lensAbi.gaugeForPool, })
    poolsAddresses = poolsAddresses.filter((_, i) => gauges[i] !== nullAddress)
    gauges = gauges.filter(gauge => gauge !== nullAddress)
    const bals = await api.multiCall({  abi: 'erc20:balanceOf', calls: gauges.map(i => ({ target: i, params: lpDepositor}))})
    api.addTokens(poolsAddresses, bals)
    await sumTokens2({ api, uniV3nftsAndOwners: [[nfpManager, neadNfpDepositor],], resolveLP: true, })
}

async function avaxTvl(api) {
    const poolsAddresses = await api.call({ target: snekView, abi: lensAbi.allActivePools, })
    const gauges = await api.call({ target: snekView, abi: lensAbi.allGauges, })
    const bals = await api.multiCall({  abi: 'erc20:balanceOf', calls: gauges.map(i => ({ target: i, params: booster}))})
    api.addTokens(poolsAddresses, bals)
    return sumTokens2({ api, resolveLP: true, })
}

module.exports = {
    misrepresentedTokens: true,
    arbitrum: {
        staking: staking(neadStake, neadRam),
        tvl: arbiTvl,
    },
    avax: {
        staking: sumTokensExport({ owner: neadStake_avax, tokens: [neadSnek], lps: [neadSnekLp], useDefaultCoreAssets: true, }),
        tvl: avaxTvl
    }
};