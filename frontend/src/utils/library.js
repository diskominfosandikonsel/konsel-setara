export const formatDate = (dateString) => {
  if (!dateString) return '-';

  const date = new Date(dateString);
  
  // Cek apakah date valid
  if (isNaN(date.getTime())) return dateString;

  const options = { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  };

  return new Intl.DateTimeFormat('id-ID', options).format(date);
};

export const formatDateShort = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  return new Intl.DateTimeFormat('id-ID').format(date);
};