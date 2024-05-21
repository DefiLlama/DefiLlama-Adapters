const { sumTokens2 } = require("../helper/unwrapLPs");
const helperAbi = require("./leveraged-token-helper-abi.json");

const contracts = {
  tlx: "0xD9cC3D70E730503E7f28c1B407389198c4B75FA2",
  sUSD: "0x8c6f28f2F1A3C87F0f938b96d27520d9751ec8d9",
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
  return sumTokens2({ api });
}

async function tvl(api) {
  const res = await api.call({
    abi: helperAbi.leveragedTokenData,
    target: contracts.leveragedTokenHelper,
  });
  const totalSusd = res.reduce((acc, token) => {
    return acc + (token.totalSupply * token.exchangeRate) / 1e18;
  }, 0);
  api.addToken(contracts.sUSD, totalSusd);
  return sumTokens2({ api });
}

module.exports = {
  start: 1712731500,
  methodology:
    "Total TLX locked in the genesis locker contract and total TLX staked in the staking contract. TVL is computed as the total margin deposited across the protocol's leveraged tokens.",
  optimism: {
    tvl: tvl,
    staking: staking,
  },
};
