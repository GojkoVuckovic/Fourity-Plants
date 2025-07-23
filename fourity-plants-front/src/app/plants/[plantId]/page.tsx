interface SinglePlantPageProps {
  params: {
    plantId: string;
  };
}

export default async function SinglePlantPage({
  params,
}: SinglePlantPageProps) {
  const { plantId } = await params;
  const res = await fetch(`https://dummyjson.com/recipes/${plantId}`);
  const recipe = await res.json();

  return <h1 className="text-4xl text-center font-bold">{recipe.name}</h1>;
}
