export interface MenuItem {
  id: string;
  categoryEn: string;
  categoryCn: string;
  nameEn: string;
  nameCn: string;
  price: number;
  images: string[];
  ingredientsEn?: string;
  ingredientsCn?: string;
}

export const menuData: MenuItem[] = [
  {
    id: "1",
    categoryEn: "Meat",
    categoryCn: "肉",
    nameEn: "Sweet and Sour Chicken",
    nameCn: "糖醋鸡",
    price: 10,
    images: ["/placeholder.svg"],
    ingredientsEn: "Chicken breast, bell peppers, pineapple, sweet and sour sauce",
    ingredientsCn: "鸡胸肉、甜椒、菠萝、糖醋酱",
  },
  {
    id: "2",
    categoryEn: "Rice",
    categoryCn: "米饭",
    nameEn: "Egg Fried Rice",
    nameCn: "蛋炒饭",
    price: 5,
    images: ["/placeholder.svg"],
    ingredientsEn: "Steamed rice, eggs, spring onions, soy sauce",
    ingredientsCn: "米饭、鸡蛋、葱、酱油",
  },
  {
    id: "3",
    categoryEn: "Meat",
    categoryCn: "肉",
    nameEn: "Beef Claypot",
    nameCn: "牛肉煲仔饭",
    price: 12,
    images: ["/placeholder.svg"],
    ingredientsEn: "Tender beef, rice, vegetables, claypot sauce",
    ingredientsCn: "嫩牛肉、米饭、蔬菜、煲仔酱",
  },
  {
    id: "4",
    categoryEn: "Meat",
    categoryCn: "肉",
    nameEn: "Szechuan Beef",
    nameCn: "四川牛肉",
    price: 15,
    images: ["/placeholder.svg"],
    ingredientsEn: "Beef strips, Szechuan peppers, dried chilies, garlic",
    ingredientsCn: "牛肉条、花椒、干辣椒、大蒜",
  },
  {
    id: "5",
    categoryEn: "Vegetables",
    categoryCn: "蔬菜",
    nameEn: "Mapo Tofu",
    nameCn: "麻婆豆腐",
    price: 12,
    images: ["/placeholder.svg"],
    ingredientsEn: "Soft tofu, minced pork, Szechuan peppers, chili bean paste",
    ingredientsCn: "嫩豆腐、猪肉末、花椒、豆瓣酱",
  },
  {
    id: "6",
    categoryEn: "Appetizers",
    categoryCn: "开胃菜",
    nameEn: "Chips",
    nameCn: "炸薯条",
    price: 8,
    images: ["/placeholder.svg"],
    ingredientsEn: "Potatoes, salt, seasoning",
    ingredientsCn: "土豆、盐、调味料",
  },
  {
    id: "7",
    categoryEn: "Meat",
    categoryCn: "肉",
    nameEn: "Lamb Shoulder with Cumin",
    nameCn: "羊肩肉",
    price: 18,
    images: ["/placeholder.svg"],
    ingredientsEn: "Lamb shoulder, cumin seeds, chili flakes, onions",
    ingredientsCn: "羊肩肉、孜然、辣椒片、洋葱",
  },
];

export const categories = [
  { en: "All", cn: "全部" },
  { en: "Meat", cn: "肉" },
  { en: "Vegetables", cn: "蔬菜" },
  { en: "Rice", cn: "米饭" },
  { en: "Appetizers", cn: "开胃菜" },
];
