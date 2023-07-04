module.exports = {
  misrepresentedTokens: true,
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
      };

      const contractAbis = {
        gainsBalance: "function getGainsBalance() view returns (uint256)",
        gTokenPrice: "function gTokenPrice() view returns (uint256)",
        wWaterBalance: "function balanceOfDAI() public view returns (uint256)",
        vlpBalance: "function getVlpBalance() public view returns (uint256)",
        stakedVlpBalance:
          "function getStakedVlpBalance() public view returns (uint256)",
        vlpPrice: "function getVLPPrice() public view returns (uint256)",
        waterUSDCBal: "function balanceOfUSDC() public view returns (uint256)",
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

      return {
        tether: bals.reduce((a, i) => a + i / 1e6, 0),
        dai:
          (whiskeyGainsBalance * whiskeyGTokenPrice) / 1e36 +
          whiskeyWaterDaiBal / 1e18,
        "usd-coin":
          ((vlpBal + StakedVLPBal) * sakeVLPPrice) / 1e18 / 1e5 +
          sakeWaterUSDCBal / 1e6,
      };
    },
  },
};
