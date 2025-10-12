import { db } from './index';


const createQueueEntry = async (queryType, localId, tableName, data, serverId = null) => {
  try {
      await db.executeSql(
          'INSERT INTO queue (queryType, localId, serverId, tableName, data) VALUES (?, ?, ?, ?, ?)',
          [queryType, localId, serverId, tableName, data]
      );
      console.log('Queue entry created successfully');
  } catch (error) {
      console.error('Error creating queue entry:', error);
  }
};

const getQueueEntries = async () => {
  try {
      let result = await db.executeSql('SELECT * FROM queue');
      result = result[0];
      return result.rows.raw()
  } catch (error) {
      console.error('Error fetching queue entries:', error);
      return [];
  }
};

const findQueueEntrie = async (localId) => {
  try {
      let [result] = await db.executeSql('SELECT * FROM Queue WHERE localId = ?', [localId]);
      const data = result.rows.raw();
      return data;
  } catch (error) {
      console.error('Error fetching queue entries:', error);
      return [];
  }
};

const updateQueueEntry = async (id, queryType, localId, tableName, data, serverId = null) => {
  try {
    await db.executeSql(
      'UPDATE queue SET data = ?, queryType = ?, serverId = ?, tableName = ?, localId = ? WHERE id = ?',
      [data, queryType, serverId, tableName, localId, id]
    );
    console.log('Queue entry updated successfully');
  } catch (error) {
    console.error('Error updating queue entry:', error);
  }
};

const deleteQueueEntry = async (id) => {
  try {
      await db.executeSql('DELETE FROM queue WHERE id = ?', [id]);
      console.log('Queue entry deleted successfully');
  } catch (error) {
      console.error('Error deleting queue entry:', error);
  }
};

const clearQueue = async () => {
  try {
      await db.executeSql('DELETE FROM queue');
      console.log('Queue cleared successfully');
  } catch (error) {
      console.error('Error clearing queue:', error);
  }
};




export default {
  createQueueEntry,
  getQueueEntries,
  findQueueEntrie,
  updateQueueEntry,
  deleteQueueEntry,
  clearQueue
}