const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");
const { staking } = require("../helper/staking");
const sdk = require("@defillama/sdk");

const betifystaking = "0x335CAC92af7015BE7802170B62Ebc4C74900484d";
const betify = "0xD465b6B4937D768075414D413e981Af0b49349Cc";
const treasury = "0x596a6DFf0CF36fABf75EDeB6aA2992C950Ff14bA";
const dao = "0xEe376093ccDB3D81f226C2290868219687226845";
const wBETSLIP = "0x3e7dfdd82965515e9b6398d91b991f5d4c830ef6";
const revenueShare = "0x40822C8E1389dE62980691bF0AFBd5B8D1D56cB7";

async function tvl(timestamp, ethBlock, chainBlocks) {
  const balances = {};
  const transform = (addr) =>
    addr.toLowerCase() === "0xF2001B145b43032AAF5Ee2884e456CCd805F677D"
      ? "0xF2001B145b43032AAF5Ee2884e456CCd805F677D"
      : `cronos:${addr}`;

  await sumTokensAndLPsSharedOwners(
    balances,
    [
      //   [usdc, false]
      ["0xf2001b145b43032aaf5ee2884e456ccd805f677d", false], // DAI
      ["0x76f0adfff61fd9a542a36a98b96909ec7d3a8c53", true], // BETIFY-DAI
      ["0xe2c5275d86D2fB860F19a2CbBED9967d39AA73e8", true], // BETIFY-MMF
      ["0x5c7f8a570d578ed84e63fdfa7b1ee72deae1ae23", false], // WCRO
      ["0x3e7dfdd82965515e9b6398d91b991f5d4c830ef6", false], // wBETSLIP
    ],
    [treasury, dao, revenueShare],
    chainBlocks.metis,
    "cronos",
    transform
  );

  const wbetslipAddress = transform(wBETSLIP);

  const betslip = await sdk.api.abi.call({
    target: wBETSLIP,
    abi: 'function wBTSToBTS(uint256 _amount) view returns (uint256)',
    chain: "cronos",
    block: chainBlocks.cronos,
    params: [sdk.util.convertToBigInt(balances[wbetslipAddress])],
  });
  balances[transform(betify)] = betslip.output;
  delete balances[wbetslipAddress];

  return balances;
}
module.exports = {
  cronos: {
    tvl,
    staking: staking(betifystaking, betify),
  },
  methodology:
    "Counts tokens on the treasury for tvl and staked BETIFY for staking",
};
