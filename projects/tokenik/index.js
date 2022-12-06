const sdk = require("@defillama/sdk");
const abi = require("./abi.json");

const rnikTokenAddress = "RNIK" // Token contract is not yet deployed. RNIK is only a balance in the staking contract. TODO: add RNIK contract address once deployed.
const rnikStaking = '0xdff9ff80fc9acad74b29cda886889fe0f6cf45cf';


/*** Staking of reward token (RNIK) on Ethereum */
const getStakedRNIK = async (timestamp, ethBlock, chainBlocks) => {
  const stakedAmount = (await sdk.api.abi.call({ abi: abi.stakingRNIK, target: rnikStaking, block: ethBlock })).output;

  return {
    [rnikTokenAddress]: stakedAmount
  };
};

module.exports = {
  timetravel: true,
  start: 1668416951, // Nov-14-2022 09:09:11 AM +UTC
  misrepresentedTokens: true,
  methodology: `Tokenik's TVL consists of only staked RNIK on Ethereum until the official Tokenik v2 launch. At that time, the RNIK token contract will also deployed. Currently, the RNIK token is only a balance on the staking/rewards contracts with a value of $1 when used on the Tokenik platform.`,
  ethereum: {
    tvl: () => ({}),
    staking: getStakedRNIK
  },
};
