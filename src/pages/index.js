import Head from "next/head";
import Header from "@/components/sections/Header";
import Hero from "@/components/sections/Hero";
import BeforeAfter from "@/components/sections/BeforeAfter";
import TrustBar from "@/components/sections/TrustBar";
import AudienceSwitcher from "@/components/sections/AudienceSwitcher";
import HowItWorks from "@/components/sections/HowItWorks";
import ScopeSheet from "@/components/sections/ScopeSheet";
import WhereTheMoney from "@/components/sections/WhereTheMoney";
import CarePlans from "@/components/sections/CarePlans";
import UpgradeLadder from "@/components/sections/UpgradeLadder";
import Proof from "@/components/sections/Proof";
import FitNotFit from "@/components/sections/FitNotFit";
import FAQ from "@/components/sections/FAQ";
import Apply from "@/components/sections/Apply";
import CTA from "@/components/sections/CTA";
import Footer from "@/components/sections/Footer";

export default function Home() {
  return (
    <>
      <Head>
        <title>Nanolix — A professional website, built for you.</title>
        <meta
          name="description"
          content="No upfront design fee. Our team designs and builds your website page, helps you launch it, and gives you a clear handoff so the site is yours to keep."
        />
      </Head>
      <Header />
      <main>
        <Hero />
        <BeforeAfter />
        <TrustBar />
        <AudienceSwitcher />
        <HowItWorks />
        <ScopeSheet />
        <WhereTheMoney />
        <CarePlans />
        <UpgradeLadder />
        <Proof />
        <FitNotFit />
        <FAQ />
        <Apply />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
