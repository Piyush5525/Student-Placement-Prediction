import { RouterProvider } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "@/lib/query-client";
import { ThemeProvider } from "@/providers/theme-provider";
import { MotionProvider } from "@/providers/motion-provider";
import { AuthProvider } from "@/context/auth-context";
import { router } from "./router";

/**
 * Provider composition order matters:
 *  1. QueryClientProvider — server-state cache, outermost since nothing
 *     below should ever render without it available.
 *  2. ThemeProvider — stamps data-theme on <html> before first paint logic
 *     that depends on it (e.g. MotionProvider reading computed styles).
 *  3. MotionProvider — depends on the reduced-motion hook, which is theme-
 *     store-adjacent but independent of ThemeProvider; ordered after Theme
 *     purely for readability, not a hard dependency.
 *  4. AuthProvider — validates any persisted token against the real
 *     backend (GET /auth/me) before the route tree renders, so a stale
 *     token can't let ProtectedRoute through. Placed innermost-but-one so
 *     it can still sit above RouterProvider (routes read auth state).
 *  5. RouterProvider — innermost, renders the actual route tree.
 */
export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <MotionProvider>
          <AuthProvider>
            <RouterProvider router={router} />
          </AuthProvider>
        </MotionProvider>
      </ThemeProvider>
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
