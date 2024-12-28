const ADDRESSES = require('../helper/coreAssets.json')
const helperAbi = {
  "leveragedTokenData": "function leveragedTokenData() view returns (tuple(address addr, string symbol, uint256 totalSupply, string targetAsset, uint256 targetLeverage, bool isLong, bool isActive, uint256 rebalanceThreshold, uint256 exchangeRate, bool canRebalance, bool hasPendingLeverageUpdate, uint256 remainingMargin, uint256 leverage, uint256 assetPrice, uint256 userBalance)[])"
}


const contracts = {
  tlx: "0xD9cC3D70E730503E7f28c1B407389198c4B75FA2",
  sUSD: ADDRESSES.optimism.sUSD,
  locker: "0xc068c3261522c97ff719dc97c98c63a1356fef0f",
  staker: "0xc30877315f3b621a8f7bcda27819ec29429f3817",
  leveragedTokenHelper: "0xBdAF7A2C4ee313Be468B9250609ba8496131B1f0",
};

async function staking(api) {
  const lockedTlxBalance = await api.call({
    abi: "uint256:totalStaked",
    target: contracts.locker,
  });

  const stakedTlxBalance = await api.call({
    abi: "uint256:totalStaked",
    target: contracts.staker,
  });

  api.addToken(contracts.tlx, lockedTlxBalance);
  api.addToken(contracts.tlx, stakedTlxBalance);
}

async function tvl(api) {
  // documentation: https://docs.tlx.fi/more/deployed-contracts
  // factory - 0x5dd85f51e9fd6ade8ecc216c07919ecd443eb14d
  const res = await api.call({
    abi: helperAbi.leveragedTokenData,
    target: contracts.leveragedTokenHelper,
  });
  const totalSusd = res.reduce((acc, token) => {
    return acc + (token.totalSupply * token.exchangeRate) / 1e18;
  }, 0);
  api.addToken(contracts.sUSD, totalSusd);
}

module.exports = {
  start: '2024-04-10',
  methodology:
    "Total TLX locked in the genesis locker contract and total TLX staked in the staking contract. TVL is computed as the total margin deposited across the protocol's leveraged tokens.",
  optimism: {
    tvl: tvl,
    staking: staking,
  },
};
