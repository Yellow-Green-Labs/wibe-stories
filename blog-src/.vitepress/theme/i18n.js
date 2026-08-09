import { useRoute, useData } from 'vitepress'
import { computed } from 'vue'

export const LOCALES = [
  { code: '', label: 'English', short: 'EN', lang: 'en-US' },
  { code: 'th', label: 'ไทย', short: 'TH', lang: 'th-TH' },
  { code: 'ko', label: '한국어', short: 'KO', lang: 'ko-KR' },
  { code: 'ja', label: '日本語', short: 'JA', lang: 'ja-JP' },
  { code: 'es', label: 'Español', short: 'ES', lang: 'es-ES' },
  { code: 'it', label: 'Italiano', short: 'IT', lang: 'it-IT' },
  { code: 'tl', label: 'Filipino', short: 'TL', lang: 'fil-PH' },
  { code: 'tr', label: 'Türkçe', short: 'TR', lang: 'tr-TR' },
  { code: 'sv', label: 'Svenska', short: 'SV', lang: 'sv-SE' },
]

export const CATEGORIES = [
  {
    key: 'voice-recording-tips',
    name: {
      en: 'Voice Dictation', th: 'การสั่งด้วยเสียง', ko: '음성 받아쓰기',
      ja: '音声入力', es: 'Dictado por voz', it: 'Dettatura vocale',
      tl: 'Pagdidikta gamit ang boses', tr: 'Sesle Yazma', sv: 'Röstdiktat',
    },
  },
  {
    key: 'stories-traditions',
    name: {
      en: 'User Stories', th: 'เรื่องราวจากผู้ใช้', ko: '사용자 이야기',
      ja: 'ユーザーの声', es: 'Historias de usuarios', it: 'Storie degli utenti',
      tl: 'Mga Kwento ng User', tr: 'Kullanıcı Hikayeleri', sv: 'Användarberättelser',
    },
  },
  {
    key: 'tech-ai',
    name: {
      en: 'Tech Behind', th: 'เบื้องหลังเทคโนโลยี', ko: '기술의 뒷이야기',
      ja: '技術の舞台裏', es: 'Detrás de la tecnología', it: 'Dietro la tecnologia',
      tl: 'Sa Likod ng Tech', tr: 'Teknolojinin Perde Arkası', sv: 'Bakom tekniken',
    },
  },
  {
    key: 'occasions-celebrations',
    name: {
      en: 'Seasonal Moments', th: 'ช่วงเวลาแห่งเทศกาล', ko: '계절의 순간',
      ja: '季節のひととき', es: 'Momentos de temporada', it: 'Momenti stagionali',
      tl: 'Mga Pana-panahong Sandali', tr: 'Mevsimsel Anlar', sv: 'Säsongsstunder',
    },
  },
  {
    key: 'product-news',
    name: {
      en: 'Personal Voice', th: 'เสียงส่วนตัว', ko: '나만의 목소리',
      ja: 'パーソナルボイス', es: 'Voz personal', it: 'Voce personale',
      tl: 'Personal na Boses', tr: 'Kişisel Ses', sv: 'Personlig röst',
    },
  },
  {
    key: 'languages-culture',
    name: {
      en: 'Language Culture', th: 'ภาษาและวัฒนธรรม', ko: '언어와 문화',
      ja: '言語と文化', es: 'Idiomas y cultura', it: 'Lingue e cultura',
      tl: 'Mga Wika at Kultura', tr: 'Diller ve Kültür', sv: 'Språk och kultur',
    },
  },
]

const UI = {
  en: {
    createCard: 'Create a card', search: 'Search stories…', searchLabel: 'Search',
    mission: "I'm on a mission to bring voice dictation to every language.",
    featured: 'Featured', latest: 'Latest stories',
    allMonths: 'All', emptyMonth: 'No stories this month yet — check back soon.',
    noResults: 'No stories found.', readTime: 'min read', stories: 'stories', publishedOn: 'Published on',
    backToBlog: 'Back to blog', related: 'Related stories',
    createCta: 'Have a story worth sharing?', createCtaSub: 'Turn your voice into a shareable card, in your language, in seconds.',
    backToTop: 'Back to top', footerRights: '© 2026 Yellow Green Labs. All rights reserved.',
    appName: 'Wibe Stories', allCategories: 'All categories', readMore: 'Read more',
    shareLine: 'Loved this? Share it with someone who needs it.',
    shareButton: 'Share', copied: 'Link copied',
    signature: '— Spoken, not typed. Thanks Wispr!',
    disclosure: 'Crafted with AI assistance and refined with feedback from careful readers.',
    improveOpen: 'Anything to improve? Tell us.',
    improveFinal: 'Reviewed. Still see an error? Tell us.',
    contributorsLabel: 'Contributors',
  },
  th: {
    createCard: 'สร้างการ์ด', search: 'ค้นหาเรื่องราว…', searchLabel: 'ค้นหา',
    mission: 'ฉันมีภารกิจที่จะนำการสั่งด้วยเสียงไปสู่ทุกภาษา',
    featured: 'เด่น', latest: 'เรื่องราวล่าสุด',
    allMonths: 'ทั้งหมด', emptyMonth: 'ยังไม่มีเรื่องราวในเดือนนี้ — กลับมาใหม่เร็วๆ นี้นะ',
    noResults: 'ไม่พบเรื่องราว', readTime: 'นาที', stories: 'เรื่อง', publishedOn: 'เผยแพร่เมื่อ',
    backToBlog: 'กลับไปที่บล็อก', related: 'เรื่องราวที่เกี่ยวข้อง',
    createCta: 'มีเรื่องราวน่าแบ่งปันไหม?', createCtaSub: 'เปลี่ยนเสียงของคุณให้เป็นการ์ดที่แชร์ได้ ในภาษาของคุณ ภายในไม่กี่วินาที',
    backToTop: 'กลับขึ้นด้านบน', footerRights: '© 2026 Yellow Green Labs. สงวนลิขสิทธิ์',
    appName: 'Wibe Stories', allCategories: 'ทุกหมวดหมู่', readMore: 'อ่านเพิ่มเติม',
    shareLine: 'ชอบบทความนี้ไหม? แชร์ให้คนที่ต้องการมัน',
    shareButton: 'แชร์', copied: 'คัดลอกลิงก์แล้ว',
    signature: '— พูด ไม่ได้พิมพ์ ขอบคุณ Wispr!',
    disclosure: 'สร้างสรรค์ด้วยความช่วยเหลือของ AI และขัดเกลาด้วยความคิดเห็นจากผู้อ่านที่ใส่ใจ',
    improveOpen: 'มีอะไรอยากให้ปรับปรุงไหม? บอกเราได้เลย',
    improveFinal: 'ตรวจทานแล้ว ยังเห็นข้อผิดพลาดอยู่ไหม? บอกเราได้เลย',
    contributorsLabel: 'ผู้ร่วมให้ข้อมูล',
  },
  ko: {
    createCard: '카드 만들기', search: '이야기 검색…', searchLabel: '검색',
    mission: '저는 모든 언어에 음성 받아쓰기를 전하는 것을 사명으로 삼고 있습니다.',
    featured: '추천', latest: '최신 이야기',
    allMonths: '전체', emptyMonth: '이번 달 이야기가 아직 없어요 — 곧 다시 확인해 주세요.',
    noResults: '이야기를 찾을 수 없어요.', readTime: '분', stories: '개', publishedOn: '게시 날짜',
    backToBlog: '블로그로 돌아가기', related: '관련 이야기',
    createCta: '공유할 만한 이야기가 있나요?', createCtaSub: '목소리를 언어에 상관없이 몇 초 만에 공유 가능한 카드로 바꿔 보세요.',
    backToTop: '맨 위로', footerRights: '© 2026 Yellow Green Labs. All rights reserved.',
    appName: 'Wibe Stories', allCategories: '전체 카테고리', readMore: '더 읽기',
    shareLine: '마음에 드셨나요? 필요한 누군가에게 공유해 주세요.',
    shareButton: '공유', copied: '링크가 복사되었습니다',
    signature: '— 타자가 아닌, 말로 전하는 마음. Wispr 감사합니다!',
    disclosure: 'AI의 도움으로 작성되었고, 세심한 독자들의 피드백으로 다듬어졌습니다.',
    improveOpen: '개선할 점이 있나요? 알려주세요.',
    improveFinal: '검토했습니다. 그래도 오류가 보이나요? 알려주세요.',
    contributorsLabel: '기여자',
  },
  ja: {
    createCard: 'カードを作成', search: '記事を検索…', searchLabel: '検索',
    mission: '私は、あらゆる言語に音声入力を届けることを使命としています。',
    featured: '注目', latest: '最新記事',
    allMonths: 'すべて', emptyMonth: '今月の記事はまだありません — また見に来てください。',
    noResults: '記事が見つかりません。', readTime: '分', stories: '件', publishedOn: '公開日',
    backToBlog: 'ブログに戻る', related: '関連記事',
    createCta: '共有したいストーリーはありますか？', createCtaSub: 'あなたの声を、あなたの言語で、数秒で共有できるカードに。',
    backToTop: 'トップへ戻る', footerRights: '© 2026 Yellow Green Labs. All rights reserved.',
    appName: 'Wibe Stories', allCategories: 'すべてのカテゴリ', readMore: '続きを読む',
    shareLine: '気に入りましたか？必要な人にシェアしてください。',
    shareButton: 'シェア', copied: 'リンクをコピーしました',
    signature: '— タイピングではなく、話すこと。Wispr に感謝！',
    disclosure: 'AI の支援で作成し、注意深い読者のフィードバックで磨き上げています。',
    improveOpen: '改善できることはありますか？ぜひ教えてください。',
    improveFinal: '確認しました。まだ誤りがありますか？教えてください。',
    contributorsLabel: 'コントリビューター',
  },
  es: {
    createCard: 'Crear una tarjeta', search: 'Buscar historias…', searchLabel: 'Buscar',
    mission: 'Tengo la misión de llevar el dictado por voz a todos los idiomas.',
    featured: 'Destacado', latest: 'Últimas historias',
    allMonths: 'Todos', emptyMonth: 'Aún no hay historias este mes — vuelve pronto.',
    noResults: 'No se encontraron historias.', readTime: 'min', stories: 'historias', publishedOn: 'Publicado el',
    backToBlog: 'Volver al blog', related: 'Historias relacionadas',
    createCta: '¿Tienes una historia que compartir?', createCtaSub: 'Convierte tu voz en una tarjeta compartible, en tu idioma, en segundos.',
    backToTop: 'Volver arriba', footerRights: '© 2026 Yellow Green Labs. Todos los derechos reservados.',
    appName: 'Wibe Stories', allCategories: 'Todas las categorías', readMore: 'Leer más',
    shareLine: '¿Te ha gustado? Compártelo con alguien que lo necesite.',
    shareButton: 'Compartir', copied: 'Enlace copiado',
    signature: '— Hablado, no escrito. ¡Gracias Wispr!',
    disclosure: 'Creado con asistencia de IA y refinado con los comentarios de lectores atentos.',
    improveOpen: '¿Hay algo que mejorar? Cuéntanos.',
    improveFinal: 'Revisado. ¿Aún ves un error? Cuéntanos.',
    contributorsLabel: 'Colaboradores',
  },
  it: {
    createCard: 'Crea una card', search: 'Cerca storie…', searchLabel: 'Cerca',
    mission: 'La mia missione è portare la dettatura vocale in ogni lingua.',
    featured: 'In evidenza', latest: 'Ultime storie',
    allMonths: 'Tutti', emptyMonth: 'Ancora nessuna storia questo mese — torna presto.',
    noResults: 'Nessuna storia trovata.', readTime: 'min', stories: 'storie', publishedOn: 'Pubblicato il',
    backToBlog: 'Torna al blog', related: 'Storie correlate',
    createCta: 'Hai una storia da condividere?', createCtaSub: 'Trasforma la tua voce in una card condivisibile, nella tua lingua, in pochi secondi.',
    backToTop: 'Torna su', footerRights: '© 2026 Yellow Green Labs. Tutti i diritti riservati.',
    appName: 'Wibe Stories', allCategories: 'Tutte le categorie', readMore: 'Leggi di più',
    shareLine: 'Ti è piaciuto? Condividilo con qualcuno che ne ha bisogno.',
    shareButton: 'Condividi', copied: 'Link copiato',
    signature: '— Parlato, non scritto. Grazie Wispr!',
    disclosure: "Creato con l'assistenza dell'IA e rifinito con il feedback di lettori attenti.",
    improveOpen: "C'è qualcosa da migliorare? Diccelo.",
    improveFinal: 'Controllato. Vedi ancora un errore? Diccelo.',
    contributorsLabel: 'Collaboratori',
  },
  tl: {
    createCard: 'Gumawa ng card', search: 'Maghanap ng kwento…', searchLabel: 'Maghanap',
    mission: 'Misyon kong dalhin ang pagdidikta gamit ang boses sa bawat wika.',
    featured: 'Itinatampok', latest: 'Pinakabagong kwento',
    allMonths: 'Lahat', emptyMonth: 'Wala pang kwento ngayong buwan — bumalik ka muli.',
    noResults: 'Walang nahanap na kwento.', readTime: 'min', stories: 'kwento', publishedOn: 'Nai-publish noong',
    backToBlog: 'Bumalik sa blog', related: 'Mga kaugnay na kwento',
    createCta: 'May kwento kang ibabahagi?', createCtaSub: 'Gawing shareable card ang iyong boses, sa iyong wika, sa ilang segundo.',
    backToTop: 'Bumalik sa taas', footerRights: '© 2026 Yellow Green Labs. Nakalaan ang lahat ng karapatan.',
    appName: 'Wibe Stories', allCategories: 'Lahat ng kategorya', readMore: 'Magbasa pa',
    shareLine: 'Nagustuhan mo ba? I-share mo sa taong nangangailangan nito.',
    shareButton: 'I-share', copied: 'Nakopya ang link',
    signature: '— Sinabi, hindi nai-type. Salamat, Wispr!',
    disclosure: 'Ginawa sa tulong ng AI at pino sa feedback ng mga maingat na mambabasa.',
    improveOpen: 'May dapat bang i-improve? Sabihin mo sa amin.',
    improveFinal: 'Nasuri na. May nakikita ka pa bang error? Sabihin mo sa amin.',
    contributorsLabel: 'Mga Contributor',
  },
  tr: {
    createCard: 'Kart oluştur', search: 'Hikaye ara…', searchLabel: 'Ara',
    mission: 'Misyonum sesli yazmayı her dile taşımak.',
    featured: 'Öne çıkan', latest: 'Son hikayeler',
    allMonths: 'Tümü', emptyMonth: 'Bu ay henüz hikaye yok — yakında tekrar gel.',
    noResults: 'Hikaye bulunamadı.', readTime: 'dk', stories: 'hikaye', publishedOn: 'Yayınlanma',
    backToBlog: 'Bloga dön', related: 'İlgili hikayeler',
    createCta: 'Paylaşmaya değer bir hikayen mi var?', createCtaSub: 'Sesini, kendi dilinde, saniyeler içinde paylaşılabilir bir karta dönüştür.',
    backToTop: 'Başa dön', footerRights: '© 2026 Yellow Green Labs. Tüm hakları saklıdır.',
    appName: 'Wibe Stories', allCategories: 'Tüm kategoriler', readMore: 'Devamını oku',
    shareLine: 'Beğendin mi? İhtiyacı olan biriyle paylaş.',
    shareButton: 'Paylaş', copied: 'Bağlantı kopyalandı',
    signature: '— Yazılmadı, söylendi. Teşekkürler Wispr!',
    disclosure: 'Yapay zeka desteğiyle hazırlandı ve özenli okuyucuların geri bildirimleriyle iyileştirildi.',
    improveOpen: 'İyileştirilecek bir şey var mı? Bize söyle.',
    improveFinal: 'İncelendi. Hâlâ bir hata görüyor musun? Bize söyle.',
    contributorsLabel: 'Katkıda Bulunanlar',
  },
  sv: {
    createCard: 'Skapa ett kort', search: 'Sök berättelser…', searchLabel: 'Sök',
    mission: 'Jag har som uppdrag att föra röstdiktat till varje språk.',
    featured: 'Utvalt', latest: 'Senaste berättelserna',
    allMonths: 'Alla', emptyMonth: 'Inga berättelser den här månaden än — kom tillbaka snart.',
    noResults: 'Inga berättelser hittades.', readTime: 'min', stories: 'berättelser', publishedOn: 'Publicerad',
    backToBlog: 'Tillbaka till bloggen', related: 'Relaterade berättelser',
    createCta: 'Har du en berättelse värd att dela?', createCtaSub: 'Gör din röst till ett delbart kort, på ditt språk, på några sekunder.',
    backToTop: 'Till toppen', footerRights: '© 2026 Yellow Green Labs. Alla rättigheter förbehållna.',
    appName: 'Wibe Stories', allCategories: 'Alla kategorier', readMore: 'Läs mer',
    shareLine: 'Gillade du det? Dela det med någon som behöver det.',
    shareButton: 'Dela', copied: 'Länken kopierad',
    signature: '— Talat, inte skrivet. Tack Wispr!',
    disclosure: 'Skapad med AI-stöd och förfinad med feedback från noggranna läsare.',
    improveOpen: 'Något att förbättra? Berätta för oss.',
    improveFinal: 'Granskad. Ser du fortfarande ett fel? Berätta för oss.',
    contributorsLabel: 'Bidragsgivare',
  },
}

export function useLocale() {
  const route = useRoute()
  const { site } = useData()
  const base = site.value.base || '/'
  return computed(() => {
    const rest = route.path.replace(new RegExp('^' + base.replace(/\/$/, '') + '/'), '')
    const seg = rest.split('/')[0] || ''
    return LOCALES.some((l) => l.code === seg) ? seg : ''
  })
}

export function useI18n() {
  const locale = useLocale()
  const lang = computed(() => (LOCALES.find((l) => l.code === locale.value) || LOCALES[0]).lang)

  function t(key) {
    const dict = UI[locale.value] || UI.en
    return dict[key] !== undefined ? dict[key] : UI.en[key]
  }

  function catName(key) {
    const cat = CATEGORIES.find((c) => c.key === key)
    if (!cat) return key
    return cat.name[locale.value] || cat.name.en
  }

  const cats = computed(() =>
    CATEGORIES.map((c) => ({ key: c.key, name: c.name[locale.value] || c.name.en }))
  )

  function monthName(ym) {
    return new Intl.DateTimeFormat(lang.value, { month: 'long' }).format(new Date(ym + '-01'))
  }

  function fmtDate(d) {
    const date = d instanceof Date ? d : new Date(String(d))
    if (Number.isNaN(date.getTime())) return ''
    return new Intl.DateTimeFormat(lang.value, { year: 'numeric', month: 'long', day: 'numeric' }).format(date)
  }

  return { locale, lang, t, catName, cats, monthName, fmtDate }
}
