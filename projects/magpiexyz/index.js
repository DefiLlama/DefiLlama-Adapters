const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk')
const { staking } = require('../helper/staking')
const WombatPoolHelperAbi = require("./abis/wombatPoolHelper.json")
const MasterMagpieAbi = require("./abis/masterMagpie.json");
const config = {
    bsc: {
        MasterMagpieAddress: "0xa3B615667CBd33cfc69843Bf11Fbb2A1D926BD46",
        VlMGPAddress: "0x9B69b06272980FA6BAd9D88680a71e3c3BeB32c6",
        MWOMSVAddress: ADDRESSES.null,
        MGPAddress: "0xD06716E1Ff2E492Cc5034c2E81805562dd3b45fa",
        WOMAddress: "0xAD6742A35fB341A9Cc6ad674738Dd8da98b94Fb1",
        MWOMAddress: "0x027a9d301FB747cd972CFB29A63f3BDA551DFc5c",
    },
    arbitrum: {
        MasterMagpieAddress: "0x664cc2BcAe1E057EB1Ec379598c5B743Ad9Db6e7",
        VlMGPAddress: "0x536599497Ce6a35FC65C7503232Fec71A84786b9",
        MWOMSVAddress: "0x21804FB90593458630298f10a85094cb6d3B07Db",
        MGPAddress: "0xa61F74247455A40b01b0559ff6274441FAfa22A3",
        WOMAddress: "0x7B5EB3940021Ec0e8e463D5dBB4B7B09a89DDF96",
        MWOMAddress: "0x509FD25EE2AC7833a017f17Ee8A6Fb4aAf947876",
    },
  };

async function getPoolList(api, MasterMagpieAddress, VlMGPAddress, MWOMAddress, MWOMSVAddress) {
  let poolTokens = await api.fetchList({ lengthAbi: MasterMagpieAbi.poolLength, itemAbi: MasterMagpieAbi.registeredToken, target: MasterMagpieAddress })
  const customPools = new Set([MWOMAddress, VlMGPAddress, MWOMSVAddress, '0x2130Df9dba40AfeFcA4C9b145f5ed095335c5FA3'].map(i => i.toLowerCase()))
  poolTokens = poolTokens.filter(i => !customPools.has(i.toLowerCase()))
  const infos = await api.multiCall({ calls: poolTokens, abi: MasterMagpieAbi.tokenToPoolInfo, target: MasterMagpieAddress })
  const depositTokens = await api.multiCall({ calls: infos.map(i => i.helper), abi: WombatPoolHelperAbi.depositToken, })
  return [poolTokens, depositTokens]
}

async function tvl(api) {
  const { MasterMagpieAddress, VlMGPAddress, MWOMSVAddress, WOMAddress, MWOMAddress } = config[api.chain];
  const [poolTokens, depositTokens] = await getPoolList(api, MasterMagpieAddress, VlMGPAddress, MWOMAddress, MWOMSVAddress);
  const decimals = await api.multiCall({ abi: 'erc20:decimals', calls: depositTokens })
  const balances = {};
  const womBal = await api.call({ abi: 'erc20:balanceOf', target: MWOMAddress, params: MasterMagpieAddress })
  sdk.util.sumSingleBalance(balances, WOMAddress, womBal, api.chain)
  if (MWOMSVAddress != ADDRESSES.null) {
    const mWomSVBal = await api.call({ abi: 'erc20:balanceOf', target: MWOMAddress, params: MWOMSVAddress })
    sdk.util.sumSingleBalance(balances, WOMAddress, mWomSVBal, api.chain)
  }
  const bals = await api.multiCall({ abi: 'erc20:balanceOf', calls: poolTokens.map(i => ({ target: i, params: MasterMagpieAddress })) })
  bals.forEach((v, i) => {
    v /= 10 ** (18 - decimals[i])
    sdk.util.sumSingleBalance(balances, depositTokens[i], v, api.chain)
  })
  return balances
}

Object.keys(config).forEach((chain) => {
  const { VlMGPAddress, MGPAddress, } = config[chain];
  module.exports[chain] = {
    tvl: tvl,
    staking: staking(VlMGPAddress, MGPAddress)
  }
})