//import utils
const ADDRESSES = require("../helper/coreAssets.json");

module.exports = {
  misrepresentedTokens: true,
  hallmarks: [
    [1688342964, "VLP Leverage Vault"],
    [1692164391, "GLP Leverage Vault"],
    [1695274791, "GMXV2 Leverage Vault"],
    [1682314791, "GLP Delta Neutral Vault"],
    [1683178791, "GDAI Leverage Vault"],
    [1696389409, "HLP Leverage Vault"],
    [1697716800, "VKA TGE"],
  ],

  arbitrum: {
    tvl: async (_, _b, _cb, { api }) => {
      const vaults = [
        "0x0081772FD29E4838372CbcCdD020f53954f5ECDE", // VodkaVault
        "0x6df0018b0449bB4468BfAE8507E13021a7aa0583", // WaterVault
      ];
      const bals = await api.multiCall({
        abi: "int256:getVaultMarketValue",
        calls: vaults,
      });
      bals.forEach((i) => api.add(ADDRESSES.arbitrum.USDC, i));

      const addresses = {
        whiskey: "0x6532eFCC1d617e094957247d188Ae6d54093718A",
        whiskeyWater: "0xa100E02e861132C4703ae96D6868664f27Eaa431",
        sake: "0x45BeC5Bb0EE87181A7Aa20402C66A6dC4A923758",
        sakeWater: "0x6b367F9EB22B2E6074E9548689cddaF9224FC0Ab",
        sakeV2: "0xc53A53552191BeE184557A15f114a87a757e5b6F",
        sakeWaterV2: "0x806e8538FC05774Ea83d9428F778E423F6492475",
        vodkaV1_Water: "0xC99C6427cB0B824207606dC2745A512C6b066E7C",
        VodkaV1: "0x88D7500aF99f11fF52E9f185C7aAFBdF9acabD93",
        fsGlp: ADDRESSES.arbitrum.fsGLP,
        vodkaV2: "0x9198989a85E35adeC46309E06684dCA444c9cF27",
        vodkaV2_Water: "0x9045ae36f963b7184861BDce205ea8B08913B48c",
        gmWeth: "0x70d95587d40A2caf56bd97485aB3Eec10Bee6336", // weth/usdc.e
        gmArb: "0xC25cEf6061Cf5dE5eb761b50E4743c1F5D7E5407", // arb/usdc.e
        VLP: "0xc5b2d9fda8a82e8dcecd5e9e6e99b78a9188eb05",
        gDAI: "0xd85e038593d7a098614721eae955ec2022b9b91b",
        rum: "0x739fe1BE8CbBeaeA96fEA55c4052Cd87796c0a89",
        hlpStaking: "0xbE8f8AF5953869222eA8D39F1Be9d03766010B1C",
        hlp: "0x4307fbDCD9Ec7AEA5a1c2958deCaa6f316952bAb",
        agedVodka: "0x9566db22DC32E54234d2D0Ae7B72f44e05158239",
      };

      await api.sumTokens({
        tokensAndOwners: [
          [ADDRESSES.arbitrum.USDC, addresses.vodkaV1_Water],
          [ADDRESSES.arbitrum.USDC_CIRCLE, addresses.vodkaV2_Water],
          [ADDRESSES.arbitrum.USDC, addresses.sakeWater],
          [ADDRESSES.arbitrum.USDC, addresses.sakeWaterV2],
          [ADDRESSES.arbitrum.DAI, addresses.whiskeyWater],
          [addresses.gDAI, addresses.whiskey],
          [addresses.VLP, addresses.sake],
          [addresses.VLP, addresses.sakeV2],
          [addresses.fsGlp, addresses.VodkaV1],
          [addresses.gmArb, addresses.vodkaV2],
          [addresses.gmWeth, addresses.vodkaV2],
          [addresses.hlp, addresses.rum],
          [addresses.fsGlp, addresses.agedVodka],
        ],
      });

      const contractAbis = {
        stakedVlpBalance:
          "function getStakedVlpBalance() public view returns (uint256)",
        stakedHlpBalance:
          "function userTokenAmount(address user) public view returns (uint256)",
      };

      const StakedVLPBal = await api.call({
        abi: contractAbis.stakedVlpBalance,
        target: addresses.sake,
      });
      const StakedVLPBalV2 = await api.call({
        abi: contractAbis.stakedVlpBalance,
        target: addresses.sakeV2,
      });
      const StakedHLPBal = await api.call({
        abi: contractAbis.stakedHlpBalance,
        target: addresses.hlpStaking,
        params: addresses.rum,
      });

      api.add(addresses.VLP, StakedVLPBal);
      api.add(addresses.VLP, StakedVLPBalV2);
      api.add(addresses.hlp, StakedHLPBal);
    },
  },
};
