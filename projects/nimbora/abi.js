const troveInterface = [{
    name: "get_l1_total_supply",
    type: "function",
    inputs: [],
    outputs: [
      {
        type: "core::integer::u256"
      }
    ],
    state_mutability: "view"
  },
];

const troveAbi = {};
troveInterface.forEach((i) => (troveAbi[i.name] = i));

module.exports = {
    troveAbi,
};