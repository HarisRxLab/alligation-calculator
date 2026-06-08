import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: RootComponent,
});

function RootComponent() {
  return (
    <QueryClientProvider client={Route.useRouteContext().queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}
