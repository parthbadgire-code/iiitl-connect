"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@parthbadgire/ui/components/dropdown-menu";
import {
  Avatar,
  AvatarFallback,
} from "@parthbadgire/ui/components/avatar";
import { useSession, signOut } from "@/lib/auth-client";

export function Topbar() {
  const { data: session } = useSession();

  const handleSignOut = async () => {
    await signOut();
  };

  const initial = session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "U";

  return (
    <header className="flex h-14 items-center justify-between border-b border-zinc-800 bg-zinc-950 px-4">
      {/* Empty div for flexible spacing to push user nav to the right */}
      <div className="flex-1" />

      <div className="flex items-center gap-4">
        {session?.user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-full outline-none focus:ring-2 focus:ring-zinc-800">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{initial}</AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{session.user.name}</p>
                  <p className="text-xs leading-none text-zinc-400">
                    {session.user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleSignOut}
                className="text-destructive focus:bg-destructive focus:text-destructive-foreground cursor-pointer"
              >
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="h-8 w-8 rounded-full bg-zinc-800 animate-pulse" />
        )}
      </div>
    </header>
  );
}
