const { sumTokensExport, sumTokens2 } = require('../helper/chain/cardano');
const { get } = require('../helper/http');

async function borrowed() {
  const totalBorrowed = await get('https://token.empowa.io/emp/borrowed/total');
  const housingAllocationSupply = 120000000000000; // Fixed allocation at TGE
  const housingAllocationBalanceQuery = await sumTokens2({owner: 'addr1vxcvl4y6dun92v5h94jwxc3cwhrsg4ucdsw8z4fea2qc63sttrcej', tokens: ['6c8642400e8437f737eb86df0fc8a8437c760f48592b1ba8f5767e81456d706f7761']});
  const housingAllocationBalance = parseInt(housingAllocationBalanceQuery['cardano:6c8642400e8437f737eb86df0fc8a8437c760f48592b1ba8f5767e81456d706f7761']);
  
  const amountClaimed = housingAllocationSupply - housingAllocationBalance;
  const borrowedBalance = totalBorrowed.total_borrowed - amountClaimed;
  return {'cardano:6c8642400e8437f737eb86df0fc8a8437c760f48592b1ba8f5767e81456d706f7761': borrowedBalance};
}

module.exports = {
  methodology: 'EMP borrowed for housing or housing collateral',
  cardano: {
    staking: sumTokensExport({ owner: 'addr1w8r99sv75y9tqfdzkzyqdqhedgnef47w4x7y0qnyts8pznq87e4wh', tokens: ['6c8642400e8437f737eb86df0fc8a8437c760f48592b1ba8f5767e81456d706f7761']}),
    tvl: borrowed,
  },
};