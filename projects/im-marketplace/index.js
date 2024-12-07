const { ethers } = require("ethers");

// Addresses and ABI
const InvoiceMateContractAddress = "0x3fD2C172c783C5B2dFCF7e756420F78F90A28848";

const InvoiceMateABI = [
  "function totalIncomings(uint256) view returns (uint256)",
  "function currentDay() view returns (uint256)",
];

// TVL function (placeholder, returns 0)
async function tvl(api) {
  // If you don't calculate TVL, return 0
  return {};
}

// Borrowed calculation
async function borrowed(api) {
  // Connect to the smart contract
  const contract = new ethers.Contract(InvoiceMateContractAddress, InvoiceMateABI, api.provider);

  // Get the current day
  const day = await contract.currentDay();
  console.log("day",day)

  // Fetch total incomings for the current day
  const borrowedValue = await contract.totalIncomings(day);
  console.log("borrowedValue",borrowedValue)

  // Add the borrowed value
  api.add("islm", borrowedValue);
}

module.exports = {
  methodology: "Borrowed value is calculated by fetching total incomings for the current day from the smart contract.",
  islm: {
    tvl, // TVL key required
    borrowed,
  },
  hallmarks: [
    [1688169600, "Launch on ISLM"],
  ],
};
