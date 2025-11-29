export const getPastDate = (daysAgo: number) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return {
    apiFmt: `${year}${month}${day}`, // YYYYMMDD
    displayFmt: `${month}-${day}`, // MM-DD
  };
};
