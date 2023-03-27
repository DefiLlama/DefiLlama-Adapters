const sdk = require("@defillama/sdk");
const { BigNumber } = require("ethers");
const abis = require("./abis");

module.exports = {
  start: 1668410449,
  timetravel: true,
  methodology:
    "Counts GOO balance of the vault then sums it with the total multiplier reserve based on the vaults pricing of a multiplier in GOO",
}

module.exports["ethereum"] = {
  tvl: async (_, block) => {
    const { output: gooberReserves } = await sdk.api.abi.call({
      block,
      target: "0x2275d4937b6bFd3c75823744d3EfBf6c3a8dE473",
      abi: abis.goober.reserves,
    });
    const { output: gooBalance } = await sdk.api.abi.call({
      block,
      target: "0x60bb1e2AA1c9ACAfB4d34F71585D7e959f387769",
      params: ["0x2275d4937b6bFd3c75823744d3EfBf6c3a8dE473"],
      abi: abis.artGobblers.gooBalance,
    });

    const poolPricePerMult = BigNumber.from(gooberReserves._gooReserve).div(
      gooberReserves._gobblerReserve
    );

    const gobbersInGoo = poolPricePerMult.mul(gooberReserves._gobblerReserve);
    const totalGoo = BigNumber.from(gooBalance).add(gobbersInGoo).toString();

    return {
      "0x600000000a36F3cD48407e35eB7C5c910dc1f7a8": totalGoo,
    };
  },
};
