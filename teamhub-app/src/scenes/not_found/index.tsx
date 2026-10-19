import { ButtonLink } from "../../components/ui/Button";
import { SjuMark } from "../../components/ui/misc";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 text-center">
      <SjuMark className="mb-8 w-16 opacity-90" />
      <h1 className="text-[32px] font-semibold">Page not found</h1>
      <p className="mt-2 max-w-sm text-muted">The page you're looking for doesn't exist or has moved.</p>
      <ButtonLink to="/" className="mt-6">
        Go to home
      </ButtonLink>
    </main>
  );
}
