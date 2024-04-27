const sdk = require("@defillama/sdk");
const { lendingMarket } = require("./methodologies");
const { sumTokens2 } = require("./unwrapLPs");

module.exports = {
  ionProtocolExports: (config) => {
    const abi = {
      debt: "uint256:debt",
      totalCollateral: "uint256:totalGem",
      totalSupply: "uint256:totalSupply",
      underlyingLender: "address:underlying",
      underlyingCollateral: "address:GEM",
    };

    const exportsObj = {
      methodology: lendingMarket,
    };
    Object.keys(config).forEach((chain) => {
      const { markets } = config[chain];

      async function borrowed(api) {
        let ionPools = Object.keys(markets);
        for (let pool of ionPools) {
          const token = await api.call({
            abi: abi.underlyingLender,
            target: pool,
          });
          const bal = await api.call({
            abi: abi.debt,
            target: pool,
          });
          api.add(token, bal / 1e27);
        }
      }

      async function tvl(api) {
        const toa = [];
        await Promise.all(
          Object.keys(markets).map(async (ionPool) => {
            const gemJoin = markets[ionPool];
            const underlyingCollateral = await api.call({
              abi: abi.underlyingCollateral,
              target: gemJoin,
            });
            const underlyingLender = await api.call({
              abi: abi.underlyingLender,
              target: ionPool,
            });
            toa.push([underlyingCollateral, gemJoin]);
            toa.push([underlyingLender, ionPool]);
          })
        );
        return sumTokens2({ tokensAndOwners: toa });
      }

      exportsObj[chain] = { tvl, borrowed };
    });
    return exportsObj;
  },
};
