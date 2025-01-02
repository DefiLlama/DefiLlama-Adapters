const { sumTokensExport } = require("../helper/unwrapLPs");
const { staking } = require("../helper/staking");

const APE = "0x4d224452801ACEd8B2F0aebE155379bb5D594381";
const crvFRAX = "0x3175Df0976dFA876431C2E9eE6Bc45b65d3473CC";
const apeUSDCrvFrax = "0x04b727C7e246CA70d496ecF52E6b6280f3c8077D";
const amoV2 = "0x8E252A679C87313Ccefc9559F4f1c0e4062390B5";
const multisig = "0x02ca76e87779412a77ee77c3600d72f68b9ea68c";
const convexRewardPool = "0x51e6B84968D56a1E5BC93Ee264e95b1Ea577339c";
const fraxStakingWrapper = "0x6a20FC1654A2167d00614332A5aFbB7EBcD9d414";

const apeAPE = "0xcaB90816f91CC25b04251857ED6002891Eb0D6Fa";

const tvl = async (api) => {
  const apeUSDCrvFraxTotalSupply = await api.call({ abi: 'erc20:totalSupply', target: apeUSDCrvFrax })

  const [amoV2LPBalance, multisigLPBalance, stakedLPBalance, crvFraxBalance,] = await api.multiCall({
    calls: [
      { target: convexRewardPool, params: amoV2, },
      { target: convexRewardPool, params: multisig, },
      { target: convexRewardPool, params: fraxStakingWrapper, },
      { target: crvFRAX, params: apeUSDCrvFrax, },
    ],
    abi: "erc20:balanceOf",
  });

  const apeUSDCrvFraxShare = (+stakedLPBalance + +multisigLPBalance + +amoV2LPBalance) / apeUSDCrvFraxTotalSupply
  api.add(crvFRAX, crvFraxBalance * apeUSDCrvFraxShare)
};

module.exports = {
  ethereum: {
    pool2: sumTokensExport({
      tokensAndOwners: [
        ['0x1977870a4c18a728c19dd4eb6542451df06e0a4b', '0x4Fa7cd808920520294245d746a932d334B783926'], // curve apeUSD-FRAX
        ['0xfb7a3798c6fff187c8cf08c0b1322b52cfa70ace', '0xbcc28F6BA03642B9B5a3E7ad5C8f27991576796c'],  // uni v2
        ['0x84ab278a8140a8a9759de17895a8da8d756618f3', '0x0a2c0a2033eccc7cc57e42901f04b96972131579'], // uni v2
        ['0x04b727C7e246CA70d496ecF52E6b6280f3c8077D', '0x0C63197017970596044f80778282BB5B2208f018'],  // curve
      ],
      resolveLP: true,
    }),
    tvl,
    staking: staking(apeAPE, APE),
  },
  methodology:
    "Counts liquidity as the Collateral APE and USDC & FRAX on all AMOs through their contracts",
};
