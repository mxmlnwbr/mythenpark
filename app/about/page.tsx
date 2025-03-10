"use client"

import Image from "next/image";

export default function AboutUs() {
  return (
    <div className="min-h-screen">
      
      <div className="relative">

        {/* Content section - Scrollable */}
        <div className="w-full p-8 overflow-y-auto md:h-[calc(100vh-88px)]">

          <h1 className="text-4xl font-bold mb-4">ABOUT US</h1>

          <p className="mb-4">
            Der Mythenpark befindet sich, in einem sehr abwechslungsreichen Gelände, am Brünnelistock auf ca. 1400m ü. M., zentral und an bester Lage. Er liegt an einem Südhang, zwischen tief verschneiten Tannen und urtümlicher Landschaft mit Ausblick auf ein grandioses Panorama. Zugänglich ist der Park aus allen Richtungen.
          </p>
          <p className="mb-4">
            Was 1998 mit einer kleinen Freestyleszene begann, hat sich zu einem der beliebtesten Parks der Schweiz entwickelt. Anfänglich wurden kleine Contests für Locals organisiert, 2002 begann man sich mit dem Erstellen eines Parks zu befassen, was bis Heute immer witerentwickelt und verbessert hat. Seit Mitte 2005 besteht das Mythenpark-Team, welches anfänglich aus 9 Mitgliedern bestand. Im Januar 2006 hat sich das Team zu einem rechtskräftigen Verein zusammengeschlossen, welcher zur Zeit 13 Vollmitgleider und weitere Passivmitglieder zählt. Je nach dem arbeiten 1 bis 2 Personen unseres Vereins bei den Bergbahnen, wo sie unter anderem für die Parkpflege Verantwortlich sind. Alle weiteren Mitglieder arbeiten auf freiwilliger Basis und freuen sich immer, wenn auch mal enthusiastische Besucher mitanpacken. Der Verein "Mythenpark" hat sich zum Ziel gesetzt, einen neuen Freestyle-Resort in der Zentralschweiz noch weiter auszubauen.
          </p>
          <p className="mb-4">
            Das Parkterrain weist eine ideale Mischung zwischen steil und flach auf, wodurch man gute Voraussetzungen hat für abwechslungsreiche Lines. Ausserdem ist er vom normalen Pistennetz klar getrennt. Der Park umfasst rund 20-25 Obstacles in verschiedenen Schwierigkeitsgraden. Für alle die sich erst einmal an das Ganze herantasten möchten, wird eine Beginnerline erstellt. Wenn Einer nicht mehr kann, chillt er's am Parkende bei der 1291(Snow-)Bar und geniest seinen Pausentee. Dort befindet sich auch ein Imbissstand und ein grosses Selbstbedienungs-Restaurant. Während allen Anlässen sorgt ein DJ für gute Beats.
          </p>
          
          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 my-8">
            <div className="text-center">
              <div className="text-4xl font-bold">25</div>
              <div>Obstacles</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold">15</div>
              <div>Team Members</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold">7</div>
              <div>Events per year</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold">2300</div>
              <div>Working hours per year</div>
            </div>
          </div>
          
          {/* Travel Information */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Anreise</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-semibold mb-2">ÖV</h3>
                <p className="mb-2">Nach «Rickenbach SZ (Rotenfluebahn)».</p>
                <p className="mb-2">Danach mit der Gondel auf die Rothenflue. Von dort zum Grossenboden-Handgruobi Lift traversieren.</p>
                <p>Ticket nötig für 11 Liftanlagen/Mythenregion.</p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-2">Auto</h3>
                <p className="mb-2">Parkplatz bei Talstation Handgruobi, siehe Karte.</p>
                <p>Ticket nötig für 9 Liftanlagen/Teilgebiet Handgruobi.</p>
              </div>
            </div>
            
            <p className="mt-4">
              Ticketpreise, Webcams und Anlagenbericht auf <a href="https://www.mythenregion.ch" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">Mythenregion.ch</a>
            </p>
          </div>
          
          {/* Contact Information */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-2">Kontakt</h2>
            <p className="mb-1"><strong>Mail:</strong></p>
            <p><a href="mailto:info@mythenpark.ch" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">info@mythenpark.ch</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}
