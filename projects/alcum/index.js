const ALCUM_COPPER_VAULT = '0x84735270aE4F8fe9ae15652f676ecb524ea480Ab';
const SETTLEMENT_ENGINE = '0xa5ce803D61f694E35b3889392C82b5b9b2B91989';
const EPOCH_MANAGER = '0x40A8611580F4F896ccee2b949635F442E8A9275f';

const ABI = {
  totalSupply: "function totalSupply() view returns (uint256)",
  decimals: "function decimals() view returns (uint8)",
  getCopperPrice: "function getCopperPrice() view returns (uint256)",
  currentEpochId: "function currentEpochId() view returns (uint256)",
  epochRevenues: "function epochRevenues(uint256) view returns (uint256 epochId, uint256 netRevenue, uint256 originalNetRevenue, uint256 cupPurchased, uint256 cupSold, uint256 averagePurchasePrice, uint256 averageSalePrice, bool isSettled)",
  getNAVSummary: "function getNAVSummary() view returns (uint256 totalAssets, uint256 netAssets, uint256 pricePerShare)"
};

async function tvl(api) {
  const [totalSupply, decimals] = await Promise.all([
    api.call({ target: ALCUM_COPPER_VAULT, abi: ABI.totalSupply }),
    api.call({ target: ALCUM_COPPER_VAULT, abi: ABI.decimals }),
  ]);

  let pricePerShare;

  const currentEpochId = await api.call({
    target: EPOCH_MANAGER,
    abi: ABI.currentEpochId
  });

  if (currentEpochId > 0) {
    const currentEpochData = await api.call({
      target: SETTLEMENT_ENGINE,
      abi: ABI.epochRevenues,
      params: [currentEpochId]
    });

    if (currentEpochData.isSettled) {
      const navSummary = await api.call({
        target: SETTLEMENT_ENGINE,
        abi: ABI.getNAVSummary
      });
      pricePerShare = navSummary.pricePerShare;
    }
  }

  if (!pricePerShare) {
    pricePerShare = await api.call({
      target: ALCUM_COPPER_VAULT,
      abi: ABI.getCopperPrice
    });
  }
  
  const totalValueUSDC = ((totalSupply / (10 ** decimals)) * (pricePerShare / (10 ** 8)));

  api.addUSDValue(totalValueUSDC);
}

module.exports = {
  misrepresentedTokens: true,
  methodology: "TVL is calculated by multiplying the xCUP total supply by the share price. If an epoch is settled, the share price is derived from the Settlement Engine's NAV (netRevenue logic). Otherwise, the current Copper Price is used.",
  ethereum: {
    tvl,
  }
};