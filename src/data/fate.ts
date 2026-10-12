import type { RegionId } from './index';

/**
 * Pure entertainment. Nothing here claims facts about a place.
 * Placeholders: {city}, {country}. Never attach Turkish suffixes straight to them
 * ("{city}'de" breaks for names like Kraków); use "{city} şehrinde" / "{country} topraklarında" instead.
 */
export type Mood = 'good' | 'neutral' | 'bad';

export interface FateEvent {
  id: string;
  emoji: string;
  title: string;
  text: string;
  mood: Mood;
  regions?: RegionId[]; // only offered for these regions
}

export const PROPHECIES: string[] = [
  'Yıldızlar {city} semalarında hizalanıyor; hayatının en güzel Erasmus anılarından birini biriktireceksin.',
  '{city} sokaklarında kaybolacaksın ve tam orada favori kafeni bulacaksın.',
  'Valizin ağır, kalbin hafif: {city} şehrinden ayrılırken en az üç yeni arkadaşınla vedalaşacaksın.',
  '{country} topraklarında dil seni zorlayacak, ama bir ay sonra "teşekkürler" demeyi yerel dilde öğrenmiş olacaksın.',
  '{city} şehrinde sana güvenen bir mentor çıkacak karşına; öğrendikleri hayat boyu seninle kalacak.',
  'Bir tramvayı kaçıracaksın, ama kaçırdığın tramvay seni şehrin en güzel manzarasına götürecek.',
  '{city} şehrinde yağmur yağacak ve bir şemsiyeyi paylaşırken ömürlük bir arkadaşlıkla tanışacaksın.',
  'Kahve fincanının dibinde {city} yazıyor: yeni bir yemek, yeni bir şarkı ve biraz daha cesur bir sen.',
  'İlk yemek denemen yanacak, ama {country} topraklarındaki en iyi fırını birlikte keşfedeceğin bir arkadaşın olacak.',
  'Bir yabancı sana yol tarif ederken aslında hayatının yönünü gösterecek.',
  '{city} şehrindeki bir bit pazarından alacağın küçük bir hatıra yıllar sonra bu çarkı hatırlatacak.',
  'Evraklar, formlar, imzalar... Hepsi geçecek; geriye {city} şehrinde çektiğin fotoğraflar kalacak.',
  'Bu çark tesadüfen durmadı: {city} seni bekliyordu.',
  'Haritada küçük bir nokta olan {city}, anılarında kocaman bir yer tutacak.',
  'Bir gece yarısı sohbeti, {country} yolculuğunun en güzel hatırası olacak.',
  'Kader sana bir bilet, bir sırt çantası ve çok sayıda "evet" fırsatı gösteriyor.',
  'İlk haftanın sonunda {city} şehri sana "yabancı" değil "komşu" diyecek.',
  'Gün batarken bir köprüde duracaksın ve "iyi ki gelmişim" diyeceksin.',
  'Yerel bir festivale tesadüfen denk geleceksin ve ayrılırken ona geri döneceğini söyleyeceksin.',
  'Cebindeki bozuk paralar kısa süre sonra {city} şehrinin en lezzetli sokak yemeğine dönüşecek.',
];

export const EVENTS: FateEvent[] = [
  { id: 'friend', mood: 'good', emoji: '🎉', title: 'Yurtta yeni arkadaş', text: 'Ortak mutfakta tanıştığın biri seni hafta sonu gezisine davet ediyor.' },
  { id: 'bakery', mood: 'good', emoji: '🍰', title: 'Yerel lezzet', text: '{city} şehrindeki küçük bir fırında şimdiye kadar yediğin en iyi tatlıyı buluyorsun.' },
  { id: 'train-on-time', mood: 'good', emoji: '🚆', title: 'Tren tam zamanında', text: 'Tren dakikası dakikasına geliyor. Bugün gerçekten şanslı günündesin!' },
  { id: 'grant', mood: 'good', emoji: '💶', title: 'Burs erken yattı', text: 'Hesabına beklenenden önce para yatıyor. Bu akşam kutlama yemeği senden.' },
  { id: 'student-card', mood: 'good', emoji: '🎟️', title: 'Öğrenci kartı kurtarıcı', text: 'Müzede öğrenci kartın sayesinde giriş ücretsiz çıkıyor.' },
  { id: 'sunset', mood: 'good', emoji: '🌅', title: 'Gizli manzara', text: '{city} şehrinde tesadüfen en güzel gün batımı noktasını buluyorsun.' },
  { id: 'busker', mood: 'good', emoji: '🎶', title: 'Sokak müzisyeni', text: 'Meydanda çalan bir müzisyen şarkı istiyor; senin ülkenden bir şarkı söylüyorsun ve herkes eşlik ediyor.' },
  { id: 'language', mood: 'good', emoji: '🗣️', title: 'Dil atılımı', text: 'Yerel dilde ilk tam cümleni kuruyorsun; garson gülümseyip alkışlıyor.' },
  { id: 'lost', mood: 'neutral', emoji: '🧭', title: 'Kaybolmak güzeldir', text: 'Telefonun şarjı bitiyor; yönünü yerel birine soruyor ve planında olmayan harika bir sokak keşfediyorsun.' },
  { id: 'market', mood: 'neutral', emoji: '🛒', title: 'Market macerası', text: 'Etiketleri çözemediğin bir ürün alıyorsun. Tatlı mı, tuzlu mu? Akşam yemeğine kadar sır.' },
  { id: 'library', mood: 'neutral', emoji: '📚', title: 'Sessiz sığınak', text: 'Üniversite kütüphanesinde ilginç bir köşe keşfediyorsun; artık ders çalışma yerin belli.' },
  { id: 'orientation', mood: 'neutral', emoji: '🎓', title: 'Karşılama haftası', text: 'Uyum haftasında dünyanın dört bir yanından insanla tanışıyorsun; isimlerin yarısını ilk günde unutuyorsun.' },
  { id: 'flea', mood: 'neutral', emoji: '🛍️', title: 'Bit pazarı', text: 'Pazarda hiçbir işine yaramayacak ama vazgeçemeyeceğin bir hatıra alıyorsun.' },
  { id: 'rain', mood: 'bad', emoji: '🌧️', title: 'Şemsiyesiz yağmur', text: 'Şemsiyeni evde unutuyorsun; sağanak tam {city} şehrinin ortasında yakalıyor.' },
  { id: 'strike', mood: 'bad', emoji: '🚌', title: 'Toplu taşıma grevi', text: 'Bugün toplu taşıma çalışmıyor. Şehri yürüyerek keşfetme günü!' },
  { id: 'plug', mood: 'bad', emoji: '🔌', title: 'Priz uyumsuzluğu', text: 'Şarj aletinin fişi {country} prizlerine uymuyor; adaptör arayışı başlıyor.' },
  { id: 'laundry', mood: 'bad', emoji: '🧺', title: 'Çamaşır makinesi bilmecesi', text: 'Yurttaki çamaşır makinesinin düğmelerini çözmen bir saatini alıyor.' },
  { id: 'paperwork', mood: 'bad', emoji: '📄', title: 'Evrak turu', text: 'Tek bir imza için üç farklı ofisi dolaşıyorsun. Sabır, kader ve fotokopi.' },
  { id: 'alarm', mood: 'bad', emoji: '🍞', title: 'Yangın alarmı', text: 'Kızarttığın ekmek yangın alarmını çaldırıyor; tüm bina koridorda toplanıyor ve herkes seni tanıyor.' },
  { id: 'snow', mood: 'bad', emoji: '❄️', title: 'Kar fırtınası', text: 'Sert bir soğuk dalgası geliyor. Kat kat giyin, sıcak çikolata mutlaka içilmeli.', regions: ['kuzey'] },
  { id: 'sun', mood: 'bad', emoji: '☀️', title: 'Kavurucu öğle', text: 'Güneş kremini ve şapkanı unutuyorsun; öğleden sonrayı gölgede geçiriyorsun.', regions: ['guney', 'akdeniz'] },
  { id: 'tea', mood: 'good', emoji: '🫖', title: 'Çay daveti', text: 'Komşun seni çaya çağırıyor; bir saat sürecek sohbet üç saate uzuyor.', regions: ['kafkas', 'balkan', 'akdeniz'] },
  { id: 'border', mood: 'neutral', emoji: '🗺️', title: 'Sınırı fark etmedin', text: 'Şehir turunda yürürken ülke sınırını neredeyse fark etmeden geçiyorsun.', regions: ['mikro'] },
  { id: 'wine', mood: 'good', emoji: '🍷', title: 'Yerel sofra', text: 'Bir aile seni geleneksel bir sofraya oturtuyor; tarifi not almadan yemeyi bırakmıyorsun.', regions: ['guney', 'balkan', 'kafkas'] },
  { id: 'bike', mood: 'neutral', emoji: '🚲', title: 'Bisiklet günü', text: 'Herkes bisiklette; sen de kiralayıp şehri iki tekerle keşfetmeye karar veriyorsun.', regions: ['bati', 'orta', 'kuzey'] },
];
