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

const L1TroveAbi = {};

L1TroveInterface.forEach((i) => (L1TroveAbi[i.name] = i));

module.exports = {
    L1TroveAbi
};