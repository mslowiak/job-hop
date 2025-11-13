import React from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { LogOut } from "lucide-react";
import { supabase } from "../../db/supabase.client";

interface UserMenuProps {
  user: any;
}

export const UserMenu: React.FC<UserMenuProps> = ({ user }) => {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/auth/login";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <span className="sr-only">Open user menu</span>
          <span className="text-sm font-medium">{user.email}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuItem className="flex-col items-start">
          <div className="text-sm font-medium">{user.email}</div>
          <div className="text-xs text-muted-foreground">{user.user_metadata?.full_name || "Użytkownik"}</div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Wyloguj się</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
