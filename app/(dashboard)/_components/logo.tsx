import Image from "next/image";
export const Logo = () => {
  return (
    <Image
      height={120}
      width={160}
      alt="logo"
      src="/logo.svg"
      className="m-4"
    />
  );
};
