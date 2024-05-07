const BigNumber = require('bignumber.js');
// Defining the contract addresses for your tokens
const rsTAO_CONTRACT = "0xdad3d3c5cac4f2c8eca2b483aba9e928a4b88783";
const rsCOMAI_CONTRACT = "0xae173ac44c0041cda87907f52a1e531934e49610";

// Constants for the decimals of each token
const rsTAO_DECIMALS = 9;
const rsCOMAI_DECIMALS = 18;

// function convertTo18DecimalWei(amount, decimals) {
//     const multiplier = new BigNumber(10).exponentiatedBy(18 - decimals);
//     const amount18DecimalWei = new BigNumber(amount).times(multiplier);
//     return amount18DecimalWei.toString(10);
//   }
// Async function to calculate TVL
async function tvl(api) {
    // Retrieve the total supply of rsTAO tokens and adjust for decimals
    const rsTAO_supply = await api.call({
        abi: 'erc20:totalSupply',
        target: rsTAO_CONTRACT
    });
    // const adjusted_rsTAO_supply = rsTAO_supply / (10 ** rsTAO_DECIMALS);

    // let token1Balance18Decimals = await convertTo18DecimalWei(rsTAO_supply, rsTAO_DECIMALS);
    // let adjusted_rsTAO_supply = new BigNumber(token1Balance18Decimals.toString());
    // adjusted_rsTAO_supply = adjusted_rsTAO_supply.integerValue().toFixed();

    // Add rsTAO token supply to the balances using its contract address as a key
    api.add(rsTAO_CONTRACT, rsTAO_supply);

    // Retrieve the total supply of rsCOMAI tokens and adjust for decimals
    const rsCOMAI_supply = await api.call({
        abi: 'erc20:totalSupply',
        target: rsCOMAI_CONTRACT
    });
    // const adjusted_rsCOMAI_supply = rsCOMAI_supply / (10 ** rsCOMAI_DECIMALS);

    // Add rsCOMAI token supply to the balances using its contract address as a key
    api.add(rsCOMAI_CONTRACT, rsCOMAI_supply);
}

// Module exports
module.exports = {
    methodology: "TVL is calculated as the sum of the total supplies of rsTAO and rsCOMAI tokens.",
    ethereum: {
        tvl,
    }
};
