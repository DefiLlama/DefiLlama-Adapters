const strkStaking = [
  {
    "type": "function",
    "name": "get_total_stake",
    "inputs": [],
    "outputs": [
      {
        "type": "core::integer::u128"
      }
    ],
    "state_mutability": "view"
  },
]
const strkStakingAbi = {}
strkStaking.forEach(i => strkStakingAbi[i.name] = i)

module.exports = {
  strkStakingAbi,
}