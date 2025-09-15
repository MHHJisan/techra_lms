import Image from "next/image";

// components/FeaturedCourses.jsx
const courses = [
  { title: "Web Development", price: "$49", image: "/img/course1.jpg" },
  { title: "Graphic Design", price: "$59", image: "/img/course2.jpg" },
  { title: "Data Science", price: "$69", image: "/img/course3.png" },
];

const FeaturedCourses = () => {
  return (
    <section className="py-16 bg-gray-50">
      <h2 className="text-center text-3xl font-bold mb-8">Featured Courses</h2>
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 px-4">
        {courses.map((course, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <Image
              src={course.image}
              alt={course.title}
              width={400}
              height={192}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="text-lg font-bold">{course.title}</h3>
              <p className="text-gray-600">{course.price}</p>
              <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600">
                Learn More
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturedCourses;
