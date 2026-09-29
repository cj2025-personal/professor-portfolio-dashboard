# University marks in the Proj Arch rollout rail

The rail under "Starting with B1G universities" names the eighteen Big Ten
members. It shows a university's official logo only when that university has
given written permission and supplied the file. Until then the card shows a
typographic monogram and the name, which is plain nominative use and needs no
permission.

The state of every school lives in `src/lib/universities.js`. Nothing on the
page is fetched from a third-party host.

## Why permission, not fair use

Showing a university's logo to describe a planned rollout is usually
defensible as nominative fair use, and the note under the rail disclaims any
affiliation. But logos, unlike names, are artwork most universities license
actively, and several brand offices state that any external use needs their
approval. Asking removes the question, and it is a conversation the project
will need anyway if the rollout becomes real.

## Process per university

1. Open the brand office page listed for the school in `universities.js`.
   Find the trademark or licensing contact (often a form or an email such as
   `licensing@` or `trademarks@`). Where the manifest lists a separate
   licensing site, start there.
2. Send the request below, from the project lead's institutional address.
   Set `permission: 'requested'` in the manifest with the date in a comment.
3. On approval, use the file the office supplies or points to, in the colour
   version its guidelines permit for a white background. Save it as
   `public/images/universities/<name>.svg` (or `.png` at 2x, at least
   160×160). Do not recolour, crop, stretch or restyle it.
4. Set `logo: '/images/universities/<name>.svg'` and
   `permission: 'granted'` for that school. Keep the approval email.
5. If an office declines, set `permission: 'declined'` and leave `logo`
   null. The monogram remains.

The rail's CSS renders every mark in a uniform muted grey until hover. Check
each school's guidelines before shipping that: a few require the logo in full
colour or single-colour black only. If a guideline forbids the grey
treatment, remove `filter` from `.pa-university__mark img` for that logo by
adding a `--pa-university-plain` modifier, or ask the office in the request.

## Request template

Subject: Permission to display the [University] logo on a research project page

Dear [Trademark Licensing / Brand Office],

I am [name], [title] at [institution]. I lead Proj Arch, a research and
education project that connects learners with scholars and adapts academic
explanations by reading level. The project page is at
https://craigljohnson.org/proj-arch.

The page includes a section describing the planned first rollout to Big Ten
member universities, listing each institution by name. I am writing to ask
permission to display [University]'s official [primary logo / monogram] on
that page, alongside its name, solely to identify the university as part of
that planned rollout.

Details of the intended use:

- Placement: a single card in a row of Big Ten institutions, next to the
  university's name.
- Size: about 40 pixels square on screen.
- Treatment: the file you supply, unaltered. The row currently renders marks
  in muted grey until hovered; I am happy to show yours in full colour if
  your guidelines require it.
- Context: informational. The page carries a notice that Proj Arch is not
  affiliated with, sponsored by or endorsed by any listed university, and no
  merchandise or paid offering is involved.
- Duration: for as long as the rollout section is published. I will remove
  the logo at your request.

If you can approve this use, could you point me to the correct file and any
conditions I should follow? If a licence form is required, I will complete
it.

Thank you for your time.

[name]
[title, institution]
[email, phone]

## Brand offices

| University | Brand office | Licensing office |
|---|---|---|
| Illinois | https://brand.illinois.edu/ | via brand site |
| Indiana | https://brand.iu.edu/ | https://licensing.iu.edu/ |
| Iowa | https://brand.uiowa.edu/ | https://licensing.uiowa.edu/ |
| Maryland | https://brand.umd.edu/ | via brand site |
| Michigan | https://brand.umich.edu/ | via brand site |
| Michigan State | https://brand.msu.edu/ | https://licensing.msu.edu/ |
| Minnesota | https://brand.umn.edu/ | via brand site |
| Nebraska | https://ucomm.unl.edu/brand | https://licensing.unl.edu/ |
| Northwestern | https://www.northwestern.edu/brand/ | via brand site |
| Ohio State | https://brand.osu.edu/ | https://trademarklicensing.osu.edu/ |
| Oregon | https://brand.uoregon.edu/ | via brand site |
| Penn State | https://brand.psu.edu/ | https://licensing.psu.edu/ |
| Purdue | https://marcom.purdue.edu/our-brand/ | https://www.purdue.edu/trademarks/ |
| Rutgers | https://ucm.rutgers.edu/brand | via brand site |
| UCLA | https://brand.ucla.edu/ | via brand site |
| USC | https://identity.usc.edu/ | https://trademarks.usc.edu/ |
| Washington | https://www.washington.edu/brand/ | https://www.washington.edu/trademarks/ |
| Wisconsin | https://brand.wisc.edu/ | https://licensing.wisc.edu/ |

URLs were checked to resolve on 2026-09-29. "Via brand site" means the
licensing contact is linked from the brand office page rather than hosted
on its own domain.

## The Big Ten mark

The B1G wordmark in the heading (`public/images/big-ten.svg`) is a separate
case: it is the text-only conference logo, below the threshold of
originality for copyright, used nominatively to name the conference. It
still carries trademark rights, which the note under the rail acknowledges.
If the project approaches the conference itself, ask its office for a
licence and replace the file with the one it supplies.
