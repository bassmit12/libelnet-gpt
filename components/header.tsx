import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme-toggle";
import Image from "next/image";

export function Header() {
  return (
    <header className="border-b sticky top-0 bg-background/95 dark:bg-gray-900/95 dark:border-gray-800 backdrop-blur-sm z-10">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between max-w-screen-2xl">
        <div className="flex items-center gap-2">
          <Image
            src="https://www.libelnet.nl/templates/libelnet/images/libelnet-maasbree-logo.png"
            alt="LibelNet Logo"
            className="h-10 w-auto"
            width={240}
            height={240}
          />
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />

          <div className="hidden md:block">
            <Button className="bg-libelnet-blue hover:bg-libelnet-blue/90 text-white dark:bg-libelnet-blue/80 dark:hover:bg-libelnet-blue">
              Employee Login
            </Button>
          </div>

          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-700 dark:text-gray-300"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="dark:bg-gray-900 dark:border-gray-800"
            >
              <div className="flex flex-col gap-4 mt-8">
                <Button className="w-full bg-libelnet-blue hover:bg-libelnet-blue/90 text-white dark:bg-libelnet-blue/80 dark:hover:bg-libelnet-blue">
                  Employee Login
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
