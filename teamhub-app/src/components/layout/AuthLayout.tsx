import type { ReactNode } from "react";
import seal from "../../assets/brand/sju-seal.png";
import { SjuMark } from "../ui/misc";

/** Split screen used by Login and Create Account. */
export default function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <section className="relative hidden overflow-hidden bg-crimson-deep text-white lg:flex lg:flex-col lg:justify-between lg:p-12">
        <img
          src={seal}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-40 -right-40 w-[560px] max-w-none opacity-[0.09] grayscale"
        />
        <div className="flex items-center gap-3">
          <SjuMark tone="white" className="w-11" />
          <span className="border-l border-white/30 pl-3 font-serif text-2xl font-semibold">TeamHub</span>
        </div>
        <div className="relative max-w-md">
          <p className="font-serif text-[40px] leading-[1.15] font-medium">
            Every Hawks club team, its schedule, and its people in one place.
          </p>
          <p className="mt-5 text-white/70">
            Coaches post updates, players check practice times, and fans follow along.
          </p>
        </div>
        <p className="relative text-sm text-white/50">Saint Joseph's University, Philadelphia</p>
      </section>

      <section className="flex flex-col items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <SjuMark className="w-10" />
            <span className="border-l border-line pl-3 font-serif text-2xl font-semibold">TeamHub</span>
          </div>
          <h1 className="text-[30px] font-semibold">{title}</h1>
          <p className="mt-1.5 text-muted">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </section>
    </div>
  );
}
