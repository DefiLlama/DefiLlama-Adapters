const { request } = require("graphql-request")

async function getPagedGql(url, query, itemName){
    let lastId = "";
    let all = []
    let page;
    do {
        page = (await request(url, query, {
            lastId
        }))[itemName]
        all = all.concat(page)
        lastId = page[page.length - 1]?.id
    } while (page.length === 1e3);
    return all
}

module.exports={
    getPagedGql
}