import createProxy from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createProxy(routing);

export const config = {
  // Skip API routes, Next internals, Vercel internals and static files.
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
