
const SortData = (data) => { return (data?.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime)) || []) };

export const SortCustomers = (data) => {
  if (!Array.isArray(data)) return [];

  data.sort((a, b) => {
    const nameA = (a.firstName || "") + " " + (a.lastName || "");
    const nameB = (b.firstName || "") + " " + (b.lastName || "");

    return nameA.localeCompare(nameB, "en", { sensitivity: "base" });
  });

  return data;
};

export default SortData;