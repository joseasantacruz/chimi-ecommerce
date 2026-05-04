"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import { Search, X } from "lucide-react";
import type { OrderStatus } from "@prisma/client";

interface OrderFiltersProps {
  onFilter: (filters: {
    search: string;
    estado: string;
    from: string;
    to: string;
  }) => void;
}

export function OrderFilters({ onFilter }: OrderFiltersProps) {
  const [search, setSearch] = useState("");
  const [estado, setEstado] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const apply = () => onFilter({ search, estado, from, to });
  const clear = () => {
    setSearch(""); setEstado("all"); setFrom(""); setTo("");
    onFilter({ search: "", estado: "all", from: "", to: "" });
  };

  return (
    <div className="flex flex-wrap gap-3">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre o email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <Select value={estado} onValueChange={setEstado}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los estados</SelectItem>
          {Object.entries(ORDER_STATUS_LABELS).map(([key, label]) => (
            <SelectItem key={key} value={key}>{label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        type="date"
        value={from}
        onChange={(e) => setFrom(e.target.value)}
        className="w-[160px]"
        placeholder="Desde"
      />
      <Input
        type="date"
        value={to}
        onChange={(e) => setTo(e.target.value)}
        className="w-[160px]"
        placeholder="Hasta"
      />

      <Button onClick={apply}>Filtrar</Button>
      <Button variant="outline" onClick={clear}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
