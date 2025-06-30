import {db} from './index'


const createOppositeCustomer = async (_id, firstName, lastName, phone, email, summary, active, userId) => {
  try {
      await db.executeSql(
          'INSERT INTO oppositeCustomers (_id, firstName, lastName, phone, email, summary, active, userId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [_id, firstName, lastName, phone, email, summary, active, userId]
      );
      console.log('Opposite Customer created successfully');
  } catch (error) {
      console.error('Error creating opposite customer:', error);
  }
};

const getOppositeCustomers = async () => {
  try {
      const [results] = await db.executeSql('SELECT * FROM oppositeCustomers');
      const oppositecustomers = results.rows.raw();
      // console.log('Opposite Customer:', oppositecustomers);
      return oppositecustomers;
  } catch (error) {
      console.error('Error fetching customers:', error);
      return [];
  }
};

const updateOppositeCustomer = async (id, firstName, lastName, phone, email, summary, active, userId) => {
  try {
      await db.executeSql(
          'UPDATE oppositeCustomers SET firstName = ?, lastName = ?, phone = ?, email = ?, summary = ?, active = ?, userId = ? WHERE id = ?',
          [firstName, lastName, phone, email, summary, active, userId, id]
      );
      console.log('Opposite Customer updated successfully');
  } catch (error) {
      console.error('Error updating opposite Customer:', error);
  }
};

const deleteOppositeCustomer = async (id) => {
  try {
      await db.executeSql('DELETE FROM oppositeCustomers WHERE id = ?', [id]);
      console.log('Opposite Customer deleted successfully');
  } catch (error) {
      console.error('Error deleting customer:', error);
  }
};

const clearOppositeCustomers = async () => 
{
  try {
    await db.executeSql("DELETE FROM oppositeCustomers");
    console.log('Opposite Customers cleared successfully');
  } catch (error) {
    console.error('Error clearing opposite customers:', error);
  }
}

export default {
  createOppositeCustomer,
  getOppositeCustomers,
  updateOppositeCustomer,
  deleteOppositeCustomer,
  clearOppositeCustomers,
}