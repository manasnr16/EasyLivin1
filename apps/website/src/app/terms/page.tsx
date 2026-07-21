import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description: 'Terms and Conditions governing the relationship between clients and EasyLivin real estate consultancy, Goa.',
}

const DEFINITIONS = [
  {
    term: 'EL',
    definition:
      'Refers to EasyLivin, a registered real estate consultancy firm operating in Goa, India, its agents, employees, representatives, and authorised associates.',
  },
  {
    term: 'Property',
    definition:
      'Any residential or commercial land, building, apartment, villa, plot, farmland, plantation, resort, or any other immovable property introduced, presented, or shown to the Client by EL.',
  },
  {
    term: 'Sell',
    definition:
      'Includes sale, resale, transfer, assignment, exchange, lease, licence, or any other disposition of a Property, whether directly or indirectly.',
  },
  {
    term: 'Seller',
    definition:
      'The owner(s), authorised representative(s), developer(s), or any other person(s) with the legal authority to sell, rent, lease, or otherwise transfer a Property.',
  },
  {
    term: 'Client',
    definition:
      'Any individual, company, trust, partnership, or legal entity that appoints EL as estate agent and/or receives services from EL in connection with the purchase, rental, acquisition, or inspection of a Property.',
  },
  {
    term: 'Remuneration',
    definition:
      'The commission, brokerage fee, service charge, or any other payment legitimately due to EL for services rendered in connection with the introduction, presentation, facilitation, or completion of a Property transaction.',
  },
]

const TOC = [
  { id: 'appointment', label: '1. Appointment of EasyLivin' },
  { id: 'definitions', label: '2. Definitions' },
  { id: 'remuneration', label: '3. Remuneration & Charges' },
  { id: 'client-statements', label: '4. Statements by the Client' },
  { id: 'el-statements', label: '5. Statements by EasyLivin' },
  { id: 'mutual', label: '6. Mutual Agreements' },
  { id: 'disclaimer', label: '7. Disclaimer' },
  { id: 'jurisdiction', label: '8. Jurisdiction' },
  { id: 'entire-agreement', label: '9. Entire Agreement' },
  { id: 'ipf', label: '10. Interested Property Form' },
]

export default function TermsPage() {
  return (
    <>
      {/* Page hero */}
      <div
        className="relative pt-20 md:pt-[116px] pb-10"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e2444 100%)' }}
      >
        <div className="relative max-w-[1200px] mx-auto px-6 pt-6">
          <div className="flex items-center gap-2 mb-3 text-[12px]">
            <Link href="/" className="text-white/40 hover:text-gold transition-colors">Home</Link>
            <span className="text-white/20">/</span>
            <span className="text-gold">Terms &amp; Conditions</span>
          </div>
          <h1 className="font-display text-[clamp(1.8rem,4vw,3rem)] font-semibold text-white mb-2">
            Terms &amp; Conditions
          </h1>
          <p className="text-white/55 text-[14px]">
            Please read these terms carefully before engaging our services.
          </p>
          <p className="text-white/35 text-[12px] mt-2">Last updated: January 2026</p>
        </div>
      </div>

      {/* Main content */}
      <div className="bg-white py-12">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-10 items-start">

            {/* Sticky Table of Contents — desktop */}
            <aside className="hidden lg:block w-[240px] flex-shrink-0 sticky top-24">
              <div className="bg-slate-50 rounded-xl border border-slate-100 p-5">
                <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-gold mb-4">
                  On This Page
                </p>
                <nav className="space-y-2">
                  {TOC.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className="block text-[12.5px] text-slate-500 hover:text-navy transition-colors leading-snug py-0.5"
                    >
                      {item.label}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Legal content */}
            <article className="flex-1 min-w-0 max-w-[820px]">

              {/* ── SECTION 1 ── */}
              <section id="appointment" className="mb-10 scroll-mt-28">
                <SectionHeading number="1" title="Appointment of EasyLivin" />
                <p className="body-text">
                  I hereby appoint EasyLivin (&ldquo;EL&rdquo;) as my Estate Agent to introduce, present, and
                  show properties to me. This appointment is non-exclusive unless otherwise agreed in
                  writing, and I acknowledge that EL may simultaneously act for other buyers, sellers,
                  lessors, and lessees in respect of the same or similar properties.
                </p>
                <p className="body-text mt-3">
                  By engaging EL&apos;s services — whether in person, by telephone, electronically, or
                  through the EasyLivin website — the Client agrees to be bound by these Terms &amp;
                  Conditions in their entirety.
                </p>
              </section>

              <Divider />

              {/* ── SECTION 2 ── */}
              <section id="definitions" className="mb-10 scroll-mt-28">
                <SectionHeading number="2" title="Definitions" />
                <p className="body-text mb-6">
                  In these Terms &amp; Conditions, unless the context otherwise requires, the following
                  terms shall have the meanings ascribed to them below:
                </p>
                <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                  {DEFINITIONS.map(({ term, definition }) => (
                    <div key={term} className="flex gap-4 px-5 py-4 bg-white hover:bg-slate-50 transition-colors">
                      <div className="w-28 flex-shrink-0">
                        <span className="text-[12px] font-bold text-navy tracking-wide uppercase bg-gold/10 text-gold px-2.5 py-1 rounded">
                          {term}
                        </span>
                      </div>
                      <p className="text-slate-600 text-[13.5px] leading-relaxed">{definition}</p>
                    </div>
                  ))}
                </div>
              </section>

              <Divider />

              {/* ── SECTION 3 ── */}
              <section id="remuneration" className="mb-10 scroll-mt-28">
                <SectionHeading number="3" title="Remuneration &amp; Charges" />

                <SubSection number="3.1" title="Commission Obligation">
                  <p className="body-text">
                    The Client agrees to pay EL a commission as agreed upon in writing prior to the
                    commencement of any transaction. EL&apos;s commission becomes due and payable upon
                    the execution of a binding sale agreement, lease deed, or any other agreement
                    relating to the Property.
                  </p>
                </SubSection>

                <SubSection number="3.2" title="Valuation of Non-Cash Consideration">
                  <p className="body-text">
                    Where the consideration for a transaction includes any non-cash element —
                    including but not limited to barter, exchange of property, or deferred
                    payment — EL&apos;s commission shall be calculated on the fair market value of
                    the total consideration as independently determined or mutually agreed.
                  </p>
                </SubSection>

                <SubSection number="3.3" title="Taxes and Government Charges">
                  <p className="body-text">
                    All applicable taxes, including Goods and Services Tax (GST) and any other
                    statutory levies, shall be payable by the Client in addition to EL&apos;s
                    commission. Stamp duty, registration charges, and other government fees are the
                    sole responsibility of the transacting parties and are not included in EL&apos;s
                    remuneration.
                  </p>
                </SubSection>

                <SubSection number="3.4" title="Interest on Overdue Payments">
                  <p className="body-text">
                    Any remuneration not paid by the due date shall attract interest at the rate of
                    18% per annum (or such rate as prescribed by applicable law, whichever is
                    higher), calculated from the due date until the date of actual payment.
                  </p>
                </SubSection>

                <SubSection number="3.5" title="Commission Entitlement Conditions">
                  <p className="body-text">EL shall be entitled to its full commission where:</p>
                  <ul className="legal-list">
                    <li>EL introduced the Client to the Property, irrespective of whether a formal agreement was signed through EL;</li>
                    <li>The Client enters into any transaction regarding a Property introduced by EL within 24 months of such introduction;</li>
                    <li>The transaction is structured differently from what was originally proposed, but relates to the same Property or Seller;</li>
                    <li>The Client withdraws after a binding offer or agreement has been executed.</li>
                  </ul>
                </SubSection>

                <SubSection number="3.6" title="Lease, Licence, Sale &amp; Exchange Provisions">
                  <p className="body-text">
                    Where a Property is leased, licenced, or exchanged rather than sold outright,
                    EL&apos;s commission shall be calculated on the total value of the transaction —
                    including, for lease agreements, the full term rental value — unless a separate
                    written agreement specifies otherwise.
                  </p>
                </SubSection>

                <SubSection number="3.7" title="Family Members &amp; Associates">
                  <p className="body-text">
                    For the purposes of these Terms, commission obligations extend to transactions
                    completed by or on behalf of the Client&apos;s immediate family members, related
                    entities, nominees, or associates who acquire a Property that was introduced to
                    the Client by EL.
                  </p>
                </SubSection>

                <SubSection number="3.8" title="Survival of Commission Obligations">
                  <p className="body-text">
                    The Client&apos;s obligation to pay EL&apos;s commission shall survive the
                    expiry or termination of this agreement for a period of 24 months in respect of
                    any Property introduced by EL prior to such expiry or termination.
                  </p>
                </SubSection>
              </section>

              <Divider />

              {/* ── SECTION 4 ── */}
              <section id="client-statements" className="mb-10 scroll-mt-28">
                <SectionHeading number="4" title="Statements by the Client" />

                <SubSection number="4.1" title="Client Representations">
                  <p className="body-text">
                    The Client represents and warrants that all information provided to EL is
                    accurate, complete, and not misleading, and that the Client has full legal
                    capacity and authority to enter into property transactions.
                  </p>
                </SubSection>

                <SubSection number="4.2" title="Non-Broker Declaration">
                  <p className="body-text">
                    The Client declares that they are acting as a principal and not as an agent,
                    broker, or representative of any other person in connection with the Property
                    being sought, unless expressly disclosed to EL in writing.
                  </p>
                </SubSection>

                <SubSection number="4.3" title="Penalty for Misrepresentation">
                  <p className="body-text">
                    Should the Client provide false, incomplete, or misleading information that
                    results in loss or damage to EL, the Seller, or any third party, the Client
                    shall be liable for all resulting losses, costs, and expenses, including legal
                    fees.
                  </p>
                </SubSection>

                <SubSection number="4.4" title="Communication Restrictions with Sellers">
                  <p className="body-text">
                    The Client agrees not to contact, negotiate with, or transact directly with any
                    Seller introduced by EL without EL&apos;s prior written consent. All
                    communications regarding Properties shown by EL shall be conducted through EL
                    unless otherwise agreed.
                  </p>
                </SubSection>

                <SubSection number="4.5" title="Financial Disclosure">
                  <p className="body-text">
                    The Client agrees to provide EL with a true and accurate indication of their
                    financial capacity and purchasing budget prior to or during the property search
                    process, to enable EL to provide appropriate and relevant property introductions.
                  </p>
                </SubSection>

                <SubSection number="4.6" title="Eligibility &amp; Legal Compliance">
                  <p className="body-text">
                    The Client confirms that they are legally eligible to purchase, lease, or
                    otherwise acquire immovable property in India under applicable laws, including
                    FEMA regulations where the Client is a Non-Resident Indian (NRI) or Foreign
                    National. EL accepts no responsibility for verifying the Client&apos;s legal
                    eligibility.
                  </p>
                </SubSection>
              </section>

              <Divider />

              {/* ── SECTION 5 ── */}
              <section id="el-statements" className="mb-10 scroll-mt-28">
                <SectionHeading number="5" title="Statements by EasyLivin (EL)" />

                <SubSection number="5.1" title="Best Endeavours">
                  <p className="body-text">
                    EL shall use its best endeavours to introduce Properties that match the
                    Client&apos;s stated requirements. However, EL does not guarantee that a
                    suitable Property will be found or that any transaction will be completed
                    successfully.
                  </p>
                </SubSection>

                <SubSection number="5.2" title="No Inspection Responsibility">
                  <p className="body-text">
                    EL does not carry out structural surveys, building inspections, or technical
                    assessments of any Property. The Client is strongly advised to appoint
                    independent qualified professionals to inspect any Property before entering into
                    a binding transaction.
                  </p>
                </SubSection>

                <SubSection number="5.3" title="No Title Verification Responsibility">
                  <p className="body-text">
                    EL does not verify the legal title, encumbrances, or ownership status of any
                    Property. It is the Client&apos;s responsibility to appoint a qualified legal
                    practitioner to conduct due diligence on title and associated documentation
                    before completing any transaction.
                  </p>
                </SubSection>

                <SubSection number="5.4" title="Legal &amp; Tax Advisory Disclaimer">
                  <p className="body-text">
                    EL is not a legal adviser, tax consultant, or financial adviser. Nothing
                    communicated by EL, whether verbally or in writing, shall constitute legal,
                    tax, or financial advice. Clients are strongly encouraged to seek independent
                    professional advice before making any property-related decisions.
                  </p>
                </SubSection>

                <SubSection number="5.5" title="Property Condition Disclaimer">
                  <p className="body-text">
                    EL makes no warranties or representations regarding the condition, fitness for
                    purpose, habitability, or compliance with planning or building regulations of
                    any Property. All Properties are presented &ldquo;as is&rdquo; based on
                    information provided by the Seller.
                  </p>
                </SubSection>

                <SubSection number="5.6" title="Information Usage Restrictions">
                  <p className="body-text">
                    All information, materials, brochures, photographs, and data provided by EL
                    in relation to any Property are furnished solely for the Client&apos;s personal
                    use in evaluating the Property. Such materials may not be reproduced,
                    distributed, or used for any commercial purpose without EL&apos;s prior
                    written consent.
                  </p>
                </SubSection>

                <SubSection number="5.7" title="Data Sharing Restrictions">
                  <p className="body-text">
                    EL will not sell, rent, or share the Client&apos;s personal information with
                    any third party for commercial purposes without the Client&apos;s express
                    consent. Information may be shared with the Seller, legal professionals, and
                    financial institutions strictly as necessary to facilitate a transaction.
                  </p>
                </SubSection>
              </section>

              <Divider />

              {/* ── SECTION 6 ── */}
              <section id="mutual" className="mb-10 scroll-mt-28">
                <SectionHeading number="6" title="Mutual Agreements Between Client &amp; EL" />

                <SubSection number="6.1" title="Property Introduction Records">
                  <p className="body-text">
                    Every Property introduced, presented, or shown to the Client by EL shall be
                    recorded in the Interested Property Form (see Section 10). The contents of this
                    form shall constitute conclusive evidence that the said Property was introduced
                    by EL. Both parties agree that accurate and timely completion of this form is
                    integral to the agreement.
                  </p>
                </SubSection>

                <SubSection number="6.2" title="Dual Representation Consent">
                  <p className="body-text">
                    The Client acknowledges and consents to the fact that EL may simultaneously
                    represent both the buyer and the seller in the same transaction. EL shall
                    disclose such dual representation at the earliest opportunity and shall act
                    fairly and impartially towards both parties.
                  </p>
                </SubSection>

                <SubSection number="6.3" title="Confidentiality Obligations">
                  <p className="body-text">
                    Both parties agree to maintain strict confidentiality in respect of all
                    information shared during the course of the engagement. Specifically, EL shall
                    not disclose the following to any third party without the Client&apos;s express
                    written consent:
                  </p>
                  <ul className="legal-list">
                    <li>The Client&apos;s willingness to pay a higher price than offered;</li>
                    <li>The Seller&apos;s willingness to accept a lower price than listed;</li>
                    <li>The motivations, personal circumstances, or urgency of either party;</li>
                    <li>Details of the Client&apos;s financing arrangements or borrowing capacity;</li>
                    <li>Any personal or commercially sensitive information shared in confidence.</li>
                  </ul>
                </SubSection>

                <SubSection number="6.4" title="Broker Cooperation">
                  <p className="body-text">
                    The Client authorises EL to co-operate with other registered real estate brokers
                    and agents in facilitating the Client&apos;s property search. Where a
                    transaction is co-brokered, EL&apos;s commission may be shared with the
                    co-operating broker. The Client&apos;s total commission obligation to EL shall
                    not increase as a result of any such co-broking arrangement.
                  </p>
                </SubSection>

                <SubSection number="6.5" title="Multiple Buyer Representation">
                  <p className="body-text">
                    The Client acknowledges and consents to EL simultaneously representing other
                    prospective purchasers, lessees, or investors who may be interested in the same
                    Property. EL shall handle all such representations with equal diligence and
                    without prejudice to any party.
                  </p>
                </SubSection>
              </section>

              <Divider />

              {/* ── SECTION 7 ── */}
              <section id="disclaimer" className="mb-10 scroll-mt-28">
                <SectionHeading number="7" title="Disclaimer" />
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mt-4 space-y-4">
                  <DisclaimerItem title="Website Information">
                    The information published on the EasyLivin website is provided in good faith
                    for general informational purposes only. EL makes no warranties, express or
                    implied, as to the accuracy, completeness, currency, or suitability of the
                    information for any particular purpose.
                  </DisclaimerItem>
                  <DisclaimerItem title="Service Disclaimer">
                    EL does not guarantee that its services will meet the Client&apos;s specific
                    requirements or that a suitable property will be identified or a transaction
                    completed within any given timeframe.
                  </DisclaimerItem>
                  <DisclaimerItem title="Accuracy of Listings">
                    Property details, dimensions, pricing, images, and descriptions are provided by
                    Sellers and are believed to be accurate at the time of listing. EL does not
                    independently verify such information and accepts no liability for any
                    discrepancies, omissions, or errors in listing content.
                  </DisclaimerItem>
                  <DisclaimerItem title="Limitation of Liability">
                    To the fullest extent permitted by applicable law, EL shall not be liable for
                    any direct, indirect, incidental, special, or consequential losses arising from
                    the use of EL&apos;s services, reliance on information provided, or the
                    outcome of any property transaction.
                  </DisclaimerItem>
                  <DisclaimerItem title="Virus &amp; Technology">
                    EL does not warrant that its website or digital communications are free from
                    viruses, malware, or other harmful components. Clients are advised to use
                    appropriate security software when accessing digital services. EL accepts no
                    liability for any damage caused to a Client&apos;s device or data as a result
                    of accessing EL&apos;s digital platforms.
                  </DisclaimerItem>
                  <DisclaimerItem title="Operational Interruptions">
                    EL shall not be liable for any loss or inconvenience arising from interruptions
                    to its services due to technical failures, maintenance, force majeure events,
                    or circumstances beyond EL&apos;s reasonable control.
                  </DisclaimerItem>
                </div>
              </section>

              <Divider />

              {/* ── SECTION 8 ── */}
              <section id="jurisdiction" className="mb-10 scroll-mt-28">
                <SectionHeading number="8" title="Jurisdiction" />
                <p className="body-text">
                  These Terms &amp; Conditions shall be governed by and construed in accordance with
                  the laws of India. Any dispute, claim, or controversy arising out of or relating
                  to this agreement or the services provided by EL — including disputes regarding
                  its existence, validity, breach, or termination — shall be subject exclusively
                  to the jurisdiction of the Courts at Panjim, Goa.
                </p>
                <p className="body-text mt-3">
                  Both parties agree to submit to the exclusive jurisdiction of the said courts
                  and waive any objection to proceedings in such courts on the grounds of venue,
                  convenience, or applicable law.
                </p>
              </section>

              <Divider />

              {/* ── SECTION 9 ── */}
              <section id="entire-agreement" className="mb-10 scroll-mt-28">
                <SectionHeading number="9" title="Entire Agreement" />
                <p className="body-text">
                  These Terms &amp; Conditions, together with any written agreements, addenda, or
                  forms signed by both parties, constitute the entire agreement between the Client
                  and EL with respect to the subject matter herein, and supersede all prior
                  understandings, representations, negotiations, and communications, whether oral
                  or written.
                </p>
                <p className="body-text mt-3">
                  No amendment, modification, or waiver of any provision of this agreement shall
                  be effective unless made in writing and duly signed by authorised representatives
                  of both parties. No course of dealing, course of performance, or trade usage
                  shall be relied upon to modify, interpret, or supplement the terms of this
                  agreement.
                </p>
              </section>

              <Divider />

              {/* ── SECTION 10 ── */}
              <section id="ipf" className="mb-2 scroll-mt-28">
                <SectionHeading number="10" title="Interested Property Form" />
                <p className="body-text mb-5">
                  The Interested Property Form is an integral record of all properties introduced,
                  presented, or shown to the Client by EasyLivin. Its contents are binding on all
                  parties to this agreement.
                </p>
                <div className="border-2 border-gold/40 bg-gold-pale rounded-xl p-6">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-1 h-full bg-gold rounded-full flex-shrink-0 self-stretch min-h-[24px]" />
                    <p className="text-[11px] font-bold tracking-[0.15em] uppercase text-gold">
                      Legal Notice — Interested Property Form
                    </p>
                  </div>
                  <p className="text-navy text-[14px] leading-relaxed font-medium">
                    The identification and description of every property introduced, presented, or
                    shown to a Client by EasyLivin shall be recorded in this form. The contents of
                    this form shall be conclusive evidence that the property was introduced by
                    EasyLivin and shall form an integral part of the agreement between the Client,
                    EasyLivin, and the property owner.
                  </p>
                  <p className="text-slate-500 text-[13px] leading-relaxed mt-3">
                    By receiving a property introduction from EasyLivin — whether verbally, in
                    writing, by site visit, or through any digital communication — the Client
                    acknowledges that EasyLivin is the procuring cause of any resulting transaction
                    and that EL&apos;s remuneration obligations under Section 3 apply in full.
                  </p>
                </div>
              </section>

            </article>
          </div>
        </div>
      </div>
    </>
  )
}

/* ── Shared sub-components ── */

function SectionHeading({ number, title }: { number: string; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center text-gold font-bold text-[13px]">
        {number}
      </span>
      <h2
        className="font-display text-[1.25rem] font-semibold text-navy leading-tight"
        dangerouslySetInnerHTML={{ __html: title }}
      />
    </div>
  )
}

function SubSection({
  number,
  title,
  children,
}: {
  number: string
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="mb-5 pl-4 border-l-2 border-slate-100">
      <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-gold mb-1.5">
        {number} — {title}
      </p>
      {children}
    </div>
  )
}

function DisclaimerItem({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[13px] font-semibold text-navy mb-1">{title}</p>
      <p className="text-slate-500 text-[13.5px] leading-relaxed">{children}</p>
    </div>
  )
}

function Divider() {
  return <hr className="border-slate-100 mb-10" />
}
