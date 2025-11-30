
export function fromAndToDateMaker (from, to)
{
    const fromDate = new Date(from.getTime() - (from.getTimezoneOffset()*60*1000)).toISOString().split('T')[0];
    const toDate = new Date(to.getTime() - (to.getTimezoneOffset()*60*1000)).toISOString().split('T')[0];

    return {fromDate, toDate};
}


export function getWeekRange(date) {
  // const d = new Date(date);
  // const day = (d.getDay() + 6) % 7; // shift so Monday = 0
  
  // const monday = new Date(d);
  // monday.setDate(d.getDate() - day);
  // monday.setHours(0, 0, 0, 0)
  // const sunday = new Date(monday);
  // sunday.setDate(monday.getDate() + 6);
  // sunday.setHours(23, 59, 59, 999);
  // return {
  //   weekStart: monday.toISOString().split('T')[0],
  //   weekEnd: sunday.toISOString().split('T')[0]
  // };
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7; // Monday = 0

  const monday = new Date(d);
  monday.setDate(d.getDate() - day);
  monday.setHours(0, 0, 0, 0); // start of week

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999); // end of week

  return {
    weekStart: monday,
    weekEnd: sunday
  };
}

export function getPreviousWeekRange(date) {
  const d = new Date(date);
  d.setDate(d.getDate() - 7);
  const { weekStart, weekEnd } = getWeekRange(d);
  return { prevWeekStart: weekStart, prevWeekEnd: weekEnd };
}

export const isWeekCompleted = (weekEnd) => {
    const weekEndDate = new Date(weekEnd);
    const weekEndWithHours = new Date(weekEndDate);
    weekEndWithHours.setHours(23, 59, 59, 999);
    return new Date() > weekEndWithHours; // only true if current time is after end of week
  };

function dateMaker (date)
{
    const newDate = new Date(date);

    const year = newDate.getFullYear();
    const month = newDate.getMonth();
    const day = newDate.getDate();
    const fullDate = year + "-" + (month < 9 ? "0" + (month + 1) : (month + 1)) + "-" + (day < 9 ? "0" + day : day);

    return fullDate;
};



export default dateMaker;
