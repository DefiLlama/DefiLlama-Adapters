const ADDRESSES = require('../helper/coreAssets.json')
const { getTokenBalance } = require('../helper/chain/stellar')

const VAULTS_CONTRACT_ID = "CCUN4RXU5VNDHSF4S4RKV4ZJYMX2YWKOH6L4AKEKVNVDQ7HY5QIAO4UB";

async function tvl(api) {
  const balance = await getTokenBalance(ADDRESSES.stellar.XLM, VAULTS_CONTRACT_ID)
  api.add(ADDRESSES.stellar.XLM, balance)
}

module.exports = {
  timetravel: false,
  methodology: `Takes the total amount of XLMs locked in the Vaults contract, the XLMs are the collateral of the issued assets by the protocol.`,
  stellar: {
    tvl,
  },
};
