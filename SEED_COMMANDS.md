# 🌱 أوامر إضافة الـ 50 متجراً

## الخطوة 1: توصيل بقاعدة البيانات

### في Render.com (Shell):
```bash
# الاتصال بقاعدة البيانات
psql $DATABASE_URL
```

### من جهازك المحلي (Terminal):
```bash
# تحتاج أولاً لتثبيت psql
# macOS: brew install postgresql
# Ubuntu: sudo apt-get install postgresql-client

# ثم الاتصال
psql "postgresql://USER:PASSWORD@HOST:5432/DATABASE"
```

---

## الخطوة 2: إنشاء الجداول (إذا لم تكن موجودة)

```sql
-- تشغيل هذا أولاً للتأكد من أن الجداول موجودة
\dt

-- إذا لم تجد جدول merchants، شغل:
CREATE TABLE IF NOT EXISTS merchants (
  id SERIAL PRIMARY KEY,
  business_name VARCHAR(255) NOT NULL,
  business_name_ar VARCHAR(255),
  slug VARCHAR(255) UNIQUE,
  description TEXT,
  description_ar TEXT,
  short_description VARCHAR(500),
  category VARCHAR(50) NOT NULL,
  subcategory VARCHAR(100),
  tags TEXT,
  country VARCHAR(100),
  city VARCHAR(100),
  address TEXT,
  neighborhood VARCHAR(100),
  phone VARCHAR(50),
  email VARCHAR(320),
  website TEXT,
  facebook_url TEXT,
  instagram_url TEXT,
  price_range VARCHAR(10),
  rating VARCHAR(10) DEFAULT '0',
  status VARCHAR(20) DEFAULT 'active',
  is_verified BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  logo TEXT,
  cover_image TEXT,
  claimed_by INTEGER,
  claimed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS jobs (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  title_ar VARCHAR(255),
  slug VARCHAR(255) UNIQUE,
  description TEXT,
  description_ar TEXT,
  category VARCHAR(50),
  type VARCHAR(50),
  experience_level VARCHAR(50),
  country VARCHAR(100),
  city VARCHAR(100),
  salary_min VARCHAR(50),
  salary_max VARCHAR(50),
  status VARCHAR(20) DEFAULT 'open',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP
);
```

---

## الخطوة 3: إدراج المتاجر (الأوامر الجاهزة)

انسخ والصق هذا الأمر كاملاً:

```sql
INSERT INTO merchants (business_name, business_name_ar, short_description, description, category, subcategory, country, city, address, phone, email, price_range, rating, tags, status, is_verified, is_featured) VALUES
('Al Ajami Restaurant', 'مطعم الأعجمي', 'مطعم سوري أصيل في قلب باريس', 'مطعم الأعجمي هو واحد من أشهر المطاعم السورية في باريس. يقدم تشكيلة واسعة من الأطباق الشرقية الأصيلة.', 'restaurant', 'مطعم سوري', 'فرنسا', 'باريس', '3 Rue du Faubourg Montmartre, 75009 Paris', '+33 1 42 46 04 38', 'contact@alajami.fr', '$$', '4.7', 'مطعم سوري, باريس, حلال, مشاوي, شاورما', 'active', true, true),
('Bakdash Ice Cream', 'بكداش - آيس كريم حلبي', 'أشهر آيس كريم عربي في باريس', 'بكداش يقدم الآيس كريم الحلبي الأصيل بأجود المكسرات والفستق الحلبي.', 'sweets', 'آيس كريم حلبي', 'فرنسا', 'باريس', '12 Rue des Rosiers, 75004 Paris', '+33 1 42 72 91 42', 'info@bakdash.fr', '$', '4.8', 'آيس كريم, حلبي, فستق, حلويات شرقية', 'active', true, false),
('Les Deux Magots Arabic Bakery', 'مخبز الشرق', 'مخبز عربي يقدم الخبز الطازج', 'مخبز متخصص في إنتاج الخبز العربي الطازج يومياً.', 'bakery', 'مخبز عربي', 'فرنسا', 'باريس', '25 Rue de la Roquette, 75011 Paris', '+33 1 47 00 21 93', null, '$', '4.5', 'مخبز, خبز عربي, حلويات شرقية, كنافة', 'active', true, false),
('Sultan Barber Shop', 'صالون السلطان للحلاقة', 'صالون حلاقة عربي فاخر', 'صالون السلطان يقدم خدمات الحلاقة والتجميل الرجالي العربي.', 'barber', 'صالون حلاقة رجالي', 'فرنسا', 'باريس', '8 Rue du Faubourg Saint-Denis, 75010 Paris', '+33 1 42 38 59 27', null, '$$', '4.6', 'حلاقة, صالون, حلاقة عربية, تجميل رجالي', 'active', true, false),
('Bazar du Monde Arabe', 'سوق العالم العربي', 'سوبرماركت عربي متكامل في باريس', 'سوبرماركت يقدم كل المنتجات العربية والحلال.', 'supermarket', 'سوبرماركت حلال', 'فرنسا', 'باريس', '45 Rue de Belleville, 75020 Paris', '+33 1 43 58 42 61', 'bazar@monde-arabe.fr', '$$', '4.4', 'سوبرماركت, حلال, منتجات عربية, بقالة', 'active', true, false),
('La Mosquee de Paris Cafe', 'مقهى جامع باريس', 'مقهى تقليدي في حديقة المسجد الكبير', 'مقهى يقدم الشاي المغربي بالنعناع والحلويات التقليدية.', 'cafe', 'مقهى مغربي', 'فرنسا', 'باريس', '39 Rue Geoffroy-Saint-Hilaire, 75005 Paris', '+33 1 43 31 18 14', null, '$', '4.7', 'مقهى, شاي مغربي, حلويات, جامع باريس', 'active', true, true),
('Levant Restaurant London', 'مطعم بلاد الشام - لندن', 'مطعم شامي راقي في قلب لندن', 'يقدم تجربة طعام شامية فاخرة مع إطلالة على نهر التايمز.', 'restaurant', 'مطعم شامي فاخر', 'المملكة المتحدة', 'لندن', '76-77 London Wall, London EC2M 5NX', '+44 20 7256 1122', 'info@levant-london.co.uk', '$$$', '4.6', 'مطعم شامي, لندن, فاخر, مشاوي, مازة', 'active', true, true),
('Edgware Road Halal Butcher', 'جزار الطريق الحلال', 'جزار حلال في منطقة Edgware Road', 'متجر لحوم حلال طازجة يومياً من لحم غنم وعجل ودواجن.', 'butcher', 'جزار حلال', 'المملكة المتحدة', 'لندن', '142 Edgware Road, London W2 2DZ', '+44 20 7723 8765', null, '$$', '4.5', 'جزار, حلال, لحم, دواجن, Edgware Road', 'active', true, false),
('The Arabica Lounge', 'لاونج أرابيكا', 'مقهى ولاونج عربي للشيشة في لندن', 'لاونج يقدم الشيشة بنكهات متنوعة والمشروبات العربية.', 'shisha_lounge', 'مقهى شيشة', 'المملكة المتحدة', 'لندن', '35 Maida Vale, London W9 1RS', '+44 20 7286 5492', null, '$$', '4.3', 'شيشة, مقهى, عربي, لندن', 'active', true, false),
('Damaskus Restaurant Berlin', 'مطعم دمشق - برلين', 'مطعم دمشقي أصيل في قلب برلين', 'مطعم يقدم الأطباق الدمشقية الأصيلة من فتة حمص، منسف، كبة.', 'restaurant', 'مطعم دمشقي', 'ألمانيا', 'برلين', 'Sonnenallee 87, 12045 Berlin', '+49 30 623 72 14', 'info@damaskus-berlin.de', '$$', '4.6', 'مطعم سوري, برلين, دمشقي, منسف, Neukolln', 'active', true, true),
('Babylon Supermarkt', 'سوبرماركت بابل', 'كل ما يحتاجه العرب في برلين', 'سوبرماركت متخصص في المنتجات العربية والحلال.', 'supermarket', 'سوبرماركت عربي', 'ألمانيا', 'برلين', 'Sonnenallee 120, 12045 Berlin', '+49 30 624 89 33', null, '$$', '4.4', 'سوبرماركت, حلال, عربي, برلين', 'active', true, false),
('Al-Andalus Konditorei', 'حلويات الأندلس - برلين', 'حلويات شرقية وأندلسية في برلين', 'يقدم تشكيلة واسعة من الحلويات الشرقية والأندلسية.', 'sweets', 'حلويات شرقية', 'ألمانيا', 'برلين', 'Sonnnenallee 45, 12045 Berlin', '+49 30 622 35 71', null, '$', '4.8', 'حلويات, شرقية, بقلاوة, كنافة, برلين', 'active', true, false),
('Beirut Express Berlin', 'بيروت إكسبرس', 'مطعم لبناني سريع في برلين', 'يقدم أشهى المأكولات اللبنانية السريعة من فلافل، شاورما.', 'restaurant', 'مطعم لبناني', 'ألمانيا', 'برلين', 'Admiralstrasse 16, 10999 Berlin', '+49 30 614 12 88', null, '$', '4.5', 'مطعم لبناني, فلافل, شاورما, برلين', 'active', true, false),
('Souk Amsterdam', 'سوق أمستردام', 'مطعم ومقهى عربي في وسط أمستردام', 'يجمع بين الأطباق العربية التقليدية والمطبخ الأوروبي العصري.', 'restaurant', 'مطعم عربي', 'هولندا', 'أمستردام', 'Utrechtsestraat 65, 1017 VJ Amsterdam', '+31 20 624 52 19', 'hello@soukamsterdam.nl', '$$', '4.5', 'مطعم عربي, أمستردام, مقهى, حلال', 'active', true, false),
('Al-Iman Halal Market', 'سوق الإيمان الحلال', 'بقالة حلال وعربية في أمستردام', 'يقدم منتجات حلال طازجة، تمور، زيت زيتون، بهارات.', 'supermarket', 'بقالة حلال', 'هولندا', 'أمستردام', 'Bos en Lommerweg 126, 1055 ED Amsterdam', '+31 20 684 83 21', null, '$$', '4.3', 'سوبرماركت, حلال, أمستردام, بقالة', 'active', true, false),
('Le Sahara Restaurant', 'مطعم الصحراء - بروكسل', 'مطعم مغربي جزائري في بروكسل', 'يقدم المأكولات المغربية والجزائرية الأصيلة من الكسكس، الطاجين.', 'restaurant', 'مطعم مغربي جزائري', 'بلجيكا', 'بروكسل', 'Chaussee d''Ixelles 112, 1050 Ixelles', '+32 2 512 43 68', null, '$$', '4.4', 'مطعم مغربي, بروكسل, كسكس, طاجين', 'active', true, false),
('Baklava Palace Brussels', 'قصر البقلاوة - بروكسل', 'حلويات تركية وعربية فاخرة', 'أفضل أنواع البقلاوة التركية والحلويات العربية الفاخرة.', 'sweets', 'حلويات تركية', 'بلجيكا', 'بروكسل', 'Rue du Marche aux Herbes 78, 1000 Bruxelles', '+32 2 217 09 83', null, '$$', '4.7', 'بقلاوة, حلويات, تركية, بروكسل', 'active', true, false),
('Oriental Vienna', 'الشرقي - فيينا', 'مطعم عربي عراقي في فيينا', 'يقدم الأطباق العراقية الأصيلة من التمن والمقلوبة والكباب.', 'restaurant', 'مطعم عراقي', 'النمسا', 'فيينا', 'Praterstrasse 42, 1020 Wien', '+43 1 214 22 87', null, '$$', '4.5', 'مطعم عراقي, فيينا, كباب, تمن', 'active', true, false),
('Sahara Hookah Lounge Vienna', 'لاونج صحراء - فيينا', 'مقهى وشيشة عربي في فيينا', 'أجواء عربية أصيلة مع الشيشة والشاي والقهوة العربية.', 'shisha_lounge', 'مقهى شيشة', 'النمسا', 'فيينا', 'Mariahilfer Strasse 89, 1060 Wien', '+43 1 597 63 42', null, '$$', '4.3', 'شيشة, فيينا, مقهى عربي', 'active', true, false),
('El Oasis Halal Madrid', 'الواحة الحلال - مدريد', 'مطعم ومقهى حلال في قلب مدريد', 'يقدم مأكولات عربية إسبانية مدمجة بإشراف حلال كامل.', 'restaurant', 'مطعم حلال إسباني', 'إسبانيا', 'مدريد', 'Calle de Fuencarral 127, 28010 Madrid', '+34 915 32 76 45', null, '$$', '4.4', 'مطعم حلال, مدريد, عربي إسباني', 'active', true, false),
('Mezquita Central Halal Market', 'سوق المسجد المركزي الحلال', 'بقالة حلال بالقرب من مسجد مدريد', 'يقدم كل المنتجات الحلال والعربية.', 'supermarket', 'بقالة حلال', 'إسبانيا', 'مدريد', 'Calle de Alcala 480, 28027 Madrid', '+34 913 67 22 81', null, '$$', '4.2', 'سوبرماركت حلال, مدريد, مسجد', 'active', true, false),
('Sultan Restaurant Roma', 'مطعم السلطان - روما', 'مطعم تركي عربي في روما', 'يقدم المأكولات التركية والعربية من الكباب التركي والمازة.', 'restaurant', 'مطعم تركي عربي', 'إيطاليا', 'روما', 'Via Merulana 251, 00185 Roma', '+39 06 770 99 182', null, '$$', '4.3', 'مطعم تركي, روما, كباب, حلال', 'active', true, false),
('Oriental Bakery Stockholm', 'مخبز الشرق - ستوكهولم', 'مخبز وحلويات عربية في ستوكهولم', 'يقدم الخبز العربي الطازج والحلويات الشرقية.', 'bakery', 'مخبز وحلويات عربية', 'السويد', 'ستوكهولم', 'Odengatan 78, 113 22 Stockholm', '+46 8 30 18 42', null, '$', '4.5', 'مخبز عربي, ستوكهولم, حلويات شرقية', 'active', true, false),
('Al-Dar Restaurant Geneva', 'مطعم الدار - جنيف', 'مطعم فلسطيني شامي في جنيف', 'يقدم المسخن الفلسطيني والمأكولات الشامية الأصيلة.', 'restaurant', 'مطعم فلسطيني شامي', 'سويسرا', 'جنيف', 'Rue de Lausanne 48, 1202 Geneve', '+41 22 731 77 93', null, '$$$', '4.6', 'مطعم فلسطيني, جنيف, مسخن, شامي', 'active', true, false),
('Casablanca Cafe Paris', 'مقهى الدار البيضاء - باريس', 'مقهى مغربي يقدم الشاي بالنعناع', 'مقهى مغربي أصيل يقدم الشاي المغربي والحلويات.', 'cafe', 'مقهى مغربي', 'فرنسا', 'باريس', '18 Rue de la Huchette, 75005 Paris', '+33 1 43 29 47 82', null, '$', '4.4', 'مقهى مغربي, باريس, شاي, حلويات', 'active', true, false),
('Arabian Nights London', 'ليالي العربية - لندن', 'مطعم عربي فاخر في Mayfair', 'تجربة طعام عربية فاخرة في أرقى مناطق لندن.', 'restaurant', 'مطعم عربي فاخر', 'المملكة المتحدة', 'لندن', '34 Curzon Street, London W1J 7TN', '+44 20 7491 3832', null, '$$$$', '4.8', 'مطعم فاخر, لندن, Mayfair, عربي', 'active', true, true),
('Al-Baraka Travel Hamburg', 'سفر البركة - هامبورغ', 'وكالة سفر عربية في هامبورغ', 'تنظم رحلات الحج والعمرة والسياحة للعرب.', 'travel_agency', 'وكالة سفر', 'ألمانيا', 'هامبورغ', 'Steindamm 52, 20099 Hamburg', '+49 40 284 12 39', null, '$$$', '4.3', 'وكالة سفر, حج, عمرة, هامبورغ', 'active', true, false),
('Halal Barber Munich', 'صالون الحلاقة الحلال - ميونخ', 'صالون حلاقة للرجال في ميونخ', 'صالون حلاقة عربي يقدم خدماته للرجال والأطفال.', 'barber', 'صالون حلاقة', 'ألمانيا', 'ميونخ', 'Schwanthalerstrasse 155, 80339 Munchen', '+49 89 545 32 18', null, '$$', '4.4', 'حلاقة, ميونخ, صالون عربي', 'active', true, false),
('Falafel King Rotterdam', 'ملك الفلافل - روتردام', 'أفضل فلافل في روتردام', 'يقدم الفلافل العربي الأصيل والشاورما والحمص.', 'restaurant', 'مطعم فلافل', 'هولندا', 'روتردام', 'Kruiskade 125, 3012 DE Rotterdam', '+31 10 214 78 56', null, '$', '4.6', 'فلافل, روتردام, شاورما, حمص', 'active', true, false),
('Al-Falah Mosque', 'مسجد الفلاح - بروكسل', 'مسجد ومركز إسلامي في بروكسل', 'مسجد ومركز مجتمعي يقدم خدمات دينية واجتماعية.', 'mosque', 'مسجد ومركز إسلامي', 'بلجيكا', 'بروكسل', 'Rue du Progres 323, 1030 Schaerbeek', '+32 2 215 88 44', null, 'free', '4.7', 'مسجد, بروكسل, مركز إسلامي, صلاة', 'active', true, false),
('Zaytouna Halal Butcher Lyon', 'جزار الزيتونة الحلال - ليون', 'جزار حلال في ليون', 'يقدم لحوم حلال طازجة من لحم غنم وعجل ودواجن.', 'butcher', 'جزار حلال', 'فرنسا', 'ليون', 'Rue Moncey 17, 69002 Lyon', '+33 4 78 42 19 37', null, '$$', '4.3', 'جزار حلال, ليون, لحم, دواجن', 'active', true, false),
('Al-Nour Bakery Copenhagen', 'مخبز النور - كوبنهاغن', 'مخبز عربي في كوبنهاغن', 'يقدم الخبز العربي والحلويات والكنافة والبقلاوة.', 'bakery', 'مخبز عربي', 'الدنمارك', 'كوبنهاغن', 'Norrebrogade 78, 2200 Kobenhavn', '+45 35 24 18 92', null, '$', '4.4', 'مخبز عربي, كوبنهاغن, حلويات', 'active', true, false),
('Sham Palace Dublin', 'قصر الشام - دبلن', 'مطعم سوري شامي في دبلن', 'يقدم المأكولات الشامية الأصيلة في قلب دبلن.', 'restaurant', 'مطعم شامي', 'أيرلندا', 'دبلن', 'Capel Street 143, Dublin 1', '+353 1 873 42 61', null, '$$', '4.5', 'مطعم شامي, دبلن, سوري, مشاوي', 'active', true, false),
('Medina Money Transfer', 'تحويل أموال المدينة - لندن', 'تحويل أموال للدول العربية', 'يقدم خدمات تحويل الأموال للدول العربية.', 'money_transfer', 'تحويل أموال', 'المملكة المتحدة', 'لندن', 'Edgware Road 201, London W2 1ES', '+44 20 7723 91 44', null, '$', '4.2', 'تحويل أموال, لندن, Edgware Road', 'active', true, false),
('Desert Rose Oslo', 'وردة الصحراء - أوسلو', 'مطعم عربي في أوسلو', 'يقدم المأكولات العربية والمشاوي والمازة.', 'restaurant', 'مطعم عربي', 'النرويج', 'أوسلو', 'Gronlandsleiret 25, 0190 Oslo', '+47 22 17 38 56', null, '$$', '4.3', 'مطعم عربي, أوسلو, مشاوي, مازة', 'active', true, false),
('Al-Huda Islamic Center', 'مركز الهداية - هلسنكي', 'مركز إسلامي في هلسنكي', 'يقدم خدمات دينية واجتماعية وتعليمية.', 'mosque', 'مسجد ومركز إسلامي', 'فنلندا', 'هلسنكي', 'Kaenkuja 1, 00500 Helsinki', '+358 9 739 67 82', null, 'free', '4.5', 'مسجد, هلسنكي, مركز إسلامي', 'active', true, false),
('Mecca Restaurant Lisbon', 'مطعم مكة - لشبونة', 'مطعم حلال عربي في لشبونة', 'يقدم المأكولات العربية الحلال.', 'restaurant', 'مطعم عربي حلال', 'البرتغال', 'لشبونة', 'Rua da Palma 258, 1100-394 Lisboa', '+351 21 882 34 71', null, '$$', '4.4', 'مطعم حلال, لشبونة, عربي', 'active', true, false),
('Al-Rashid Supermarket Prague', 'سوبرماركت الرشيد - براغ', 'سوبرماركت عربي في براغ', 'يقدم المنتجات العربية والحلال والبهارات.', 'supermarket', 'سوبرماركت عربي', 'التشيك', 'براغ', 'Sokolovska 192/541, 190 00 Praha 9', '+420 284 681 32 7', null, '$$', '4.2', 'سوبرماركت, حلال, براغ, منتجات عربية', 'active', true, false),
('Nile Restaurant Warsaw', 'مطعم النيل - وارسو', 'مطعم مصري عربي في وارسو', 'يقدم المأكولات المصرية الأصيلة.', 'restaurant', 'مطعم مصري', 'بولندا', 'وارسو', 'Marszalkowska 99/101, 00-693 Warszawa', '+48 22 622 43 78', null, '$$', '4.3', 'مطعم مصري, وارسو, كشري, فول', 'active', true, false),
('Al-Quds Bakery Budapest', 'مخبز القدس - بودابست', 'مخبز فلسطيني عربي في بودابست', 'يقدم الخبز الفلسطيني والعربي الطازج.', 'bakery', 'مخبز فلسطيني', 'المجر', 'بودابست', 'Rakoczi ut 69, 1078 Budapest', '+36 1 322 41 95', null, '$', '4.5', 'مخبز فلسطيني, بودابست, خبز عربي', 'active', true, false),
('Sahara Cafe Zurich', 'مقهى الصحراء - زيورخ', 'مقهى ومطعم عربي في زيورخ', 'يقدم الشاي العربي والقهوة التركية والمأكولات الخفيفة.', 'cafe', 'مقهى عربي', 'سويسرا', 'زيورخ', 'Langstrasse 215, 8005 Zurich', '+41 43 488 76 22', null, '$$', '4.4', 'مقهى عربي, زيورخ, شاي, قهوة تركية', 'active', true, false),
('Habibi Shisha Vienna', 'لاونج حبيبي - فيينا', 'لاونج شيشة عربي عصري في فيينا', 'لاونج عصري يقدم الشيشة بنكهات متنوعة.', 'shisha_lounge', 'لاونج شيشة', 'النمسا', 'فيينا', 'Praterstrasse 21, 1020 Wien', '+43 1 214 52 88', null, '$$', '4.2', 'شيشة, لاونج, فيينا, عربي', 'active', true, false),
('Al-Masry Marseille', 'مطعم المصري - مرسيليا', 'مطعم مصري أصيل في مرسيليا', 'يقدم المأكولات المصرية من الكشري والملوخية.', 'restaurant', 'مطعم مصري', 'فرنسا', 'مرسيليا', '63 La Canebiere, 13001 Marseille', '+33 4 91 08 12 44', null, '$$', '4.4', 'مطعم مصري, مرسيليا, كشري, شاورما', 'active', true, false),
('Cafe Beyrouth Nice', 'مقهى بيروت - نيس', 'مقهى ومطعم لبناني في نيس', 'يقدم المازة والمشاوي والحلويات اللبنانية.', 'cafe', 'مقهى ومطعم لبناني', 'فرنسا', 'نيس', '12 Rue Massena, 06000 Nice', '+33 4 93 87 22 11', null, '$$', '4.3', 'مطعم لبناني, نيس, مازة, مشاوي', 'active', true, false),
('Sham Palace Frankfurt', 'قصر الشام - فرانكفورت', 'مطعم سوري شامي في فرانكفورت', 'يقدم الأطباق الشامية من المشاوي والفتة والكبة.', 'restaurant', 'مطعم شامي', 'ألمانيا', 'فرانكفورت', 'Kaiserstrasse 52, 60329 Frankfurt am Main', '+49 69 272 38 22', null, '$$', '4.5', 'مطعم شامي, فرانكفورت, مشاوي, كبة', 'active', true, false),
('Sultan Supermarket Cologne', 'سوبرماركت السلطان - كولونيا', 'سوبرماركت عربي في كولونيا', 'يقدم المنتجات العربية والحلال والتمور.', 'supermarket', 'سوبرماركت عربي', 'ألمانيا', 'كولونيا', 'Venloer Str. 385, 50825 Koln', '+49 221 168 91 33', null, '$$', '4.3', 'سوبرماركت, حلال, كولونيا, عربي', 'active', true, false),
('Al-Sham Sweets Stuttgart', 'حلويات الشام - شتوتغارت', 'حلويات شامية فاخرة', 'يقدم البقلاوة الشامية والكنافة النابلسية.', 'sweets', 'حلويات شامية', 'ألمانيا', 'شتوتغارت', 'Konigstrasse 45, 70173 Stuttgart', '+49 711 293 84 17', null, '$$', '4.6', 'حلويات, شامية, بقلاوة, كنافة', 'active', true, false),
('Manchester Halal Butcher', 'جزار مانشستر الحلال', 'جزار وبقالة حلال', 'يقدم اللحوم الحلال الطازجة والمنتجات العربية.', 'butcher', 'جزار وبقالة حلال', 'المملكة المتحدة', 'مانشستر', 'Wilmslow Road 142, Rusholme, Manchester M14 5AW', '+44 161 224 55 88', null, '$$', '4.4', 'جزار حلال, مانشستر, بقالة', 'active', true, false),
('Birmingham Cultural Center', 'مركز برمنغهام الثقافي', 'مركز ثقافي عربي', 'يقدم أنشطة ثقافية ودورات لغة عربية.', 'mosque', 'مركز ثقافي عربي', 'المملكة المتحدة', 'برمنغهام', 'Stratford Road 298, Birmingham B11 1AA', '+44 121 766 22 44', null, 'free', '4.5', 'مركز ثقافي, برمنغهام, عربي', 'active', true, false),
('Barcelona Arab Lounge', 'لاونج برشلونة العربي', 'مطعم ولاونج عربي في برشلونة', 'يقدم المأكولات العربية والشيشة.', 'shisha_lounge', 'مطعم ولاونج عربي', 'إسبانيا', 'برشلونة', 'Carrer de Mallorca 234, 08008 Barcelona', '+34 934 88 12 55', null, '$$', '4.3', 'لاونج, شيشة, برشلونة, عربي', 'active', true, false),
('Milan Arabic Bakery', 'مخبز ميلان العربي', 'مخبز عربي في ميلانو', 'يقدم الخبز العربي والحلويات الشرقية.', 'bakery', 'مخبز عربي', 'إيطاليا', 'ميلانو', 'Via Paolo Sarpi 28, 20154 Milano', '+39 02 349 41 88', null, '$', '4.4', 'مخبز عربي, ميلانو, خبز', 'active', true, false),
('Athens Halal Restaurant', 'مطعم أثينا الحلال', 'مطعم حلال عربي في أثينا', 'يقدم المأكولات العربية والمشاوي.', 'restaurant', 'مطعم حلال عربي', 'اليونان', 'أثينا', 'Athinas Street 45, Athens 10551', '+30 21 0321 88 42', null, '$$', '4.2', 'مطعم حلال, أثينا, عربي', 'active', true, false),
('Oasis Market Bucharest', 'سوق الواحة الحلال - بوخارست', 'بقالة حلال وعربية', 'يقدم المنتجات الحلال والعربية.', 'supermarket', 'بقالة حلال عربية', 'رومانيا', 'بوخارست', 'Strada Barcanesti 18, Sector 2, Bucuresti', '+40 21 322 15 88', null, '$$', '4.3', 'بقالة, حلال, بوخارست, عربي', 'active', true, false),
('Budapest Arabic Cafe', 'مقهى بودابست العربي', 'مقهى عربي ومطعم في بودابست', 'يقدم القهوة العربية والشاي المغربي.', 'cafe', 'مقهى ومطعم عربي', 'المجر', 'بودابست', 'Kiraly utca 28, 1075 Budapest', '+36 1 782 22 44', null, '$$', '4.5', 'مقهى, بودابست, قهوة عربية', 'active', true, false),
('Andalusia Restaurant Lisbon', 'مطعم الأندلس - لشبونة', 'مطعم مغربي أندلسي', 'يقدم الكسكس والطاجين والبسطيلة.', 'restaurant', 'مطعم مغربي أندلسي', 'البرتغال', 'لشبونة', 'Rua de Sao Juliao 72, 1100-524 Lisboa', '+351 21 887 65 22', null, '$$$', '4.6', 'مطعم مغربي, لشبونة, كسكس, طاجين', 'active', true, true),
('Oslo Arabic Barber', 'صالون أوسلو العربي', 'صالون حلاقة عربي في أوسلو', 'يقدم خدمات الحلاقة والتجميل للرجال والأطفال.', 'barber', 'صالون حلاقة عربي', 'النرويج', 'أوسلو', 'Gronland 18, 0188 Oslo', '+47 22 42 18 33', null, '$$', '4.4', 'حلاقة, أوسلو, صالون عربي', 'active', true, false),
('Stockholm Arabic Supermarket', 'سوبرماركت ستوكهولم العربي', 'سوبرماركت عربي متكامل', 'يقدم كل المنتجات العربية والحلال.', 'supermarket', 'سوبرماركت عربي متكامل', 'السويد', 'ستوكهولم', 'Soderhallarna 11, 118 72 Stockholm', '+46 8 669 28 44', null, '$$', '4.3', 'سوبرماركت, حلال, ستوكهولم, عربي', 'active', true, false),
('Copenhagen Shisha Garden', 'حديقة الشيشة - كوبنهاغن', 'مقهى وشيشة عربي', 'مقهى عربي يقدم الشيشة والشاي.', 'shisha_lounge', 'مقهى وشيشة عربي', 'الدنمارك', 'كوبنهاغن', 'Vesterbrogade 62, 1620 Kobenhavn', '+45 33 21 44 88', null, '$$', '4.2', 'شيشة, كوبنهاغن, مقهى عربي', 'active', true, false);
```

---

## الخطوة 4: التحقق من الإدراج

```sql
-- عدد المتاجر
SELECT COUNT(*) FROM merchants;

-- يجب أن يظهر: 50

-- عرض أول 5 متاجر
SELECT business_name_ar, city, country, category, rating FROM merchants LIMIT 5;
```

---

## 🚀 طريقة سريعة: تشغيل Seed Script

```bash
# 1. ادخل لمجلد المشروع
cd deploy-euroarab

# 2. ثبت الحزم
npm install

# 3. تأكد من DATABASE_URL في ملف .env

# 4. شغل الـ Seed
npx tsx db/seed.ts
```

---

## ✅ بعد الإدراج الناجح

1. شغّل الموقع: `npm start`
2. افتح: `https://your-render-url.onrender.com`
3. يجب أن ترى الـ 50 متجراً ظاهراً!
