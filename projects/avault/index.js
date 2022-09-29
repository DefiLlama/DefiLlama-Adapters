const sdk = require("@defillama/sdk");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { getChainTransform, getFixBalances } = require("../helper/portedTokens");
const utils = require("../helper/utils");
const { vaultsBase } = require("./avault-vault-utils");
const url = "https://www.avault.network/media/get-vaults.json";
async function tvl(chainBlocks) {
  const balances = {};
  const vaultsInfo = (await utils.fetchURL(url)).data;
  // const vaultsInfo = {
  //   astr: {
  //     aAAA: "0x9a45b203Af044ADACceD4D95ca3cDa020E082c8A",
  //     aDotUsdc: "0x898BF9C743a436C9C3F332aF445aAd69c15b10b8",
  //     aDotAstr: "0xE66560C1B5FAaE4e4f77ba40F61F21F4ADbb6924",
  //     aMuuuAstr: "0x57D942953d416835F7B60bE2A8b49870cc7bcfe1",
  //     aKglAstr: "0xe7465336BaA2EfBe52e3e67a8B06a97630d76882",
  //     aLayAstr: "0xc59B9d3ECC93967e697accDbfe9EAB74bB3Fba22",
  //     aOusdUsdc: "0x40B18bc7AEE5A03515fCf241ad89d548899FB74f",
  //     aBaiUsdc: "0x5417F117E4A2283623B3b9A07Ec2B2f269d19A75",
  //     aBaiAstr: "0xC730151a27A4cE6a09d51cFaB115233C2E73D471",
  //     aNikaAstr: "0x13E01d7Da7b3F211C6972c331DA88c142dF571D8",
  //     aOruAstr: "0x8f0fD0A3b767a67E992F33063817A2d472EFf74f",
  //     aJpycAstr: "0x8d90E9C50Af206a2757e09B56160991Dd7548db9",
  //     aSdnAstr: "0x5F612d4155b1CEdE2a2cda61146834280f706B78",
  //     aMaticAstr: "0x7D7b744CB50Eb228fe23Bbb29bc5918c507180B7",
  //     aBnbAstr: "0x6B13DDF4d1E1F2E036619920746318fB79f9EA84",
  //     aBtcAstr: "0x945bC42819F4F612d07DaBd1d57F10Aac494405f",
  //     aUsdtAstr: "0x8964FAE92bb4b79D408e9Bd3d48e7C9EcaA5f163",
  //     aUsdcAstr: "0xDaD1D300E9a6f4f36AeD40213EF473Fd019704E9",
  //     aEthAstr: "0xDaac872a9098aC5620C9D8eaF2DD50FBABc50Bb1",
  //     aDaiUsdc: "0x81FbF3A32D600C65B9Df30404C2D372b6c9eE845",
  //     aBusdUsdc: "0x8552030E314cD15300f75AA93fA8133BB3340E6f",
  //     aUsdtUsdc: "0x41F97524B5E73575F3848E1983181c0622d10e41",
  //   },
  // };
  const chainArr = Object.keys(vaultsInfo);
  const chain = "astr";
  const chainLocal = chain === "astr" ? "astar" : chainArr[i];
  const fixBalances = await getFixBalances(chainLocal);
  const vaultAddressArr = Object.values(vaultsInfo[chainLocal]);
  const transformAddress = await getChainTransform(chainLocal);
  const { wantedLocked, wantedAddresses, vaultName } = await vaultsBase(
    chainLocal,
    vaultAddressArr,
    chainBlocks
  );

  const lpPositions = [];
  for (let k = 0; k < wantedLocked.length; k++) {
    if (vaultName[k].toLowerCase().endsWith(" lp")) {
      lpPositions.push({
        token: wantedAddresses[k],
        balance: wantedLocked[k],
      });
    } else {
      sdk.util.sumSingleBalance(
        balances,
        `${chainLocal}:${wantedAddresses[k]}`,
        wantedLocked[k]
      );
    }
  }
  await unwrapUniswapLPs(
    balances,
    lpPositions,
    chainBlocks[chainLocal],
    chainLocal,
    transformAddress
  );
  fixBalances(balances);

  return balances;
}

module.exports = {
  misrepresentedTokens: true,
  methodology: "Avault - The Best Yield Aggregator on ASTR Network",
  astar: {
    tvl: tvl,
  },
};
