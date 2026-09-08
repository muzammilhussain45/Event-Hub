import { Show, UserButton } from "@clerk/nextjs"
import Image from "next/image"
import Link from "next/link"
import { Button } from "../ui/button"

const Header = () => {
  return (
    <header className="w-full border-b">
      <div className="wrapper flex items-center justify-between">
        <Link href="/" className="w-36">
          <Image 
            src="/assets/images/logo.png" width={128} height={38}
            alt="EventHub logo"
            className="h-auto w-full"
            loading="eager"
          />
        </Link>

       <Show when="signed-in">
         
        </Show>

        <div className="flex w-32 justify-end gap-3">
          <Show when="signed-in">
            <UserButton />
          
          </Show>
          <Show when="signed-out">
            <Button asChild className="rounded-full" size="lg">
              <Link href="/sign-in">
                Login
              </Link>
            </Button>
          </Show>
        </div>
      </div>
    </header>
  )
}

export default Header