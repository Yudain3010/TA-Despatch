// components/Navbar.tsx
import Link from "next/link";
import { Button } from "../button";

export const Navbar = async () => {
  return (
    <div className="bg-zinc-100 dark:bg-zinc-900 py-2 border-b border-s-zinc-200 dark:border-s-zinc-700 fixed w-full z-10 top-0">
      <div className="container mx-auto flex items-center justify-between px-4">      
        <div className="container mx-auto flex items-center justify-start px-4">
          <Link href="/">Pengembangan dan Integrasi Sistem Web Pemantauan Oven Despatch dengan Penerapan Standar Industri</Link>
        </div>
        <div className="flex items-center gap-4">
        <Link href="/sign-in">
            <Button>Sign In</Button>
        </Link>
        </div>
      </div>
    </div>
  );
};