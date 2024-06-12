const stakedStrk = [
  {
    name: "total_assets",
    type: "function",
    inputs: [],
    outputs: [
      {
        type: "core::integer::u256",
      },
    ],
    state_mutability: "view",
  },
];

const stakedStrkAbi = {};
stakedStrk.forEach((i) => (stakedStrkAbi[i.name] = i));

module.exports = {
  stakedStrkAbi,
};
