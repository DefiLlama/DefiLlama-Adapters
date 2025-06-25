const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport, sumTokens2, } = require('../helper/unwrapLPs')
const { getConfig } = require('../helper/cache')
const { getInsuranceFundValue, insuranceTokens } = require("./insurance-fund-polygon");
const { getInsuranceFundValueOp } = require("./insurance-fund-optimism");
const { getInsuranceFundValueBase } = require("./insurance-fund-base");
const { getInsuranceFundValueArb } = require("./insurance-fund-arbitrum");

const realTvl = async (api) => {
  const USTB = '0x83fedbc0b85c6e29b589aa6bdefb1cc581935ecd'
  const basketManager = '0x5e581ce0472bF528E7F5FCB96138d7759AC2ac3f'.toLowerCase()
  // get all baskets in existance
  const baskets = await api.call({ abi: 'address[]:getBasketsArray', target: basketManager })
  const basketTVL = await api.multiCall({  abi: 'uint256:getTotalValueOfBasket', calls: baskets})
  api.add(USTB, basketTVL)
}

// doc: https://docs.tangible.store/real-usd/real-usd-v3-contracts-and-addresses
const TNGBL = '0x49e6A20f1BBdfEeC2a8222E052000BbB14EE6007'.toLowerCase()
const USDR = '0x40379a439d4f6795b6fc9aa5687db461677a2dba'.toLowerCase()
const CVX_ETH = ADDRESSES.ethereum.CVX.toLowerCase()

const { apGetAddress, getPriceManager, getCategories,
  getTotalSupply, getTokenByIndex, getTnftCustody,
  getItemPriceBatchTokenIds, getPair, } = require("./abi.js");

const ADDRESS_PROVIDER_ADDRESS = "0xE95BCf65478d6ba44C5F57740CfA50EA443619eA";
const FACTORY_ADDRESS = "0xB0E54b88BB0043A938563fe8A77F4ddE2eB0cFc0";

const insuranceConfig = {
  ethereum: {
    owner: '0x5d35A37E5842F6b3072893A3f7Bf0e1d1FF80179',
    tokens: [ADDRESSES.null, CVX_ETH],
  },
  polygon: {
    owners: ['0xD1758fbABAE91c805BE76D56548A584EF68B81f0', '0x632572cfAa39330c8F0211b5B33BC86135E48b5f'],
    tokens: Object.values(insuranceTokens),
  },
  optimism: {
    owner: '0x7f922242d919feF0da0e40e3Cb4B7f7D3c97a63e',
    tokens: [ADDRESSES.null, ADDRESSES.optimism.OP, ADDRESSES.optimism.USDC],
  },
  base: {
    owner: "0x17ee1f11aa0654bd4ab1af4b6b309c7f137c925e",
    tokens: [ADDRESSES.null,],
  },
  arbitrum: {
    owner: "0xe19848f158efd31d45a6975320365251c92040c1",
    tokens: [ADDRESSES.null, ADDRESSES.arbitrum.USDT],
  }
}

async function tvl(api) {
  await Promise.all([
    treasuryTvl,
    rwaTVL,
    tangiblePOL,
    insuranceTvl,
  ].map(fn => fn(api)))
}

async function tvlOp(api) {
  await Promise.all([
    insuranceTvlOp,
  ].map(fn => fn(api)))
}

async function tvlBase(api) {
  await Promise.all([
    insuranceTvlBase,
  ].map(fn => fn(api)))
}

async function tvlArb(api) {
  await Promise.all([
    insuranceTvlArb,
  ].map(fn => fn(api)))
}

async function treasuryTvl(api) {
  //treasury address to get total value in treasury
  const usdrTreasuryAddress = await api.call({
    abi: apGetAddress,
    target: ADDRESS_PROVIDER_ADDRESS,
    params: ["0xc83e4fd410f80be983b083c99898391186b0893751a26a9a1e5fdcb9d4129701"],//keccak of USDRTreasury
  })
  await api.sumTokens({ owner: usdrTreasuryAddress, tokens: [ADDRESSES.polygon.DAI,] })
}

async function insuranceTvl(api) {
  await Promise.all(insuranceConfig.polygon.owners.map(i => (async () => {
    await unwrapBalancerToken(api, i);
    await getInsuranceFundValue(api, i);
  })()))
}

async function insuranceTvlOp(api) {
  await getInsuranceFundValueOp(api, insuranceConfig.optimism.owner);
  return sumTokens2({ api, ...insuranceConfig.optimism })
}

async function insuranceTvlBase(api) {
  await getInsuranceFundValueBase(api, insuranceConfig.base.owner);
  await api.sumTokens({ owner: insuranceConfig.base.owner, tokens: insuranceConfig.base.tokens })
}

async function insuranceTvlArb(api) {
  await getInsuranceFundValueArb(api, insuranceConfig.arbitrum.owner);
  return sumTokens2({ api, ...insuranceConfig.arbitrum })
}

async function rwaTVL(api) {
  //get all needed addresses
  const priceManagerAddress = await api.call({ abi: getPriceManager, target: FACTORY_ADDRESS, })

  // we itterate through these to get prices
  const tnftContractsAddresses = await api.call({ abi: getCategories, target: FACTORY_ADDRESS, })

  //underlying to get decimals 
  const underlyingAddress = await api.call({
    abi: apGetAddress,
    target: ADDRESS_PROVIDER_ADDRESS,
    params: ["0xadbe96ac53cb4ca392e9ee5a7e23c7d7c8450cb015ceaad4d4677fae1c0bb1a4"], //keccak of underlying
  })

  //now we fetch value of all tnfts ever minted
  await Promise.all(tnftContractsAddresses.map(async (tnft) => {

    //fetch all token ids
    let ids = [];
    const tokenIds = await api.fetchList({ target: tnft, itemAbi: getTokenByIndex, lengthAbi: getTotalSupply, })
    if (!tokenIds.length) return;
    const inTangibleCustody = await api.multiCall({ target: tnft, abi: getTnftCustody, calls: tokenIds, })
    inTangibleCustody.forEach((v, i) => {
      if (v) ids.push(tokenIds[i])
    })

    // now fetch all prices
    const prices = await api.call({
      abi: getItemPriceBatchTokenIds,
      target: priceManagerAddress,
      params: [tnft, underlyingAddress, ids],
    })

    for (let i = 0; i < prices.weSellAt.length; i++) {
      api.add(underlyingAddress, prices.weSellAt[i]) // how can get the rwa value instead of the price you are willing to sell at?
      api.add(underlyingAddress, prices.lockedAmount[i])  // what is this amount?
    }
  }))

}

async function tangiblePOL(api) {

  //pearl pair api address
  const pearlPairApi = await api.call({
    abi: apGetAddress,
    target: ADDRESS_PROVIDER_ADDRESS,
    params: ["0xd1e0c1a56a62f2e6553b45bde148c89c51a01f766c23f4bb2c612bd2c822f711"],//keccak of paerl api address
  })

  // liquidity manager
  const liquidityManager = await api.call({
    abi: apGetAddress,
    target: ADDRESS_PROVIDER_ADDRESS,
    params: ["0x6878742ff510854cb02c186504af5267007c4a6d33f490fc28ec83e83e1458e1"],//keccak of liquidity manager
  })

  const { data } = await getConfig('tangible', "https://api.pearl.exchange/api/v15/pools");
  const pools = data.filter(
    (pool) =>
      (["DAI", "USDC", "USDT"].includes(pool.token0.symbol) &&
        pool.token1.symbol === "USDR") ||
      (["DAI", "USDC", "USDT"].includes(pool.token1.symbol) &&
        pool.token0.symbol === "USDR"),
  ).map(i => i.address)

  const [lpBals, tokens0, tokens1, totalSupplies, reserves] = await Promise.all([
    api.multiCall({ abi: getPair, target: pearlPairApi, calls: pools.map(p => ({ params: [p, liquidityManager] })) }),
    api.multiCall({ abi: 'address:token0', calls: pools }),
    api.multiCall({ abi: 'address:token1', calls: pools }),
    api.multiCall({ abi: 'uint256:totalSupply', calls: pools }),
    api.multiCall({ abi: "function getReserves() view returns (uint112 _reserve0, uint112 _reserve1, uint32 _blockTimestampLast)", calls: pools }),
  ])

  const blacklist = [USDR, TNGBL]
  lpBals.forEach((lpBal, i) => {
    const ratio = lpBal.account_gauge_balance / totalSupplies[i]
    if (!blacklist.includes(tokens0[i].toLowerCase()))
      api.add(tokens0[i], reserves[i]._reserve0 * ratio)

    if (!blacklist.includes(tokens1[i].toLowerCase()))
      api.add(tokens1[i], reserves[i]._reserve1 * ratio)

  })
}

module.exports = {
  hallmarks: [
    [1697032800, "USDR Depeg"]
  ],
  misrepresentedTokens: true,
  polygon: { tvl, },
  ethereum: { tvl: sumTokensExport(insuranceConfig.ethereum) },
  base: { tvl: tvlBase },
  arbitrum: { tvl: tvlArb },
  optimism: { tvl: tvlOp },
  real: { tvl: realTvl },
}

async function unwrapBalancerToken(api, owner) {
  const gauge = '0x07222e30b751c1ab4a730745afe19810cfd762c0'
  const balancerToken = '0x9f9f548354b7c66dc9a9f3373077d86aaaccf8f2'
  const [lpSupply, lpTokens] = await api.batchCall([
    { abi: 'erc20:totalSupply', target: balancerToken },
    { abi: 'erc20:balanceOf', target: gauge, params: owner },
  ])
  const ratio = lpTokens / lpSupply

  const poolId = await api.call({ abi: 'function getPoolId() view returns (bytes32)', target: balancerToken })
  const vault = await api.call({ abi: 'address:getVault', target: balancerToken })
  const [tokens, bals] = await api.call({ abi: 'function getPoolTokens(bytes32) view returns (address[], uint256[],uint256)', target: vault, params: poolId })
  tokens.forEach((v, i) => {
    if (v.toLowerCase() === TNGBL) return;
    api.add(v, bals[i] * ratio)
  })
}