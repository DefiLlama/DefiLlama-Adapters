// TODO: Once factory is upgraded, adapt this adapter to dynamically discover minters and genesis contracts from factory events
// The factory (0xd696e56b3a054734d4c6dcbd32e11a278b0ec458) will emit:
//   factory.deployed(address contract, string identifier)
//   where identifier ends with "::minter" (e.g., "harbor_v1::BTC::fxUSD::minter") or "::genesis" (e.g., "harbor_v1::BTC::fxUSD::genesis")
//   The factory address is fixed for all time.
//   We can then index all minter and genesis addresses from factory events instead of hardcoding them.

// All minter contract addresses (proxy addresses from factory deployments)
// Format: proxy address from "proxy" field where proxy name ends with "::minter"
const KNOWN_MINTERS = [
  // BTC::fxUSD::minter
  '0x33e32ff4d0677862fa31582CC654a25b9b1e4888',
  // BTC::stETH::minter
  '0xF42516EB885E737780EB864dd07cEc8628000919',
  // ETH::fxUSD::minter
  '0xd6E2F8e57b4aFB51C6fA4cbC012e1cE6aEad989F',
  // EUR::fxUSD::minter
  '0xDEFB2C04062350678965CBF38A216Cc50723B246',
  // EUR::stETH::minter
  '0x68911ea33E11bc77e07f6dA4db6cd23d723641cE',
  // GOLD::fxUSD::minter
  '0x880600E0c803d836E305B7c242FC095Eed234A8f',
  // GOLD::stETH::minter
  '0xB315DC4698DF45A477d8bb4B0Bc694C4D1Be91b5',
  // MCAP::fxUSD::minter
  '0x3d3EAe3a4Ee52ef703216c62EFEC3157694606dE',
  // MCAP::stETH::minter
  '0xe37e34Ab0AaaabAc0e20c911349c1dEfAD0691B6',
  // SILVER::fxUSD::minter
  '0x177bb50574CDA129BDd0B0F50d4E061d38AA75Ef',
  // SILVER::stETH::minter
  '0x1c0067BEe039A293804b8BE951B368D2Ec65b3e9',
];

// Genesis contract addresses (proxy addresses from factory deployments)
// Format: proxy address from "proxy" field where proxy name ends with "::genesis"
const GENESIS_CONTRACTS = [
  // BTC::fxUSD::genesis
  '0x42cc9a19b358a2A918f891D8a6199d8b05F0BC1C',
  // BTC::stETH::genesis
  '0xc64Fc46eED431e92C1b5e24DC296b5985CE6Cc00',
  // ETH::fxUSD::genesis
  '0xC9df4f62474Cf6cdE6c064DB29416a9F4f27EBdC',
  // EUR::fxUSD::genesis
  '0xa9EB43Ed6Ba3B953a82741F3e226C1d6B029699b',
  // EUR::stETH::genesis
  '0xf4F97218a00213a57A32E4606aAecC99e1805A89',
  // GOLD::fxUSD::genesis
  '0x2cbF457112Ef5A16cfcA10Fb173d56a5cc9DAa66',
  // GOLD::stETH::genesis
  '0x8Ad6b177137A6c33070c27d98355717849Ce526c',
  // MCAP::fxUSD::genesis
  '0x7Bfb831E6360D4600C7b9b200F8AcA6f89CecdA4',
  // MCAP::stETH::genesis
  '0xa6c02dE8E3150C6ffA9C80F98185d42653CB438d',
  // SILVER::fxUSD::genesis
  '0x66d18B9Dd5d1cd51957DFea0e0373b54E06118C8',
  // SILVER::stETH::genesis
  '0x8f655Ca32A1Fa8032955989c19e91886F26439dc',
];

async function tvl(api) {
  // Combine minters and genesis contracts
  const allContracts = [...KNOWN_MINTERS, ...GENESIS_CONTRACTS];

  const collateralTokens = await api.multiCall({ abi: 'address:WRAPPED_COLLATERAL_TOKEN', calls: allContracts, });
  return api.sumTokens({ tokensAndOwners2: [collateralTokens, allContracts] });
}

module.exports = {
  methodology: 'TVL is calculated by summing the balances of collateral tokens held by all 0xHarborFi minter and genesis contracts. Each contract\'s collateral token is queried dynamically using WRAPPED_COLLATERAL_TOKEN().',
  ethereum: {
    tvl,
  },
};
