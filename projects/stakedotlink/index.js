const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");

const sdlToken = "0xA95C5ebB86E0dE73B4fB8c47A45B792CFeA28C23";
const sdlStakingPool = "0x0B2eF910ad0b34bf575Eb09d37fd7DA6c148CA4d";
const linkToken = ADDRESSES.ethereum.LINK;
const linkStakingPool = "0xb8b295df2cd735b15BE5Eb419517Aa626fc43cD5";
const linkPriorityPool = "0xDdC796a66E8b83d0BcCD97dF33A6CcFBA8fd60eA";


async function tvl(timestamp, ethBlock, chainBlocks) {
  const stakedLINK = await sdk.api.abi.call({
    block: ethBlock,
    target: linkStakingPool,
    abi: "uint256:totalStaked",
  });
  const ppLINK = await sdk.api.abi.call({
    block: ethBlock,
    target: linkPriorityPool,
    abi: "uint256:totalQueued",
  });

  return {
    [linkToken]: BigInt(stakedLINK.output) + BigInt(ppLINK.output),
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
    "Queries LINK staking/priority pools and SDL staking pool for the total amount of tokens staked",
  start: 1670337984,
  ethereum: {
    tvl,
    staking,
  },
};
