//import Image from "next/image";
import Link from "next/link";
import Dashboard from "./components/ToDos/dashboard";

export default function Home() {
  return (
    <div className="container mx-auto py-8">
      <Dashboard />
      
    </div>
  );
}
