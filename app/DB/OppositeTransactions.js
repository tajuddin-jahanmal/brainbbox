import {db} from './index'

const createOppositeTransaction = async (_id, amount, profit, information, currencyId, cashbookId, type, dateTime) => {
  try {
      await db.executeSql(
          'INSERT INTO oppositeTransactions (_id, amount, profit, information, currencyId, cashbookId, type, dateTime) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [_id, amount, profit, information, currencyId, cashbookId, type, dateTime]
      );
      console.log('Opposite Transaction created successfully');
  } catch (error) {
      console.error('Error creating opposite transaction:', error);
  }
};

const getOppositeTransactions = async () => {
  try {
      const [results] = await db.executeSql('SELECT * FROM oppositeTransactions');
      const Oppotransactions = results.rows.raw();
      // console.log('Opposite Transactions:', Oppotransactions);
      return Oppotransactions;
  } catch (error) {
      console.error('Error fetching Opposite transactions:', error);
      return [];
  }
};

const updateOppositeTransaction = async (id, _id, amount, profit, information, currencyId, cashbookId, type, dateTime) => {
  try {
      await db.executeSql(
          'UPDATE oppositeTransactions SET _id = ?, amount = ?, profit = ?, information = ?, currencyId = ?, cashbookId = ?, type = ?, dateTime = ? WHERE id = ?',
          [_id, amount, profit, information, currencyId, cashbookId, type, dateTime, id]
      );
      console.log('Opposite Transaction updated successfully');
  } catch (error) {
      console.error('Error updating opposite transaction:', error);
  }
};

const deleteOppositeTransaction = async (_id) => {
  try {
      await db.executeSql('DELETE FROM oppositeTransactions WHERE _id = ?', [_id]);
      console.log('Opposite Transaction deleted successfully');
  } catch (error) {
      console.error('Error deleting opposite transaction:', error);
  }
};

const clearOppositeTransaction = async () => 
{
  try {
    await db.executeSql("DELETE FROM oppositeTransactions");
    console.log('Opposite Transaction cleared successfully');
  } catch (error) {
    console.error('Error clearing opposite Transaction:', error);
  }
}


export default {
  createOppositeTransaction,
  getOppositeTransactions,
  updateOppositeTransaction,
  deleteOppositeTransaction,
  clearOppositeTransaction,
}