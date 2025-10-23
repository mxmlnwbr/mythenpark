"use client"

import Image from "next/image";
import { motion } from "framer-motion";

export default function AboutUs() {
  return (
    <>
    <div className="min-h-screen bg-gradient-to-b from-[#e5e9fd] to-white">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-4xl font-bold mb-4 text-magenta-600">ABOUT US</h1>

        <p className="mb-4 text-cyan-700">
          Der Mythenpark befindet sich, in einem sehr abwechslungsreichen Gelände, am Brünnelistock auf ca. 1400m ü. M., zentral und an bester Lage. Er liegt an einem Südhang, zwischen tief verschneiten Tannen und urtümlicher Landschaft mit Ausblick auf ein grandioses Panorama. Zugänglich ist der Park aus allen Richtungen.
        </p>
        <p className="mb-4 text-cyan-700">
          Was 1998 mit einer kleinen Freestyleszene begann, hat sich zu einem der beliebtesten Parks der Schweiz entwickelt. Anfänglich wurden kleine Contests für Locals organisiert, 2002 begann man sich mit dem Erstellen eines Parks zu befassen, was bis Heute immer witerentwickelt und verbessert hat. Seit Mitte 2005 besteht das Mythenpark-Team, welches anfänglich aus 9 Mitgliedern bestand. Im Januar 2006 hat sich das Team zu einem rechtskräftigen Verein zusammengeschlossen, welcher zur Zeit 13 Vollmitgleider und weitere Passivmitglieder zählt. Je nach dem arbeiten 1 bis 2 Personen unseres Vereins bei den Bergbahnen, wo sie unter anderem für die Parkpflege Verantwortlich sind. Alle weiteren Mitglieder arbeiten auf freiwilliger Basis und freuen sich immer, wenn auch mal enthusiastische Besucher mitanpacken. Der Verein "Mythenpark" hat sich zum Ziel gesetzt, einen neuen Freestyle-Resort in der Zentralschweiz noch weiter auszubauen.
        </p>
        <p className="mb-4 text-cyan-700">
          Das Parkterrain weist eine ideale Mischung zwischen steil und flach auf, wodurch man gute Voraussetzungen hat für abwechslungsreiche Lines. Ausserdem ist er vom normalen Pistennetz klar getrennt. Der Park umfasst rund 20-25 Obstacles in verschiedenen Schwierigkeitsgraden. Für alle die sich erst einmal an das Ganze herantasten möchten, wird eine Beginnerline erstellt. Wenn Einer nicht mehr kann, chillt er's am Parkende bei der 1291(Snow-)Bar und geniest seinen Pausentee. Dort befindet sich auch ein Imbissstand und ein grosses Selbstbedienungs-Restaurant. Während allen Anlässen sorgt ein DJ für gute Beats.
        </p>
        
        {/* Travel Information */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4 text-magenta-600">Anreise</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-cyan-200">
              <h3 className="text-xl font-semibold mb-2 text-cyan-600">ÖV</h3>
              <p className="mb-2 text-gray-700">Nach «Rickenbach SZ (Rotenfluebahn)».</p>
              <p className="mb-2 text-gray-700">Danach mit der Gondel auf die Rothenflue. Von dort zum Grossenboden-Handgruobi Lift traversieren.</p>
              <p className="text-gray-700">Ticket nötig für 11 Liftanlagen/Mythenregion.</p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-magenta-200">
              <h3 className="text-xl font-semibold mb-2 text-magenta-600">Auto</h3>
              <p className="mb-2 text-gray-700">Parkplatz bei Talstation Handgruobi, siehe Karte.</p>
              <p className="text-gray-700">Ticket nötig für 9 Liftanlagen/Teilgebiet Handgruobi.</p>
            </div>
          </div>
          
          <p className="mt-4 text-cyan-700">
            Ticketpreise, Webcams und Anlagenbericht auf <a href="https://www.mythenregion.ch" target="_blank" rel="noopener noreferrer" className="text-magenta-600 hover:text-magenta-700 font-semibold">Mythenregion.ch</a>
          </p>
        </div>
        
        {/* Contact Information */}
        <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-cyan-200">
          <h2 className="text-2xl font-bold mb-2 text-magenta-600">Kontakt</h2>
          <p className="mb-1 text-gray-700"><strong>Mail:</strong></p>
          <p><a href="mailto:info@mythenpark.ch" className="text-cyan-600 hover:text-cyan-700 font-semibold">info@mythenpark.ch</a></p>
        </div>
      </div>
    </div>
    
    {/* In Shape Since 1998 Section */}
    <div className="w-full bg-white py-16 lg:py-24 overflow-hidden mt-16">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-black text-[#e604ff] tracking-tight">
            IN SHAPE SINCE 1998
          </h2>
        </motion.div>
      </div>
    </div>
    </>
  );
}
