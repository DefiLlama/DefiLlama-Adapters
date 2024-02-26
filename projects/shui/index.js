const SCFX_TokenAddress = "0x1858a8d367e69cd9E23d0Da4169885a47F05f1bE";

const WCFX = "0x14b2d3bc65e74dae1030eafd8ac30c533c976a9b";

module.exports = {
  conflux: {
    tvl: async (_, _1, _2, { api }) => {
      const ratioDepositedBySupply = await api.call({
        target: SCFX_TokenAddress,
        abi: "function ratioDepositedBySupply() public view returns (uint256)"
      });
      const totalDeposited = await api.call({
        target: SCFX_TokenAddress,
        abi: "function totalDeposited() public view returns (uint256)"
      });
      return {
        ["conflux:" + WCFX]: totalDeposited * ratioDepositedBySupply / 1e9
      };
    }
  }
};