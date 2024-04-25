const { stakings } = require("../helper/staking");

const stakingContracts = [
  "0xd47477da78F6252b1029f3041aC4FC749439CD3F",
  "0xe3F7194AB9cDa2E91bBf0AC7F450Ac7a60B40901",
  "0x53Bd1b82363d93dc9344FfBB764d2713cd5628cC",
];

const stakingTokens = [
    "0x5c46bFF4B38dc1EAE09C5BAc65872a1D8bc87378",
    "0xB880fd278198bd590252621d4CD071b1842E9Bcd",
    "0xF6D226f9Dc15d9bB51182815b320D3fBE324e1bA"
];

module.exports = {
  merlin: {
    staking: stakings(stakingContracts, stakingTokens),
    tvl: () => ({}),
  },
};
