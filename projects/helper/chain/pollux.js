const { post } = require('../http')

async function getStakedSulBalance(SULAANA_CONTRACT_ADDRESS,SULMINE_CONTRACT_ADDRESS_ENCODED,CALLER_ADDRESS) {
  const data = 
     await post(
      "https://mobfullnode.poxscan.io/wallet/triggerconstantcontract",
      {
        owner_address: CALLER_ADDRESS,
        contract_address: SULAANA_CONTRACT_ADDRESS,
        function_selector: "balanceOf(address)",
        parameter:
        SULMINE_CONTRACT_ADDRESS_ENCODED,
        visible: true,
      }
    )
    
  return(Number("0x" + data?.constant_result[0]));
}

module.exports = {
  getStakedSulBalance
}