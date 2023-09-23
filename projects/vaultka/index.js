//import utils
const getGmPrice = require("./utils");

module.exports = {
  misrepresentedTokens: true,
  hallmarks: [
    [1688342964, "VLP Leverage Vault"],
    [1692164391, "GLP Leverage Vault"],
    [1695274791, "GMXV2 Leverage Vault "],
    [1682314791, "GLP Delta Natural Vault"],
    [1683178791, "GDAI Leverage Vault"],
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

      const addresses = {
        whiskey: "0x6532eFCC1d617e094957247d188Ae6d54093718A",
        whiskeyWater: "0xa100E02e861132C4703ae96D6868664f27Eaa431",
        sake: "0x45BeC5Bb0EE87181A7Aa20402C66A6dC4A923758",
        sakeWater: "0x6b367F9EB22B2E6074E9548689cddaF9224FC0Ab",
        sakeV2: "0xc53A53552191BeE184557A15f114a87a757e5b6F",
        sakeWaterV2: "0x806e8538FC05774Ea83d9428F778E423F6492475",
        vodkaV1_Water: "0xC99C6427cB0B824207606dC2745A512C6b066E7C",
        VodkaV1: "0x88D7500aF99f11fF52E9f185C7aAFBdF9acabD93",
        fsGlp: "0x1aDDD80E6039594eE970E5872D247bf0414C8903",
        vodkaV2: "0x9198989a85E35adeC46309E06684dCA444c9cF27",
        vodkaV2_Water: "0x9045ae36f963b7184861BDce205ea8B08913B48c",
        gmWeth: "0x70d95587d40A2caf56bd97485aB3Eec10Bee6336", // weth/usdc.e
        gmArb: "0xC25cEf6061Cf5dE5eb761b50E4743c1F5D7E5407", // arb/usdc.e
      };

      const contractAbis = {
        gainsBalance: "function getGainsBalance() view returns (uint256)",
        gTokenPrice: "function gTokenPrice() view returns (uint256)",
        wWaterBalance: "function balanceOfDAI() public view returns (uint256)",
        vlpBalance: "function getVlpBalance() public view returns (uint256)",
        stakedVlpBalance:
          "function getStakedVlpBalance() public view returns (uint256)",
        vlpPrice: "function getVLPPrice() public view returns (uint256)",
        glpPrice: "function getGLPPrice(bool) public view returns (uint256)",
        waterUSDCBal: "function balanceOfUSDC() public view returns (uint256)",
        balanceOf: "function balanceOf(address) view returns (uint256)",
      };

      const whiskeyGainsBalance = await api.call({
        abi: contractAbis.gainsBalance,
        target: addresses.whiskey,
      });

      const whiskeyGTokenPrice = await api.call({
        abi: contractAbis.gTokenPrice,
        target: addresses.whiskey,
      });

      const whiskeyWaterDaiBal = await api.call({
        abi: contractAbis.wWaterBalance,
        target: addresses.whiskeyWater,
      });

      const sakeWaterUSDCBal = await api.call({
        abi: contractAbis.waterUSDCBal,
        target: addresses.sakeWater,
      });

      const vlpBal = await api.call({
        abi: contractAbis.vlpBalance,
        target: addresses.sake,
      });

      const StakedVLPBal = await api.call({
        abi: contractAbis.stakedVlpBalance,
        target: addresses.sake,
      });

      const sakeVLPPrice = await api.call({
        abi: contractAbis.vlpPrice,
        target: addresses.sake,
      });

      const sakeWaterUSDCBalV2 = await api.call({
        abi: contractAbis.waterUSDCBal,
        target: addresses.sakeWaterV2,
      });

      const vlpBalV2 = await api.call({
        abi: contractAbis.vlpBalance,
        target: addresses.sakeV2,
      });

      const StakedVLPBalV2 = await api.call({
        abi: contractAbis.stakedVlpBalance,
        target: addresses.sakeV2,
      });

      const vodkaWaterUSDCBalV1 = await api.call({
        abi: contractAbis.waterUSDCBal,
        target: addresses.vodkaV1_Water,
      });

      const vodkaGLPPrice = await api.call({
        abi: contractAbis.glpPrice,
        target: addresses.VodkaV1,
        params: [true],
      });

      const vodkaGLPBalV1 = await api.call({
        abi: contractAbis.balanceOf,
        target: addresses.fsGlp,
        params: [addresses.VodkaV1],
      });

      //gmxV2 Vaults

      const vodkaWaterUSDCBalV2 = await api.call({
        abi: contractAbis.waterUSDCBal,
        target: addresses.vodkaV2_Water,
      });

      const vodkaGmArbBal = await api.call({
        abi: contractAbis.balanceOf,
        target: addresses.gmArb,
        params: [addresses.vodkaV2],
      });

      const vodkaGmEthBal = await api.call({
        abi: contractAbis.balanceOf,
        target: addresses.gmWeth,
        params: [addresses.vodkaV2],
      });

      const vodkaGmArbPrice = await getGmPrice("arb");
      const vodkaGmEthPrice = await getGmPrice("eth");

      return {
        tether: bals.reduce((a, i) => a + i / 1e6, 0),
        dai:
          (whiskeyGainsBalance * whiskeyGTokenPrice) / 1e36 +
          whiskeyWaterDaiBal / 1e18,
        "usd-coin":
          ((vlpBal + StakedVLPBal) * sakeVLPPrice) / 1e18 / 1e5 +
          sakeWaterUSDCBal / 1e6 +
          ((vlpBalV2 + StakedVLPBalV2) * sakeVLPPrice) / 1e18 / 1e5 +
          sakeWaterUSDCBalV2 / 1e6 +
          vodkaWaterUSDCBalV1 / 1e6 +
          (vodkaGLPBalV1 * vodkaGLPPrice) / 1e18 / 1e18 +
          vodkaWaterUSDCBalV2 / 1e6 +
          (vodkaGmArbBal * vodkaGmArbPrice) / 1e36 +
          (vodkaGmEthBal * vodkaGmEthPrice) / 1e36,
      };
    },
  },
};
