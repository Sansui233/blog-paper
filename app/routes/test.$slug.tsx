import { useEffect, useRef, useState } from "react";
import type { Route } from "./+types/test.$slug";


export async function loader({ params }: Route.LoaderArgs) {
  // get first post from velite db as example
  return {
    text: `This is a test route with slug: ${params.slug}`,
  };
}

export function meta({ loaderData }: Route.MetaArgs) {
  return [
    { title: `Test Route - ${loaderData.text}` },
    { name: "description", content: "This is a test route for demonstration purposes." },
  ];
}

export default function TestRoute({ loaderData }: Route.ComponentProps) {
  const [state, setState] = useState<number | null>(null);
  const divRef = useRef<HTMLDivElement>(null);

  // bind set state to state + 1 when scroll
  useEffect(() => {
    const onScroll = () => {
      setState((prev) => (prev === null ? 1 : prev + 1));
    };
    window.addEventListener("scroll", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
    }
  }, []);

  return (
    <div ref={divRef}>
      <h1>Test Route {new Date().toLocaleString()}</h1>

      <p>State: {state}</p>
      <button onClick={() => setState((prev) => (prev === null ? 1 : prev + 1))}>
        Increment State
      </button>
      {/* lorem example text */}
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
      </p>
    </div>
  );
}