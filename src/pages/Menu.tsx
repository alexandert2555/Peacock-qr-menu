import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Globe, ArrowLeft, Search } from "lucide-react";
import MenuCard from "@/components/MenuCard";
import { supabase } from "@/integrations/supabase/client";
import type { MenuItem } from "@/data/menuData";

const CATEGORY_ORDER: string[] = [
  "All",
  "Appetisers",
  "BBQ",
  "DimSum",
  "Cold-dressed",
  "Soup",
  "Meat",
  "Superior Luxurious",
  "Emperor's Seafood",
  "Global Seafood",
  "Tofu & Vegetables",
  "Rice & Noodles",
  "Desserts",
  "Beverages",
  "Other",
];

const Menu = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState<"en" | "cn">("en");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoriesList, setCategoriesList] = useState<{ en: string; cn: string }[]>([{ en: "All", cn: "全部" }]);
  const [showFilters, setShowFilters] = useState(true);
  const lastScrollY = useRef(0);

  const fetchMenuItems = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .eq("is_available", true)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Error fetching menu items:", error);
    } else if (data) {
      const transformedData: MenuItem[] = data.map((item) => ({
        id: item.id,
        categoryEn: item.category_en,
        categoryCn: item.category_cn,
        nameEn: item.name_en,
        nameCn: item.name_cn,
        price: Number(item.price),
        images: item.image_urls || ["/placeholder.svg"],
        ingredientsEn: item.ingredients_en || "",
        ingredientsCn: item.ingredients_cn || "",
      }));
      setMenuItems(transformedData);

      // Build dynamic categories from fetched items
      const uniqueMap = new Map<string, { en: string; cn: string }>();
      for (const item of transformedData) {
        if (!uniqueMap.has(item.categoryEn)) {
          uniqueMap.set(item.categoryEn, { en: item.categoryEn, cn: item.categoryCn });
        }
      }
      const unordered = Array.from(uniqueMap.values());
      const ordered = unordered.sort((a, b) => {
        const ai = CATEGORY_ORDER.indexOf(a.en);
        const bi = CATEGORY_ORDER.indexOf(b.en);
        if (ai !== -1 && bi !== -1) return ai - bi;
        if (ai !== -1) return -1;
        if (bi !== -1) return 1;
        return a.en.localeCompare(b.en);
      });
      setCategoriesList([{ en: "All", cn: "全部" }, ...ordered]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const savedLang = localStorage.getItem("selectedLanguage") as "en" | "cn" | null;
    if (savedLang) {
      setLanguage(savedLang);
    }
    fetchMenuItems();

    const handleScroll = () => {
      if (typeof window === "undefined") return;

      const currentScrollY = window.scrollY;
      const isMobile = window.innerWidth <= 768;

      if (!isMobile) {
        setShowFilters(true);
        lastScrollY.current = currentScrollY;
        return;
      }

      if (currentScrollY > lastScrollY.current && currentScrollY > 120) {
        setShowFilters(false);
      } else {
        setShowFilters(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [fetchMenuItems]);

  const toggleLanguage = () => {
    const newLang = language === "en" ? "cn" : "en";
    setLanguage(newLang);
    localStorage.setItem("selectedLanguage", newLang);
  };

  const filteredMenu = menuItems.filter((item) => {
    const matchesCategory =
      selectedCategory === "All" || item.categoryEn === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      item.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nameCn.includes(searchQuery) ||
      (item.ingredientsEn && item.ingredientsEn.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.ingredientsCn && item.ingredientsCn.includes(searchQuery));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="hover:bg-muted"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <div className="text-center">
              <img
                src="https://static.wixstatic.com/media/0f97bf_7a606b6e0a27475c8a3e4af0d40c70fb~mv2.png"
                alt="Company Logo"
                className="h-10 md:h-12 mx-auto object-contain"
              />
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={toggleLanguage}
              className="border-primary/20 hover:bg-primary/5"
            >
              <Globe className="h-5 w-5 text-primary" />
            </Button>
          </div>
        </div>
      </header>

      {/* Search and Category Filter */}
      <div
        className={`sticky top-[73px] z-40 bg-background/85 backdrop-blur-md border-b border-border shadow-sm transition-transform duration-300 md:translate-y-0 ${
          showFilters ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="container mx-auto px-4 py-3 space-y-3 md:space-y-4 md:py-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={language === "en" ? "Search menu items..." : "搜索菜品..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background"
            />
          </div>
          
          {/* Category Filter */}
          <div className="flex flex-wrap justify-center md:justify-start gap-2 pb-2">
            {categoriesList.map((cat) => (
              <Button
                key={cat.en}
                variant={selectedCategory === cat.en ? "default" : "outline"}
                onClick={() => setSelectedCategory(cat.en)}
                className={`flex-shrink-0 px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base rounded-full font-medium transition-all ${
                  selectedCategory === cat.en
                    ? "bg-primary hover:bg-primary/90 shadow-elegant"
                    : "hover:bg-muted"
                }`}
              >
                {language === "en" ? cat.en : cat.cn}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Grid */}
      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-20">
            <p className="text-xl text-muted-foreground">
              {language === "en" ? "Loading menu..." : "加载菜单..."}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 animate-fade-in">
              {filteredMenu.map((item) => (
                <MenuCard key={item.id} item={item} language={language} />
              ))}
            </div>

            {filteredMenu.length === 0 && !loading && (
              <div className="text-center py-20">
                <p className="text-xl text-muted-foreground">
                  {language === "en" 
                    ? searchQuery 
                      ? "No items match your search" 
                      : "No items found in this category"
                    : searchQuery
                      ? "没有找到匹配的菜品"
                      : "此类别中没有项目"}
                </p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-16">
        <div className="container mx-auto px-4 py-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Peacock London</h2>
          <p className="text-muted-foreground">
            {language === "en" 
              ? "Authentic Chinese Cuisine" 
              : "正宗中国菜"}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Menu;
