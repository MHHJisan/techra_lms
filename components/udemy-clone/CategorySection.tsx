// components/CategorySection.jsx
import { FaBook, FaVideo, FaQuestionCircle } from "react-icons/fa";

const categories = [
  { icon: FaBook, title: "Courses", description: "Explore various courses" },
  { icon: FaVideo, title: "Videos", description: "Watch educational videos" },
  { icon: FaQuestionCircle, title: "Quizzes", description: "Test your skills" },
];

const CategorySection = () => {
  return (
    <section className="py-16 bg-white">
      <h2 className="text-center text-3xl font-bold mb-8">What We Offer</h2>
      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 px-4">
        {categories.map((category, index) => (
          <div
            key={index}
            className="p-6 bg-gray-100 rounded-lg shadow-md text-center"
          >
            <category.icon className="text-blue-500 text-4xl mx-auto mb-4" />
            <h3 className="text-xl font-bold">{category.title}</h3>
            <p className="text-gray-600 mt-2">{category.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CategorySection;
