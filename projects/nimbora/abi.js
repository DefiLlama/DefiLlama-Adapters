const L2TroveInterface = [{
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

const L1TroveInterface = [{
  name:"getEntireDebtAndColl",
  type:"function",
  inputs:[{
    internalType:"address",
    name:"_borrower",
    type:"address"
  }],
  outputs:[{
    internalType:"uint256",
    name:"debt",
    type:"uint256"
  },
  {
    internalType:"uint256",
    name:"coll",
    type:"uint256"
  }]
}];

const L2TroveAbi = {};
const L1TroveAbi = {};

L2TroveInterface.forEach((i) => (L2TroveAbi[i.name] = i));
L1TroveInterface.forEach((i) => (L1TroveAbi[i.name] = i));

module.exports = {
    L2TroveAbi,
    L1TroveAbi
};