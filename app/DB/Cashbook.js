import {db} from './index'

const createCashBookEntry = async (ownerId, customerId, active) => {
  try {
      await db.executeSql(
          'INSERT INTO cashbooks (ownerId, customerId, active) VALUES (?, ?, ?)',
          [ownerId, customerId, active]
      );
      console.log('Cashbook entry created successfully');
  } catch (error) {
      console.error('Error creating cashbook entry:', error);
  }
};

const getCashBookEntries = async () => {
  try {
      const [results] = await db.executeSql('SELECT * FROM cashbooks');
      const entries = results.rows.raw();
      console.log('Cashbook entries:', entries);
      return entries;
  } catch (error) {
      console.error('Error fetching cashbook entries:', error);
      return [];
  }
};

const updateCashBookEntry = async (id, ownerId, customerId, active) => {
  try {
      await db.executeSql(
          'UPDATE cashbooks SET ownerId = ?, customerId = ?, active = ? WHERE id = ?',
          [ownerId, customerId, active, id]
      );
      console.log('Cashbook entry updated successfully');
  } catch (error) {
      console.error('Error updating cashbook entry:', error);
  }
};

const deleteCashBookEntry = async (id) => {
  try {
      await db.executeSql('DELETE FROM cashbooks WHERE id = ?', [id]);
      console.log('Cashbook entry deleted successfully');
  } catch (error) {
      console.error('Error deleting cashbook entry:', error);
  }
};


export default {
  createCashBookEntry,
  deleteCashBookEntry, 
  getCashBookEntries, 
  updateCashBookEntry
}