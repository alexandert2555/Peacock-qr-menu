import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MenuItem } from "@/data/menuData";

interface MenuCardProps {
  item: MenuItem;
  language: "en" | "cn";
}

const MenuCard = ({ item, language }: MenuCardProps) => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % item.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + item.images.length) % item.images.length);
  };

  const handleCardClick = () => {
    navigate(`/product/${item.id}`);
  };

  return (
    <Card 
      className="group overflow-hidden hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 bg-card cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="relative aspect-[3/2] overflow-hidden bg-muted">
        <img
          src={item.images[currentImageIndex]}
          alt={language === "en" ? item.nameEn : item.nameCn}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {item.images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              className="absolute left-1.5 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {item.images.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1 rounded-full transition-all ${
                    idx === currentImageIndex
                      ? "w-5 bg-primary"
                      : "w-1 bg-background/60"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="p-4 space-y-2.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="font-semibold text-base text-foreground leading-tight">
              {language === "en" ? item.nameEn : item.nameCn}
            </h3>
            {language === "en" && item.nameCn && (
              <p className="text-xs text-muted-foreground mt-0.5">{item.nameCn}</p>
            )}
            {language === "cn" && item.nameEn && (
              <p className="text-xs text-muted-foreground mt-0.5">{item.nameEn}</p>
            )}
          </div>
          <div className="flex-shrink-0">
            <span className="text-lg font-bold text-primary">£{item.price}</span>
          </div>
        </div>

        {(item.ingredientsEn || item.ingredientsCn) && (
          <p className="text-xs text-muted-foreground leading-relaxed">
            {language === "en" ? item.ingredientsEn : item.ingredientsCn}
          </p>
        )}
      </div>
    </Card>
  );
};

export default MenuCard;
