"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";

interface EventSearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export function EventSearch({ onSearch, placeholder = "Search events..." }: EventSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch(value);
  };

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder={placeholder}
        value={searchQuery}
        onChange={handleChange}
        className="pl-9"
        aria-label="Search events"
      />
    </div>
  );
}

