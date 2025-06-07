import React from 'react';
import Header from '../components/Header.tsx';
import Footer from '../components/Footer.tsx';

const HomePage: React.FC = () => {
  return (
    <div className="u-body u-xl-mode">
      <Header />

      <section className="u-clearfix u-palette-5-dark-3 u-section-1" id="sec-2e20">
        <div className="u-clearfix u-sheet u-valign-bottom-lg u-valign-bottom-md u-valign-bottom-sm u-sheet-1">
          <div className="custom-expanded u-color-scheme-u11 u-color-style-multicolor-1 u-palette-2-base u-shape u-shape-rectangle u-shape-1"></div>
          <div className="data-layout-selected u-clearfix u-gutter-60 u-layout-spacing-vertical u-layout-wrap u-layout-wrap-1">
            <div className="u-gutter-0 u-layout">
              <div className="u-layout-row">

                {/* Left column */}
                <div className="u-size-30 u-size-60-md">
                  <div className="u-layout-col">
                    <div className="u-align-center u-container-align-center u-container-style u-layout-cell u-left-cell u-shape-rectangle u-size-40 u-white u-layout-cell-1">
                      <div className="u-container-layout u-container-layout-1">
                        <img
                          src="images/2.jpg"
                          alt="Treninzi za rekreativce"
                          className="custom-expanded u-image u-image-default u-image-1"
                        />
                      </div>
                    </div>

                    <div className="u-align-left u-container-align-left u-container-style u-layout-cell u-left-cell u-size-20 u-white u-layout-cell-2">
                      <div className="u-container-layout u-container-layout-2">
                        <h1 className="u-custom-font u-font-oswald u-text u-text-palette-2-base u-text-1">
                          Treninzi za rekreativce
                        </h1>
                        <div className="u-border-3 u-border-palette-2-base u-expanded-width u-line u-line-horizontal u-line-1"></div>
                        <p className="u-text u-text-2">
                          Za starije rekreativce ili takmičare koji žele unaprijediti igru, održati formu ili jednostavno uživati u kvalitetnom sparingu, nudim profesionalne sparing treninge. Bez obzira da li igrate rekreativno, u klupskim ligama, ili se vraćate na teren nakon pauze — sparing je idealan način da ostanete u ritmu, poradite na specifičnim udarcima i taktičkim elementima igre. Treninge u potpunosti prilagođavam vašim željama — tempo, tip igre, situacijski treninzi ili priprema za mečeve. Ako volite dinamične i izazovne mečeve bez pritiska, ovo je pravi izbor za vas.
                        </p>
                        <a
                          href="#"
                          className="u-border-2 u-border-palette-1-dark-1 u-btn u-btn-round u-button-style u-custom-font u-heading-font u-radius-3 u-btn-1"
                        >
                          Rezervišite termin
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right column */}
                <div className="u-size-30 u-size-60-md">
                  <div className="u-layout-col">
                    <div className="u-align-center u-container-align-center u-container-style u-layout-cell u-right-cell u-size-20 u-layout-cell-3">
                      <div className="u-container-layout u-container-layout-3">
                        <div className="custom-expanded u-color-scheme-u11 u-color-style-multicolor-1 u-container-style u-expanded-width-md u-expanded-width-sm u-group u-shape-rectangle u-white u-group-1">
                          <div className="u-container-layout u-container-layout-4">
                            <h3 className="u-text u-text-default u-text-3">Treninzi za mališane</h3>
                            <p className="u-text u-text-default u-text-4">
                              Kao privatni teniski trener, vjerujem da tenis djeci treba biti zanimljiv, zabavan i podsticajan. Na treninzima radimo na razvoju koordinacije, agilnosti i motoričkih sposobnosti, ali jednako tako njegujemo i važne životne vrijednosti poput discipline, upornosti i sportskog duha. Svakom djetetu pristupam individualno, uvažavajući njegov uzrast i nivo znanja, kako bi trening bio prilagođen njegovim potrebama i ciljevima. Bilo da je riječ o prvim koracima na terenu ili pripremama za takmičenja, pomoći ću vašem djetetu da zavoli tenis i razvije svoj puni potencijal.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="u-container-style u-layout-cell u-right-cell u-size-40 u-layout-cell-4">
                      <div className="u-container-layout u-container-layout-5">
                        <div className="u-align-left-xs u-color-scheme-u11 u-color-style-multicolor-1 u-expanded-height u-palette-2-base u-shape u-shape-rectangle u-shape-2"></div>
                        <img
                          src="images/djeca.jpg"
                          alt="Treninzi za mališane"
                          className="custom-expanded u-image u-image-2"
                        />
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
