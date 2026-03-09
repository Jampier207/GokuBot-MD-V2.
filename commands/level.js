const growth = Math.pow(Math.PI / Math.E, 1.618) * Math.E * 0.75

function xpRange(level, multiplier = global.multiplier || 2) {
  if (level < 0) throw new TypeError('level cannot be negative')
  level = Math.floor(level)

  const min = level === 0 
    ? 0 
    : Math.round(Math.pow(level, growth) * multiplier) + 1

  const max = Math.round(Math.pow(level + 1, growth) * multiplier)

  return { min, max, xp: max - min }
}

function findLevel(xp, multiplier = global.multiplier || 2) {
  if (!isFinite(xp)) return xp
  if (xp <= 0) return 0

  let low = 0
  let high = 1000

  while (low <= high) {
    const mid = Math.floor((low + high) / 2)
    const { min } = xpRange(mid, multiplier)

    if (min > xp) high = mid - 1
    else low = mid + 1
  }

  return high
}

function canLevelUp(level, xp, multiplier = global.multiplier || 2) {
  if (level < 0 || xp <= 0) return false
  return level < findLevel(xp, multiplier)
}

export default async (m) => {
  const user = global.db.data.users[m.sender]
  const chat = global.db.data.chats[m.chat]

  if (!user || !chat?.users?.[m.sender]) return

  const chatUser = chat.users[m.sender]

  let before = user.level

  while (canLevelUp(user.level, user.exp, global.multiplier)) {
    user.level++
  }

  if (before !== user.level) {
    if (user.level % 5 === 0) {
      const coinBonus = Math.floor(Math.random() * 3001) + 5000
      const expBonus = Math.floor(Math.random() * 401) + 100

      chatUser.coins = (chatUser.coins || 0) + coinBonus
      user.exp += expBonus
    }

    const { min, max } = xpRange(user.level, global.multiplier)
    user.minxp = min
    user.maxxp = max
  }
}
