export async function load({ params }) {
  const project = await db.projects.get(params.id);
  return { project };
}
