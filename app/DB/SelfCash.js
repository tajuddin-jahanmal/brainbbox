import {db} from './index'

const createSelfCash = async (_id, amount, profit, information, currencyId, cashbookId, type, dateTime) => {
  try {
      await db.executeSql(
          'INSERT INTO selfCash (_id, amount, profit, information, currencyId, cashbookId, type, dateTime) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [_id, amount, profit, information, currencyId, cashbookId, type, dateTime]
      );
      console.log('SelfCash created successfully');
  } catch (error) {
      console.error('Error creating SelfCash:', error);
  }
};

const getSelfCash = async () => {
  try {
      const [results] = await db.executeSql('SELECT * FROM selfCash');
      const selfCashs = results.rows.raw();
      // console.log('SelfCash:', selfCashs);
      return selfCashs;
  } catch (error) {
      console.error('Error fetching SelfCash:', error);
      return [];
  }
};

const updateSelfCash = async (id, _id, amount, profit, information, currencyId, cashbookId, type, dateTime) => {
  try {
      await db.executeSql(
          'UPDATE selfCash SET _id = ?, amount = ?, profit = ?, information = ?, currencyId = ?, cashbookId = ?, type = ?, dateTime = ? WHERE id = ?',
          [_id, amount, profit, information, currencyId, cashbookId, type, dateTime, id]
      );
      console.log('selfCash updated successfully');
  } catch (error) {
      console.error('Error updating selfCash:', error);
  }
};

const deleteSelfCash = async (_id) => {
  try {
      await db.executeSql('DELETE FROM SelfCash WHERE _id = ?', [_id]);
      console.log('SelfCash deleted successfully');
  } catch (error) {
      console.error('Error deleting SelfCash:', error);
  }
};




export default {
  createSelfCash,
  getSelfCash,
  updateSelfCash,
  deleteSelfCash
}