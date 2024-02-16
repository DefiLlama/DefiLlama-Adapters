const sdk = require("@defillama/sdk");
const abi = require('./abis/aurelius.json');
const { default: BigNumber } = require("bignumber.js");

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


async function getMoneyMarketLiquidity(chain, dataProvider){
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

  const moneyMarketTokens = [];
  const moneyMarketBalances = [];

  reserveData.output.forEach((reserve) => {
    const availableLiquidity = BigNumber(reserve.output.availableLiquidity);
    const borrowed = BigNumber(reserve.output.totalVariableDebt);
    const totalLiquidity = availableLiquidity.plus(borrowed);
    moneyMarketTokens.push(reserve.input.params[0]);
    moneyMarketBalances.push(totalLiquidity.toString());
  })

  return({
    moneyMarketTokens, 
    moneyMarketBalances
  });
}

const strategies = Object.values(strategiesVersioned).map(i => Object.values(i)).flat()

async function tvl(_, _b, _cb, { api, }) {
  const vaults = Object.values(admins)
  const configs = await api.multiCall({ abi: 'address:collateralConfig', calls: vaults })
  const collaterals = await api.multiCall({ abi: 'address[]:getAllowedCollaterals', calls: configs })
  const pools = await api.multiCall({ abi: 'address:activePool', calls: vaults })

  const tokens = await api.multiCall({ abi: 'address:token', calls: strategies })
  const bals = await api.multiCall({ abi: 'uint256:totalSupply', calls: strategies })
  api.addTokens(tokens, bals)

  const {moneyMarketTokens, moneyMarketBalances} = await getMoneyMarketLiquidity("mantle", MONEY_MARKET_DATA_PROVIDER);
  api.addTokens(moneyMarketTokens, moneyMarketBalances);
  
  return api.sumTokens({ ownerTokens: pools.map((p, i) => [collaterals[i], p]) })
}

module.exports = {
  doublecounted: true,
  methodology: `TVL is fetched from Aurelius contracts. 
    Minting TVL is calculated by summing collateral supply in the active pool and underlying vaults. 
    Money market TVL is the sum of each reserve's available and borrowed liquidity.`,
  mantle: {
    tvl
  },
}