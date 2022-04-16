const Caver = require("caver-js");
const { toUSDTBalances } = require("../helper/balances");
const { RPC_ENDPOINT_URL, SCNR, ABIs } = require("./constants");

const getTokenPrice = async () => {
  // FIXME: fetch token price
  return 2.157;
};

const tvl = async () => {
  const caver = new Caver(RPC_ENDPOINT_URL);

  const getStakedInLPs = async (lpAddress) => {
    const lp = new caver.klay.Contract(ABIs.LP, lpAddress);
    const { 0: reservesForSCNR } = await lp.methods //
      .getReserves()
      .call();
    return Number(reservesForSCNR);
  };

  const getStakedInGovernance = async (address) => {
    const staking = new caver.klay.Contract(ABIs.Staking, SCNR.staking);
    const stakedBalance = await staking.methods
      .totalStakedBalanceOf(address)
      .call();
    return Number(stakedBalance);
  };

  const [tokenPrice, ...totalStakedByProtocols] = await Promise.all([
    getTokenPrice(),
    getStakedInLPs(SCNR.lp.KLAY),
    getStakedInGovernance(SCNR.address),
  ]);

  const totalStaked =
    totalStakedByProtocols.reduce((acc, staked) => acc + staked, 0) /
    10 ** SCNR.decimals;

  return toUSDTBalances(totalStaked * tokenPrice);
};

module.exports = {
  klaytn: {
    tvl,
  },
};
