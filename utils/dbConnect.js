
function dbDriver() {
	if (!global.sql) {
		global.sql = {
			driver: require('msnodesqlv8'),
			//connStr: `Driver={ODBC Driver 18 for SQL Server}; Server=(localdb)\\mssqllocaldb;UID=linux; PWD=linux; Database=EtjanstMallContext;Encrypt=no;`
			//connStr: `Driver={ODBC Driver 18 for SQL Server}; Server=(localdb)\\mssqllocaldb;Database=EtjanstMallContext;Trusted_Connection=True;MultipleActiveResultSets=true;`
			connStr: `server=(localdb)\\mssqllocaldb;Database=EtjanstMallContext;Trusted_Connection=Yes;Driver={SQL Server Native Client 11.0};`
		}
	}
	return global.sql
}

export default dbDriver

