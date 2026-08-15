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
    key: 'wibes-news',
    name: {
      en: "Wibe's News", th: 'ข่าวของ Wibe', ko: 'Wibe 소식',
      ja: 'Wibe ニュース', es: 'Noticias de Wibe', it: 'Novità di Wibe',
      tl: 'Balita sa Wibe', tr: "Wibe'den Haberler", sv: 'Wibe-nyheter',
    },
  },
  {
    key: 'voice-dictation',
    name: {
      en: 'Voice Dictation', th: 'พิมพ์ด้วยเสียง', ko: '음성 받아쓰기',
      ja: '音声入力', es: 'Dictado por voz', it: 'Dettatura vocale',
      tl: 'Pagdidikta ng Boses', tr: 'Sesli Dikte', sv: 'Röstdiktering',
    },
  },
  {
    key: 'tech-behind',
    name: {
      en: 'Tech Behind', th: 'เบื้องหลังเทคโนโลยี', ko: '기술 비하인드',
      ja: '技術の裏側', es: 'Detrás de la tecnología', it: 'Dietro la tecnologia',
      tl: 'Likod ng Teknolohiya', tr: 'Teknolojinin Ardında', sv: 'Tekniken Bakom',
    },
  },
  {
    key: 'confluence',
    name: {
      en: 'Confluence', th: 'การเชื่อมโยง', ko: '연결',
      ja: 'つながり', es: 'Conexiones', it: 'Connessioni',
      tl: 'Koneksyon', tr: 'Bağlantılar', sv: 'Kopplingar',
    },
  },
  {
    key: 'user-stories',
    name: {
      en: 'User Stories', th: 'เรื่องราวผู้ใช้', ko: '사용자 이야기',
      ja: 'ユーザーストーリー', es: 'Historias de usuarios', it: 'Storie degli utenti',
      tl: 'Mga Kuwento ng Gumagamit', tr: 'Kullanıcı Hikayeleri', sv: 'Användarberättelser',
    },
  },
  {
    key: 'cultural-mosaic',
    name: {
      en: 'Cultural Mosaic', th: 'วัฒนธรรมโลก', ko: '세계 문화',
      ja: '世界の文化', es: 'Culturas del mundo', it: 'Culture del mondo',
      tl: 'Mga Kultura ng Mundo', tr: 'Dünya Kültürleri', sv: 'Världskulturer',
    },
  },
]

const UI = {
  en: {
    createCard: 'Create a card', createCardHint: 'Takes you to the Wibe Stories app to make cards', search: 'Search stories…', searchLabel: 'Search', home: 'Home', menu: 'Menu',
    mission: "We are on a mission to bring voice dictation to every language.",
    featured: 'Featured', latest: 'Latest stories',
    allMonths: 'All',
    filterBy: 'Filter by',
    noResults: 'No stories found.', readTime: 'min read', stories: 'stories', publishedOn: 'Published on',
    backToBlog: 'Back to blog', related: 'Related stories',
    createCta: 'Have a story worth sharing?', createCtaSub: 'Turn your voice into a shareable card, in your language, in seconds.',
    backToTop: 'Back to top', footerRights: '© 2026 Yellow Green Labs. All rights reserved.',
    appName: 'Wibe Stories', allCategories: 'All categories', readMore: 'Read more',
    shareArticle: 'Share this article', copied: 'Link copied',
    shareCopy: 'Copy link', shareLinkedIn: 'Share on LinkedIn', shareX: 'Share on X', shareFacebook: 'Share on Facebook',
    signature: '— Spoken, not typed. Thanks Wispr!',
    disclosure: 'Crafted with AI assistance and refined with feedback from careful readers.',
    improveOpen: 'Anything to improve? Tell us.',
    improveFinal: 'Reviewed. Still see an error? Tell us.',
    contributorsLabel: 'Contributors',
    ctaButton: 'Create your Wibe Story',
    ctaTaglinePre: 'Take your voice beyond cards.',
    ctaTaglineFlow: 'lets you speak anywhere you type.',
    supportQuestion: 'Questions?', supportContact: 'Contact us',
    independence: 'Independent project · Not affiliated with Wispr Flow',
    publication: 'A Wibe Stories Publication', copyright: '© 2026 YG Labs', browseAll: 'Browse all stories',
    legalPrivacy: 'Privacy', legalTerms: 'Terms', legalRefund: 'Refund Policy', explore: 'Explore', legal: 'Legal',
    consentText: 'We use cookies for anonymous analytics to improve this blog.',
    consentAccept: 'Accept', consentDecline: 'Decline',
    pagination: 'Pagination', categories: 'Categories', languages: 'Languages',
    language: 'Language', year: 'Year', month: 'Month',
  },
  th: {
    createCard: 'สร้างการ์ด', createCardHint: 'ไปที่แอป Wibe Stories เพื่อสร้างการ์ด', search: 'ค้นหาเรื่องราว…', searchLabel: 'ค้นหา', home: 'หน้าแรก', menu: 'เมนู',
    mission: 'เรามีภารกิจที่จะนำการสั่งด้วยเสียงไปสู่ทุกภาษา',
    featured: 'เด่น', latest: 'เรื่องราวล่าสุด',
    allMonths: 'All',
    filterBy: 'กรองตาม',
    noResults: 'ไม่พบเรื่องราว', readTime: 'นาที', stories: 'เรื่อง', publishedOn: 'เผยแพร่เมื่อ',
    backToBlog: 'กลับไปที่บล็อก', related: 'เรื่องราวที่เกี่ยวข้อง',
    createCta: 'มีเรื่องราวน่าแบ่งปันไหม?', createCtaSub: 'เปลี่ยนเสียงของคุณให้เป็นการ์ดที่แชร์ได้ ในภาษาของคุณ ภายในไม่กี่วินาที',
    backToTop: 'กลับขึ้นด้านบน', footerRights: '© 2026 Yellow Green Labs. สงวนลิขสิทธิ์',
    appName: 'Wibe Stories', allCategories: 'ทุกหมวดหมู่', readMore: 'อ่านเพิ่มเติม',
    shareArticle: 'แชร์บทความนี้', copied: 'คัดลอกลิงก์แล้ว',
    shareCopy: 'คัดลอกลิงก์', shareLinkedIn: 'แชร์บน LinkedIn', shareX: 'แชร์บน X', shareFacebook: 'แชร์บน Facebook',
    signature: '— พูด ไม่ได้พิมพ์ ขอบคุณ Wispr!',
    disclosure: 'สร้างสรรค์ด้วยความช่วยเหลือของ AI และขัดเกลาด้วยความคิดเห็นจากผู้อ่านที่ใส่ใจ',
    improveOpen: 'มีอะไรอยากให้ปรับปรุงไหม? บอกเราได้เลย',
    improveFinal: 'ตรวจทานแล้ว ยังเห็นข้อผิดพลาดอยู่ไหม? บอกเราได้เลย',
    contributorsLabel: 'ผู้ร่วมให้ข้อมูล',
    ctaButton: 'สร้างเรื่องราว Wibe ของคุณ',
    ctaTaglinePre: 'นำเสียงของคุณไปได้ไกลกว่าการ์ด',
    ctaTaglineFlow: 'ช่วยให้คุณพูดได้ทุกที่ที่พิมพ์',
    supportQuestion: 'มีคำถาม?', supportContact: 'ติดต่อเรา',
    independence: 'โปรเจกต์อิสระ · ไม่เกี่ยวข้องกับ Wispr Flow',
    publication: 'A Wibe Stories Publication', copyright: '© 2026 YG Labs', browseAll: 'ดูเรื่องราวทั้งหมด',
    legalPrivacy: 'ความเป็นส่วนตัว', legalTerms: 'ข้อกำหนด', legalRefund: 'นโยบายการคืนเงิน', explore: 'สำรวจ', legal: 'ข้อกฎหมาย',
    consentText: 'เราใช้คุกกี้เพื่อการวิเคราะห์แบบไม่ระบุตัวตนเพื่อปรับปรุงบล็อกนี้',
    consentAccept: 'ยอมรับ', consentDecline: 'ปฏิเสธ',
    pagination: 'การแบ่งหน้า', categories: 'หมวดหมู่', languages: 'ภาษา',
    language: 'ภาษา', year: 'ปี', month: 'เดือน',
  },
  ko: {
    createCard: '카드 만들기', createCardHint: '카드를 만들려면 Wibe Stories 앱으로 이동합니다', search: '이야기 검색…', searchLabel: '검색', home: '홈', menu: '메뉴',
    mission: '우리는 모든 언어에 음성 받아쓰기를 전하는 것을 사명으로 삼고 있습니다.',
    featured: '추천', latest: '최신 이야기',
    allMonths: 'All',
    filterBy: '필터:',
    noResults: '이야기를 찾을 수 없어요.', readTime: '분', stories: '개', publishedOn: '게시 날짜',
    backToBlog: '블로그로 돌아가기', related: '관련 이야기',
    createCta: '공유할 만한 이야기가 있나요?', createCtaSub: '목소리를 언어에 상관없이 몇 초 만에 공유 가능한 카드로 바꿔 보세요.',
    backToTop: '맨 위로', footerRights: '© 2026 Yellow Green Labs. 모든 권리 보유.',
    appName: 'Wibe Stories', allCategories: '전체 카테고리', readMore: '더 읽기',
    shareArticle: '이 글 공유하기', copied: '링크가 복사되었습니다',
    shareCopy: '링크 복사', shareLinkedIn: 'LinkedIn에 공유', shareX: 'X에 공유', shareFacebook: 'Facebook에 공유',
    signature: '— 타자가 아닌, 말로 전하는 마음. Wispr 감사합니다!',
    disclosure: 'AI의 도움으로 작성되었고, 세심한 독자들의 피드백으로 다듬어졌습니다.',
    improveOpen: '개선할 점이 있나요? 알려주세요.',
    improveFinal: '검토했습니다. 그래도 오류가 보이나요? 알려주세요.',
    contributorsLabel: '기여자',
    ctaButton: '나만의 Wibe 스토리 만들기',
    ctaTaglinePre: '카드 너머로 목소리를 전하세요.',
    ctaTaglineFlow: '타이핑하는 곳 어디에서나 말할 수 있습니다.',
    supportQuestion: '질문이 있나요?', supportContact: '문의하기',
    independence: '독립 프로젝트 · Wispr Flow와 무관합니다',
    publication: 'A Wibe Stories Publication', copyright: '© 2026 YG Labs', browseAll: '모든 이야기 보기',
    legalPrivacy: '개인정보처리방침', legalTerms: '이용약관', legalRefund: '환불 정책', explore: '탐색', legal: '법률',
    consentText: '이 블로그 개선을 위해 익명 분석 쿠키를 사용합니다.',
    consentAccept: '동의', consentDecline: '거부',
    pagination: '페이지 매김', categories: '카테고리', languages: '언어',
    language: '언어', year: '연도', month: '월',
  },
  ja: {
    createCard: 'カードを作成', createCardHint: 'カードを作成するには Wibe Stories アプリへ', search: '記事を検索…', searchLabel: '検索', home: 'ホーム', menu: 'メニュー',
    mission: '私たちは、あらゆる言語に音声入力を届けることを使命としています。',
    featured: '注目', latest: '最新記事',
    allMonths: 'All',
    filterBy: '絞り込み',
    noResults: '記事が見つかりません。', readTime: '分', stories: '件', publishedOn: '公開日',
    backToBlog: 'ブログに戻る', related: '関連記事',
    createCta: '共有したいストーリーはありますか？', createCtaSub: 'あなたの声を、あなたの言語で、数秒で共有できるカードに。',
    backToTop: 'トップへ戻る', footerRights: '© 2026 Yellow Green Labs. 無断転載を禁じます。',
    appName: 'Wibe Stories', allCategories: 'すべてのカテゴリ', readMore: '続きを読む',
    shareArticle: 'この記事をシェア', copied: 'リンクをコピーしました',
    shareCopy: 'リンクをコピー', shareLinkedIn: 'LinkedInでシェア', shareX: 'Xでシェア', shareFacebook: 'Facebookでシェア',
    signature: '— タイピングではなく、話すこと。Wispr に感謝！',
    disclosure: 'AI の支援で作成し、注意深い読者のフィードバックで磨き上げています。',
    improveOpen: '改善できることはありますか？ぜひ教えてください。',
    improveFinal: '確認しました。まだ誤りがありますか？教えてください。',
    contributorsLabel: 'コントリビューター',
    ctaButton: 'Wibe ストーリーを作成',
    ctaTaglinePre: 'カードの先へ、あなたの声を。',
    ctaTaglineFlow: 'タイピングする場所ならどこでも話せます。',
    supportQuestion: '質問がありますか？', supportContact: 'お問い合わせ',
    independence: '独立プロジェクト · Wispr Flow とは関係ありません',
    publication: 'A Wibe Stories Publication', copyright: '© 2026 YG Labs', browseAll: 'すべての記事を見る',
    legalPrivacy: 'プライバシー', legalTerms: '利用規約', legalRefund: '返金ポリシー', explore: '探索', legal: '法的',
    consentText: 'このブログを改善するため、匿名分析のクッキーを使用します。',
    consentAccept: '同意', consentDecline: '拒否',
    pagination: 'ページネーション', categories: 'カテゴリ', languages: '言語',
    language: '言語', year: '年', month: '月',
  },
  es: {
    createCard: 'Crear una tarjeta', createCardHint: 'Te lleva a la app de Wibe Stories para crear tarjetas', search: 'Buscar historias…', searchLabel: 'Buscar', home: 'Inicio', menu: 'Menú',
    mission: 'Tenemos la misión de llevar el dictado por voz a todos los idiomas.',
    featured: 'Destacado', latest: 'Últimas historias',
    allMonths: 'All',
    filterBy: 'Filtrar por',
    noResults: 'No se encontraron historias.', readTime: 'min', stories: 'historias', publishedOn: 'Publicado el',
    backToBlog: 'Volver al blog', related: 'Historias relacionadas',
    createCta: '¿Tienes una historia que compartir?', createCtaSub: 'Convierte tu voz en una tarjeta compartible, en tu idioma, en segundos.',
    backToTop: 'Volver arriba', footerRights: '© 2026 Yellow Green Labs. Todos los derechos reservados.',
    appName: 'Wibe Stories', allCategories: 'Todas las categorías', readMore: 'Leer más',
    shareArticle: 'Comparte este artículo', copied: 'Enlace copiado',
    shareCopy: 'Copiar enlace', shareLinkedIn: 'Compartir en LinkedIn', shareX: 'Compartir en X', shareFacebook: 'Compartir en Facebook',
    signature: '— Hablado, no escrito. ¡Gracias Wispr!',
    disclosure: 'Creado con asistencia de IA y refinado con los comentarios de lectores atentos.',
    improveOpen: '¿Hay algo que mejorar? Cuéntanos.',
    improveFinal: 'Revisado. ¿Aún ves un error? Cuéntanos.',
    contributorsLabel: 'Colaboradores',
    ctaButton: 'Crea tu historia Wibe',
    ctaTaglinePre: 'Lleva tu voz más allá de las tarjetas.',
    ctaTaglineFlow: 'te permite hablar en cualquier lugar donde escribas.',
    supportQuestion: '¿Preguntas?', supportContact: 'Contáctanos',
    independence: 'Proyecto independiente · No afiliado a Wispr Flow',
    publication: 'A Wibe Stories Publication', copyright: '© 2026 YG Labs', browseAll: 'Ver todas las historias',
    legalPrivacy: 'Privacidad', legalTerms: 'Términos', legalRefund: 'Política de reembolso', explore: 'Explorar', legal: 'Legal',
    consentText: 'Usamos cookies para análisis anónimos y mejorar este blog.',
    consentAccept: 'Aceptar', consentDecline: 'Rechazar',
    pagination: 'Paginación', categories: 'Categorías', languages: 'Idiomas',
    language: 'Idioma', year: 'Año', month: 'Mes',
  },
  it: {
    createCard: 'Crea una card', createCardHint: 'Ti porta nell’app Wibe Stories per creare le card', search: 'Cerca storie…', searchLabel: 'Cerca', home: 'Home', menu: 'Menu',
    mission: 'La nostra missione è portare la dettatura vocale in ogni lingua.',
    featured: 'In evidenza', latest: 'Ultime storie',
    allMonths: 'All',
    filterBy: 'Filtra per',
    noResults: 'Nessuna storia trovata.', readTime: 'min', stories: 'storie', publishedOn: 'Pubblicato il',
    backToBlog: 'Torna al blog', related: 'Storie correlate',
    createCta: 'Hai una storia da condividere?', createCtaSub: 'Trasforma la tua voce in una card condivisibile, nella tua lingua, in pochi secondi.',
    backToTop: 'Torna su', footerRights: '© 2026 Yellow Green Labs. Tutti i diritti riservati.',
    appName: 'Wibe Stories', allCategories: 'Tutte le categorie', readMore: 'Leggi di più',
    shareArticle: 'Condividi questo articolo', copied: 'Link copiato',
    shareCopy: 'Copia link', shareLinkedIn: 'Condividi su LinkedIn', shareX: 'Condividi su X', shareFacebook: 'Condividi su Facebook',
    signature: '— Parlato, non scritto. Grazie Wispr!',
    disclosure: "Creato con l'assistenza dell'IA e rifinito con il feedback di lettori attenti.",
    improveOpen: "C'è qualcosa da migliorare? Diccelo.",
    improveFinal: 'Controllato. Vedi ancora un errore? Diccelo.',
    contributorsLabel: 'Collaboratori',
    ctaButton: 'Crea la tua Wibe Story',
    ctaTaglinePre: 'Porta la tua voce oltre le card.',
    ctaTaglineFlow: 'ti permette di parlare ovunque digiti.',
    supportQuestion: 'Domande?', supportContact: 'Contattaci',
    independence: 'Progetto indipendente · Non affiliato a Wispr Flow',
    publication: 'A Wibe Stories Publication', copyright: '© 2026 YG Labs', browseAll: 'Vedi tutte le storie',
    legalPrivacy: 'Privacy', legalTerms: 'Termini', legalRefund: 'Politica di rimborso', explore: 'Esplora', legal: 'Legale',
    consentText: 'Usiamo cookie per analisi anonime e migliorare questo blog.',
    consentAccept: 'Accetta', consentDecline: 'Rifiuta',
    pagination: 'Paginazione', categories: 'Categorie', languages: 'Lingue',
    language: 'Lingua', year: 'Anno', month: 'Mese',
  },
  tl: {
    createCard: 'Gumawa ng card', createCardHint: 'Dadalhin ka sa Wibe Stories app para gumawa ng card', search: 'Maghanap ng kwento…', searchLabel: 'Maghanap', home: 'Tahanan', menu: 'Menu',
    mission: 'Misyon nating dalhin ang pagdidikta gamit ang boses sa bawat wika.',
    featured: 'Itinatampok', latest: 'Pinakabagong kwento',
    allMonths: 'All',
    filterBy: 'Salain ayon sa',
    noResults: 'Walang nahanap na kwento.', readTime: 'min', stories: 'kwento', publishedOn: 'Nai-publish noong',
    backToBlog: 'Bumalik sa blog', related: 'Mga kaugnay na kwento',
    createCta: 'May kwento kang ibabahagi?', createCtaSub: 'Gawing shareable card ang iyong boses, sa iyong wika, sa ilang segundo.',
    backToTop: 'Bumalik sa taas', footerRights: '© 2026 Yellow Green Labs. Nakalaan ang lahat ng karapatan.',
    appName: 'Wibe Stories', allCategories: 'Lahat ng kategorya', readMore: 'Magbasa pa',
    shareArticle: 'I-share ang artikulong ito', copied: 'Nakopya ang link',
    shareCopy: 'Kopyahin ang link', shareLinkedIn: 'I-share sa LinkedIn', shareX: 'I-share sa X', shareFacebook: 'I-share sa Facebook',
    signature: '— Sinabi, hindi nai-type. Salamat, Wispr!',
    disclosure: 'Ginawa sa tulong ng AI at pino sa feedback ng mga maingat na mambabasa.',
    improveOpen: 'May dapat bang i-improve? Sabihin mo sa amin.',
    improveFinal: 'Nasuri na. May nakikita ka pa bang error? Sabihin mo sa amin.',
    contributorsLabel: 'Mga Contributor',
    ctaButton: 'Gumawa ng iyong Wibe Story',
    ctaTaglinePre: 'Dalhin ang iyong boses sa kabila ng mga card.',
    ctaTaglineFlow: 'hinahayaan kang magsalita kahit saan ka mag-type.',
    supportQuestion: 'May tanong?', supportContact: 'Makipag-ugnayan',
    independence: 'Independenteng proyekto · Hindi kaakibat ng Wispr Flow',
    publication: 'A Wibe Stories Publication', copyright: '© 2026 YG Labs', browseAll: 'Tingnan ang lahat ng kwento',
    legalPrivacy: 'Privacy', legalTerms: 'Mga Tuntunin', legalRefund: 'Patakaran sa Refund', explore: 'Galugarin', legal: 'Legal',
    consentText: 'Gumagamit kami ng cookies para sa anonymous analytics upang mapabuti ang blog na ito.',
    consentAccept: 'Tanggapin', consentDecline: 'Tumanggi',
    pagination: 'Pagination', categories: 'Mga Kategorya', languages: 'Mga Wika',
    language: 'Wika', year: 'Taon', month: 'Buwan',
  },
  tr: {
    createCard: 'Kart oluştur', createCardHint: 'Kart oluşturmak için Wibe Stories uygulamasına götürür', search: 'Hikaye ara…', searchLabel: 'Ara', home: 'Ana Sayfa', menu: 'Menü',
    mission: 'Misyonumuz sesli yazmayı her dile taşımak.',
    featured: 'Öne çıkan', latest: 'Son hikayeler',
    allMonths: 'All',
    filterBy: 'Filtrele',
    noResults: 'Hikaye bulunamadı.', readTime: 'dk', stories: 'hikaye', publishedOn: 'Yayınlanma',
    backToBlog: 'Bloga dön', related: 'İlgili hikayeler',
    createCta: 'Paylaşmaya değer bir hikayen mi var?', createCtaSub: 'Sesini, kendi dilinde, saniyeler içinde paylaşılabilir bir karta dönüştür.',
    backToTop: 'Başa dön', footerRights: '© 2026 Yellow Green Labs. Tüm hakları saklıdır.',
    appName: 'Wibe Stories', allCategories: 'Tüm kategoriler', readMore: 'Devamını oku',
    shareArticle: 'Bu makaleyi paylaş', copied: 'Bağlantı kopyalandı',
    shareCopy: 'Bağlantıyı kopyala', shareLinkedIn: 'LinkedIn\'de paylaş', shareX: 'X\'te paylaş', shareFacebook: 'Facebook\'ta paylaş',
    signature: '— Yazılmadı, söylendi. Teşekkürler Wispr!',
    disclosure: 'Yapay zeka desteğiyle hazırlandı ve özenli okuyucuların geri bildirimleriyle iyileştirildi.',
    improveOpen: 'İyileştirilecek bir şey var mı? Bize söyle.',
    improveFinal: 'İncelendi. Hâlâ bir hata görüyor musun? Bize söyle.',
    contributorsLabel: 'Katkıda Bulunanlar',
    ctaButton: 'Wibe Hikayeni Oluştur',
    ctaTaglinePre: 'Sesini kartların ötesine taşı.',
    ctaTaglineFlow: 'yazdığın her yerde konuşmanı sağlar.',
    supportQuestion: 'Soruların mı var?', supportContact: 'Bize ulaşın',
    independence: 'Bağımsız proje · Wispr Flow ile bağlantılı değildir',
    publication: 'A Wibe Stories Publication', copyright: '© 2026 YG Labs', browseAll: 'Tüm hikayeleri gör',
    legalPrivacy: 'Gizlilik', legalTerms: 'Şartlar', legalRefund: 'İade Politikası', explore: 'Keşfet', legal: 'Yasal',
    consentText: 'Bu blogu iyileştirmek için anonim analiz çerezleri kullanıyoruz.',
    consentAccept: 'Kabul Et', consentDecline: 'Reddet',
    pagination: 'Sayfalama', categories: 'Kategoriler', languages: 'Diller',
    language: 'Dil', year: 'Yıl', month: 'Ay',
  },
  sv: {
    createCard: 'Skapa ett kort', createCardHint: 'Tar dig till Wibe Stories-appen för att skapa kort', search: 'Sök berättelser…', searchLabel: 'Sök', home: 'Hem', menu: 'Meny',
    mission: 'Vi har som uppdrag att föra röstdiktat till varje språk.',
    featured: 'Utvalt', latest: 'Senaste berättelserna',
    allMonths: 'All',
    filterBy: 'Filtrera på',
    noResults: 'Inga berättelser hittades.', readTime: 'min', stories: 'berättelser', publishedOn: 'Publicerad',
    backToBlog: 'Tillbaka till bloggen', related: 'Relaterade berättelser',
    createCta: 'Har du en berättelse värd att dela?', createCtaSub: 'Gör din röst till ett delbart kort, på ditt språk, på några sekunder.',
    backToTop: 'Till toppen', footerRights: '© 2026 Yellow Green Labs. Alla rättigheter förbehållna.',
    appName: 'Wibe Stories', allCategories: 'Alla kategorier', readMore: 'Läs mer',
    shareArticle: 'Dela den här artikeln', copied: 'Länken kopierad',
    shareCopy: 'Kopiera länk', shareLinkedIn: 'Dela på LinkedIn', shareX: 'Dela på X', shareFacebook: 'Dela på Facebook',
    signature: '— Talat, inte skrivet. Tack Wispr!',
    disclosure: 'Skapad med AI-stöd och förfinad med feedback från noggranna läsare.',
    improveOpen: 'Något att förbättra? Berätta för oss.',
    improveFinal: 'Granskad. Ser du fortfarande ett fel? Berätta för oss.',
    contributorsLabel: 'Bidragsgivare',
    ctaButton: 'Skapa din Wibe-berättelse',
    ctaTaglinePre: 'Ta din röst bortom korten.',
    ctaTaglineFlow: 'låter dig prata var du än skriver.',
    supportQuestion: 'Frågor?', supportContact: 'Kontakta oss',
    independence: 'Självständigt projekt · Inte anslutet till Wispr Flow',
    publication: 'A Wibe Stories Publication', copyright: '© 2026 YG Labs', browseAll: 'Visa alla berättelser',
    legalPrivacy: 'Integritet', legalTerms: 'Villkor', legalRefund: 'Återbetalningspolicy', explore: 'Utforska', legal: 'Juridik',
    consentText: 'Vi använder cookies för anonym analys för att förbättra den här bloggen.',
    consentAccept: 'Acceptera', consentDecline: 'Avböj',
    pagination: 'Paginering', categories: 'Kategorier', languages: 'Språk',
    language: 'Språk', year: 'År', month: 'Månad',
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

export function parseDate(str) {
  if (str instanceof Date) return str
  const m = String(str || '').match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  const d = new Date(str)
  return Number.isNaN(d.getTime()) ? null : d
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

  function fmtDate(d) {
    const date = parseDate(d)
    if (!date) return ''
    return new Intl.DateTimeFormat(lang.value, { year: 'numeric', month: 'long', day: 'numeric' }).format(date)
  }

  return { locale, lang, t, catName, cats, fmtDate }
}