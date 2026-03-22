import Image from "next/image";
import Header from "./components/header";
import MenuSidebar from "./components/menu_sidebar";

export default function Home() {
  return (
   <>
   <Header />
   <MenuSidebar/>
   <main style={{ paddingTop: "64px", paddingLeft: "280px" }}>
   </main>
   </>
  );
}
