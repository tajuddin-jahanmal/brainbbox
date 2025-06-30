import language from "../../localization";
const TimeAgo = (dateTimeString) => {
  const now = new Date();
  const past = new Date(dateTimeString);
  const diffMs = now - past;

  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return `${language.justnow}`;
  if (diffMinutes < 60) return `${diffMinutes} ${language.minute}${diffMinutes === 1 ? '' : ''} ${language.ago}`;
  if (diffHours < 24) return `${diffHours} ${language.hour}${diffHours === 1 ? '' : ''} ${language.ago}`;
  return `${diffDays} ${language.day}${diffDays === 1 ? '' : ''} ${language.ago}`;
};

export default TimeAgo;