import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { emergencyContacts } from "../db/schema";
import { eq, and, sql } from "drizzle-orm";

export const emergencyRouter = createRouter({
  // List all emergency contacts with filters
  list: publicQuery
    .input(
      z.object({
        country: z.string().optional(),
        city: z.string().optional(),
        type: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      try {
        const conditions: any[] = [eq(emergencyContacts.isActive, true)];

        if (input?.country) {
          conditions.push(sql`${emergencyContacts.country} = ${input.country}`);
        }
        if (input?.city) {
          conditions.push(sql`${emergencyContacts.city} = ${input.city}`);
        }
        if (input?.type) {
          conditions.push(sql`${emergencyContacts.type} = ${input.type}`);
        }

        const where = conditions.length > 1
          ? and(...conditions)
          : conditions[0];

        const items = await db
          .select()
          .from(emergencyContacts)
          .where(where)
          .orderBy(emergencyContacts.type, emergencyContacts.city);

        return { items, total: items.length };
      } catch (error: any) {
        console.error("[emergency.list] Error:", error?.message);
        return { items: [], total: 0 };
      }
    }),

  // Get by country
  byCountry: publicQuery
    .input(z.object({ country: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const items = await db
        .select()
        .from(emergencyContacts)
        .where(
          and(
            eq(emergencyContacts.isActive, true),
            sql`${emergencyContacts.country} = ${input.country}`
          )
        )
        .orderBy(emergencyContacts.type, emergencyContacts.city);
      return items;
    }),

  // Get types
  types: publicQuery.query(async () => {
    return [
      { id: "embassy", name: "السفارات", nameEn: "Embassy", icon: "Landmark", color: "#dc2626" },
      { id: "hospital", name: "مستشفيات", nameEn: "Hospital", icon: "Heart", color: "#ef4444" },
      { id: "police", name: "شرطة", nameEn: "Police", icon: "Shield", color: "#1d4ed8" },
      { id: "fire", name: "إطفاء", nameEn: "Fire", icon: "Flame", color: "#ea580c" },
      { id: "pharmacy_24h", name: "صيدليات 24س", nameEn: "24h Pharmacy", icon: "Clock", color: "#16a34a" },
      { id: "tourist_police", name: "شرطة سياحية", nameEn: "Tourist Police", icon: "ShieldCheck", color: "#2563eb" },
      { id: "airport", name: "مطارات", nameEn: "Airport", icon: "Plane", color: "#0891b2" },
      { id: "lost_card", name: "حجز بطاقات", nameEn: "Card Hotline", icon: "CreditCard", color: "#7c3aed" },
      { id: "taxi", name: "تاكسي", nameEn: "Taxi", icon: "Car", color: "#ca8a04" },
    ];
  }),

  // Seed emergency contacts (run once)
  seed: publicQuery.mutation(async () => {
    const db = getDb();

    const emergencyData = [
      // ═══════════════════════════════════════════
      // 🇫🇷 FRANCE - PARIS
      // ═══════════════════════════════════════════
      // Embassies - Paris
      { name: "Embassy of Algeria", nameAr: "سفارة الجزائر", type: "embassy" as const, phone: "+331 47 23 01 44", country: "France", city: "Paris", address: "50, Rue de Lisbonne, 75008 Paris", description: "Embassy of the People's Democratic Republic of Algeria", descriptionAr: "سفارة الجمهورية الجزائرية الديمقراطية الشعبية" },
      { name: "Embassy of Morocco", nameAr: "سفارة المغرب", type: "embassy" as const, phone: "+331 45 20 69 69", country: "France", city: "Paris", address: "5, Rue Le Tasse, 75016 Paris", description: "Embassy of the Kingdom of Morocco", descriptionAr: "سفارة المملكة المغربية" },
      { name: "Embassy of Tunisia", nameAr: "سفارة تونس", type: "embassy" as const, phone: "+331 45 53 84 00", country: "France", city: "Paris", address: "25, Rue Barbet-de-Jouy, 75007 Paris", description: "Embassy of the Republic of Tunisia", descriptionAr: "سفارة الجمهورية التونسية" },
      { name: "Embassy of Egypt", nameAr: "سفارة مصر", type: "embassy" as const, phone: "+331 56 90 18 00", country: "France", city: "Paris", address: "56, Avenue d'Iena, 75116 Paris", description: "Embassy of the Arab Republic of Egypt", descriptionAr: "سفارة جمهورية مصر العربية" },
      { name: "Embassy of Lebanon", nameAr: "سفارة لبنان", type: "embassy" as const, phone: "+331 47 20 61 86", country: "France", city: "Paris", address: "3, Villa Copernic, 75116 Paris", description: "Embassy of the Lebanese Republic", descriptionAr: "سفارة الجمهورية اللبنانية" },
      { name: "Embassy of Syria", nameAr: "سفارة سوريا", type: "embassy" as const, phone: "+331 45 53 44 55", country: "France", city: "Paris", address: "20, Rue Vaneau, 75007 Paris", description: "Embassy of the Syrian Arab Republic", descriptionAr: "سفارة الجمهورية العربية السورية" },
      { name: "Embassy of Iraq", nameAr: "سفارة العراق", type: "embassy" as const, phone: "+331 53 23 10 60", country: "France", city: "Paris", address: "9, Rue d'Astorg, 75008 Paris", description: "Embassy of the Republic of Iraq", descriptionAr: "سفارة جمهورية العراق" },
      { name: "Embassy of Palestine", nameAr: "سفارة فلسطين", type: "embassy" as const, phone: "+331 42 30 11 20", country: "France", city: "Paris", address: "10-12, Rue Thiers, 75116 Paris", description: "Embassy of the State of Palestine", descriptionAr: "سفارة دولة فلسطين" },
      { name: "Embassy of Jordan", nameAr: "سفارة الأردن", type: "embassy" as const, phone: "+331 47 63 71 65", country: "France", city: "Paris", address: "80, Boulevard Maurice-Barres, 92200 Neuilly-sur-Seine", description: "Embassy of the Hashemite Kingdom of Jordan", descriptionAr: "سفارة المملكة الأردنية الهاشمية" },
      { name: "Embassy of Saudi Arabia", nameAr: "سفارة السعودية", type: "embassy" as const, phone: "+331 56 79 40 00", country: "France", city: "Paris", address: "5, Avenue Hoche, 75008 Paris", description: "Embassy of the Kingdom of Saudi Arabia", descriptionAr: "سفارة المملكة العربية السعودية" },
      { name: "Embassy of UAE", nameAr: "سفارة الإمارات", type: "embassy" as const, phone: "+331 44 43 20 00", country: "France", city: "Paris", address: "2, Boulevard de la Tour-Maubourg, 75007 Paris", description: "Embassy of the United Arab Emirates", descriptionAr: "سفارة دولة الإمارات العربية المتحدة" },
      { name: "Embassy of Qatar", nameAr: "سفارة قطر", type: "embassy" as const, phone: "+331 53 67 92 00", country: "France", city: "Paris", address: "1, Rue de Tilsitt, 75008 Paris", description: "Embassy of the State of Qatar", descriptionAr: "سفارة دولة قطر" },
      { name: "Embassy of Kuwait", nameAr: "سفارة الكويت", type: "embassy" as const, phone: "+331 47 23 41 51", country: "France", city: "Paris", address: "129, Rue du Ranelagh, 75016 Paris", description: "Embassy of the State of Kuwait", descriptionAr: "سفارة دولة الكويت" },
      { name: "Embassy of Oman", nameAr: "سفارة عمان", type: "embassy" as const, phone: "+331 47 66 82 80", country: "France", city: "Paris", address: "50, Avenue d'Iena, 75116 Paris", description: "Embassy of the Sultanate of Oman", descriptionAr: "سفارة سلطنة عمان" },
      { name: "Embassy of Bahrain", nameAr: "سفارة البحرين", type: "embassy" as const, phone: "+331 47 23 04 50", country: "France", city: "Paris", address: "3, Place des Etats-Unis, 75116 Paris", description: "Embassy of the Kingdom of Bahrain", descriptionAr: "سفارة مملكة البحرين" },
      { name: "Embassy of Yemen", nameAr: "سفارة اليمن", type: "embassy" as const, phone: "+331 47 83 56 60", country: "France", city: "Paris", address: "25, Rue des Jeuneurs, 75002 Paris", description: "Embassy of the Republic of Yemen", descriptionAr: "سفارة الجمهورية اليمنية" },
      { name: "Embassy of Sudan", nameAr: "سفارة السودان", type: "embassy" as const, phone: "+331 47 83 33 11", country: "France", city: "Paris", address: "11, Rue Alfred Dehodencq, 75016 Paris", description: "Embassy of the Republic of Sudan", descriptionAr: "سفارة جمهورية السودان" },
      { name: "Embassy of Libya", nameAr: "سفارة ليبيا", type: "embassy" as const, phone: "+331 45 24 34 72", country: "France", city: "Paris", address: "18, Rue Charles-Lamoureux, 75116 Paris", description: "Embassy of the State of Libya", descriptionAr: "سفارة دولة ليبيا" },
      { name: "Embassy of Mauritania", nameAr: "سفارة موريتانيا", type: "embassy" as const, phone: "+331 45 53 15 46", country: "France", city: "Paris", address: "5, Rue de Montevideo, 75116 Paris", description: "Embassy of the Islamic Republic of Mauritania", descriptionAr: "سفارة الجمهورية الإسلامية الموريتانية" },
      { name: "Embassy of Somalia", nameAr: "سفارة الصومال", type: "embassy" as const, phone: "+331 42 88 45 21", country: "France", city: "Paris", address: "26, Rue Dumont-d'Urville, 75116 Paris", description: "Embassy of the Federal Republic of Somalia", descriptionAr: "سفارة جمهورية الصومال الفيدرالية" },
      // Emergency - Paris
      { name: "Police Nationale", nameAr: "الشرطة الوطنية", type: "police" as const, phone: "17", country: "France", city: "Paris", description: "Emergency police number", descriptionAr: "رقم الطوارئ للشرطة" },
      { name: "SAMU (Medical Emergency)", nameAr: "سميو (طوارئ طبية)", type: "hospital" as const, phone: "15", country: "France", city: "Paris", description: "Medical emergency services", descriptionAr: "خدمات الطوارئ الطبية" },
      { name: "Pompiers (Fire Brigade)", nameAr: "المطافئ", type: "fire" as const, phone: "18", country: "France", city: "Paris", description: "Fire and rescue emergency", descriptionAr: "طوارئ المطافئ والإنقاذ" },
      { name: "European Emergency", nameAr: "طوارئ أوروبا", type: "police" as const, phone: "112", country: "France", city: "Paris", description: "Universal European emergency number", descriptionAr: "رقم الطوارئ الأوروبي الموحد" },
      { name: "SOS Medecins Paris", nameAr: "أطباء الطوارئ باريس", type: "hospital" as const, phone: "+331 47 07 77 77", country: "France", city: "Paris", description: "24/7 home doctor service", descriptionAr: "خدمة طبيب منزلي 24/7" },
      { name: "Hopital Avicenne (APHP)", nameAr: "مستشفى ابن سينا", type: "hospital" as const, phone: "+331 48 95 88 88", country: "France", city: "Paris", address: "125, Rue de Stalingrad, 93000 Bobigny", description: "Major public hospital serving Arab community", descriptionAr: "مستشفى عمومي كبير يخدم الجالية العربية" },
      { name: "Police Prefecture Paris", nameAr: "مديرية الشرطة باريس", type: "police" as const, phone: "+331 53 71 53 71", country: "France", city: "Paris", address: "9, Boulevard du Palais, 75004 Paris", description: "Prefecture de Police de Paris", descriptionAr: "مديرية شرطة باريس" },
      // Pharmacies 24h - Paris
      { name: "Pharmacie des Champs-Elysees (24h)", nameAr: "صيدلية الشانزيليزيه 24س", type: "pharmacy_24h" as const, phone: "+331 43 59 24 42", country: "France", city: "Paris", address: "84, Avenue des Champs-Elysees, 75008 Paris", description: "24-hour pharmacy on Champs-Elysees", descriptionAr: "صيدلية 24 ساعة في الشانزيليزيه" },
      { name: "Pharmacie Europe (24h)", nameAr: "صيدلية أوروبا 24س", type: "pharmacy_24h" as const, phone: "+331 42 85 31 70", country: "France", city: "Paris", address: "6, Rue de Madrid, 75008 Paris", description: "24-hour pharmacy near Saint-Lazare", descriptionAr: "صيدلية 24 ساعة قرب سان لازار" },

      // ═══════════════════════════════════════════
      // 🇩🇪 GERMANY - BERLIN
      // ═══════════════════════════════════════════
      { name: "Embassy of Algeria", nameAr: "سفارة الجزائر", type: "embassy" as const, phone: "+49 30 2030 870", country: "Germany", city: "Berlin", address: "Gorlitzer Str. 45, 10997 Berlin", description: "Embassy of Algeria in Berlin", descriptionAr: "سفارة الجزائر في برلين" },
      { name: "Embassy of Morocco", nameAr: "سفارة المغرب", type: "embassy" as const, phone: "+49 30 206 230", country: "Germany", city: "Berlin", address: "Niederwallstr. 39, 10117 Berlin", description: "Embassy of Morocco in Berlin", descriptionAr: "سفارة المغرب في برلين" },
      { name: "Embassy of Tunisia", nameAr: "سفارة تونس", type: "embassy" as const, phone: "+49 30 364 120", country: "Germany", city: "Berlin", address: "Hessische Str. 10, 10115 Berlin", description: "Embassy of Tunisia in Berlin", descriptionAr: "سفارة تونس في برلين" },
      { name: "Embassy of Egypt", nameAr: "سفارة مصر", type: "embassy" as const, phone: "+49 30 477 100", country: "Germany", city: "Berlin", address: "Stauffenbergstr. 6-7, 10785 Berlin", description: "Embassy of Egypt in Berlin", descriptionAr: "سفارة مصر في برلين" },
      { name: "Embassy of Lebanon", nameAr: "سفارة لبنان", type: "embassy" as const, phone: "+49 30 319 091", country: "Germany", city: "Berlin", address: "Tschaikowskistr. 15, 10629 Berlin", description: "Embassy of Lebanon in Berlin", descriptionAr: "سفارة لبنان في برلين" },
      { name: "Embassy of Syria", nameAr: "سفارة سوريا", type: "embassy" as const, phone: "+49 30 505 507", country: "Germany", city: "Berlin", address: "Rauchstr. 25, 10787 Berlin", description: "Embassy of Syria in Berlin", descriptionAr: "سفارة سوريا في برلين" },
      { name: "Embassy of Iraq", nameAr: "سفارة العراق", type: "embassy" as const, phone: "+49 30 306 080", country: "Germany", city: "Berlin", address: "Zimmerstr. 93, 10117 Berlin", description: "Embassy of Iraq in Berlin", descriptionAr: "سفارة العراق في برلين" },
      { name: "Embassy of Palestine", nameAr: "سفارة فلسطين", type: "embassy" as const, phone: "+49 30 308 820", country: "Germany", city: "Berlin", address: "Klagenfurter Str. 8, 10785 Berlin", description: "Embassy of Palestine in Berlin", descriptionAr: "سفارة فلسطين في برلين" },
      { name: "Embassy of Saudi Arabia", nameAr: "سفارة السعودية", type: "embassy" as const, phone: "+49 30 8900 8100", country: "Germany", city: "Berlin", address: "Tiergartenstr. 33-34, 10785 Berlin", description: "Embassy of Saudi Arabia in Berlin", descriptionAr: "سفارة السعودية في برلين" },
      { name: "Embassy of UAE", nameAr: "سفارة الإمارات", type: "embassy" as const, phone: "+49 30 516 550", country: "Germany", city: "Berlin", address: "Hiroshimastr. 18-20, 10785 Berlin", description: "Embassy of UAE in Berlin", descriptionAr: "سفارة الإمارات في برلين" },
      { name: "Embassy of Jordan", nameAr: "سفارة الأردن", type: "embassy" as const, phone: "+49 30 832 140", country: "Germany", city: "Berlin", address: "Pfalzburger Str. 56, 10717 Berlin", description: "Embassy of Jordan in Berlin", descriptionAr: "سفارة الأردن في برلين" },
      // Emergency - Berlin
      { name: "Polizei Notruf", nameAr: "الشرطة", type: "police" as const, phone: "110", country: "Germany", city: "Berlin", description: "Police emergency", descriptionAr: "طوارئ الشرطة" },
      { name: "Feuerwehr / Rettungsdienst", nameAr: "المطافئ/الإسعاف", type: "fire" as const, phone: "112", country: "Germany", city: "Berlin", description: "Fire & ambulance emergency", descriptionAr: "طوارئ المطافئ والإسعاف" },
      { name: "Charite Hospital", nameAr: "مستشفى شاريتيه", type: "hospital" as const, phone: "+49 30 450 50", country: "Germany", city: "Berlin", address: "Chariteplatz 1, 10117 Berlin", description: "Europe's largest university hospital", descriptionAr: "أكبر مستشفى جامعي في أوروبا" },
      { name: "Krankenhaus Moabit", nameAr: "مستشفى موابيت", type: "hospital" as const, phone: "+49 30 787 50", country: "Germany", city: "Berlin", address: "Alt-Moabit 9, 10559 Berlin", description: "Major hospital near central Berlin", descriptionAr: "مستشفى كبير قرب وسط برلين" },
      { name: "Berlin Tourist Police", nameAr: "شرطة السياحة برلين", type: "tourist_police" as const, phone: "+49 30 466 40", country: "Germany", city: "Berlin", address: "Platz der Luftbrucke 6, 12101 Berlin", description: "Tourist police helpline", descriptionAr: "خط مساعدة شرطة السياحة" },

      // ═══════════════════════════════════════════
      // 🇬🇧 UK - LONDON
      // ═══════════════════════════════════════════
      { name: "Embassy of Algeria", nameAr: "سفارة الجزائر", type: "embassy" as const, phone: "+44 20 7589 6885", country: "United Kingdom", city: "London", address: "1-3 Riding House Street, London W1W 7DR", description: "Embassy of Algeria in London", descriptionAr: "سفارة الجزائر في لندن" },
      { name: "Embassy of Morocco", nameAr: "سفارة المغرب", type: "embassy" as const, phone: "+44 20 7581 5001", country: "United Kingdom", city: "London", address: "49 Queen's Gate Gardens, London SW7 5NE", description: "Embassy of Morocco in London", descriptionAr: "سفارة المغرب في لندن" },
      { name: "Embassy of Tunisia", nameAr: "سفارة تونس", type: "embassy" as const, phone: "+44 20 7584 8117", country: "United Kingdom", city: "London", address: "29 Prince's Gate, London SW7 1QG", description: "Embassy of Tunisia in London", descriptionAr: "سفارة تونس في لندن" },
      { name: "Embassy of Egypt", nameAr: "سفارة مصر", type: "embassy" as const, phone: "+44 20 7235 9777", country: "United Kingdom", city: "London", address: "26 South Street, London W1K 1DW", description: "Embassy of Egypt in London", descriptionAr: "سفارة مصر في لندن" },
      { name: "Embassy of Lebanon", nameAr: "سفارة لبنان", type: "embassy" as const, phone: "+44 20 7229 7265", country: "United Kingdom", city: "London", address: "21 Kensington Palace Gardens, London W8 4QN", description: "Embassy of Lebanon in London", descriptionAr: "سفارة لبنان في لندن" },
      { name: "Embassy of Saudi Arabia", nameAr: "سفارة السعودية", type: "embassy" as const, phone: "+44 20 7917 3000", country: "United Kingdom", city: "London", address: "Curzon Street, London W1J 7TU", description: "Embassy of Saudi Arabia in London", descriptionAr: "سفارة السعودية في لندن" },
      { name: "Embassy of UAE", nameAr: "سفارة الإمارات", type: "embassy" as const, phone: "+44 20 7581 1281", country: "United Kingdom", city: "London", address: "1-2 Grosvenor Crescent, London SW1X 7EE", description: "Embassy of UAE in London", descriptionAr: "سفارة الإمارات في لندن" },
      { name: "Embassy of Iraq", nameAr: "سفارة العراق", type: "embassy" as const, phone: "+44 20 7590 9200", country: "United Kingdom", city: "London", address: "3 Elvaston Place, London SW7 5QH", description: "Embassy of Iraq in London", descriptionAr: "سفارة العراق في لندن" },
      { name: "Embassy of Jordan", nameAr: "سفارة الأردن", type: "embassy" as const, phone: "+44 20 7937 3685", country: "United Kingdom", city: "London", address: "6 Upper Phillipsore Gardens, London W8 7HB", description: "Embassy of Jordan in London", descriptionAr: "سفارة الأردن في لندن" },
      { name: "Embassy of Palestine", nameAr: "سفارة فلسطين", type: "embassy" as const, phone: "+44 20 7074 9666", country: "United Kingdom", city: "London", address: "5-7 Galena Road, London W6 0LT", description: "Embassy of Palestine in London", descriptionAr: "سفارة فلسطين في لندن" },
      { name: "Embassy of Qatar", nameAr: "سفارة قطر", type: "embassy" as const, phone: "+44 20 7493 2200", country: "United Kingdom", city: "London", address: "1 South Audley Street, London W1K 1NB", description: "Embassy of Qatar in London", descriptionAr: "سفارة قطر في لندن" },
      { name: "Embassy of Kuwait", nameAr: "سفارة الكويت", type: "embassy" as const, phone: "+44 20 7590 3400", country: "United Kingdom", city: "London", address: "2 Albert Gate, London SW1X 7JU", description: "Embassy of Kuwait in London", descriptionAr: "سفارة الكويت في لندن" },
      { name: "Embassy of Libya", nameAr: "سفارة ليبيا", type: "embassy" as const, phone: "+44 20 7201 8280", country: "United Kingdom", city: "London", address: "15 Knightsbridge, London SW1X 7LY", description: "Embassy of Libya in London", descriptionAr: "سفارة ليبيا في لندن" },
      { name: "Embassy of Sudan", nameAr: "سفارة السودان", type: "embassy" as const, phone: "+44 20 7835 8087", country: "United Kingdom", city: "London", address: "3 Cleveland Row, London SW1A 1DD", description: "Embassy of Sudan in London", descriptionAr: "سفارة السودان في لندن" },
      { name: "Embassy of Yemen", nameAr: "سفارة اليمن", type: "embassy" as const, phone: "+44 20 7584 6607", country: "United Kingdom", city: "London", address: "57 Cromwell Road, London SW7 2ED", description: "Embassy of Yemen in London", descriptionAr: "سفارة اليمن في لندن" },
      { name: "Embassy of Oman", nameAr: "سفارة عمان", type: "embassy" as const, phone: "+44 20 7225 0001", country: "United Kingdom", city: "London", address: "167 Queen's Gate, London SW7 5HE", description: "Embassy of Oman in London", descriptionAr: "سفارة عمان في لندن" },
      // Emergency - London
      { name: "Metropolitan Police", nameAr: "شرطة لندن", type: "police" as const, phone: "999", country: "United Kingdom", city: "London", description: "Emergency police/fire/ambulance", descriptionAr: "طوارئ الشرطة/المطافئ/الإسعاف" },
      { name: "NHS (Medical Emergency)", nameAr: "الصحة الوطنية", type: "hospital" as const, phone: "111", country: "United Kingdom", city: "London", description: "Non-emergency medical advice", descriptionAr: "استشارات طبية غير طارئة" },
      { name: "St Thomas' Hospital", nameAr: "مستشفى سانت توماس", type: "hospital" as const, phone: "+44 20 7188 7188", country: "United Kingdom", city: "London", address: "Westminster Bridge Road, London SE1 7EH", description: "Major NHS hospital", descriptionAr: "مستشفى الصحة الوطنية الكبير" },
      { name: "Royal London Hospital", nameAr: "مستشفى لندن الملكي", type: "hospital" as const, phone: "+44 20 3594 1888", country: "United Kingdom", city: "London", address: "Whitechapel Road, London E1 1FR", description: "Major trauma centre", descriptionAr: "مركز الصدمات الكبرى" },
      { name: "Guy's Hospital", nameAr: "مستشفى جايز", type: "hospital" as const, phone: "+44 20 7188 7188", country: "United Kingdom", city: "London", address: "Great Maze Pond, London SE1 9RT", description: "Teaching hospital", descriptionAr: "مستشفى تعليمي" },
      { name: "Samaritans (Crisis Line)", nameAr: "خط الأمان (أزمات)", type: "hospital" as const, phone: "116 123", country: "United Kingdom", city: "London", description: "24/7 crisis support helpline", descriptionAr: "خط مساندة الأزمات 24/7" },

      // ═══════════════════════════════════════════
      // 🇳🇱 NETHERLANDS - AMSTERDAM
      // ═══════════════════════════════════════════
      { name: "Embassy of Morocco", nameAr: "سفارة المغرب", type: "embassy" as const, phone: "+31 70 368 4684", country: "Netherlands", city: "Amsterdam", address: "Amaliastraat 2, 2514 JC The Hague", description: "Embassy of Morocco", descriptionAr: "سفارة المغرب" },
      { name: "Embassy of Algeria", nameAr: "سفارة الجزائر", type: "embassy" as const, phone: "+31 70 306 5500", country: "Netherlands", city: "Amsterdam", address: "Stationsweg 117, 2515 BS The Hague", description: "Embassy of Algeria", descriptionAr: "سفارة الجزائر" },
      { name: "Embassy of Egypt", nameAr: "سفارة مصر", type: "embassy" as const, phone: "+31 70 354 2000", country: "Netherlands", city: "Amsterdam", address: "Badhuisweg 92, 2587 CL The Hague", description: "Embassy of Egypt", descriptionAr: "سفارة مصر" },
      { name: "Embassy of Tunisia", nameAr: "سفارة تونس", type: "embassy" as const, phone: "+31 70 354 6540", country: "Netherlands", city: "Amsterdam", address: "Carnegielaan 7, 2517 KH The Hague", description: "Embassy of Tunisia", descriptionAr: "سفارة تونس" },
      { name: "Embassy of UAE", nameAr: "سفارة الإمارات", type: "embassy" as const, phone: "+31 70 310 8206", country: "Netherlands", city: "Amsterdam", address: "Molenstraat 10, 2513 BL The Hague", description: "Embassy of UAE", descriptionAr: "سفارة الإمارات" },
      // Emergency - Amsterdam
      { name: "Politie (Police)", nameAr: "الشرطة", type: "police" as const, phone: "112", country: "Netherlands", city: "Amsterdam", description: "General emergency number", descriptionAr: "رقم الطوارئ العام" },
      { name: "Academic Medical Center", nameAr: "المركز الطبي الأكاديمي", type: "hospital" as const, phone: "+31 20 566 9111", country: "Netherlands", city: "Amsterdam", address: "Meibergdreef 9, 1105 AZ Amsterdam", description: "Major university hospital", descriptionAr: "مستشفى جامعي كبير" },

      // ═══════════════════════════════════════════
      // 🇪🇸 SPAIN - MADRID & BARCELONA
      // ═══════════════════════════════════════════
      { name: "Embassy of Morocco", nameAr: "سفارة المغرب", type: "embassy" as const, phone: "+34 91 562 9490", country: "Spain", city: "Madrid", address: "Calle de Serrano 179, 28002 Madrid", description: "Embassy of Morocco in Madrid", descriptionAr: "سفارة المغرب في مدريد" },
      { name: "Embassy of Algeria", nameAr: "سفارة الجزائر", type: "embassy" as const, phone: "+34 91 745 9393", country: "Spain", city: "Madrid", address: "Calle de Princesa 81, 28008 Madrid", description: "Embassy of Algeria in Madrid", descriptionAr: "سفارة الجزائر في مدريد" },
      { name: "Embassy of Egypt", nameAr: "سفارة مصر", type: "embassy" as const, phone: "+34 91 308 0800", country: "Spain", city: "Madrid", address: "Calle de Serrano 174, 28002 Madrid", description: "Embassy of Egypt in Madrid", descriptionAr: "سفارة مصر في مدريد" },
      { name: "Embassy of Tunisia", nameAr: "سفارة تونس", type: "embassy" as const, phone: "+34 91 303 0490", country: "Spain", city: "Madrid", address: "Pl. de la Republica Dominicana 3, 28016 Madrid", description: "Embassy of Tunisia in Madrid", descriptionAr: "سفارة تونس في مدريد" },
      { name: "Consulate of Morocco - Barcelona", nameAr: "قنصلية المغرب - برشلونة", type: "embassy" as const, phone: "+34 93 272 1414", country: "Spain", city: "Barcelona", address: "Passeig de la Bonanova 56, 08017 Barcelona", description: "Consulate General of Morocco", descriptionAr: "القنصلية العامة للمملكة المغربية" },
      // Emergency - Madrid
      { name: "Policia Nacional", nameAr: "الشرطة الوطنية", type: "police" as const, phone: "091", country: "Spain", city: "Madrid", description: "National police emergency", descriptionAr: "طوارئ الشرطة الوطنية" },
      { name: "Guardia Civil", nameAr: "الحرس المدني", type: "police" as const, phone: "062", country: "Spain", city: "Madrid", description: "Civil Guard emergency", descriptionAr: "طوارئ الحرس المدني" },
      { name: "Emergencias", nameAr: "الطوارئ", type: "fire" as const, phone: "112", country: "Spain", city: "Madrid", description: "All emergencies", descriptionAr: "جميع حالات الطوارئ" },
      { name: "Hospital General Universitario Gregorio Maranon", nameAr: "مستشفى غريغوريو مارانيون", type: "hospital" as const, phone: "+34 91 586 8000", country: "Spain", city: "Madrid", address: "Calle del Dr. Esquerdo 46, 28007 Madrid", description: "Major public hospital", descriptionAr: "مستشفى عام كبير" },
      { name: "Hospital Clinic Barcelona", nameAr: "مستشفى كلينيك برشلونة", type: "hospital" as const, phone: "+34 93 227 5400", country: "Spain", city: "Barcelona", address: "Carrer de Villarroel 170, 08036 Barcelona", description: "Major public hospital Barcelona", descriptionAr: "مستشفى عام كبير برشلونة" },

      // ═══════════════════════════════════════════
      // 🇮🇹 ITALY - ROME & MILAN
      // ═══════════════════════════════════════════
      { name: "Embassy of Morocco", nameAr: "سفارة المغرب", type: "embassy" as const, phone: "+39 06 324 4611", country: "Italy", city: "Rome", address: "Via Lovanio 5, 00198 Roma", description: "Embassy of Morocco in Rome", descriptionAr: "سفارة المغرب في روما" },
      { name: "Embassy of Algeria", nameAr: "سفارة الجزائر", type: "embassy" as const, phone: "+39 06 323 3640", country: "Italy", city: "Rome", address: "Via Bartolomeo Eustachio 12, 00161 Roma", description: "Embassy of Algeria in Rome", descriptionAr: "سفارة الجزائر في روما" },
      { name: "Embassy of Egypt", nameAr: "سفارة مصر", type: "embassy" as const, phone: "+39 06 833 9601", country: "Italy", city: "Rome", address: "Via Salaria 267, 00199 Roma", description: "Embassy of Egypt in Rome", descriptionAr: "سفارة مصر في روما" },
      { name: "Embassy of Tunisia", nameAr: "سفارة تونس", type: "embassy" as const, phone: "+39 06 841 4386", country: "Italy", city: "Rome", address: "Via G. Acerbi 30, 00197 Roma", description: "Embassy of Tunisia in Rome", descriptionAr: "سفارة تونس في روما" },
      { name: "Embassy of Lebanon", nameAr: "سفارة لبنان", type: "embassy" as const, phone: "+39 06 322 6104", country: "Italy", city: "Rome", address: "Via G. Marchi 3, 00198 Roma", description: "Embassy of Lebanon in Rome", descriptionAr: "سفارة لبنان في روما" },
      { name: "Embassy of Iraq", nameAr: "سفارة العراق", type: "embassy" as const, phone: "+39 06 8621 3783", country: "Italy", city: "Rome", address: "Via della Camilluccia 355, 00135 Roma", description: "Embassy of Iraq in Rome", descriptionAr: "سفارة العراق في روما" },
      { name: "Consulate of Morocco - Milan", nameAr: "قنصلية المغرب - ميلان", type: "embassy" as const, phone: "+39 02 463 341", country: "Italy", city: "Milan", address: "Via dei Giardini 4, 20122 Milano", description: "Consulate of Morocco in Milan", descriptionAr: "قنصلية المغرب في ميلان" },
      // Emergency - Rome
      { name: "Polizia di Stato", nameAr: "شرطة الدولة", type: "police" as const, phone: "113", country: "Italy", city: "Rome", description: "State police emergency", descriptionAr: "طوارئ الشرطة" },
      { name: "Carabinieri", nameAr: "الدرك", type: "police" as const, phone: "112", country: "Italy", city: "Rome", description: "Military police emergency", descriptionAr: "طوارئ الدرك العسكري" },
      { name: "Emergenza Sanitaria", nameAr: "الطوارئ الصحية", type: "hospital" as const, phone: "118", country: "Italy", city: "Rome", description: "Medical emergency", descriptionAr: "الطوارئ الطبية" },
      { name: "Policlinico Umberto I", nameAr: "مستشفى أمبرتو الأول", type: "hospital" as const, phone: "+39 06 4997 1", country: "Italy", city: "Rome", address: "Viale del Policlinico 155, 00161 Roma", description: "Rome's largest public hospital", descriptionAr: "أكبر مستشفى عام في روما" },

      // ═══════════════════════════════════════════
      // 🇧🇪 BELGIUM - BRUSSELS
      // ═══════════════════════════════════════════
      { name: "Embassy of Morocco", nameAr: "سفارة المغرب", type: "embassy" as const, phone: "+32 2 343 6760", country: "Belgium", city: "Brussels", address: "Avenue de l'Armee 29, 1040 Brussels", description: "Embassy of Morocco in Brussels", descriptionAr: "سفارة المغرب في بروكسل" },
      { name: "Embassy of Algeria", nameAr: "سفارة الجزائر", type: "embassy" as const, phone: "+32 2 661 1160", country: "Belgium", city: "Brussels", address: "Rue G. Stocq 22, 1050 Brussels", description: "Embassy of Algeria in Brussels", descriptionAr: "سفارة الجزائر في بروكسل" },
      { name: "Embassy of Tunisia", nameAr: "سفارة تونس", type: "embassy" as const, phone: "+32 2 343 0880", country: "Belgium", city: "Brussels", address: "Avenue Franklin Roosevelt 45, 1050 Brussels", description: "Embassy of Tunisia in Brussels", descriptionAr: "سفارة تونس في بروكسل" },
      { name: "Embassy of Egypt", nameAr: "سفارة مصر", type: "embassy" as const, phone: "+32 2 675 8588", country: "Belgium", city: "Brussels", address: "Avenue de l'Uruguay 19, 1000 Brussels", description: "Embassy of Egypt in Brussels", descriptionAr: "سفارة مصر في بروكسل" },
      { name: "Embassy of Lebanon", nameAr: "سفارة لبنان", type: "embassy" as const, phone: "+32 2 375 5780", country: "Belgium", city: "Brussels", address: "Rue G. Stocq 20, 1050 Brussels", description: "Embassy of Lebanon in Brussels", descriptionAr: "سفارة لبنان في بروكسل" },
      { name: "Embassy of Saudi Arabia", nameAr: "سفارة السعودية", type: "embassy" as const, phone: "+32 2 533 7788", country: "Belgium", city: "Brussels", address: "Avenue de Tervuren 475, 1150 Brussels", description: "Embassy of Saudi Arabia in Brussels", descriptionAr: "سفارة السعودية في بروكسل" },
      { name: "Embassy of UAE", nameAr: "سفارة الإمارات", type: "embassy" as const, phone: "+32 2 648 4500", country: "Belgium", city: "Brussels", address: "Rue Montoyer 123, 1000 Brussels", description: "Embassy of UAE in Brussels", descriptionAr: "سفارة الإمارات في بروكسل" },
      { name: "Embassy of Qatar", nameAr: "سفارة قطر", type: "embassy" as const, phone: "+32 2 289 3900", country: "Belgium", city: "Brussels", address: "Avenue Franklin Roosevelt 65, 1050 Brussels", description: "Embassy of Qatar in Brussels", descriptionAr: "سفارة قطر في بروكسل" },
      { name: "Embassy of Iraq", nameAr: "سفارة العراق", type: "embassy" as const, phone: "+32 2 660 2955", country: "Belgium", city: "Brussels", address: "Rue des Vignobles 38, 1150 Brussels", description: "Embassy of Iraq in Brussels", descriptionAr: "سفارة العراق في بروكسل" },
      { name: "Embassy of Palestine", nameAr: "سفارة فلسطين", type: "embassy" as const, phone: "+32 2 734 2140", country: "Belgium", city: "Brussels", address: "Rue des Deux Eglises 83, 1000 Brussels", description: "Embassy of Palestine in Brussels", descriptionAr: "سفارة فلسطين في بروكسل" },
      // Emergency - Brussels
      { name: "Police/Police Federal", nameAr: "الشرطة الفيدرالية", type: "police" as const, phone: "101", country: "Belgium", city: "Brussels", description: "Police emergency", descriptionAr: "طوارئ الشرطة" },
      { name: "Aide Medicale Urgente", nameAr: "المساعدة الطبية العاجلة", type: "hospital" as const, phone: "112", country: "Belgium", city: "Brussels", description: "All emergencies", descriptionAr: "جميع حالات الطوارئ" },

      // ═══════════════════════════════════════════
      // 🇸🇪 SWEDEN - STOCKHOLM
      // ═══════════════════════════════════════════
      { name: "Embassy of Morocco", nameAr: "سفارة المغرب", type: "embassy" as const, phone: "+46 8 669 9390", country: "Sweden", city: "Stockholm", address: "Ostermalmsgatan 36, 114 26 Stockholm", description: "Embassy of Morocco in Stockholm", descriptionAr: "سفارة المغرب في ستوكهولم" },
      { name: "Embassy of Algeria", nameAr: "سفارة الجزائر", type: "embassy" as const, phone: "+46 8 24 18 20", country: "Sweden", city: "Stockholm", address: "Sandhamnsgatan 30, 115 28 Stockholm", description: "Embassy of Algeria in Stockholm", descriptionAr: "سفارة الجزائر في ستوكهولم" },
      { name: "Embassy of Egypt", nameAr: "سفارة مصر", type: "embassy" as const, phone: "+46 8 23 08 00", country: "Sweden", city: "Stockholm", address: "Strandvagen 35, 114 56 Stockholm", description: "Embassy of Egypt in Stockholm", descriptionAr: "سفارة مصر في ستوكهولم" },
      // Emergency - Stockholm
      { name: "Polisen (Police)", nameAr: "الشرطة", type: "police" as const, phone: "112", country: "Sweden", city: "Stockholm", description: "All emergencies", descriptionAr: "جميع حالات الطوارئ" },
      { name: "Karolinska Universitetssjukhuset", nameAr: "مستشفى كارولينسكا", type: "hospital" as const, phone: "+46 8 517 700 00", country: "Sweden", city: "Stockholm", address: "171 76 Solna, Stockholm", description: "Sweden's premier university hospital", descriptionAr: "أفضل مستشفى جامعي في السويد" },

      // ═══════════════════════════════════════════
      // 🇩🇰 DENMARK - COPENHAGEN
      // ═══════════════════════════════════════════
      { name: "Embassy of Morocco", nameAr: "سفارة المغرب", type: "embassy" as const, phone: "+45 39 62 11 12", country: "Denmark", city: "Copenhagen", address: "Rosbaeksvej 18, 2100 Kobenhavn O", description: "Embassy of Morocco in Copenhagen", descriptionAr: "سفارة المغرب في كوبنهاغن" },
      { name: "Embassy of Egypt", nameAr: "سفارة مصر", type: "embassy" as const, phone: "+45 39 62 02 22", country: "Denmark", city: "Copenhagen", address: "Kastelsvej 25, 2100 Kobenhavn O", description: "Embassy of Egypt in Copenhagen", descriptionAr: "سفارة مصر في كوبنهاغن" },
      // Emergency - Copenhagen
      { name: "Politi (Police)", nameAr: "الشرطة", type: "police" as const, phone: "112", country: "Denmark", city: "Copenhagen", description: "All emergencies", descriptionAr: "جميع حالات الطوارئ" },
      { name: "Rigshospitalet", nameAr: "مستشفى ريجز", type: "hospital" as const, phone: "+45 35 45 35 45", country: "Denmark", city: "Copenhagen", address: "Blegdamsvej 9, 2100 Kobenhavn", description: "Denmark's largest hospital", descriptionAr: "أكبر مستشفى في الدنمارك" },

      // ═══════════════════════════════════════════
      // 🇦🇹 AUSTRIA - VIENNA
      // ═══════════════════════════════════════════
      { name: "Embassy of Morocco", nameAr: "سفارة المغرب", type: "embassy" as const, phone: "+43 1 712 2222", country: "Austria", city: "Vienna", address: "Hochenstaufengasse 2, 1010 Wien", description: "Embassy of Morocco in Vienna", descriptionAr: "سفارة المغرب في فيينا" },
      { name: "Embassy of Algeria", nameAr: "سفارة الجزائر", type: "embassy" as const, phone: "+43 1 713 05 81", country: "Austria", city: "Vienna", address: "Khevenhullerstrasse 5, 1130 Wien", description: "Embassy of Algeria in Vienna", descriptionAr: "سفارة الجزائر في فيينا" },
      { name: "Embassy of Egypt", nameAr: "سفارة مصر", type: "embassy" as const, phone: "+43 1 713 18 51", country: "Austria", city: "Vienna", address: "Hochenstaufengasse 6, 1010 Wien", description: "Embassy of Egypt in Vienna", descriptionAr: "سفارة مصر في فيينا" },
      // Emergency - Vienna
      { name: "Polizei (Police)", nameAr: "الشرطة", type: "police" as const, phone: "133", country: "Austria", city: "Vienna", description: "Police emergency", descriptionAr: "طوارئ الشرطة" },
      { name: "Rettung (Ambulance)", nameAr: "الإسعاف", type: "fire" as const, phone: "144", country: "Austria", city: "Vienna", description: "Ambulance emergency", descriptionAr: "طوارئ الإسعاف" },
      { name: "Feuerwehr (Fire)", nameAr: "المطافئ", type: "fire" as const, phone: "122", country: "Austria", city: "Vienna", description: "Fire emergency", descriptionAr: "طوارئ المطافئ" },
      { name: "AKH Wien", nameAr: "مستشفى فيينا العام", type: "hospital" as const, phone: "+43 1 404 00", country: "Austria", city: "Vienna", address: "Wahringer Gurtel 18-20, 1090 Wien", description: "Vienna General Hospital", descriptionAr: "المستشفى العام في فيينا" },

      // ═══════════════════════════════════════════
      // 🇨🇭 SWITZERLAND - ZURICH
      // ═══════════════════════════════════════════
      { name: "Embassy of Algeria", nameAr: "سفارة الجزائر", type: "embassy" as const, phone: "+41 31 351 0551", country: "Switzerland", city: "Zurich", address: "Thunstrasse 66, 3005 Bern", description: "Embassy of Algeria in Bern", descriptionAr: "سفارة الجزائر في برن" },
      { name: "Embassy of Morocco", nameAr: "سفارة المغرب", type: "embassy" as const, phone: "+41 31 352 0555", country: "Switzerland", city: "Zurich", address: "Elfenstrasse 6, 3006 Bern", description: "Embassy of Morocco in Bern", descriptionAr: "سفارة المغرب في برن" },
      { name: "Embassy of Egypt", nameAr: "سفارة مصر", type: "embassy" as const, phone: "+41 31 352 0180", country: "Switzerland", city: "Zurich", address: "Elfenauweg 61, 3006 Bern", description: "Embassy of Egypt in Bern", descriptionAr: "سفارة مصر في برن" },
      // Emergency - Zurich
      { name: "Polizei (Police)", nameAr: "الشرطة", type: "police" as const, phone: "117", country: "Switzerland", city: "Zurich", description: "Police emergency", descriptionAr: "طوارئ الشرطة" },
      { name: "Sanitat (Ambulance)", nameAr: "الإسعاف", type: "hospital" as const, phone: "144", country: "Switzerland", city: "Zurich", description: "Ambulance emergency", descriptionAr: "طوارئ الإسعاف" },
      { name: "Feuerwehr (Fire)", nameAr: "المطافئ", type: "fire" as const, phone: "118", country: "Switzerland", city: "Zurich", description: "Fire emergency", descriptionAr: "طوارئ المطافئ" },
      { name: "Universitatsspital Zurich", nameAr: "مستشفى زيورخ الجامعي", type: "hospital" as const, phone: "+41 44 255 11 11", country: "Switzerland", city: "Zurich", address: "Ramistrasse 100, 8091 Zurich", description: "University Hospital Zurich", descriptionAr: "المستشفى الجامعي في زيورخ" },

      // ═══════════════════════════════════════════
      // 🇳🇴 NORWAY - OSLO
      // ═══════════════════════════════════════════
      { name: "Embassy of Morocco", nameAr: "سفارة المغرب", type: "embassy" as const, phone: "+47 22 55 35 38", country: "Norway", city: "Oslo", address: " Oscars gate 78, 0258 Oslo", description: "Embassy of Morocco in Oslo", descriptionAr: "سفارة المغرب في أوسلو" },
      { name: "Embassy of Egypt", nameAr: "سفارة مصر", type: "embassy" as const, phone: "+47 22 55 70 35", country: "Norway", city: "Oslo", address: "Drammensveien 90A, 0271 Oslo", description: "Embassy of Egypt in Oslo", descriptionAr: "سفارة مصر في أوسلو" },
      // Emergency - Oslo
      { name: "Politi (Police)", nameAr: "الشرطة", type: "police" as const, phone: "112", country: "Norway", city: "Oslo", description: "All emergencies", descriptionAr: "جميع حالات الطوارئ" },
      { name: "Oslo Universitetssykehus", nameAr: "مستشفى أوسلو الجامعي", type: "hospital" as const, phone: "+47 23 01 80 00", country: "Norway", city: "Oslo", address: "Kirkeveien 166, 0450 Oslo", description: "Oslo University Hospital", descriptionAr: "مستشفى أوسلو الجامعي" },

      // ═══════════════════════════════════════════
      // 🇫🇮 FINLAND - HELSINKI
      // ═══════════════════════════════════════════
      { name: "Embassy of Morocco", nameAr: "سفارة المغرب", type: "embassy" as const, phone: "+358 9 681 1420", country: "Finland", city: "Helsinki", address: "Unioninkatu 14 B, 00130 Helsinki", description: "Embassy of Morocco in Helsinki", descriptionAr: "سفارة المغرب في هلسنكي" },
      // Emergency - Helsinki
      { name: "Poliisi (Police)", nameAr: "الشرطة", type: "police" as const, phone: "112", country: "Finland", city: "Helsinki", description: "All emergencies", descriptionAr: "جميع حالات الطوارئ" },

      // ═══════════════════════════════════════════
      // 🇬🇷 GREECE - ATHENS
      // ═══════════════════════════════════════════
      { name: "Embassy of Egypt", nameAr: "سفارة مصر", type: "embassy" as const, phone: "+30 210 363 1680", country: "Greece", city: "Athens", address: "3, Vassilissis Sophias Avenue, 10674 Athens", description: "Embassy of Egypt in Athens", descriptionAr: "سفارة مصر في أثينا" },
      { name: "Embassy of Algeria", nameAr: "سفارة الجزائر", type: "embassy" as const, phone: "+30 210 681 9632", country: "Greece", city: "Athens", address: "14, Vassilissis Olgas Avenue, 10557 Athens", description: "Embassy of Algeria in Athens", descriptionAr: "سفارة الجزائر في أثينا" },
      // Emergency - Athens
      { name: "Astynomia (Police)", nameAr: "الشرطة", type: "police" as const, phone: "100", country: "Greece", city: "Athens", description: "Police emergency", descriptionAr: "طوارئ الشرطة" },
      { name: "Ethniki Odiki Ypiresia", nameAr: "الطوارئ", type: "hospital" as const, phone: "166", country: "Greece", city: "Athens", description: "Ambulance emergency", descriptionAr: "طوارئ الإسعاف" },

      // ═══════════════════════════════════════════
      // 🇹🇷 TURKEY - ISTANBUL
      // ═══════════════════════════════════════════
      { name: "Embassy of Saudi Arabia", nameAr: "سفارة السعودية", type: "embassy" as const, phone: "+90 212 515 0000", country: "Turkey", city: "Istanbul", address: "Tepebasi, Mesrutiyet Cad. No: 47, 34430 Istanbul", description: "Consulate General of Saudi Arabia", descriptionAr: "القنصلية العامة للسعودية" },
      { name: "Embassy of Egypt", nameAr: "سفارة مصر", type: "embassy" as const, phone: "+90 212 336 1288", country: "Turkey", city: "Istanbul", address: "Askoc Apt, Cumhuriyet Cad. No: 22, 34367 Istanbul", description: "Consulate General of Egypt", descriptionAr: "القنصلية العامة لمصر" },
      // Emergency - Istanbul
      { name: "Polis (Police)", nameAr: "الشرطة", type: "police" as const, phone: "155", country: "Turkey", city: "Istanbul", description: "Police emergency", descriptionAr: "طوارئ الشرطة" },
      { name: "Ambulans (Ambulance)", nameAr: "الإسعاف", type: "hospital" as const, phone: "112", country: "Turkey", city: "Istanbul", description: "All emergencies", descriptionAr: "جميع حالات الطوارئ" },

      // ═══════════════════════════════════════════
      // 🇵🇹 PORTUGAL - LISBON
      // ═══════════════════════════════════════════
      { name: "Embassy of Morocco", nameAr: "سفارة المغرب", type: "embassy" as const, phone: "+351 21 390 8210", country: "Portugal", city: "Lisbon", address: "Rua Alto do Duque 21, 1400-009 Lisbon", description: "Embassy of Morocco in Lisbon", descriptionAr: "سفارة المغرب في لشبونة" },
      // Emergency - Lisbon
      { name: "Policia (Police)", nameAr: "الشرطة", type: "police" as const, phone: "112", country: "Portugal", city: "Lisbon", description: "All emergencies", descriptionAr: "جميع حالات الطوارئ" },

      // ═══════════════════════════════════════════
      // 🇮🇪 IRELAND - DUBLIN
      // ═══════════════════════════════════════════
      { name: "Embassy of Egypt", nameAr: "سفارة مصر", type: "embassy" as const, phone: "+353 1 668 4622", country: "Ireland", city: "Dublin", address: "12 Clyde Road, Ballsbridge, Dublin 4", description: "Embassy of Egypt in Dublin", descriptionAr: "سفارة مصر في دبلن" },
      { name: "Embassy of Saudi Arabia", nameAr: "سفارة السعودية", type: "embassy" as const, phone: "+353 1 492 0700", country: "Ireland", city: "Dublin", address: "12 Fitzwilliam Square East, Dublin 2", description: "Embassy of Saudi Arabia in Dublin", descriptionAr: "سفارة السعودية في دبلن" },
      // Emergency - Dublin
      { name: "Garda (Police)", nameAr: "الشرطة", type: "police" as const, phone: "999 / 112", country: "Ireland", city: "Dublin", description: "Emergency services", descriptionAr: "خدمات الطوارئ" },

      // ═══════════════════════════════════════════
      // 🇨🇿 CZECH REPUBLIC - PRAGUE
      // ═══════════════════════════════════════════
      { name: "Embassy of Egypt", nameAr: "سفارة مصر", type: "embassy" as const, phone: "+420 234 043 800", country: "Czech Republic", city: "Prague", address: "Na Zatorce 18, 160 00 Prague 6", description: "Embassy of Egypt in Prague", descriptionAr: "سفارة مصر في براغ" },
      { name: "Embassy of Morocco", nameAr: "سفارة المغرب", type: "embassy" as const, phone: "+420 257 318 612", country: "Czech Republic", city: "Prague", address: "Hradcanske namesti 4, 118 00 Prague 1", description: "Embassy of Morocco in Prague", descriptionAr: "سفارة المغرب في براغ" },
      // Emergency - Prague
      { name: "Policie (Police)", nameAr: "الشرطة", type: "police" as const, phone: "158", country: "Czech Republic", city: "Prague", description: "Police emergency", descriptionAr: "طوارئ الشرطة" },
      { name: "Zachranka (Ambulance)", nameAr: "الإسعاف", type: "hospital" as const, phone: "155", country: "Czech Republic", city: "Prague", description: "Ambulance emergency", descriptionAr: "طوارئ الإسعاف" },

      // ═══════════════════════════════════════════
      // 🇭🇺 HUNGARY - BUDAPEST
      // ═══════════════════════════════════════════
      { name: "Embassy of Egypt", nameAr: "سفارة مصر", type: "embassy" as const, phone: "+36 1 344 4800", country: "Hungary", city: "Budapest", address: "Stefania ut 47/b, 1143 Budapest", description: "Embassy of Egypt in Budapest", descriptionAr: "سفارة مصر في بودابست" },
      { name: "Embassy of Morocco", nameAr: "سفارة المغرب", type: "embassy" as const, phone: "+36 1 201 9082", country: "Hungary", city: "Budapest", address: "Dubrovniki utca 44, 1125 Budapest", description: "Embassy of Morocco in Budapest", descriptionAr: "سفارة المغرب في بودابست" },
      // Emergency - Budapest
      { name: "Rendorseg (Police)", nameAr: "الشرطة", type: "police" as const, phone: "107", country: "Hungary", city: "Budapest", description: "Police emergency", descriptionAr: "طوارئ الشرطة" },
      { name: "Mentok (Ambulance)", nameAr: "الإسعاف", type: "hospital" as const, phone: "104", country: "Hungary", city: "Budapest", description: "Ambulance emergency", descriptionAr: "طوارئ الإسعاف" },

      // ═══════════════════════════════════════════
      // 🇷🇴 ROMANIA - BUCHAREST
      // ═══════════════════════════════════════════
      { name: "Embassy of Egypt", nameAr: "سفارة مصر", type: "embassy" as const, phone: "+40 21 212 0150", country: "Romania", city: "Bucharest", address: "Bulevardul Dacia 47, 010162 Bucharest", description: "Embassy of Egypt in Bucharest", descriptionAr: "سفارة مصر في بوخارست" },
      { name: "Embassy of Morocco", nameAr: "سفارة المغرب", type: "embassy" as const, phone: "+40 21 211 1992", country: "Romania", city: "Bucharest", address: "Strada Orlando 10, 014641 Bucharest", description: "Embassy of Morocco in Bucharest", descriptionAr: "سفارة المغرب في بوخارست" },
      // Emergency - Bucharest
      { name: "Politia (Police)", nameAr: "الشرطة", type: "police" as const, phone: "112", country: "Romania", city: "Bucharest", description: "All emergencies", descriptionAr: "جميع حالات الطوارئ" },

      // ═══════════════════════════════════════════
      // 🇵🇱 POLAND - WARSAW
      // ═══════════════════════════════════════════
      { name: "Embassy of Egypt", nameAr: "سفارة مصر", type: "embassy" as const, phone: "+48 22 616 8800", country: "Poland", city: "Warsaw", address: "Al. Ujazdowskie 33/35, 00-540 Warsaw", description: "Embassy of Egypt in Warsaw", descriptionAr: "سفارة مصر في وارسو" },
      { name: "Embassy of Morocco", nameAr: "سفارة المغرب", type: "embassy" as const, phone: "+48 22 646 7575", country: "Poland", city: "Warsaw", address: "Dolna 25, 00-773 Warsaw", description: "Embassy of Morocco in Warsaw", descriptionAr: "سفارة المغرب في وارسو" },
      // Emergency - Warsaw
      { name: "Policja (Police)", nameAr: "الشرطة", type: "police" as const, phone: "997", country: "Poland", city: "Warsaw", description: "Police emergency", descriptionAr: "طوارئ الشرطة" },
      { name: "Pogotowie (Ambulance)", nameAr: "الإسعاف", type: "hospital" as const, phone: "999", country: "Poland", city: "Warsaw", description: "Ambulance emergency", descriptionAr: "طوارئ الإسعاف" },

      // ═══════════════════════════════════════════
      // 🇭🇷 CROATIA - ZAGREB
      // ═══════════════════════════════════════════
      { name: "Embassy of Egypt", nameAr: "سفارة مصر", type: "embassy" as const, phone: "+385 1 4677 330", country: "Croatia", city: "Zagreb", address: "Rokov perivoj 20, 10000 Zagreb", description: "Embassy of Egypt in Zagreb", descriptionAr: "سفارة مصر في زغرب" },
      // Emergency - Zagreb
      { name: "Policija (Police)", nameAr: "الشرطة", type: "police" as const, phone: "192", country: "Croatia", city: "Zagreb", description: "Police emergency", descriptionAr: "طوارئ الشرطة" },

      // ═══════════════════════════════════════════
      // 🇸🇰 SLOVAKIA - BRATISLAVA
      // ═══════════════════════════════════════════
      { name: "Embassy of Egypt", nameAr: "سفارة مصر", type: "embassy" as const, phone: "+421 2 5443 1967", country: "Slovakia", city: "Bratislava", address: "Hlboka 7, 811 03 Bratislava", description: "Embassy of Egypt in Bratislava", descriptionAr: "سفارة مصر في براتيسلافا" },

      // ═══════════════════════════════════════════
      // 🇷🇸 SERBIA - BELGRADE
      // ═══════════════════════════════════════════
      { name: "Embassy of Egypt", nameAr: "سفارة مصر", type: "embassy" as const, phone: "+381 11 3671 876", country: "Serbia", city: "Belgrade", address: "Bulevar Oslobodjenja 23, 11000 Belgrade", description: "Embassy of Egypt in Belgrade", descriptionAr: "سفارة مصر في بلغراد" },

      // ═══════════════════════════════════════════
      // 🇧🇬 BULGARIA - SOFIA
      // ═══════════════════════════════════════════
      { name: "Embassy of Egypt", nameAr: "سفارة مصر", type: "embassy" as const, phone: "+359 2 946 1093", country: "Bulgaria", city: "Sofia", address: "Ul. Sheinovo 16, 1504 Sofia", description: "Embassy of Egypt in Sofia", descriptionAr: "سفارة مصر في صوفيا" },

      // ═══════════════════════════════════════════
      // 🇲🇹 MALTA - VALLETTA
      // ═══════════════════════════════════════════
      { name: "Embassy of Egypt", nameAr: "سفارة مصر", type: "embassy" as const, phone: "+356 2133 1874", country: "Malta", city: "Valletta", address: "Villa Maurizia, Ta' Xbiex Terrace, Ta' Xbiex XBX 1032", description: "Embassy of Egypt in Malta", descriptionAr: "سفارة مصر في مالطا" },

      // ═══════════════════════════════════════════
      // 🇨🇾 CYPRUS - NICOSIA
      // ═══════════════════════════════════════════
      { name: "Embassy of Egypt", nameAr: "سفارة مصر", type: "embassy" as const, phone: "+357 22 590 100", country: "Cyprus", city: "Nicosia", address: "4, Zenonos Sozou Street, 1075 Nicosia", description: "Embassy of Egypt in Nicosia", descriptionAr: "سفارة مصر في نيقوسيا" },

      // ═══════════════════════════════════════════
      // 🇱🇺 LUXEMBOURG
      // ═══════════════════════════════════════════
      { name: "Embassy of Morocco", nameAr: "سفارة المغرب", type: "embassy" as const, phone: "+352 22 00 31", country: "Luxembourg", city: "Luxembourg City", address: "6, Rue Philippe II, 2340 Luxembourg", description: "Embassy of Morocco in Luxembourg", descriptionAr: "سفارة المغرب في لوكسمبورغ" },

      // ═══════════════════════════════════════════
      // 🇪🇪 ESTONIA - TALLINN
      // ═══════════════════════════════════════════
      { name: "Embassy of Egypt (Non-resident)", nameAr: "سفارة مصر (غير مقيمة)", type: "embassy" as const, phone: "+372 630 6300", country: "Estonia", city: "Tallinn", address: " represented by Helsinki", description: "Non-resident embassy - contact Helsinki", descriptionAr: "سفارة غير مقيمة - اتصل بهلسنكي" },

      // ═══════════════════════════════════════════
      // 🇱🇻 LATVIA - RIGA
      // ═══════════════════════════════════════════
      { name: "Embassy of Egypt (Non-resident)", nameAr: "سفارة مصر (غير مقيمة)", type: "embassy" as const, phone: "+371 676 117 40", country: "Latvia", city: "Riga", address: " represented by Stockholm", description: "Non-resident embassy - contact Stockholm", descriptionAr: "سفارة غير مقيمة - اتصل بستوكهولم" },

      // ═══════════════════════════════════════════
      // 🇱🇹 LITHUANIA - VILNIUS
      // ═══════════════════════════════════════════
      { name: "Embassy of Egypt (Non-resident)", nameAr: "سفارة مصر (غير مقيمة)", type: "embassy" as const, phone: "+370 5 219 3700", country: "Lithuania", city: "Vilnius", address: " represented by Warsaw", description: "Non-resident embassy - contact Warsaw", descriptionAr: "سفارة غير مقيمة - اتصل بوارسو" },

      // ═══════════════════════════════════════════
      // 🇸🇮 SLOVENIA - LJUBLJANA
      // ═══════════════════════════════════════════
      { name: "Embassy of Egypt (Non-resident)", nameAr: "سفارة مصر (غير مقيمة)", type: "embassy" as const, phone: "+386 1 200 8950", country: "Slovenia", city: "Ljubljana", address: " represented by Vienna", description: "Non-resident embassy - contact Vienna", descriptionAr: "سفارة غير مقيمة - اتصل بفيينا" },

      // ═══════════════════════════════════════════
      // 🇧🇦 BOSNIA - SARAJEVO
      // ═══════════════════════════════════════════
      { name: "Embassy of Egypt", nameAr: "سفارة مصر", type: "embassy" as const, phone: "+387 33 219 700", country: "Bosnia and Herzegovina", city: "Sarajevo", address: "Alipasina 80, 71000 Sarajevo", description: "Embassy of Egypt in Sarajevo", descriptionAr: "سفارة مصر في سراييفو" },

      // ═══════════════════════════════════════════
      // 🇦🇱 ALBANIA - TIRANA
      // ═══════════════════════════════════════════
      { name: "Embassy of Egypt", nameAr: "سفارة مصر", type: "embassy" as const, phone: "+355 4 228 1150", country: "Albania", city: "Tirana", address: "Rruga e Elbasanit, 1020 Tirana", description: "Embassy of Egypt in Tirana", descriptionAr: "سفارة مصر في تيرانا" },

      // ═══════════════════════════════════════════
      // 🇲🇰 NORTH MACEDONIA - SKOPJE
      // ═══════════════════════════════════════════
      { name: "Embassy of Egypt", nameAr: "سفارة مصر", type: "embassy" as const, phone: "+389 2 310 7700", country: "North Macedonia", city: "Skopje", address: "Ul. Naum Naumovski Borce 6b, 1000 Skopje", description: "Embassy of Egypt in Skopje", descriptionAr: "سفارة مصر في سكوبي" },

      // ═══════════════════════════════════════════
      // 🇲🇩 MOLDOVA - CHISINAU
      // ═══════════════════════════════════════════
      { name: "Embassy of Egypt (Non-resident)", nameAr: "سفارة مصر (غير مقيمة)", type: "embassy" as const, phone: "+373 22 211 115", country: "Moldova", city: "Chisinau", address: " represented by Bucharest", description: "Non-resident embassy - contact Bucharest", descriptionAr: "سفارة غير مقيمة - اتصل ببوخارست" },

      // ═══════════════════════════════════════════
      // 🇺🇦 UKRAINE - KYIV
      // ═══════════════════════════════════════════
      { name: "Embassy of Egypt", nameAr: "سفارة مصر", type: "embassy" as const, phone: "+380 44 490 0101", country: "Ukraine", city: "Kyiv", address: "Observatorny Lane 17, 01901 Kyiv", description: "Embassy of Egypt in Kyiv", descriptionAr: "سفارة مصر في كييف" },
      { name: "Embassy of Morocco", nameAr: "سفارة المغرب", type: "embassy" as const, phone: "+380 44 490 0102", country: "Ukraine", city: "Kyiv", address: "Saksahanskoho St. 60, 01033 Kyiv", description: "Embassy of Morocco in Kyiv", descriptionAr: "سفارة المغرب في كييف" },
      // Emergency - Kyiv
      { name: "Politsiya (Police)", nameAr: "الشرطة", type: "police" as const, phone: "102", country: "Ukraine", city: "Kyiv", description: "Police emergency", descriptionAr: "طوارئ الشرطة" },

      // ═══════════════════════════════════════════
      // 🇲🇨 MONACO
      // ═══════════════════════════════════════════
      { name: "Embassy of Morocco", nameAr: "سفارة المغرب", type: "embassy" as const, phone: "+377 93 50 17 27", country: "Monaco", city: "Monaco", address: "7, Rue Bellevue, 98000 Monaco", description: "Embassy of Morocco in Monaco", descriptionAr: "سفارة المغرب في موناكو" },

      // ═══════════════════════════════════════════
      // 🇮🇸 ICELAND - REYKJAVIK
      // ═══════════════════════════════════════════
      { name: "Embassy of Egypt (Non-resident)", nameAr: "سفارة مصر (غير مقيمة)", type: "embassy" as const, phone: "+354 510 7500", country: "Iceland", city: "Reykjavik", address: " represented by Oslo", description: "Non-resident embassy - contact Oslo", descriptionAr: "سفارة غير مقيمة - اتصل بأوسلو" },
    ];

    // Clear existing and insert
    try {
      await db.delete(emergencyContacts);
    } catch (e) {
      // table might not exist yet
    }

    let inserted = 0;
    for (const contact of emergencyData) {
      await db.insert(emergencyContacts).values({
        ...contact,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      inserted++;
    }

    return { success: true, inserted, total: emergencyData.length };
  }),
});
