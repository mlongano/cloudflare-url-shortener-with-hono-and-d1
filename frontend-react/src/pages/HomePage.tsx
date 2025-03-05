import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";

export default function HomePage() {
  const features = [
    {
      title: "Easy to Use",
      icon: "🚀",
      description: "Our intuitive interface makes everything simple.",
    },
    {
      title: "Secure",
      icon: "🔒",
      description: "Your data is protected with the latest security measures.",
    },
    {
      title: "Fast",
      icon: "⚡",
      description: "Lightning fast performance for all your needs.",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <ModeToggle />
      <section className="text-center py-12">
        <h1 className="text-4xl font-bold  mb-4">Welcome to ShortIt</h1>
        <p className="text-xl mb-8">
          Your complete solution for shortening URLs and managing your links.
        </p>
        <div className="flex justify-center space-x-4">
          <Button asChild>
            <Link to="/login">Get Started</Link>
          </Button>
        </div>
      </section>

      <section className="py-12">
        <h2 className="text-3xl font-bold text-center mb-8">Our Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-accent  p-6 rounded-lg drop-shadow-lg text-center"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
