import Image from "next/image";

export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <a target="_blank" href="https://www.instagram.com/mythenpark">
        <Image
          src="/Mythenpark-Logo.jpg"
          alt="Mythenpark logo"
          width={300}
          height={300}
        />
      </a>
    </div>
  );
}
