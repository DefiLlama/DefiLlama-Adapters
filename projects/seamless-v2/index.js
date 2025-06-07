const { getLogs2 } = require("../helper/cache/getLogs");

const SEAMLESS_LEVERAGE_MANAGER_BASE = "0x38Ba21C6Bf31dF1b1798FCEd07B4e9b07C5ec3a8";

const getLeverageTokens = async (api) => {
  return (
    await getLogs2({
      api,
      target: SEAMLESS_LEVERAGE_MANAGER_BASE,
      topics: ["0xc3f4681fb2a57a13e121c6f24fe319c8572bb001497f2b74712695625ee9028e"],
      eventAbi: "event LeverageTokenCreated(address indexed token, address collateralAsset, address debtAsset, (address lendingAdapter, address rebalanceAdapter, uint256 mintTokenFee, uint256 redeemTokenFee) config)",
      fromBlock: 31051780
    })
  )
}

const SeamlessLeverageTokensTVL = () => {
  return {
    tvl: async (api) => {
      const leverageTokens = (await getLeverageTokens(api)).map((log) => ({ lendingAdapter: log.config.lendingAdapter, collateralAsset: log.collateralAsset }));

      const collateralBalances = await api.multiCall({
        calls: leverageTokens.map(({ lendingAdapter }) => lendingAdapter),
        abi: "function getCollateral() public view returns (uint256)",
      });

      leverageTokens.forEach(({ collateralAsset }, i) => {
        api.add(collateralAsset, collateralBalances[i]);
      });

      return api.getBalances();
    },
    borrowed: async (api) => {
      const leverageTokens = (await getLeverageTokens(api)).map((log) => ({ lendingAdapter: log.config.lendingAdapter, debtAsset: log.debtAsset }));

      const debtBalances = await api.multiCall({
        calls: leverageTokens.map(({ lendingAdapter }) => lendingAdapter),
        abi: "function getDebt() public view returns (uint256)",
      });

      leverageTokens.forEach(({ debtAsset }, i) => {
        api.add(debtAsset, debtBalances[i]);
      });

      return api.getBalances();
    }
  };
};

module.exports = {
  base: SeamlessLeverageTokensTVL(),
};
