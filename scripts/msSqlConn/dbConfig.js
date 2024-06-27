//local db connection

const dbConfig = {
    database: 'EtjanstMallContext', // your database name
    server: '(localdb)\\MSSQLLocalDB', // your server name
    driver: 'msnodesqlv8',
    //     // server: '(localdb)\MSSQLLocalDB',
    //     // port: 1433,
    //     // database: 'EtjanstMallContext',
    //     // server: 'utv-mssql02\\UTV_MSSQL02',
    //     // database: 'FormsDb',
    //     // user: 'UTV_dbOwner',
    //     // password: 'Somm@r2021!',
    //     //driver: "msnodesqlv8",
    options: {
        trustedConnection: true,
    },
}
module.exports = dbConfig
