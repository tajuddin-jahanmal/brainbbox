
const SortData = (data) => { return (data?.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime)) || []) };

export const SortCustomers = (data) => {
  data?.sort((a, b) => {
    if (a.firstName < b.firstName) {
      return -1;
    } else {
      return 1;
    }
  });
  return (data || []);
}

export default SortData;