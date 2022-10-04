export const getTimestampAtStartOfHour = (timestamp = Date.now() / 1000) => {
  const date = new Date(timestamp * 1000);
  var date_utc = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds()
  );
  var startOfDay = Number(new Date(date_utc));
  var timestamp = startOfDay / 1000;
  return Math.floor(timestamp / 3600) * 3600;
};
