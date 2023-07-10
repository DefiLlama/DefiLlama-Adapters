const { nullAddress } = require('../helper/tokenMapping')
const { sumTokensExport } = require('../helper/chain/ergo')
const axios = require('axios')

async function borrowed(_, _b, _cb, { api, }) {
  const { data } = await axios.get('https://api.sigmaexplorer.org/sigmafi/loans/ongoing?limit=10000')
  data.forEach(({ repayment: { tokenId, amount}}) => {
    api.add(tokenId === 'erg' ? nullAddress : tokenId, amount)
  })
  return api.getBalances()
}

module.exports = {
  timetravel: false,
  ergo: {
    tvl: sumTokensExport({ owners: [
      '47r8CNpYJhLaJy9vQAyyhVX7SLu73dg8EDmi9zzei7YWomvTAbNaZMAHdM38TsFoiZfAcKuyrgngD6ZS2uPQktLfFpvypxkRiRi9LswRYd5tk6B5HHDsFNMfLcdqeWT9RDR2SRq1zm2HF9F913aY1gc9gVyeh8PGED2ThKJ2NCG19XhyPqCbgTFY5uTC6RaqpGCdH9p58fD4DWDd46D3EfUXz3XLzqGQvDGXTghkh9UtZ1LB7nFFoPDFc2QVDt6BCtTQwq4Jh9vFfTfBG9q6ReVF5cVX7nA6vXhWjUuHKMd7Zw5anM2u95e',
      '2f7L4F3Q9eCjdWRmxSENw18Bw5SPAf3vBaimRqgpWB5JayiqSWG2tvnc6kF8ae8mpYwtZasmVDzmgjbfa8EBTdA1u55yB8ypRZDDFhs6DmhQekuGvzBoViApMyKdAXCPriXMaJWgHxAdjtR7QhXSjdnyozxZ7ApXrQY6hDSX6H2Fg9siuGUQpTQ3oJDa8nScMGdLNK2T5A7oHs',
    ] }),
    borrowed,
  },
}
