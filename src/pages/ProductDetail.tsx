import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, ArrowLeft, Globe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { MenuItem } from "@/data/menuData";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [language, setLanguage] = useState<"en" | "cn">("en");
  const [item, setItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const savedLang = localStorage.getItem("selectedLanguage") as "en" | "cn" | null;
    if (savedLang) {
      setLanguage(savedLang);
    }
    fetchMenuItem();
  }, [id]);

  const fetchMenuItem = async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching menu item:", error);
      setLoading(false);
      return;
    }

    if (data) {
      const transformedData: MenuItem = {
        id: data.id,
        categoryEn: data.category_en,
        categoryCn: data.category_cn,
        nameEn: data.name_en,
        nameCn: data.name_cn,
        price: Number(data.price),
        images: data.image_urls || ["/placeholder.svg"],
        ingredientsEn: data.ingredients_en || "",
        ingredientsCn: data.ingredients_cn || "",
      };
      setItem(transformedData);
    }
    setLoading(false);
  };

  const toggleLanguage = () => {
    const newLang = language === "en" ? "cn" : "en";
    setLanguage(newLang);
    localStorage.setItem("selectedLanguage", newLang);
  };

  const nextImage = () => {
    if (item) {
      setCurrentImageIndex((prev) => (prev + 1) % item.images.length);
    }
  };

  const prevImage = () => {
    if (item) {
      setCurrentImageIndex((prev) => (prev - 1 + item.images.length) % item.images.length);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-xl text-muted-foreground">
          {language === "en" ? "Loading..." : "加载中..."}
        </p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-xl text-muted-foreground">
            {language === "en" ? "Product not found" : "未找到产品"}
          </p>
          <Button onClick={() => navigate("/menu")}>
            {language === "en" ? "Back to Menu" : "返回菜单"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/menu")}
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

      {/* Product Detail Content */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <Card className="overflow-hidden bg-card">
              <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                <img
                  src={item.images[currentImageIndex]}
                  alt={language === "en" ? item.nameEn : item.nameCn}
                  className="w-full h-full object-cover"
                />
                
                {item.images.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/90 hover:bg-background backdrop-blur-sm"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/90 hover:bg-background backdrop-blur-sm"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </Button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {item.images.map((_, idx) => (
                        <div
                          key={idx}
                          className={`h-2 rounded-full transition-all ${
                            idx === currentImageIndex
                              ? "w-8 bg-primary"
                              : "w-2 bg-background/60"
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </Card>

            {/* Thumbnail Gallery */}
            {item.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {item.images.map((image, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`relative aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                      idx === currentImageIndex
                        ? "border-primary"
                        : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${language === "en" ? item.nameEn : item.nameCn} - ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            {/* Category Badge */}
            <div>
              <span className="inline-block px-3 py-1 text-sm font-medium bg-primary/10 text-primary rounded-full">
                {language === "en" ? item.categoryEn : item.categoryCn}
              </span>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                {language === "en" ? item.nameEn : item.nameCn}
              </h1>
              {(language === "en" ? item.nameCn : item.nameEn) && (
                <p className="text-xl text-muted-foreground">
                  {language === "en" ? item.nameCn : item.nameEn}
                </p>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2">
              <span className="text-4xl md:text-5xl font-bold text-primary">
                £{item.price.toFixed(2)}
              </span>
            </div>

            {/* Divider */}
            <div className="h-px bg-border" />

            {/* Ingredients/Description */}
            {(item.ingredientsEn || item.ingredientsCn) && (
              <div className="space-y-3">
                <h2 className="text-xl font-semibold text-foreground">
                  {language === "en" ? "Description" : "描述"}
                </h2>
                <p className="text-base text-muted-foreground leading-relaxed">
                  {language === "en" ? item.ingredientsEn : item.ingredientsCn}
                </p>
              </div>
            )}

            {/* Additional Info Section */}
            <Card className="p-6 bg-muted/30">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">
                    {language === "en" ? "Category" : "类别"}
                  </span>
                  <span className="text-sm text-foreground">
                    {language === "en" ? item.categoryEn : item.categoryCn}
                  </span>
                </div>
                <div className="h-px bg-border" />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">
                    {language === "en" ? "Price" : "价格"}
                  </span>
                  <span className="text-lg font-bold text-primary">
                    £{item.price.toFixed(2)}
                  </span>
                </div>
              </div>
            </Card>

            {/* Back Button */}
            <Button
              onClick={() => navigate("/menu")}
              className="w-full h-12 text-lg bg-primary hover:bg-primary/90"
            >
              {language === "en" ? "Back to Menu" : "返回菜单"}
            </Button>
          </div>
        </div>
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

export default ProductDetail;

