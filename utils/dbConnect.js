function dbDriver() {
    if (!global.sql) {
        global.sql = {
            driver: require('msnodesqlv8'),
            connStr: `server=${process.env.DB_HOST};Database=${process.env.DB_DATABASE};uid=${process.env.DB_USER};pwd=${process.env.DB_PASSWORD};Trusted_Connection=${process.env.DB_TRUSTED_CONNECTION};Driver={SQL Server Native Client 11.0};`,
        }
    }
    return global.sql
}

export default dbDriver
