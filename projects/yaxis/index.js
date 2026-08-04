const { staking } = require('../helper/staking')
const abi = {
  yAxisBar: "uint256:availableBalance",
  yAxisMetaVault: "uint256:balance",
  votingEscrow: "uint256:supply",
  vault: "uint256:balanceOfThis",
};
const constants = {
  CURRENCIES: {
    "LP-3POOL-CURVE": "0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490",
    YAXIS: "0x0adA190c81b814548ddC2F6AdC4a689ce7C1FE73",
  },
  UNISWAP_LPS: [
    {
      address: "0xF0E3FdF48661CD10d56692f60BD4eCcd01E9CF64",
      tokens: ["yaxis", "ethereum"],
      staking: "0xEDaFe410e2f07ab9D7F1B04316D29C2F49dCb104",
    },
  ],
  LINKPOOL_LPS: [
    {
      address: "0x21dee38170F1e1F26baFf2C30C0fc8F8362b6961",
      tokens: ["yaxis", "ethereum"],
    },
  ],
  METAVAULT: "0xBFbEC72F2450eF9Ab742e4A27441Fa06Ca79eA6a",
  BAR: "0xeF31Cb88048416E301Fee1eA13e7664b887BA7e8",
  CHEF: "0xc330e7e73717cd13fb6ba068ee871584cf8a194f",
  STAKING: {
    METAVAULT: "0x226f9954A1221cDe805C76CfB312A5d761630E14",
    YAXIS: "0x3b09B9ADFe11f92225b4C55De89fa81456595CD9",
  },
  VAULTS: [
    {
      tokenPoolContract: "0x5a6A4D54456819380173272A5E8E9B9904BdF41B",
      token: "MIM3CRV",
      tokenContract: "0x5a6A4D54456819380173272A5E8E9B9904BdF41B",
      vault: "0x9720346Ba80b668E50A5560c200180515fEbb895",
      vaultTokenContract: "0x2C1e6D004d4f06F92464e0208b04D260b3eF46A5",
      gauge: "0x9a4A2a2E8f755b77eb512E8A8fE635B803950D51",
    },
    {
      tokenPoolContract: "0x93054188d876f558f4a66B2EF1d97d16eDf0895B",
      token: "RENCRV",
      tokenContract: "0x49849C98ae39Fff122806C06791Fa73784FB3675",
      vault: "0x0b42B20280216D604bB2B6a8944Fb9027b43dF8d",
      vaultTokenContract: "0x0C44393DA03216E934b3A5503DECF7f78174b2f3",
      gauge: "0x9AA02011a90736176f9CdC38FF4d1Ed7C90309b6",
    },
    {
      tokenPoolContract: "0xC4C319E2D4d66CcA4464C0c2B32c9Bd23ebe784e",
      token: "ALETHCRV",
      tokenContract: "0xC4C319E2D4d66CcA4464C0c2B32c9Bd23ebe784e",
      vault: "0xCAB23CA4E75E8A9F12EBCa7f51D6b3EFe97699e7",
      vaultTokenContract: "0xeF84fAc432846Ad5f6f1bD4caCcF2849e2818e66",
      gauge: "0x43103fE8Bd1049f756370F831634812Eb4eFf7D3",
    },
    {
      tokenPoolContract: "0xF178C0b5Bb7e7aBF4e12A4838C7b7c5bA2C623c0",
      token: "LINKCRV",
      tokenContract: "0xcee60cfa923170e4f8204ae08b4fa6a3f5656f3a",
      vault: "0x27d9A1dc3725Fa5E4e7128b1db7e9Da75eb3aeE5",
      vaultTokenContract: "0x5f6e4DeA25086C973C31857A04a73c66Ef41e43C",
      gauge: "0x60fd915B2251dEc19C57eDD75B0a688EA0A3bfe5",
    },
  ],
  YAXIS_GAUGE: "0x951E7726d70017E56756A6807886113708A699Fb",
  VOTING_ESCROW: "0x66b4c0dAA0C65ED1eae84B4d738B9572a79389c4",
};

async function tvl(api) {
  const token = await api.call({ abi: 'address:want', target: constants.METAVAULT })
  const bal = await api.call({ abi: 'uint256:balance', target: constants.METAVAULT })
  api.add(token, bal)
  const tokens = await api.multiCall({ abi: 'address:token', calls: constants.VAULTS.map(v => v.vault) })
  const bals = await api.multiCall({ abi: 'uint256:balance', calls: constants.VAULTS.map(v => v.vault) })
  api.addTokens(tokens, bals)
}

async function staking_(api) {
  const token = constants.CURRENCIES["YAXIS"]
  api.add(token, await api.call({ abi: abi.votingEscrow, target: constants.VOTING_ESCROW }))
  api.add(token, await api.call({ abi: abi.yAxisBar, target: constants.BAR }))
  api.add(token, await api.call({ abi: 'erc20:totalSupply', target: constants.STAKING.YAXIS }))
  api.add(token, await api.call({ abi: 'erc20:totalSupply', target: constants.YAXIS_GAUGE }))
}

module.exports = {
  doublecounted: true,
  ethereum: {
    tvl,
    staking: staking_,
    pool2: staking(constants.UNISWAP_LPS.map(i => i.staking), constants.UNISWAP_LPS.map(i => i.address))
  },
  start: '2020-09-15', // 09/16/2020 @ 12:00am (UTC+8)
};
