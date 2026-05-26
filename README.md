# Wahy.js

Wahy.js, Kur'an-ı Kerim sure ve ayetlerini komut satırından (CLI) sorgulamak, okumak ve terminalinizde renklendirilmiş bir şekilde görüntülemek için geliştirilmiş, açık kaynaklı bir Node.js aracı ve kütüphanesidir. 

Bu proje, orijinal [Wahy Ruby Gem](https://github.com/cptangry/wahy) projesinin modern Node.js ekosistemine (`cheerio`, `commander` ve `chalk` kullanılarak) uyarlanmış versiyonudur. Hem bağımsız bir CLI aracı olarak çalışabilir hem de diğer Node.js projelerinize bir modül olarak dahil edilebilir.

---

## Özellikler

- **Çift Dil Desteği:** Türkçe (`tur`) ve İngilizce (`eng`) dillerinde arama ve okuma.
- **Esnek Sorgulama:** Sureleri hem numaralarına göre (örn: `2`) hem de isimlerine göre (örn: `"Bakara"` veya `"The Cow"`) arayabilme.
- **Ayet Filtreleme:** İster tüm sureyi, ister belirli bir ayeti (örn: `-a 5`) tek seferde getirebilme.
- **Gelişmiş Terminal Arayüzü:** Başlıkları otomatik ortalayan ve ayet numaralarını renklendirerek okunabilirliği artıran CLI tasarımı.
- **Modüler Yapı:** XML verilerini işleyen yardımcı fonksiyonları sayesinde diğer projelere API/modül olarak entegre edilebilme.

---

## Kurulum ve Bağımlılıklar

Projenin çalışabilmesi için sisteminizde **Node.js** kurulu olmalıdır. Fish kabuğu kullanıyorsanız `nvm.fish` ile Node.js ortamınızı kolayca yönetebilirsiniz.

### 1. Bağımlılıkların Kurulması

Proje dizininizde aşağıdaki komut ile gerekli paketleri yükleyin:

```bash
npm install cheerio commander chalk@4
```

Not: chalk paketinin CommonJS (require) yapısıyla tam uyumlu çalışması için özellikle 4. sürümü (chalk@4) tercih edilmiştir.

### 2. Çalıştırma İzni (Linux / macOS)

Betiği doğrudan bir CLI aracı gibi ./wahy.js şeklinde çalıştırabilmek için yürütme izni vermeniz gerekir:

```bash
chmod +x wahy.js
```

## Klasör Yapısı

Projenin sorunsuz çalışması için XML veri dosyalarının wahy.js ile aynı dizindeki data/ klasörü altında bulunması gerekmektedir:
<pre>
├── wahy.js
├── package.json
└── data/
    ├── config_tr.xml
    └── config_en.xml</pre>

## Kullanım Kılavuzu (CLI)

Komut satırı arayüzü varsayılan olarak İngilizce dilinde, 1. Sure (Fatiha) ve tüm ayetler (all) seçili olacak şekilde kurgulanmıştır.

| Seçenek | Uzun Adı | Açıklama | Varsayılan |
| --- | --- | --- | --- |
| `-l` | `--lang` | Okuma yapılacak dil seçimi (`tur` veya `eng`) | `eng` |
| `-s` | `--scripture` | Sure adı veya sure numarası (1-114) | `1` |
| `-a` | `--ayah` | Getirilecek ayet numarası veya hepsi için `all` | `all` |
| `-h` | `--help` | Yardım menüsünü ve seçenekleri gösterir | - |

## CLI Örnekleri

##### 1. Türkçe Dilinde Fatiha Suresinin Tüm Ayetlerini Listeleme:

```bash
./wahy.js --lang=tur --scripture=1 --ayah=all
# veya kısaca:
./wahy.js -l tur -s 1
```
##### 2. İngilizce Dilinde "The Cow" (Bakara) Suresinin 5. Ayetini Getirme:
```bash
./wahy.js -l eng -s "The Cow" -a 5
```

##### 3. Türkçe Dilinde İhlas Suresini İsmiyle Çağırma:
```bash
./wahy.js -l tur -s "İhlas"
```
## Modül Olarak Kullanım (API)

```javascript
const wahy = require('./wahy.js');

try {
    // 1. Türkçe XML verisini yükle ve cheerio objesi oluştur
    const $ = wahy.newData('tur');

    // 2. Tüm sure elementlerini ayıkla
    const chapters = wahy.chaptersData($);

    // 3. İsme veya numaraya göre ilgili surenin verisini al
    const scripture = wahy.scriptureData(chapters, "Bakara");

    // 4. Suredi tüm ayetlerin metinlerini bir dizi (array) olarak al
    const ayetler = wahy.signData(scripture);

    console.log("Bakara Suresi Toplam Ayet Sayısı:", ayetler.length);
    console.log("Bakara Suresi 1. Ayet:", ayetler[0]);

} catch (error) {
    console.error("Hata:", error.message);
}
```
## License

The gem is available as open source under the terms of the [MIT License](http://opensource.org/licenses/MIT).
