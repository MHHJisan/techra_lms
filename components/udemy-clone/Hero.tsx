// components/Hero.jsx
import Image from "next/image";
import Link from "next/link";

const Hero = () => {
  return (
    <section className="relative bg-gray-100 h-[30vh] flex items-center justify-center text-center overflow-hidden">
      <div className="relative h-full w-full z-0">
        <Image
          src="/techra.png" // ensure this file exists in the public directory
          alt="Hero Background"
          fill // replaces layout="fill"
          className="object-cover" // replaces objectFit="cover"
          sizes="100vw"
          priority // optional: preload above-the-fold
        />
      </div>

      <div className="max-w-3xl px-4">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-800">
          Learn Anytime, Anywhere
        </h1>
        <p className="text-lg text-gray-600 mt-4">
          Unlock your potential with expertly designed online courses.
        </p>
        <div className="mt-6">
          <Link href="/courses">
            <button className="px-6 py-3 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600">
              Explore Courses
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;
