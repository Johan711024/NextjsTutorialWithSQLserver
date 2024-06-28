import { Connection, ConnectionPromises } from 'msnodesqlv8/types'
import dbConnect from '../../utils/dbConnect'

export async function getConnection(): Promise<ConnectionPromises> {
    const sql = dbConnect()
    console.log(`[dashboard] opening connection`)
    const con: Connection = await sql.driver.promises.open(sql.connStr)
    return con.promises
}
export async function doSqlQuery(sqlQuery: string) {
    const promises: ConnectionPromises = await getConnection()
    const data = await promises.query(sqlQuery)
    return data
}
