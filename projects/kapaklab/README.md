# KapakLab

KapakLab, yüklenen bir portre ve video konusundan her üretimde üç farklı YouTube kapağı hazırlayan Next.js uygulamasıdır.

## Özellikler

- Video konusu için üç kısa ve tıklanabilir başlık önerisi
- Yüklenen kişinin yüzünü referans alan üç farklı AI kompozisyonu
- Başlıkların hatasız görünmesi için sunucu tarafında kesin metin katmanı
- YouTube'a hazır 1280×720 JPG çıktılar
- Türkçe, Almanca ve İngilizce başlık
- Viral, profesyonel, eğitici, teknoloji ve gizemli stil seçenekleri
- API anahtarı olmadan arayüzü sınamak için yerel demo modu

## Kurulum

Node.js 20 veya daha yeni bir sürüm gerekir.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Gerçek AI üretimi için `.env.local` dosyasına bir `OPENAI_API_KEY` ekleyin ve `DEMO_MODE=false` yapın. Anahtar yalnızca sunucuda okunur; tarayıcıya gönderilmez.

## Üretim akışı

1. `gpt-5.6`, video konusundan yapılandırılmış üç başlık ve sahne konsepti üretir.
2. `gpt-image-2`, yüklenen kişiyi kimlik referansı olarak kullanıp üç ayrı 16:9 sahne oluşturur.
3. Sharp, başlığı ve alt kancayı hatasız biçimde görsele işler.
4. Tarayıcı üç adet 1280×720 JPG dosyasını gösterir ve indirir.

## Kontroller

```bash
npm run lint
npm test
npm run build
```

## Güvenlik ve işletim notları

- Fotoğraflar kalıcı olarak diske yazılmaz; yalnızca istek süresince bellekte işlenir.
- Kabul edilen biçimler JPG, PNG ve WebP; dosya sınırı 8 MB'dır.
- API anahtarı kesinlikle `NEXT_PUBLIC_` değişkenine konulmamalıdır.
- Sunucusuz platformda görsel üretimi 2 dakikaya yaklaşabildiği için fonksiyon zaman aşımı en az 300 saniye olmalıdır.
- Her tıklama üç ayrı görsel üretir ve API hesabında üç görselin maliyetini oluşturur.
