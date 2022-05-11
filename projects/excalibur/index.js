const {uniTvlExport} = require('../helper/calculateUniTvl')

function transformFantomAddress(addr){
  return ((addr) => {
    if(addr === "0x846e4d51d7e2043c1a87e0ab7490b93fb940357b"){ // UST address
      return 'ethereum:0xa693b19d2931d498c5b318df961919bb4aee87a5'
    }
    return `fantom:${addr}`;
  })
}

module.exports={
    fantom:{
        tvl: uniTvlExport("0x08b3CCa975a82cFA6f912E0eeDdE53A629770D3f", "fantom", transformFantomAddress)
    }
}
