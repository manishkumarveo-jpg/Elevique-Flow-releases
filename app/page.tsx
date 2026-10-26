import { Nav, Reveal } from '@/components/client';
import Cleanup from '@/components/Cleanup';
import Hero from '@/components/Hero';
import { Details, End, Faq, Footer, Languages, Meetings, Privacy, Start, Tour } from '@/components/Sections';
import Shortcuts from '@/components/Shortcuts';
import Styles from '@/components/Styles';
import Tone from '@/components/Tone';
import { Sprite } from '@/components/ui';

export default function Home() {
  return (
    <>
      <Sprite />
      <Nav />
      <main>
        <Hero />
        <Cleanup />
        <Styles />
        <Tone />
        <Shortcuts />
        <Languages />
        <Meetings />
        <Details />
        <Tour />
        <Privacy />
        <Start />
        <Faq />
        <End />
      </main>
      <Footer />
      <Reveal />
    </>
  );
}
