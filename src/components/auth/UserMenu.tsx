import React from "react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";

interface UserMenuProps {
  user: { id: string; email: string };
}

export const UserMenu: React.FC<UserMenuProps> = ({ user }) => {
  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });
      if (response.ok) {
        toast.success("Wylogowano pomyślnie");
        window.location.href = "/";
      } else {
        toast.error("Błąd podczas wylogowywania");
      }
    } catch (error) {
      toast.error("Błąd połączenia");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center space-x-2">
          <span className="truncate max-w-[120px] hidden sm:inline">{user.email}</span>
          {/* Add avatar or icon here if needed */}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem asChild>
          <a href="/account" className="w-full">
            Ustawienia Konta
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLogout} className="w-full">
          Wyloguj
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
