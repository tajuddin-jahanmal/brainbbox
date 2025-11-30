import { getWeekRange } from '../utils/dateMaker';
import { db } from './index';

const createTransaction = async (_id, amount, profit, information, currencyId, cashbookId, type, dateTime, isReceivedMobile, photo) => {
  try {
      await db.executeSql(
          'INSERT INTO transactions (_id, amount, profit, information, currencyId, cashbookId, type, dateTime, isReceivedMobile, photo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [_id, amount, profit, information, currencyId, cashbookId, type, dateTime, isReceivedMobile, photo]
      );
      // I DO THIS CODE BECAUSE WE NEED THE NEW OFFLINE DATABASE TRANSACTION ID
      const [res] = await db.executeSql('SELECT * FROM transactions WHERE _id = ?', [_id]);
      const newTransaction = res.rows.item(0);
      console.log('Transaction created successfully');
      return newTransaction;
  } catch (error) {
      console.error('Error creating transaction:', error);
  }
};

const getTransactions = async () => {
  try {
      const [results] = await db.executeSql('SELECT * FROM transactions');
      const transactions = results.rows.raw();
      // console.log('Transactions:', transactions);
      return transactions;
  } catch (error) {
      console.error('Error fetching transactions:', error);
      return [];
  }
};

const getTransactionsByCurrencyId = async (currencyId) => {
  try {
      const [results] = await db.executeSql('SELECT * FROM transactions WHERE currencyId = ? ORDER BY dateTime DESC', [currencyId]);
      const transactions = results.rows.raw();
      // console.log('Transactions by Date:', transactions[0]);
      return transactions;
  } catch (error) {
      console.error('Error fetching transactions:', error);
      return [];
  }
};

const updateTransaction = async (id, _id, amount, profit, information, currencyId, cashbookId, type, dateTime, isReceivedMobile, photo) => {
  try {
      await db.executeSql(
          'UPDATE transactions SET _id = ?, amount = ?, profit = ?, information = ?, currencyId = ?, cashbookId = ?, type = ?, dateTime = ?, isReceivedMobile = ?, photo = ?  WHERE id = ?',
          [_id, amount, profit, information, currencyId, cashbookId, type, dateTime, isReceivedMobile, photo, id]
      );
      console.log('Transaction updated successfully');
  } catch (error) {
      console.error('Error updating transaction:', error);
  }
};

const deleteTransaction = async (_id) => {
  try {
      await db.executeSql('DELETE FROM transactions WHERE _id = ?', [_id]);
      console.log('Transaction deleted successfully');
  } catch (error) {
      console.error('Error deleting transaction:', error);
  }
};

// const transactionByDateAndCashbookIdAndCurrencyId = async (fromDate, toDate, cashbookId, currencyId, type) =>
// {
//   try {
//     if (!type || type?.toLowerCase() !== "custom") 
//     {
//       const fixedToDate = new Date(toDate);
//       fixedToDate.setHours(23, 59, 59, 999);

//       const [results] = await db.executeSql(`SELECT * FROM transactions WHERE dateTime BETWEEN ? AND ? AND cashbookId = ? AND currencyId = ?`,
//       [fromDate, fixedToDate.toISOString(), cashbookId, currencyId]);
//       const transactions = results.rows.raw();
//       return transactions;
//     } else if (type?.toLowerCase() === "custom")
//     {
//       const twentyFourHoursAgo = new Date();
//       twentyFourHoursAgo.setDate(twentyFourHoursAgo.getDate() - 1);
//       const [results] = await db.executeSql(`SELECT * FROM transactions WHERE dateTime >= ? AND cashbookId = ? AND currencyId = ?`,
//       [twentyFourHoursAgo.toISOString(), cashbookId, currencyId]);
//       const transactions = results.rows.raw();
//       return transactions;
//     }
//   } catch (error) {
//     console.error('Error transaction by date:', error);
//   }
// }

// THIS FUNCTION IS BETTER THEN ABOVE ONE
const transactionByDateAndCashbookIdAndCurrencyId = async (fromDate, toDate, cashbookId, currencyId, type = "default") => {
  try {
    let query = '';
    let params = [];

    // 🧠 Normalize dates
    const start = new Date(fromDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(toDate);
    end.setHours(23, 59, 59, 999);

    // 🕒 Handle custom or preset filters
    switch (type.toLowerCase()) {
      case "custom":
        const dayAgo = new Date();
        dayAgo.setDate(dayAgo.getDate() - 1);
        query = `SELECT * FROM transactions WHERE dateTime >= ? AND cashbookId = ? AND currencyId = ?`;
        params = [dayAgo.toISOString(), cashbookId, currencyId];
        break;

      case "week":
        const { weekStart, weekEnd } = getWeekRange(new Date()); // use your Monday–Sunday logic
        query = `SELECT * FROM transactions WHERE dateTime BETWEEN ? AND ? AND cashbookId = ? AND currencyId = ?`;
        params = [weekStart, weekEnd, cashbookId, currencyId];
        break;

      case "month":
        const firstDay = new Date();
        firstDay.setDate(1);
        const lastDay = new Date(firstDay.getFullYear(), firstDay.getMonth() + 1, 0);
        query = `SELECT * FROM transactions WHERE dateTime BETWEEN ? AND ? AND cashbookId = ? AND currencyId = ?`;
        params = [firstDay.toISOString(), lastDay.toISOString(), cashbookId, currencyId];
        break;

      default:
        query = `SELECT * FROM transactions WHERE dateTime BETWEEN ? AND ? AND cashbookId = ? AND currencyId = ?`;
        params = [start.toISOString(), end.toISOString(), cashbookId, currencyId];
    }

    // ✅ Run the query
    const [results] = await db.executeSql(query, params);
    return results.rows.raw();

  } catch (error) {
    console.error('Error fetching transactions by date:', error);
    return [];
  }
};

const transactionByDateAndCurrencyId = async (fromDate, toDate, currencyId) => {
  try {
    const start = new Date(fromDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(toDate);
    end.setHours(23, 59, 59, 999);

    const [results] = await db.executeSql(
      `SELECT * FROM transactions WHERE dateTime BETWEEN ? AND ? AND currencyId = ? ORDER BY dateTime DESC`,
      [start.toISOString(), end.toISOString(), currencyId]
    );
    return results.rows.raw();

  } catch (error) {
    console.error('Error fetching transactions by date:', error);
    return [];
  }
};




export default {
  createTransaction,
  getTransactions,
  getTransactionsByCurrencyId,
  updateTransaction,
  deleteTransaction,
  transactionByDateAndCashbookIdAndCurrencyId,
  transactionByDateAndCurrencyId,
}