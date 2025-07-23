import Link from "next/link";

interface CardProps {
  name: string;
  additionalInfo: string;
  imageUrl?: string;
  imageAlt?: string;
  sunRequirement: number;
  waterRequirement: number;
  lastTimeWatered: string;
  lastTimeSunlit: string;
  linkHref?: string;
}

const Card: React.FC<CardProps> = ({
  name,
  additionalInfo,
  lastTimeWatered,
  lastTimeSunlit,
  waterRequirement,
  sunRequirement,
  imageUrl,
  imageAlt = "Card image",
  linkHref,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col max-w-sm mx-auto my-4 transform transition-transform duration-300 hover:scale-105 hover:shadow-xl">
      {imageUrl && (
        <div className="relative h-48 w-full">
          <img
            src={imageUrl}
            alt={imageAlt}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      )}

      {/* Card Content */}
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{name}</h3>
        <p className="text-gray-700 text-base flex-grow mb-4">
          {additionalInfo}
        </p>
        <p className="text-gray-700 text-base flex-grow mb-4">
          Water Requirement interval: {waterRequirement} days
        </p>
        <p className="text-gray-700 text-base flex-grow mb-4">
          Sun Requirement interval: {sunRequirement} days
        </p>
        <p className="text-gray-700 text-base flex-grow mb-4">
          Last Time Watered: {lastTimeWatered}
        </p>
        <p className="text-gray-700 text-base flex-grow mb-4">
          Last Time Sunlit: {lastTimeSunlit}
        </p>
        {/* Call-to-Action Link (optional) */}
        {linkHref && (
          <Link
            href={linkHref}
            className="inline-block bg-green-500 text-white font-medium py-2 px-4 rounded-lg text-center transition-colors duration-200 self-start"
          >
            Edit
          </Link>
        )}
      </div>
    </div>
  );
};

export default async function PlantsPage() {
  const res = await fetch("https://dummyjson.com/recipes");
  const recipes = await res.json();
  return (
    <main className="flex-1 p-8">
      <h2 className="text-3xl font-bold text-white mb-6 text-center">
        All the plants
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.recipes.map((recipe) => (
          <Card
            key={recipe.id}
            name={recipe.name}
            additionalInfo={recipe.instructions}
            waterRequirement={2}
            sunRequirement={2}
            lastTimeWatered={new Date().toDateString()}
            lastTimeSunlit={new Date().toDateString()}
            imageUrl={`https://placehold.co/400x200/black/ffffff?text=${recipe.name}`}
            linkHref={`/plants/${recipe.id}`}
          />
        ))}
      </div>
    </main>
  );
}
