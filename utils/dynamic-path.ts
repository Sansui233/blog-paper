// Get all the Dynamic Routes in the app
// read .velite

export async function getDynamicPaths(): Promise<string[]> {
  const {posts} = await import("../.velite")
  const postPaths = posts.map((p) => `/posts/${p.slug}`);
  const categories = [...new Set(posts.map((p) => p.categories).filter(Boolean))];
  const categoryPaths = categories.map((c) => `/categories/${c}`);
  const tags = [...new Set(posts.flatMap((p) => p.tags || []))];
  const tagPaths = tags.map((t) => `/tags/${t}`);

  return [...postPaths, ...categoryPaths, ...tagPaths];
}