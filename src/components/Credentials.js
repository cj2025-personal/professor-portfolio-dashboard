import React from 'react';
import { Link } from 'react-scroll';
import credentials from '../content/credentials.json';

/*
 * The recognition that used to sit in 14px grey inside About, set as an ink
 * band straight after the startup section and ahead of About, whose full
 * statements it condenses. It is also the home page's one dark band, which
 * breaks the run of paper sections. It sits below the startup demo rather
 * than under the hero so the demo stays in the first view, where it
 * autoplays on load.
 *
 * The copy is bundled rather than fetched, so the band is in place on first
 * paint and the page does not shift when it would otherwise arrive. The
 * link below it leads to the full statements in About.
 */
export default function Credentials() {
  if (!credentials.items?.length) return null;
  return (
    <section className="credentials" aria-label={credentials.label}>
      <div className="ark-container">
        <ul className="credentials__list">
          {credentials.items.map((item) => (
            <li key={item.headline} className="credentials__item">
              <p className="credentials__kicker">{item.kicker}</p>
              <p className="credentials__headline">{item.headline}</p>
              <p className="credentials__detail">{item.detail}</p>
            </li>
          ))}
        </ul>
        <Link to="about" href="#about" smooth={true} duration={500} offset={-88} className="credentials__more">
          The full record in About
        </Link>
      </div>
    </section>
  );
}
