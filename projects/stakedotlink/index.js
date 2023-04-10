const sdk = require("@defillama/sdk");

const sdlToken = "0xA95C5ebB86E0dE73B4fB8c47A45B792CFeA28C23";
const sdlStakingPool = "0xAEF186611EC96427d161107fFE14bba8aA1C2284";

const linkToken = "0x514910771af9ca656af840dff83e8264ecf986ca";
const linkStakingPool = "0xb8b295df2cd735b15BE5Eb419517Aa626fc43cD5";

const stETHToken = "0xae7ab96520de3a18e5e111b5eaab095312d7fe84";
const rETHToken = "0xae78736cd615f374d3085123a210448e74fc6393";
const stETHIndexPoolAdapter = "0xEb9f29b6395Db28C0861C24f1cbFCEee1ff0791D";
const rETHIndexPoolAdapter = "0x6025533B9E095AB2730E1Ad50219be8293d66220";

async function tvl(timestamp, ethBlock, chainBlocks) {
  const stakedLINK = await sdk.api.abi.call({
    block: ethBlock,
    target: linkStakingPool,
    abi: "uint256:totalStaked",
  });

  const stakedSTETH = await sdk.api.abi.call({
    block: ethBlock,
    target: stETHIndexPoolAdapter,
    abi: "uint256:getTotalDepositsLSD",
  });
  const stakedRETH = await sdk.api.abi.call({
    block: ethBlock,
    target: rETHIndexPoolAdapter,
    abi: "uint256:getTotalDepositsLSD",
  });

  return {
    [linkToken]: stakedLINK.output,
    [stETHToken]: stakedSTETH.output,
    [rETHToken]: stakedRETH.output,
  };
}

async function staking(timestamp, ethBlock, chainBlocks) {
  const stakedSDL = await sdk.api.abi.call({
    block: ethBlock,
    target: sdlStakingPool,
    abi: "uint256:totalStaked",
  });

  return {
    [sdlToken]: stakedSDL.output,
  };
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology:
    "Queries ETH index pool and LINK and SDL staking pools for the total amount of tokens staked",
  start: 1670337984,
  ethereum: {
    tvl,
    staking,
  },
};
