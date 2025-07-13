import { Container } from "./common/Container";

const newProducts: NewProductProps[] = [
  {
    title: "Get your card",
    description: "Set up a card to start using your funds",
    image: "/credit-card-pro.png",
  },
  {
    title: "Earn yield",
    description: "Get up to 3.15% APY",
    image: "/earn-yield.png",
  },
];

interface NewProductProps {
  title: string;
  description: string;
  image: string;
}

const NewProduct = ({ title, description, image }: NewProductProps) => {
  return (
    <div className="card-accent flex flex-1 justify-between">
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="flex flex-col justify-center">
          <img className="w-fit" src={image} alt={title} />
        </div>
        <div>
          <div className="text-base font-semibold">{title}</div>
          <div className="text-sm opacity-80">{description}</div>
        </div>
      </div>
      <div className="flex flex-col items-end justify-start md:justify-center">
        <div className="bg-secondary text-secondary-foreground min-w-[92px] rounded-md px-3 py-1.5 text-xs font-medium">
          Coming soon
        </div>
      </div>
    </div>
  );
};

export function NewProducts() {
  return (
    <div className="my-2 flex flex-col gap-2 md:flex-row">
      {newProducts.map((product) => (
        <NewProduct key={product.title} {...product} />
      ))}
    </div>
  );
}
