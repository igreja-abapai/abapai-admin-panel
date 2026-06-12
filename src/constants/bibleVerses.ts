export interface BibleVerse {
  text: string
  reference: string
}

export const BIBLE_VERSES: BibleVerse[] = [
  {
    text: 'EU E A MINHA CASA SERVIREMOS AO SENHOR.',
    reference: 'JOSUÉ 24:15',
  },
  {
    text: 'TUDO POSSO NAQUELE QUE ME FORTALECE.',
    reference: 'FILIPENSES 4:13',
  },
  {
    text: 'O SENHOR É O MEU PASTOR; NADA ME FALTARÁ.',
    reference: 'SALMOS 23:1',
  },
  {
    text: 'CONFIA NO SENHOR DE TODO O TEU CORAÇÃO.',
    reference: 'PROVÉRBIOS 3:5',
  },
  {
    text: 'NÃO TEMAS, PORQUE EU SOU CONTIGO.',
    reference: 'ISAÍAS 41:10',
  },
  {
    text: 'EU SOU O CAMINHO, A VERDADE E A VIDA.',
    reference: 'JOÃO 14:6',
  },
  {
    text: 'BUSCAI PRIMEIRO O REINO DE DEUS.',
    reference: 'MATEUS 6:33',
  },
  {
    text: 'AQUI ESTOU EU; ENVIA-ME.',
    reference: 'ISAÍAS 6:8',
  },
  {
    text: 'O SENHOR É A MINHA LUZ E A MINHA SALVAÇÃO.',
    reference: 'SALMOS 27:1',
  },
  {
    text: 'A FÉ É A CERTEZA DE COISAS QUE SE ESPERAM.',
    reference: 'HEBREUS 11:1',
  },
]

const SESSION_KEY = 'sidebar-bible-verse'

export function getRandomBibleVerse(): BibleVerse {
  const index = Math.floor(Math.random() * BIBLE_VERSES.length)
  return BIBLE_VERSES[index]
}

export function getSessionBibleVerse(): BibleVerse {
  const stored = sessionStorage.getItem(SESSION_KEY)
  if (stored) {
    try {
      return JSON.parse(stored) as BibleVerse
    } catch {
      sessionStorage.removeItem(SESSION_KEY)
    }
  }

  const verse = getRandomBibleVerse()
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(verse))
  return verse
}

export function clearSessionBibleVerse(): void {
  sessionStorage.removeItem(SESSION_KEY)
}
