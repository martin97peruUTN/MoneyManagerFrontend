import { Link, useRouter } from '@tanstack/react-router'
import { LogOut, UserCircle } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import { Button } from '#/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import { Badge } from '#/components/ui/badge'
import { authClient, useAuth } from '#/lib/auth-client'

export function UserMenu() {
  const { user } = useAuth()
  const router = useRouter()
  if (!user) return null

  const initials = `${user.name?.[0] ?? user.email[0] ?? 'U'}`.toUpperCase()

  const handleSignOut = async () => {
    await authClient.signOut()
    await router.invalidate()
    await router.navigate({ to: '/login' })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-9 gap-2 px-2">
          <Avatar className="h-7 w-7">
            {user.image && <AvatarImage src={user.image} alt={user.name} />}
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <span className="hidden text-sm font-medium sm:inline">
            {user.name} {user.lastname}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col gap-1">
          <span>
            {user.name} {user.lastname}
          </span>
          <span className="text-xs font-normal text-muted-foreground">
            {user.email}
          </span>
          {user.role === 'admin' && (
            <Badge variant="secondary" className="mt-1 w-fit">
              Admin
            </Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/profile">
            <UserCircle className="mr-2 h-4 w-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => void handleSignOut()}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
