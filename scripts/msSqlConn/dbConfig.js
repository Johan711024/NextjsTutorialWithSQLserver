const dbConfig = {
    database: process.env.DB_DATABASE, // your database name
    server: process.env.DB_HOST, // your server name
    driver: 'msnodesqlv8',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    options: {
        trustedConnection: false,
    },
}

module.exports = dbConfig
