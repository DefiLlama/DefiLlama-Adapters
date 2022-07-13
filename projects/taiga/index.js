const axios = require('axios');

async function fetch(){
    return (await axios.get('https://api.taigaprotocol.io/protocol/taiga/tvl')).data;
}

module.exports = {
    fetch
}
