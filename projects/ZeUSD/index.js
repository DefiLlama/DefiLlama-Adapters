const { ethers } = require("ethers");

const ethereumProvider = new ethers.JsonRpcProvider('https://ethereum-rpc.publicnode.com');
const mantaProvider = new ethers.JsonRpcProvider('https://manta-pacific.drpc.org');

const ERC20_ABI = [
  "function totalSupply() view returns (uint256)"
];
const MantaToken = '0x8497e571B655C50eAA2E0E8BF079cd07140C0B9C';
const ZeUSD = '0xe7d58E0300f628f80341b74e3664e320FB3235f3';

async function tvlZeUSD() {
  try {
    const zeUSDContract = new ethers.Contract(ZeUSD, ERC20_ABI, ethereumProvider);
    const supplyZeUSD = await zeUSDContract.totalSupply();

    const mantaContract = new ethers.Contract(MantaToken, ERC20_ABI, mantaProvider);
    const supplyManta = await mantaContract.totalSupply();

    const supplyZeUSDInEther = parseFloat(ethers.formatUnits(supplyZeUSD, 18));
    const supplyMantaInEther = parseFloat(ethers.formatUnits(supplyManta, 18));

    // console.log(`ZeUSD Total Supply (in ether): ${supplyZeUSDInEther}`);
    // console.log(`Manta Token Total Supply (in ether): ${supplyMantaInEther}`);

    const totalTvlZeUSD = supplyZeUSDInEther - supplyMantaInEther;

    return totalTvlZeUSD;
  } catch (error) {
    console.error("Failed to calculate total supply for ZeUSD:", error);
  }
}

async function tvlManta() {
  try {
    const mantaContract = new ethers.Contract(MantaToken, ERC20_ABI, mantaProvider);
    const supplyManta = await mantaContract.totalSupply();

    const supplyMantaInEther = parseFloat(ethers.formatUnits(supplyManta, 18));

    // console.log(`Manta Token Total Supply (in ether): ${supplyMantaInEther}`);

    return supplyMantaInEther;
  } catch (error) {
    console.error("Failed to calculate total supply for Manta:", error);
  }
}

module.exports = {
  methodology: "Total ZeUSD Supply on all chains",
  ethereum: {
    tvl: tvlZeUSD,
  },
  manta: {
    tvl: tvlManta,
  },
};
