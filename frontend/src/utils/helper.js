export const getImageUrl = (file) => {
  const BASE_URL = 'https://serversapakonsel.konaweselatankab.go.id/'
  return file
    ? BASE_URL + 'uploads/' + file
    : 'https://via.placeholder.com/300x300?text=No+Image'
}

export const formatDate = (dateString) => {
  if (!dateString) return ''

  const date = new Date(dateString)
  const now = new Date()

  const diffMs = now - date
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffMinutes = Math.floor(diffMs / (1000 * 60))

  if (diffMinutes < 60) return `${diffMinutes} menit lalu`
  if (diffHours < 24) return `${diffHours} jam lalu`

  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}