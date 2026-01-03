import type { Route } from "./+types/test";

export async function loader({ params }: Route.LoaderArgs) {
  return { slug: params.slug };
}

// ------------------------------------------------------------------
// Main Route Component
// ------------------------------------------------------------------
export default function TestRoute({ loaderData }: Route.ComponentProps) {
  return (
    <div className="flex h-screen flex-col bg-gray-50 p-4">
      {loaderData.slug}
    </div>
  );
}
