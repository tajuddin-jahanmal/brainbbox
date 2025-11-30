import SQLite from 'react-native-sqlite-storage';

const DB_NAME = 'kamil.db';

SQLite.DEBUG(false);
SQLite.enablePromise(true);

let db;
const initializeDB = () => {
    return new Promise((resolve, reject) => {
        SQLite.openDatabase({ name: DB_NAME, location: "default" })
        .then(database => {
            db = database;
            resolve();
        })
        .catch(error => {
            console.log(error, "ERROR sqlite connection");
            reject(error)
        });
    });
};



// CUSTOMERS
const createCustomersTable = async () => {
	try {
		await db.executeSql(`
			CREATE TABLE IF NOT EXISTS customers (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				_id INTEGER,
				firstName TEXT NOT NULL,
				lastName TEXT,
				countryCode TEXT NOT NULL,
				phone TEXT NOT NULL UNIQUE,
				email TEXT,
				summary TEXT,
				active INTEGER DEFAULT 1,
				userId INTEGER
			)
		`, []);
		console.log('Customers table created successfully');
	} catch (error) {
		console.log('Error creating customers table:', error.message);
	}
};

const clearCustomersTable = async () => {
	try {
		// summary TEXT UNIQUE,
		await db.executeSql("DELETE FROM customers")
		console.log('Customers table clear successfully');
	} catch (error) {
		console.log('Error clearing customers table:', error.message);
	}
};

// Opposite CUSTOMERS
const createOppositeCustomersTable = async () => {
	try {
		await db.executeSql(`
			CREATE TABLE IF NOT EXISTS oppositeCustomers (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				_id INTEGER,
				firstName TEXT NOT NULL,
				lastName TEXT,
				phone TEXT NOT NULL UNIQUE,
				email TEXT UNIQUE,
				summary TEXT,
				active INTEGER DEFAULT 1,
				userId INTEGER
			)
		`, []);
		// email TEXT UNIQUE,
		console.log('Opposite Customers table created successfully');
	} catch (error) {
		console.log('Error creating Opposite customers table:', error.message);
	}
};

// Opposite CUSTOMERS
const clearOppositeCustomersTable = async () => {
	try {
		// summary TEXT UNIQUE,
		await db.executeSql("DELETE FROM oppositeCustomers")		
		console.log('Opposite Customers table clear successfully');
	} catch (error) {
		console.log('Error clearing Opposite customers table:', error.message);
	}
};

const createQueueTable = async () => {
	try {
		await db.executeSql(`
			CREATE TABLE IF NOT EXISTS queue (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				queryType TEXT NOT NULL,
				localId INTEGER NOT NULL,
				serverId INTEGER,
				tableName TEXT NOT NULL,
				data TEXT
			)
		`, []);
		console.log('Queue table created successfully');
	} catch (error) {
		console.error('Error creating queue table:', error);
	}
};

const clearQueueTable = async () => {
	try {
		await db.executeSql("DELETE FROM queue")			
		console.log('Queue table clear successfully');
	} catch (error) {
		console.error('Error clearing queue table:', error);
	}
};


// Create 'cashbooks' table
const createCashBooksTable = async () => {
	try {
		await db.executeSql(`
			CREATE TABLE IF NOT EXISTS cashbooks (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				_id INTEGER,
				ownerId INTEGER NOT NULL,
				customerId INTEGER NOT NULL,
				active INTEGER,
				FOREIGN KEY (ownerId) REFERENCES customers (id),
				FOREIGN KEY (customerId) REFERENCES customers (id)
			)
		`, []);
		console.log('Cashbooks table created successfully');
	} catch (error) {
		console.log('Error creating cashbooks table:', error.message);
	}
};

const clearCashBooksTable = async () => {
	try {
		await db.executeSql("DELETE FROM cashbooks")
		console.log('Cashbooks table clear successfully');
	} catch (error) {
		console.log('Error clearing cashbooks table:', error.message);
	}
};

// Create 'transactions' table
const createTransactionsTable = async () => {
	try {
		await db.executeSql(`
			CREATE TABLE IF NOT EXISTS transactions (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				amount REAL NOT NULL,
				profit REAL,
				information TEXT,
				currencyId INTEGER NOT NULL,
				cashbookId INTEGER NOT NULL,
				_id INTEGER,
				type INTEGER NOT NULL,
				isReceivedMobile INTEGER,
				photo TEXT,
				dateTime TEXT NOT NULL,
				FOREIGN KEY (currencyId) REFERENCES currencies (id),
				FOREIGN KEY (cashbookId) REFERENCES cashbooks (id)
			)
		`, []);
		console.log('Transactions table created successfully');
	} catch (error) {
		console.log('Error creating transactions table:', error.message);
	}
};

const clearTransactionsTable = async () => {
	try {
		await db.executeSql("DELETE FROM transactions")
		console.log('Transactions table clear successfully');
	} catch (error) {
		console.log('Error clearing transactions table:', error.message);
	}
};

const createOppoTransactionsTable = async () => {
	try {
		await db.executeSql(`
			CREATE TABLE IF NOT EXISTS oppositeTransactions (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				amount REAL NOT NULL,
				profit REAL,
				information TEXT,
				currencyId INTEGER NOT NULL,
				cashbookId INTEGER NOT NULL,
				_id INTEGER,
				type INTEGER NOT NULL,
				dateTime TEXT NOT NULL,
				FOREIGN KEY (currencyId) REFERENCES currencies (id),
				FOREIGN KEY (cashbookId) REFERENCES cashbooks (id)
			)
		`, []);
		console.log('Opposite Transactions table created successfully');
	} catch (error) {
		console.log('Error creating Opposite Transactions table:', error.message);
	}
};


const clearOppoTransactionsTable = async () => {
	try {
		await db.executeSql("DELETE FROM oppositeTransactions")
		console.log('Opposite Transactions table clear successfully');
	} catch (error) {
		console.log('Error clearing Opposite Transactions table:', error.message);
	}
};

// Create 'selfCash' table
const createSelfCashTable = async () => {
	try {
		await db.executeSql(`
			CREATE TABLE IF NOT EXISTS selfCash (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				amount REAL NOT NULL,
				profit REAL,
				information TEXT,
				currencyId INTEGER NOT NULL,
				cashbookId INTEGER NOT NULL,
				_id INTEGER,
				type INTEGER NOT NULL,
				dateTime TEXT NOT NULL,
				FOREIGN KEY (currencyId) REFERENCES currencies (id),
				FOREIGN KEY (cashbookId) REFERENCES cashbooks (id)
				)
		`, []);
		console.log('selfCash table created successfully');
	} catch (error) {
		console.log('Error creating selfCash table:', error.message);
	}
};

const clearSelfCashTable = async () => {
	try {
		await db.executeSql("DELETE FROM selfCash")
		console.log('selfCash table clear successfully');
	} catch (error) {
		console.log('Error clearing selfCash table:', error.message);
	}
};

// Create 'currencies' table
const createCurrenciesTable = async () => {
	try {
		await db.executeSql(`
			CREATE TABLE IF NOT EXISTS currencies (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				_id INTEGER,
				code TEXT NOT NULL UNIQUE,
				name TEXT NOT NULL
			)
		`, []);
		console.log('Currencies table created successfully');
	} catch (error) {
		console.log('Error creating currencies table:', error.message);
	}
};

const clearCurrenciesTable = async () => {
	try {
		// await db.executeSql("DROP TABLE IF EXISTS currencies")
		await db.executeSql("DELETE FROM currencies")
		console.log('Currencies table clear successfully');
	} catch (error) {
		console.log('Error clearing currencies table:', error.message);
	}
};

// Create OpeningBalance
const createOpeningBalanceTable = async () => {
	try {
		await db.executeSql(`
			CREATE TABLE IF NOT EXISTS openingBalance (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				_id INTEGER,
				amount INTEGER NOT NULL,
				currencyId INTEGER NOT NULL,
				customerId INTEGER NOT NULL,
				dateTime TEXT NOT NULL,
				FOREIGN KEY (currencyId) REFERENCES currencies (id),
				FOREIGN KEY (customerId) REFERENCES customers (id)
			)
		`, []);
		console.log('Opening Balance table created successfully');
	} catch (error) {
		console.log('Error creating opening_balance table:', error.message);
	}
};

// Clear OpeningBalance
const clearOpeningBalanceTable = async () => {
	try {
		await db.executeSql("DELETE FROM openingBalance")
		console.log('Opening Balance table clear successfully');
	} catch (error) {
		console.log('Error clearing Opening Balance table:', error.message);
	}
};

// Create WeeklyBalances
const createWeeklyBalancesTable = async () => {
  try {
    await db.executeSql(
        `CREATE TABLE IF NOT EXISTS weeklyBalances (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
		  _id INTEGER,
          weekStart TEXT NOT NULL,
          weekEnd TEXT NOT NULL,
          openingBalance REAL NOT NULL,
          totalCashIn REAL NOT NULL,
          totalCashOut REAL NOT NULL,
          closingBalance REAL NOT NULL,
          customerId INTEGER NOT NULL,
          currencyId INTEGER NOT NULL
        );`
      );

    console.log("Weekly Balances table created or already exists.");
  } catch (error) {
    console.error("Error creating weeklyBalances table:", error);
  }
};


// Clear WeeklyBalances
const clearWeeklyBalancesTable = async () => {
	try {
		await db.executeSql("DELETE FROM weeklyBalances")
		console.log('Weekly Balances table clear successfully');
	} catch (error) {
		console.log('Error clearing weeklyBalances table:', error.message);
	}
};


export {
	clearCashBooksTable,
	clearCurrenciesTable,
	clearCustomersTable, clearOpeningBalanceTable, clearOppositeCustomersTable,
	clearOppoTransactionsTable,
	clearQueueTable,
	clearSelfCashTable,
	clearTransactionsTable, clearWeeklyBalancesTable, createCashBooksTable,
	createCurrenciesTable,
	createCustomersTable, createOpeningBalanceTable, createOppositeCustomersTable,
	createOppoTransactionsTable,
	createQueueTable,
	createSelfCashTable,
	createTransactionsTable, createWeeklyBalancesTable, db,
	initializeDB
};
export default () => {};