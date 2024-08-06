
const { stakings } = require("../helper/staking");
const { pool2s } = require("../helper/pool2");
const axios = require('axios');

async function getMaticPrice() {
  try {
    const response = await axios.get('https://coins.llama.fi/prices/current/polygon:0x0000000000000000000000000000000000001010');
    const data = response.data;
    const maticPrice = data.coins['polygon:0x0000000000000000000000000000000000001010'].price;    
    return maticPrice;
  } catch (error) {
    console.error('Error fetching MATIC price:', error);
  }
}

const stakingAddresses = ["0x111e34bA90D1dE9a2A57f987b5711C71FA4c0Fa0"];
const stakingToken = "0x14e5386f47466a463f85d151653e1736c0c50fc3";
const pool2StakingAddresses = ["0xEAf6E84B4E4C2Ce70a80fd781B6A7f177E7b60F5", "0xb94380939A15C574FE22B04FC95Ec5CCaAD783b8"];
const lpTokens = ["0x6495b61b8088a0a82de737ffb142136119b016e6", "0x464b7eb1c66d662e652dfbfced35d465498ad9ac"];

const tokens = [
    '0x14e5386f47466a463f85d151653e1736c0c50fc3', // ARRLAND
    '0x6495b61b8088a0a82de737ffb142136119b016e6'  // LP
];

const RESOURCE_FARMING = "0x2B448C5218c3aABf8517B5B3DE54b0E817231daF";
const NFT_CONTRACT = "0x5e0a64e69ee74fbaed5e4ec4e4e40cb4a45e3b6c";

async function tvl(api) {
  const nextItemId = await api.call({
    target: NFT_CONTRACT,
    abi: 'function nextItemId() external view returns (uint256)'
  });

  const tokenIds = Array.from({ length: Number(nextItemId) - 1 }, (_, i) => i + 1);

  const balances = await api.multiCall({  
    calls: tokenIds.map(id => ({
      target: NFT_CONTRACT,
      params: [RESOURCE_FARMING, id]
    })),
    abi: 'function balanceOf(address account, uint256 id) external view returns (uint256)'
  });

  const totalNFTs = balances.reduce((a, b) => a + Number(b), 0);

  console.log("totalNFTs", totalNFTs);



  async function getFloorPrice() {
    try {
      const response = await axios.get('https://getfloorpriceproxy-kgeccjwlwq-ey.a.run.app/?contract=0x5e0a64e69ee74fbaed5e4ec4e4e40cb4a45e3b6c');
      const floorPrice = parseFloat(response.data);
      if (isNaN(floorPrice)) {
        console.error('Invalid floor price received:', response.data);
        return 0;
      }
      return floorPrice;
    } catch (error) {
      console.error('Error fetching floor price:', error.message);
      return 0;
    }
  }

  const floorPrice = await getFloorPrice();
  const maticPrice = await getMaticPrice(api);
  const floorPriceUSD = floorPrice * maticPrice;

  const tvl_sum = totalNFTs * floorPriceUSD;
  return { 'usd': tvl_sum };
}

module.exports = {
  polygon: {
    tvl,
    staking: stakings(stakingAddresses, stakingToken, "polygon"),
    pool2: pool2s(pool2StakingAddresses, lpTokens, "polygon")
  },
  methodology: "Counts total value locked on Pirate NFTs staked, the token staking, LP token staking",
}