import { NewIn, Panels, About, CatalogPreview } from "@/components/home/HomeSections";
import { Spotlight, Bestsellers } from "@/components/home/Showcase";

export default function Home() {
  return (
    <>
      <NewIn />
      <Panels />
      <About />
      <Spotlight />
      <Bestsellers />
      <CatalogPreview />
    </>
  );
}
