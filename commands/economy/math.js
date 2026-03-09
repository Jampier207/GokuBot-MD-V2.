import fs from 'fs'

global.math = global.math || {}

const limits = {
  facil: 10,
  medio: 50,
  dificil: 90,
  imposible: 100,
  imposible2: 160
}

const generateRandomNumber = (max) => Math.floor(Math.random() * max) + 1
const getOperation = () => ['+', '-', '*', '/'][Math.floor(Math.random() * 4)]

const generarProblema = (dificultad) => {
  const maxLimit = limits[dificultad] || 30
  const num1 = generateRandomNumber(maxLimit)
  const num2 = generateRandomNumber(maxLimit)
  const operador = getOperation()
  const resultado = eval(`${num1} ${operador} ${num2}`)
  const simbolo = operador === '*' ? '×' : operador === '/' ? '÷' : operador
  return {
    problema: `${num1} ${simbolo} ${num2}`,
    resultado: operador !== '/' ? resultado : resultado.toFixed(2)
  }
}

async function run(client, m, args, command, text, prefix) {
  const chatId = m.chat
  const db = global.db.data.chats[chatId]
  const user = global.db.data.users[m.sender]
  const juego = global.math[chatId]

  if (db.adminonly || !db.rpg) {
    return m.reply('╔═ ────── ✧ ────── ═╗\n│ Comandos de matemáticas desactivados │\n╚═ ────── ✧ ────── ═╝')
  }

  if (command === 'responder') {
    if (!juego?.juegoActivo) return
    const quotedId = m.quoted?.key?.id || m.quoted?.id
    if (quotedId !== juego.problemMessageId) return
    const respuestaUsuario = args[0]
    if (!respuestaUsuario) {
      return client.reply(chatId, '╔═ ❖ Responde con un número ❖ ═╗', m)
    }

    const respuestaCorrecta = juego.respuesta
    if (Number(respuestaUsuario).toFixed(2) === Number(respuestaCorrecta).toFixed(2)) {
      const expaleatorio = Math.floor(Math.random() * 50) + 10
      user.exp = (user.exp || 0) + expaleatorio
      clearTimeout(juego.tiempoLimite)
      delete global.math[chatId]
      return client.reply(chatId,
        '╔═ ── ✧ CORRECTO ✧ ── ═╗\n' +
        `│ Ganaste: ${expaleatorio} exp │\n` +
        '╚═ ──────────────── ═╝',
        m
      )
    } else {
      juego.intentos += 1
      if (juego.intentos >= 3) {
        clearTimeout(juego.tiempoLimite)
        delete global.math[chatId]
        return client.reply(chatId,
          '╔═ ── ✧ JUEGO TERMINADO ✧ ── ═╗\n' +
          `│ La respuesta era: ${respuestaCorrecta} │\n` +
          '╚═ ──────────────── ═╝',
          m
        )
      } else {
        const intentosRestantes = 3 - juego.intentos
        return client.reply(chatId,
          `╔═ ❖ Respuesta incorrecta ❖ ═╗\n` +
          `│ Intentos restantes: ${intentosRestantes} │\n` +
          '╚═ ──────────────── ═╝',
          m
        )
      }
    }
  }

  if (command === 'math') {
    if (juego?.juegoActivo) {
      return client.reply(chatId,
        '╔═ ── ✧ JUEGO ACTIVO ✧ ── ═╗\n│ Espera a que termine el actual │\n╚═ ──────────────── ═╝',
        m
      )
    }

    const dificultad = args[0]?.toLowerCase()
    if (!limits[dificultad]) {
      return client.reply(chatId,
        '╔═ ❖ Dificultad inválida ❖ ═╗\n│ Usa: facil, medio, dificil, imposible, imposible2 │\n╚═ ──────────────── ═╝',
        m
      )
    }

    const { problema, resultado } = generarProblema(dificultad)
    const problemMessage = await client.reply(
      chatId,
      `╔═ ── ✧ RETO MATEMÁTICO ✧ ── ═╗\n` +
      `│ Problema:\n> ${problema} │\n` +
      `│ Tiempo: 1 minuto │\n` +
      `│ Responde con: *${prefix}responder <resultado>* │\n` +
      '╚═ ──────────────── ═╝',
      m
    )

    global.math[chatId] = {
      juegoActivo: true,
      problema,
      respuesta: resultado.toString(),
      intentos: 0,
      timeout: Date.now() + 60000,
      problemMessageId: problemMessage.key?.id,
      tiempoLimite: setTimeout(() => {
        if (global.math[chatId]?.juegoActivo) {
          delete global.math[chatId]
          client.reply(chatId,
            '╔═ ❖ TIEMPO AGOTADO ❖ ═╗\n│ El juego ha terminado │\n╚═ ──────────────── ═╝',
            m
          )
        }
      }, 60000)
    }
  }
}

export default {
  command: ['math', 'matematicas', 'responder'],
  category: 'rpg',
  run
}