const sdk = require("@defillama/sdk");
const abi = 'function tvlOfPool(address pool) view returns (uint256 tvl)'
const BigNumber = require("bignumber.js");

const dashboardPolygon = "0xFAacEA541e23F0D3eC7d4E202E791923Ce273787";

const poolsPolygon = [
  "0x7f64624C36d8356E05E85d7AfCD2F998d3C45bC1",
  "0xdC58C5F1BF1090E44AB976Eba60bA3bAe89c1b07",
  "0x5CfDf337993555E1FC3E94871642c13703eAb3b9",
  "0x56cB79209462A2e3454Cc84FE6B3FE5DC62389f6",
  "0x06515Aeb17448D0AeE00A28e3eB617cE7aFe9318",
  "0x658188a45B84c36407776320B01b98BD9eDCE9Cd",
  "0x95258eB8a10Ba6f8bB61666339eC65bdd380F941",
  "0x7dC29143C099919D9380dC74B9Eb95fF847e6536",
  "0x804Dc5352f1B3206FF3b0Df58035B80B421CD456",
]

const stakingPolygon = [
  "0x2b9299f80a644CA60c0d398e257cb72488875d2A",
  "0x7f64624C36d8356E05E85d7AfCD2F998d3C45bC1",
]

const ZERO = new BigNumber(0);
const ETHER = new BigNumber(10).pow(18);

async function TVLPoolPolygon(timestamp, ethBlock, chainBlock) {
  const block = chainBlock.polygon;
  const total = (
    await sdk.api.abi.multiCall({
      calls: poolsPolygon.map((address) => ({
        target: dashboardPolygon,
        params: address,
      })),
      block,
      abi: abi,
      chain: "polygon",
    })
  ).output.reduce((tvl, call) => {
    let value = call && call.output && new BigNumber(call.output);
    if (value) {
      return tvl.plus(value.dividedBy(ETHER));
    }
    return tvl;
  }, ZERO);

  return {
    tether: total.toNumber(),
  };
}

async function singleStakingPolygon(timestamp, ethBlock, chainBlock) {
  const block = chainBlock.polygon;
  const total = (
    await sdk.api.abi.multiCall({
      calls: stakingPolygon.map((address) => ({
        target: dashboardPolygon,
        params: address,
      })),
      block,
      abi: abi,
      chain: "polygon",
    })
  ).output.reduce((tvl, call) => {
    let value = call && call.output && new BigNumber(call.output);
    if (value) {
      return tvl.plus(value.dividedBy(ETHER));
    }
    return tvl;
  }, ZERO);

  return {
    tether: total.toNumber(),
  };
}

module.exports = {
  methodology: `Total value in pools`,
  misrepresentedTokens: true,
  polygon: {
    tvl: TVLPoolPolygon,
    staking: singleStakingPolygon
  },
};
