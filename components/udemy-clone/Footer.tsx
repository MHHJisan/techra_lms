// components/Footer.jsx
const Footer = () => {
  return (
    <footer className="py-6 bg-gray-800 text-gray-300 text-center md:pl-80">
      <p>&copy; 2022–{new Date().getFullYear()} Techra. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
