import {db} from './index'

const createTransaction = async (_id, amount, profit, information, currencyId, cashbookId, type, dateTime, isReceivedMobile, photo) => {
  try {
      await db.executeSql(
          'INSERT INTO transactions (_id, amount, profit, information, currencyId, cashbookId, type, dateTime, isReceivedMobile, photo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [_id, amount, profit, information, currencyId, cashbookId, type, dateTime, isReceivedMobile, photo]
      );
      console.log('Transaction created successfully');
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

const getTransactionsByDate = async (currencyId) => {
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

const transByDateAndcashbbokId = async (fromDate, toDate, cashbookId, currencyId, type) =>
{
  try {
    if (!type || type?.toLowerCase() !== "custom") 
    {
      const fixedToDate = new Date(toDate);
      fixedToDate.setHours(23, 59, 59, 999);

      const [results] = await db.executeSql(`SELECT * FROM transactions WHERE dateTime BETWEEN ? AND ? AND cashbookId = ? AND currencyId = ?`,
      [fromDate, fixedToDate.toISOString(), cashbookId, currencyId]);
      const transactions = results.rows.raw();
      return transactions;
    } else if (type?.toLowerCase() === "custom")
    {
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setDate(twentyFourHoursAgo.getDate() - 1);
      const [results] = await db.executeSql(`SELECT * FROM transactions WHERE dateTime >= ? AND cashbookId = ? AND currencyId = ?`,
      [twentyFourHoursAgo.toISOString(), cashbookId, currencyId]);
      const transactions = results.rows.raw();
      return transactions;
    }
  } catch (error) {
    console.error('Error transaction by date:', error);
  }
}



export default {
  createTransaction,
  getTransactions,
  getTransactionsByDate,
  updateTransaction,
  deleteTransaction,
  transByDateAndcashbbokId
}