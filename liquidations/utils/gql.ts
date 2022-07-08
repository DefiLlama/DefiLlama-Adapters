import { request } from "graphql-request"

export async function getPagedGql(url:string, query:string, itemName:string){
    let lastId = "";
    let all = [] as any[]
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