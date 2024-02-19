const sdk = require("@defillama/sdk");
const abi = require('./abis/aurelius.json');

const admins = {
  v1: '0x295c6074F090f85819cbC911266522e43A8e0f4A'
}

const strategiesVersioned = {
  v1: {
    wETH: "0x89A42aAc15339479e0Bba6e3B32d40CAeFAcCd98",
    wMNT: "0xD039577917A164F8Fd1Ee54c6Fb90b781eA04716",
    USDC: "0x79683D2ccefd7307f1649F8F8A987D232dc99A72",
    USDT: "0x874aE50644E56C900CBe6f3C8dabBAA991176c80",
  },
}

const MONEY_MARKET_DATA_PROVIDER = '0xedB4f24e4b74a6B1e20e2EAf70806EAC19E1FA54';

async function getCdpTvl (api) {
  const strategies = Object.values(strategiesVersioned).map(i => Object.values(i)).flat()
  const vaults = Object.values(admins)
  const configs = await api.multiCall({ abi: 'address:collateralConfig', calls: vaults })
  const collaterals = await api.multiCall({ abi: 'address[]:getAllowedCollaterals', calls: configs })
  const pools = await api.multiCall({ abi: 'address:activePool', calls: vaults })

  const tokens = await api.multiCall({ abi: 'address:token', calls: strategies })
  const bals = await api.multiCall({ abi: 'uint256:totalSupply', calls: strategies })
  api.addTokens(tokens, bals)
  api.sumTokens({ ownerTokens: pools.map((p, i) => [collaterals[i], p]) })
}

async function getReserveData (dataProvider, chain) {
  const reserveTokens = await sdk.api.abi.call({
    abi: abi["getAllReservesTokens"],
    target: dataProvider,
    chain
  })

  const reserveData = await sdk.api.abi.multiCall({
    calls: reserveTokens.output.map(({tokenAddress}) => ({
      target: dataProvider,
      params: [tokenAddress],
    })),
    abi: abi.getReserveData,
    chain
  });
  return reserveData.output;
}

async function getMoneyMarketTvl(api){
  const reserveData = await getReserveData(MONEY_MARKET_DATA_PROVIDER, "mantle");

  const moneyMarketTokens = [];
  const moneyMarketBalances = [];

  reserveData.forEach((reserve) => {
    const availableLiquidity = reserve.output.availableLiquidity;
    moneyMarketTokens.push(reserve.input.params[0]);
    moneyMarketBalances.push(availableLiquidity);
  })

  api.addTokens(moneyMarketTokens, moneyMarketBalances);
}

async function getMoneyMarketBorrowedAmount(_, _b, _cb, { api, }){
  const reserveData = await getReserveData(MONEY_MARKET_DATA_PROVIDER, "mantle");

  const moneyMarketTokens = [];
  const moneyMarketBalances = [];

  reserveData.forEach((reserve) => {
    const borrowed = reserve.output.totalVariableDebt;
    moneyMarketTokens.push(reserve.input.params[0]);
    moneyMarketBalances.push(borrowed);
  })

  api.addTokens(moneyMarketTokens, moneyMarketBalances);
}

async function tvl(_, _b, _cb, { api, }) {
  await getCdpTvl(api);
  await getMoneyMarketTvl(api);
  return ;
}

module.exports = {
  doublecounted: true,
  methodology: `TVL is fetched from Aurelius contracts. 
    CDP TVL is calculated by summing collateral supply in the active pool and underlying vaults. 
    Money market TVL is broken into available liquidity and borrowed amount.`,
  mantle: {
    tvl,
    borrowed: getMoneyMarketBorrowedAmount
  },
}