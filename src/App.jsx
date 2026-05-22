import { useState } from "react";
import RunwayHero from "@/components/ui/hero";
import BrandStory from "@/components/ui/story-scroll";
import ShopTheLook from "@/components/ui/shuffle-grid";
import CollectionShowcase from "@/components/ui/animated-slideshow";
import Navbar from "@/components/ui/navbar";
import Footer from "@/components/ui/footer";
import Preloader from "@/components/ui/preloader";

// Show the cinematic preloader once per browser session. A within-session
// refresh skips straight to the site (assets are already warm in cache); a
// fresh visit gets the full logo + load-everything-first reveal.
const FIRST_VISIT =
  typeof window === "undefined" ||
  !window.sessionStorage.getItem("modrn-loaded");

function App() {
  const [ready, setReady] = useState(!FIRST_VISIT);

  const handleReveal = () => {
    try {
      window.sessionStorage.setItem("modrn-loaded", "1");
    } catch {
      /* private mode / storage disabled — non-fatal */
    }
    setReady(true);
  };

  return (
    <>
      {FIRST_VISIT && <Preloader onReveal={handleReveal} />}
      {ready && (
        <>
          <Navbar />
          <main>
            <RunwayHero />
            <BrandStory />
            <CollectionShowcase />
            <ShopTheLook />
          </main>
          <Footer text="MODRN" />
        </>
      )}
    </>
  );
}

export default App;
