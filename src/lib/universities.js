// The Big Ten member universities shown in the Proj Arch rollout rail, and
// the state of permission to show each one's official mark.
//
// Marks are shown only with the university's written permission, from the
// file it supplied, hosted here. Until then the rail shows the typographic
// monogram. See docs/university-marks.md for the request process.
//
//   name        short name shown on the card
//   fullName    full institutional name, used for the tooltip and the request
//   mark        typographic monogram shown until (or instead of) a logo
//   brand       the university's brand office: identity standards, contacts
//   licensing   its trademark licensing office, when it has a separate site
//   permission  'not-requested' | 'requested' | 'granted' | 'declined'
//   logo        path under public/ of the permitted file, or null
//
// The brand and licensing URLs were checked to resolve on 2026-09-29.
const UNIVERSITIES = [
  { name: 'Illinois', fullName: 'University of Illinois Urbana-Champaign', mark: 'ILL',
    brand: 'https://brand.illinois.edu/', licensing: null, permission: 'not-requested', logo: null },
  { name: 'Indiana', fullName: 'Indiana University Bloomington', mark: 'IU',
    brand: 'https://brand.iu.edu/', licensing: 'https://licensing.iu.edu/', permission: 'not-requested', logo: null },
  { name: 'Iowa', fullName: 'University of Iowa', mark: 'IOWA',
    brand: 'https://brand.uiowa.edu/', licensing: 'https://licensing.uiowa.edu/', permission: 'not-requested', logo: null },
  { name: 'Maryland', fullName: 'University of Maryland, College Park', mark: 'UMD',
    brand: 'https://brand.umd.edu/', licensing: null, permission: 'not-requested', logo: null },
  { name: 'Michigan', fullName: 'University of Michigan', mark: 'M',
    brand: 'https://brand.umich.edu/', licensing: null, permission: 'not-requested', logo: null },
  { name: 'Michigan State', fullName: 'Michigan State University', mark: 'MSU',
    brand: 'https://brand.msu.edu/', licensing: 'https://licensing.msu.edu/', permission: 'not-requested', logo: null },
  { name: 'Minnesota', fullName: 'University of Minnesota Twin Cities', mark: 'MINN',
    brand: 'https://brand.umn.edu/', licensing: null, permission: 'not-requested', logo: null },
  { name: 'Nebraska', fullName: 'University of Nebraska–Lincoln', mark: 'NEB',
    brand: 'https://ucomm.unl.edu/brand', licensing: 'https://licensing.unl.edu/', permission: 'not-requested', logo: null },
  { name: 'Northwestern', fullName: 'Northwestern University', mark: 'NU',
    brand: 'https://www.northwestern.edu/brand/', licensing: null, permission: 'not-requested', logo: null },
  { name: 'Ohio State', fullName: 'The Ohio State University', mark: 'OSU',
    brand: 'https://brand.osu.edu/', licensing: 'https://trademarklicensing.osu.edu/', permission: 'not-requested', logo: null },
  { name: 'Oregon', fullName: 'University of Oregon', mark: 'UO',
    brand: 'https://brand.uoregon.edu/', licensing: null, permission: 'not-requested', logo: null },
  { name: 'Penn State', fullName: 'The Pennsylvania State University', mark: 'PSU',
    brand: 'https://brand.psu.edu/', licensing: 'https://licensing.psu.edu/', permission: 'not-requested', logo: null },
  { name: 'Purdue', fullName: 'Purdue University', mark: 'PU',
    brand: 'https://marcom.purdue.edu/our-brand/', licensing: 'https://www.purdue.edu/trademarks/', permission: 'not-requested', logo: null },
  { name: 'Rutgers', fullName: 'Rutgers University–New Brunswick', mark: 'RU',
    brand: 'https://ucm.rutgers.edu/brand', licensing: null, permission: 'not-requested', logo: null },
  { name: 'UCLA', fullName: 'University of California, Los Angeles', mark: 'UCLA',
    brand: 'https://brand.ucla.edu/', licensing: null, permission: 'not-requested', logo: null },
  { name: 'USC', fullName: 'University of Southern California', mark: 'USC',
    brand: 'https://identity.usc.edu/', licensing: 'https://trademarks.usc.edu/', permission: 'not-requested', logo: null },
  { name: 'Washington', fullName: 'University of Washington', mark: 'UW',
    brand: 'https://www.washington.edu/brand/', licensing: 'https://www.washington.edu/trademarks/', permission: 'not-requested', logo: null },
  { name: 'Wisconsin', fullName: 'University of Wisconsin–Madison', mark: 'WISC',
    brand: 'https://brand.wisc.edu/', licensing: 'https://licensing.wisc.edu/', permission: 'not-requested', logo: null },
];

export default UNIVERSITIES;
