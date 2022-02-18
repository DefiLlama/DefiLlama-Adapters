const { ethers } = require("ethers");

module.exports = {
  async useIsolatedStrategyMetadata() {
    const stratMeta = {};
    const stable = useStable();
    const { chainId } = useEthers();

    const globalDebtCeiling = useGlobalDebtCeiling(
      "globalDebtCeiling",
      [],
      BigNumber.from(0)
    );
    const totalSupply = useTotalSupply("totalSupply", [], BigNumber.from(0));

    const balancesCtx = useContext(WalletBalancesContext);
    const { yyMetadata, yieldMonitor } = useContext(ExternalMetadataContext);

    const addresses = useAddresses();

    const token2Strat = {
      ["0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7"]:
        addresses.YieldYakAVAXStrategy,
      ["0x60781C2586D68229fde47564546784ab3fACA982"]:
        addresses.YieldYakStrategy,
      ["0x59414b3089ce2AF0010e7523Dea7E2b35d776ec7"]:
        addresses.YieldYakStrategy,
      ["0x6e84a6216ea6dacc71ee8e6b0a5b7322eebc0fdd"]:
        addresses.YieldYakStrategy,
      ["0xd586e7f844cea2f87f50152665bcbc2c279d8d70"]:
        addresses.YieldYakStrategy,
      ["0x8729438EB15e2C8B576fCc6AeCdA6A148776C0F5"]:
        addresses.YieldYakStrategy,
      ["0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664"]:
        addresses.YieldYakStrategy,
      ["0x454E67025631C065d3cFAD6d71E6892f74487a15"]:
        addresses.TraderJoeMasterChefStrategy,
      ["0x2148D1B21Faa7eb251789a51B404fc063cA6AAd6"]:
        addresses.SimpleHoldingStrategy,
    };

    const masterChef2Tokens = [
      "0x57319d41f71e81f3c65f2a47ca4e001ebafd4f33",
      "0xa389f9430876455c36478deea9769b7ca4e3ddb1",
      "0xed8cbd9f0ce3c6986b22002f03c6475ceb7a6256",
      "0xd5a37dc5c9a396a03dd1136fc76a1a02b1c88ffa",
    ].map(getAddress);

    const tokens = Object.keys(token2Strat);
    const strats = Object.values(token2Strat);
    const globalMoneyAvailable = globalDebtCeiling.sub(totalSupply);

    const provider = new ethers.providers.JsonRpcProvider(
      "https://api.avax.network/ext/bc/C/rpc"
    );

    const stratViewer = new ethers.Contract(
      addresses.StrategyViewer,
      new Interface(StrategyViewer.abi),
      provider
    );

    const normalResults = await stratViewer.viewMetadata(
      addresses.StableLending,
      tokens,
      strats
    );
    const noHarvestBalanceResults =
      await stratViewer.viewMetadataNoHarvestBalance(
        addresses.StableLending,
        addresses.OracleRegistry,
        addresses.Stablecoin,
        masterChef2Tokens,
        Array(masterChef2Tokens.length).fill(
          addresses.TraderJoeMasterChef2Strategy
        )
      );

    const results = [...normalResults, ...noHarvestBalanceResults];

    const reduceFn = (result, row) => {
      const parsedRow = parseStratMeta(
        chainId ?? 43114,
        row,
        stable,
        balancesCtx,
        yyMetadata,
        globalMoneyAvailable,
        yieldMonitor
      );

      return parsedRow
        ? {
            ...result,
            [parsedRow.token.address]: {
              [parsedRow.strategyAddress]: parsedRow,
              ...(result[parsedRow.token.address] || {}),
            },
          }
        : result;
    };

    stratMeta = results?.reduce(reduceFn, {}) ?? {};

    //   if (
    //     chainId &&
    //     stable &&
    //     balancesCtx &&
    //     yyMetadata &&
    //     globalMoneyAvailable != 0 &&
    //     yieldMonitor &&
    //     Object.values(stratMeta).length === 0
    //   ) {
    //     getData();
    //   }

    return stratMeta;
  },
};
