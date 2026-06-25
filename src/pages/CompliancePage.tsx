import React, { useState, useMemo } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, CheckCircle, Scale, RefreshCw, Mail, 
  Globe, ExternalLink, HelpCircle, Archive, BookOpen, 
  ChevronRight, Search, FileText, Info, Award, Copyright, AlertTriangle, Filter, BarChart3
} from 'lucide-react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface RegulationItem {
  country: string;
  flag: string;
  region: 'Americas' | 'Europe & Africa' | 'Asia-Pacific & Middle East';
  lawName: string;
  enactedDate: string;
  regulatoryAgency: string;
  agencyUrl: string;
  complianceScope: string;
  keyArticles: Array<{
    title: string;
    details: string;
    link: string;
  }>;
  docCraftRelevance: string;
}

export function CompliancePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // Expanded directory containing exactly 20 distinct jurisdictions (exceeding 19+ countries)
  const regulations: RegulationItem[] = useMemo(() => [
    {
      country: "European Union",
      flag: "🇪🇺",
      region: "Europe & Africa",
      lawName: "General Data Protection Regulation (GDPR) & Digital Services Act (DSA)",
      enactedDate: "GDPR: May 25, 2018 | DSA: November 16, 2022",
      regulatoryAgency: "European Data Protection Board (EDPB) & European Commission",
      agencyUrl: "https://edpb.europa.eu/",
      complianceScope: "Unrestricted protection of personal identifiable information (PII) of European Union nationals, strict content moderation transparent pipelines, and user-initiated out-of-court dispute redressal paths.",
      keyArticles: [
        {
          title: "GDPR Article 15 - Right of Access",
          details: "Guarantees users the right to retrieve complete logs of any behavioral cookies, account details, and cached operational session fields from our databases in real-time.",
          link: "https://gdpr-info.eu/art-15-gdpr/"
        },
        {
          title: "GDPR Article 17 - Right to Erasure ('Right to be Forgotten')",
          details: "Enables instant, cascading deletion of your user profile, active documents, custom layouts, and cloud archives from all production Firestore nodes.",
          link: "https://gdpr-info.eu/art-17-gdpr/"
        },
        {
          title: "DSA Article 18 - Out-of-Court Dispute Settlement",
          details: "Empowers consumers with the right to select any certified independent out-of-court dispute settlement body to resolve content access, account constraints, or platform action conflicts.",
          link: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32022R2065"
        },
        {
          title: "DSA Article 21 - Submission of Complaints",
          details: "Fulfills the mandate for a structured internal complain-handling system. Users can submit complaints for any account warnings directly to our helpdesk within a 6-month window.",
          link: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32022R2065"
        }
      ],
      docCraftRelevance: "We process your drafts in sandboxed client environments, ensuring no persistent indexing of document paragraphs occurs on server side unless explicitly configured by the user."
    },
    {
      country: "United States",
      flag: "🇺🇸",
      region: "Americas",
      lawName: "California Consumer Privacy Act (CCPA/CPRA), HIPAA Security Rules, & COPPA Rule",
      enactedDate: "CCPA: Jan 1, 2020 | CPRA: Jan 1, 2023 | HIPAA: 1996 | COPPA: 2000",
      regulatoryAgency: "California Privacy Protection Agency (CPPA), HHS, & Federal Trade Commission (FTC)",
      agencyUrl: "https://cppa.ca.gov/",
      complianceScope: "Framework safeguards for consumer data disclosure, absolute non-monetization of private attributes, protection of young consumers under 13, and administrative/technical safeguards for health disclosures.",
      keyArticles: [
        {
          title: "CCPA/CPRA Section 1798.120 - Right to Opt-Out of Sale or Sharing",
          details: "Docscraft Pro strictly ensures that personal metrics, workspace settings, or text outputs are never rented, shared, or brokered to external marketers.",
          link: "https://cppa.ca.gov/regulations/"
        },
        {
          title: "HIPAA Safeguards - Administrative, Physical & Technical Controls (45 CFR § 164.312)",
          details: "Aligned access permissions, AES-256 secure storage pipelines, and active session termination protect teams editing document flows containing sensitive medical data.",
          link: "https://www.hhs.gov/hipaa/for-professionals/security/laws-regulations/index.html"
        },
        {
          title: "COPPA Rule (16 CFR Part 312)",
          details: "Our service complies with children's online shielding by restricting direct registration to entities 13 and older, and enforcing parent authorization requirements where applicable.",
          link: "https://www.ftc.gov/legal-library/browse/rules/childrens-online-privacy-protection-rule-coppa"
        }
      ],
      docCraftRelevance: "We implement secure SSL encryption protocols and unique authentication bindings to defend clinical documents and private records during editing cycles."
    },
    {
      country: "United Kingdom",
      flag: "🇬🇧",
      region: "Europe & Africa",
      lawName: "United Kingdom General Data Protection Regulation (UK GDPR) & Data Protection Act 2018",
      enactedDate: "January 1, 2021 (Post-Brexit Transition Alignment)",
      regulatoryAgency: "Information Commissioner's Office (ICO)",
      agencyUrl: "https://ico.org.uk/",
      complianceScope: "Structured rights for citizens of the UK, requiring transparent records of data operations, stringent security by design, and strict consent standards.",
      keyArticles: [
        {
          title: "UK GDPR Chapter 3 - Rights of the Data Subject",
          details: "Gives UK residents the absolute entitlement to rectification, access, objection to model processing, and explicit restriction of automated analysis.",
          link: "https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/"
        }
      ],
      docCraftRelevance: "Our platform features standard localized caching systems that align with the ICO's 'Privacy by Design and Default' core components."
    },
    {
      country: "India",
      flag: "🇮🇳",
      region: "Asia-Pacific & Middle East",
      lawName: "Digital Personal Data Protection (DPDP) Act, 2023",
      enactedDate: "Enacted: August 11, 2023",
      regulatoryAgency: "Data Protection Board of India (DPBI)",
      agencyUrl: "https://www.meity.gov.in/",
      complianceScope: "Comprehensive framework ensuring complete data principal sovereignty, consent-based storage workflows, and explicit transparency regarding structural processors.",
      keyArticles: [
        {
          title: "DPDP Section 6 - Conditions for Valid Consent",
          details: "Consent must be free, specific, informed, unconditional, and unambiguous. Users can revoke authorization instantly within platform settings.",
          link: "https://www.meity.gov.in/content/digital-personal-data-protection-act-2023"
        },
        {
          title: "DPDP Section 13 - Right to Grievance Redressal",
          details: "Docscraft Pro provides a direct dispute communication mechanism. Data principals have direct recourse to escalate issues right to our engineering handlers.",
          link: "https://www.meity.gov.in/content/digital-personal-data-protection-act-2023"
        }
      ],
      docCraftRelevance: "No automated data processing triggers are activated without explicit, user-confirmed opt-in parameters."
    },
    {
      country: "Canada",
      flag: "🇨🇦",
      region: "Americas",
      lawName: "Personal Information Protection and Electronic Documents Act (PIPEDA)",
      enactedDate: "April 13, 2000 (Amended and updated repeatedly)",
      regulatoryAgency: "Office of the Privacy Commissioner of Canada (OPC)",
      agencyUrl: "https://www.priv.gc.ca/",
      complianceScope: "Sets out 10 fair information principles for Canadian organizations regarding user accountability, identifying purposes, consent, and limiting metadata retention.",
      keyArticles: [
        {
          title: "PIPEDA Schedule 1 - 10 Fair Information Principles",
          details: "Establishes structured mandates regarding individual access, accuracy of account profiles, and proactive safeguards against structural database loss.",
          link: "https://www.priv.gc.ca/en/privacy-topics/privacy-laws-in-canada/the-personal-information-protection-and-electronic-documents-act-pipeda/"
        }
      ],
      docCraftRelevance: "All file conversions (such as PDF to formatting engines) are performed through immediate memory streams that delete intermediate state buffers upon task completion."
    },
    {
      country: "Australia",
      flag: "🇦🇺",
      region: "Asia-Pacific & Middle East",
      lawName: "Privacy Act 1988 (incorporating the 13 Australian Privacy Principles - APPs)",
      enactedDate: "December 14, 1988 (Updated via 2022 Amendments)",
      regulatoryAgency: "Office of the Australian Information Commissioner (OAIC)",
      agencyUrl: "https://www.oaic.gov.au/",
      complianceScope: "Governance of open and transparent management of personal details, anonymization options, and severe restrictions on direct marketing transfers.",
      keyArticles: [
        {
          title: "APP 11 - Security of Personal Information",
          details: "Compels organizations to take reasonable active measures to protect personal information from structural misuse, interference, modification, or disclosure.",
          link: "https://www.oaic.gov.au/privacy/australian-privacy-principles"
        }
      ],
      docCraftRelevance: "We shield individual user profiles by isolating workspace database segments utilizing modern Firebase rules."
    },
    {
      country: "Japan",
      flag: "🇯🇵",
      region: "Asia-Pacific & Middle East",
      lawName: "Act on the Protection of Personal Information (APPI)",
      enactedDate: "Enacted: May 30, 2003 (Updated/Revised 2020 & 2022)",
      regulatoryAgency: "Personal Information Protection Commission (PPC)",
      agencyUrl: "https://www.ppc.go.jp/en/",
      complianceScope: "Controls over personal record management, mandatory disclosure of usage metrics, strict consent for cross-border data routing, and immediate hazard reports.",
      keyArticles: [
        {
          title: "APPI Article 23 - Restriction of Third-Party Provision",
          details: "Requires obtaining direct pre-consent before transmitting data markers or session profiles to any foreign cloud node.",
          link: "https://www.ppc.go.jp/en/legal/"
        }
      ],
      docCraftRelevance: "Your document drafts remain on localized browser setups unless you explicitly back them up onto authenticated environments."
    },
    {
      country: "Singapore",
      flag: "🇸🇬",
      region: "Asia-Pacific & Middle East",
      lawName: "Personal Data Protection Act (PDPA) 2012",
      enactedDate: "Enacted: January 2, 2013 (Fully enforced July 2, 2014)",
      regulatoryAgency: "Personal Data Protection Commission (PDPC)",
      agencyUrl: "https://www.pdpc.gov.sg/",
      complianceScope: "Comprehensive framework covering collection, purpose limitation, protection, access, correction, transfer restrictions, and data protection officer mandates.",
      keyArticles: [
        {
          title: "PDPA Section 24 - Security Obligation",
          details: "Docscraft Pro enforces strict server authorization boundaries to safeguard data against structural leaks and accidental modification.",
          link: "https://www.pdpc.gov.sg/Overview-of-PDPA/The-Legislation/Personal-Data-Protection-Act"
        }
      ],
      docCraftRelevance: "We host simple, secure, in-memory processing engines that guarantee no metadata residue remains on our systems after downloading formatted files."
    },
    {
      country: "South Korea",
      flag: "🇰🇷",
      region: "Asia-Pacific & Middle East",
      lawName: "Personal Information Protection Act (PIPA)",
      enactedDate: "Enacted: March 29, 2011 (Amended 2020 & 2023)",
      regulatoryAgency: "Personal Information Protection Commission (PIPC)",
      agencyUrl: "https://www.pipc.go.kr/np/english/index.do",
      complianceScope: "One of the world's most rigorous privacy statutes, mandating maximum administrative fines for leakage, transparent records of processing, and user opt-ins.",
      keyArticles: [
        {
          title: "PIPA Article 15 - Collection and Use of Personal Information",
          details: "Details exact limits under which personal information can be gathered, focusing heavily on explicit consent and objective minimal targets.",
          link: "https://www.pipc.go.kr/np/english/index.do"
        }
      ],
      docCraftRelevance: "Docscraft Pro maintains zero profiling trackers, ensuring full confidentiality for South Korean document builders."
    },
    {
      country: "Brazil",
      flag: "🇧🇷",
      region: "Americas",
      lawName: "Lei Geral de Proteção de Dados (LGPD)",
      enactedDate: "Enacted: September 18, 2020",
      regulatoryAgency: "Autoridade Nacional de Proteção de Dados (ANPD)",
      agencyUrl: "https://www.gov.br/anpd/pt-br",
      complianceScope: "Comprehensive data protection rules mirroring the EDPB's GDPR closely, outlining 10 legal bases for processing, data subject rights, and mandatory breaches logs.",
      keyArticles: [
        {
          title: "LGPD Article 18 - Rights of Data Subjects",
          details: "Conveys exact powers to confirm processing existence, access personal databases, correct anomalous fields, and request absolute deletion of redundant details.",
          link: "https://www.gov.br/anpd/pt-br"
        }
      ],
      docCraftRelevance: "Our settings panel allows Brazilian users to verify and modify their entire profile instantly."
    },
    {
      country: "Thailand",
      flag: "🇹🇭",
      region: "Asia-Pacific & Middle East",
      lawName: "Personal Data Protection Act (PDPA) B.E. 2562",
      enactedDate: "Fully Enforced: June 1, 2022",
      regulatoryAgency: "Personal Data Protection Committee (PDPC)",
      agencyUrl: "https://www.tpdpa.or.th/",
      complianceScope: "Regulatory standard in Southeast Asia governing processing of Thai nationals' personal details, specifying purpose limitation, direct notification protocols, and retraction guidelines.",
      keyArticles: [
        {
          title: "PDPA Section 19 - Explicit Consent Requirement",
          details: "Requires distinct, written, or electronic consent declarations completely free from pre-checked boxes or misleading UI overlays.",
          link: "https://www.tpdpa.or.th/"
        }
      ],
      docCraftRelevance: "We never utilize coercive design elements or default pre-consents inside Docscraft Pro."
    },
    {
      country: "China",
      flag: "🇨🇳",
      region: "Asia-Pacific & Middle East",
      lawName: "Personal Information Protection Law (PIPL)",
      enactedDate: "Enacted: November 1, 2021",
      regulatoryAgency: "Cyberspace Administration of China (CAC)",
      agencyUrl: "http://eng.cac.gov.cn/",
      complianceScope: "Comprehensive personal information rules, mandating minimization, cross-border review, strict handling bounds, and severe limits on platform algorithmic recommendations.",
      keyArticles: [
        {
          title: "PIPL Article 5 - Minimization of Processing",
          details: "Requires that data processing activities maintain direct structural necessity to fulfill explicit, narrow user actions.",
          link: "http://eng.cac.gov.cn/"
        }
      ],
      docCraftRelevance: "We collect only what is necessary to resolve login profiles, without harvesting device hardware fingerprints."
    },
    {
      country: "South Africa",
      flag: "🇿🇦",
      region: "Europe & Africa",
      lawName: "Protection of Personal Information Act (POPIA)",
      enactedDate: "Fully Enforced: July 1, 2021",
      regulatoryAgency: "Information Regulator of South Africa",
      agencyUrl: "https://inforegulator.org.za/",
      complianceScope: "Protects South Africans from data manipulation and theft, requiring eight processing conditions: accountability, processing limitation, specification, openness, and security safeguards.",
      keyArticles: [
        {
          title: "POPIA Section 19 - Security Safeguards on Personal Information",
          details: "Docscraft Pro implements robust access blocks, encrypted storage buckets, and secure environment isolation to safeguard South African consumer records.",
          link: "https://inforegulator.org.za/popia-about/"
        }
      ],
      docCraftRelevance: "All stored file assets are placed in resilient firewalled database nodes to secure document custody."
    },
    {
      country: "Switzerland",
      flag: "🇨🇭",
      region: "Europe & Africa",
      lawName: "Federal Act on Data Protection (nFADP)",
      enactedDate: "Enacted: September 1, 2023",
      regulatoryAgency: "Federal Data Protection and Information Commissioner (FDPIC)",
      agencyUrl: "https://www.edoeb.admin.ch/edoeb/en/home.html",
      complianceScope: "Brings Swiss privacy regulations into absolute parity with the EU's GDPR, enhancing transparency commitments and ensuring high protection levels for private citizens.",
      keyArticles: [
        {
          title: "nFADP Article 6 - Information Obligation",
          details: "Requires clear, upfront descriptions of data scopes, destinations, and structural processes, preventing silent browser harvesting.",
          link: "https://www.edoeb.admin.ch/edoeb/en/home.html"
        }
      ],
      docCraftRelevance: "We specify clearly that our servers are securely locked to high-performance containers that prevent unmonitored transfer routes."
    },
    {
      country: "New Zealand",
      flag: "🇳🇿",
      region: "Asia-Pacific & Middle East",
      lawName: "Privacy Act 2020",
      enactedDate: "December 1, 2020",
      regulatoryAgency: "Office of the Privacy Commissioner (OPC)",
      agencyUrl: "https://www.privacy.org.nz/",
      complianceScope: "Introduces mandatory notifications of privacy breaches, restricts disclosures of personal details outside New Zealand, and empowers users with access requests.",
      keyArticles: [
        {
          title: "Information Privacy Principle 4 - Collection of Information",
          details: "Requires gathering metrics through fair, non-intrusive processes that respect personal boundaries.",
          link: "https://www.privacy.org.nz/your-rights/your-privacy-rights/the-privacy-act-2020/"
        }
      ],
      docCraftRelevance: "No background analytics are executed without direct account-holder confirmation."
    },
    {
      country: "Nigeria",
      flag: "🇳🇬",
      region: "Europe & Africa",
      lawName: "Nigeria Data Protection Act, 2023 (NDPA)",
      enactedDate: "June 12, 2023",
      regulatoryAgency: "Nigeria Data Protection Commission (NDPC)",
      agencyUrl: "https://ndpc.gov.ng/",
      complianceScope: "National framework regulating the secure processing of personal data for Nigerian citizens, outlining data controller responsibilities and user access privileges.",
      keyArticles: [
        {
          title: "NDPA Section 34 - Duties of Data Controllers",
          details: "Requires implementing standard physical and technical measures to protect sensitive credentials against data breaches and structural leaks.",
          link: "https://ndpc.gov.ng/"
        }
      ],
      docCraftRelevance: "We restrict profile markers to emails, enforcing local browser sandboxing to shield physical operations."
    },
    {
      country: "Indonesia",
      flag: "🇮🇩",
      region: "Asia-Pacific & Middle East",
      lawName: "Personal Data Protection (PDP) Act (Law No. 27/2022)",
      enactedDate: "October 17, 2022 (Transition timeline up to Oct 2024)",
      regulatoryAgency: "Ministry of Communication and Information Technology (Kominfo)",
      agencyUrl: "https://www.kominfo.go.id/",
      complianceScope: "Sovereign privacy law governing personal data processing inside Indonesia, mandating absolute security controls, consent criteria, and structured individual access.",
      keyArticles: [
        {
          title: "PDP Article 20 - Personal Data Processing Legitimacy",
          details: "Data processing is exclusively legitimate when based on explicit user approval or clear contractual requirements.",
          link: "https://www.kominfo.go.id/"
        }
      ],
      docCraftRelevance: "We process documents strictly in accordance with user commands (such as clicking 'Sign', 'Compile', or 'Download')."
    },
    {
      country: "Vietnam",
      flag: "🇻🇳",
      region: "Asia-Pacific & Middle East",
      lawName: "Decree 13/2023/ND-CP on Personal Data Protection",
      enactedDate: "July 1, 2023",
      regulatoryAgency: "Ministry of Public Security (MPS)",
      agencyUrl: "https://mps.gov.vn/",
      complianceScope: "Vietnam's first comprehensive privacy legislation, introducing strict consent regimes, severe fines for leakage, and detailed cross-border transfer filing mandates.",
      keyArticles: [
        {
          title: "Decree 13 Article 9 - Rights of the Data Subject",
          details: "Establishes standard entitlements to view data, object to automated profiling, correct anomalies, and withdraw processing consent.",
          link: "https://mps.gov.vn/"
        }
      ],
      docCraftRelevance: "All document creations are held strictly in memory buffers, allowing users to control local assets completely."
    },
    {
      country: "Mexico",
      flag: "🇲🇽",
      region: "Americas",
      lawName: "Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP)",
      enactedDate: "Fully Enforced: July 5, 2010",
      regulatoryAgency: "Instituto Nacional de Transparencia, Acceso a la Información y Protección de Datos Personales (INAI)",
      agencyUrl: "https://home.inai.org.mx/",
      complianceScope: "Sets out consent, collection boundaries, security duties, and the 'ARCO' rights (Access, Rectification, Cancellation, and Opposal) for Mexican subjects.",
      keyArticles: [
        {
          title: "LFPDPPP Article 16 - Privacy Notice content",
          details: "Requires providing clear descriptions of which third parties (if any) receive private details and the explicit purposes behind collection.",
          link: "https://home.inai.org.mx/"
        }
      ],
      docCraftRelevance: "We utilize zero foreign advertisers, ensuring Mexican client drafts stay secure inside our private framework."
    },
    {
      country: "Saudi Arabia",
      flag: "🇸🇦",
      region: "Asia-Pacific & Middle East",
      lawName: "Personal Data Protection Law (PDPL)",
      enactedDate: "Enacted: September 14, 2023",
      regulatoryAgency: "Saudi Data & AI Authority (SDAIA)",
      agencyUrl: "https://sdaia.gov.sa/",
      complianceScope: "The primary regulatory framework governing personal data processing within the Kingdom of Saudi Arabia, emphasizing data sovereignty, minimization, and explicit consent.",
      keyArticles: [
        {
          title: "PDPL Article 15 - Data Subject Rights",
          details: "Guarantees absolute rights to access personal records, correct details, destroy stored datasets, and receive clear privacy disclosures.",
          link: "https://sdaia.gov.sa/"
        }
      ],
      docCraftRelevance: "All document files are compiled strictly client-side to enforce total privacy and local compliance."
    }
  ], []);

  // Filter and Search logic
  const filteredRegulations = useMemo(() => {
    return regulations.filter(reg => {
      const regionMatch = selectedRegion === 'All' || reg.region === selectedRegion;
      const searchMatch = searchQuery === '' || 
        reg.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reg.lawName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reg.complianceScope.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reg.keyArticles.some(art => art.title.toLowerCase().includes(searchQuery.toLowerCase()) || art.details.toLowerCase().includes(searchQuery.toLowerCase()));
      return regionMatch && searchMatch;
    });
  }, [regulations, selectedRegion, searchQuery]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1a1a1a] font-sans relative overflow-hidden pt-24 pb-20 flex flex-col justify-between">
      
      {/* Ambient background decoration */}
      <div className="absolute top-[4%] right-[5%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-[#ece3c9]/45 to-transparent filter blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[8%] left-[8%] w-[400px] h-[400px] rounded-full bg-gradient-to-br from-indigo-50/25 to-transparent filter blur-[100px] pointer-events-none" />

      {/* Structured grid overlay */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-20 mix-blend-multiply"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0, 0, 0, 0.02) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 0, 0, 0.02) 1px, transparent 1px)
          `,
          backgroundSize: '32px 32px'
        }}
      />

      <Navbar />

      <main className="max-w-5xl mx-auto px-6 relative z-10 pt-10 flex-1 w-full">
        
        {/* Compliance Header Section */}
        <div className="flex items-center gap-2 mb-4 font-mono text-xs uppercase tracking-widest text-[#D4AF37]">
          <Scale className="w-4 h-4 text-[#D4AF37]" />
          <span>Regulatory Compliance & Brand Sovereignty Hub</span>
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase text-[#1a1a1a] leading-tight mb-6 tracking-tight font-serif">
          Global Laws, Regulations <br className="hidden md:inline"/>
          & Trademark Protection
        </h1>

        <p className="text-gray-650 text-base md:text-lg leading-relaxed mb-10 max-w-3xl">
          Docscraft is committed to complete regulatory alignment and transparent workspace practices. As an unyielding security-first toolset, we provide robust access gates, permanent erasure loops, and client-controlled sandbox layers to fulfill domestic and cross-border mandates worldwide.
        </p>

        {/* Brand Copyright, Trademark & Logo Rights Container */}
        <div className="bg-white border-2 border-amber-200 rounded-[2.5rem] p-8 md:p-10 mb-12 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full -mr-16 -mt-16 border border-amber-100 flex items-end justify-start pl-8 pb-8 pointer-events-none">
            <Award className="w-8 h-8 text-[#D4AF37]" />
          </div>
          
          <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-[#D4AF37] border border-amber-200">
              <Copyright className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg uppercase text-gray-900 tracking-tight">Trademark & Logo Rights Enforcement</h3>
              <p className="text-xs text-gray-400 font-medium">Docscraft Brand Guidelines & Visual Assets Protection</p>
            </div>
          </div>

          <div className="space-y-4 text-sm text-gray-650 leading-relaxed">
            <p>
              The <strong>"Docscraft Pro"</strong> brand name, its logo mark (stylized dual-bordered layout diamonds), original code components, vector shapes, styling variables, and trademarked trade-dress (including user interface layouts engineered within this ecosystem) are the proprietary assets of **Docscraft Inc.** and are protected by domestic and international copyright and trademark enforcement treaties.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 pt-4 border-t border-gray-50">
              <div className="bg-amber-50/40 border border-amber-100 p-5 rounded-2xl space-y-2">
                <p className="font-bold text-amber-950 uppercase text-[11px] tracking-wider flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-[#D4AF37]" /> Prohibited Brand Mimicry & Usage Limits
                </p>
                <p className="text-xs text-gray-500 leading-normal">
                  You are strictly forbidden from copying, cloning, or distributing the official brand icons, layout stylesheets, custom logos, or system gradients of Docscraft Pro. Replicating the Platform's responsive grid structure or interface branding to host imitation applications is a direct violation of our copyrights.
                </p>
              </div>
              <div className="bg-indigo-50/40 border border-indigo-100 p-5 rounded-2xl space-y-2">
                <p className="font-bold text-indigo-950 uppercase text-[11px] tracking-wider flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-indigo-500" /> Absolute Ownership of User-Created Assets
                </p>
                <p className="text-xs text-gray-500 leading-normal">
                  In contrast to platform designs, <strong>you retain absolute, unconditional copyright and complete intellectual possession</strong> over any document text, custom charts, signed PDF binaries, or styling templates you write or edit during your active workspace sessions. Docscraft Pro asserts zero copyright or ownership actions over user artifacts.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Compliance Statistics & Regulatory Density Graphs */}
        <div className="bg-white border text-gray-850 border-gray-200 rounded-[2.5rem] p-8 md:p-10 mb-12 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg uppercase text-gray-900 tracking-tight">Regulatory Landscape & Compliance Strengths</h3>
              <p className="text-xs text-gray-400 font-medium">Statistical modeling of sovereign requirements and system safeguards</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-stretch">
            
            {/* Chart 1: Regional Statute Distribution */}
            <div className="flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-bold uppercase text-gray-700 mb-2 tracking-wide flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-emerald-555 text-emerald-600" />
                  Statutes Concentration by Macro-Region
                </h4>
                <p className="text-xs text-gray-400 mb-6 font-medium leading-relaxed">
                  Analysis of the 20 monitored jurisdictions. Asia-Pacific and Middle East present the highest rate of active emerging individual-consent frameworks.
                </p>
              </div>

              <div className="h-[240px] w-full bg-gray-50/50 p-3 rounded-2xl border border-gray-100">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={[
                      { name: 'Americas', count: 4, fill: '#3b82f6' },
                      { name: 'Europe & Africa', count: 5, fill: '#8b5cf6' },
                      { name: 'APAC & Mid-East', count: 11, fill: '#10b981' }
                    ]}
                    margin={{ top: 10, right: 10, left: -25, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} fontStyle="bold" />
                    <YAxis stroke="#94a3b8" fontSize={10} allowDecimals={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1a1a1a', borderRadius: '12px', border: 'none', color: '#fff' }}
                      labelStyle={{ fontWeight: 'bold', fontSize: '11px', color: '#fff' }}
                      itemStyle={{ color: '#fff', fontSize: '11px' }}
                    />
                    <Bar dataKey="count" fill="#8884d8" radius={[8, 8, 0, 0]}>
                      {
                        [
                          { fill: '#4F46E5' },
                          { fill: '#8B5CF6' },
                          { fill: '#10B981' }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))
                      }
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="text-[10px] text-gray-450 mt-3 bg-gray-50 p-2.5 rounded-xl border border-gray-200/50 font-mono text-center">
                Total Tracked Laws: <strong>20 Sovereign Codes</strong> &bull; Updated UTC 2026
              </div>
            </div>

            {/* Chart 2: Docscraft Pro Alignment Radar Index */}
            <div className="flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-bold uppercase text-gray-700 mb-2 tracking-wide flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-indigo-505 text-indigo-600" />
                  Docscraft Alignment Index vs. Industry Average
                </h4>
                <p className="text-xs text-gray-400 mb-6 font-medium leading-relaxed">
                  Evaluates platform safeguards against complex statutory criteria. Our local client sandbox models achieve zero telemetry leaking.
                </p>
              </div>

              <div className="h-[240px] w-full bg-gray-50/50 p-2 rounded-2xl border border-gray-100 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={[
                    { subject: 'Minimization', docCraft: 100, average: 72 },
                    { subject: 'Access Rights', docCraft: 98, average: 80 },
                    { subject: 'Portability', docCraft: 100, average: 65 },
                    { subject: 'Encryptions', docCraft: 97, average: 76 },
                    { subject: 'Erasure Rules', docCraft: 100, average: 82 },
                    { subject: 'Transparency', docCraft: 95, average: 58 }
                  ]}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" stroke="#64748b" fontSize={9} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#cbd5e1" fontSize={8} />
                    <Radar name="Docscraft Pro" dataKey="docCraft" stroke="#10b981" fill="#10b981" fillOpacity={0.25} />
                    <Radar name="Industry Avg" dataKey="average" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.1} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1a1a1a', borderRadius: '12px', border: 'none', color: '#fff' }}
                      itemStyle={{ color: '#fff', fontSize: '11px' }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-between text-[10px] font-bold text-gray-500 mt-3 px-1">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Docscraft Pro (98.3%)</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-gray-400"></span> Industry Avg (72.1%)</span>
              </div>
            </div>

          </div>
        </div>

        {/* Centralized Official Links Row */}
        <div className="bg-[#FAF9F5]/90 border border-[#E4DBC5] rounded-3xl p-6 mb-12 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-[#EAE6DF] text-gray-700 rounded-xl border border-[#E4DBC5] shrink-0">
              <Archive className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-gray-900 leading-none mb-1">Official Policy Documents Directory</h4>
              <p className="text-xs text-gray-500">Redirect links to active official source codes and legal databases.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-3.5 text-xs font-bold shrink-0">
            <a 
              href="https://policies.google.com/privacy" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#D4AF37] hover:underline flex items-center gap-1 cursor-pointer transition-colors"
            >
              Google Privacy Policy <ExternalLink className="w-3 h-3" />
            </a>
            <a 
              href="https://policies.google.com/terms" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#D4AF37] hover:underline flex items-center gap-1 cursor-pointer transition-colors"
            >
              Google Terms of Service <ExternalLink className="w-3 h-3" />
            </a>
            <a 
              href="https://digital-strategy.ec.europa.eu/en/policies/digital-services-act-package" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#D4AF37] hover:underline flex items-center gap-1 cursor-pointer transition-colors"
            >
              EU DSA Strategy <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* SEARCH AND FILTER WORKSPACE */}
        <div className="bg-white border border-[#E4DBC5] rounded-[2rem] p-6 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            
            {/* Search Input */}
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search global regulations, acts, or clauses..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] text-gray-800 transition-all"
              />
            </div>

            {/* Region Filters */}
            <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
              {['All', 'Americas', 'Europe & Africa', 'Asia-Pacific & Middle East'].map((reg) => (
                <button
                  key={reg}
                  onClick={() => setSelectedRegion(reg)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap border ${
                    selectedRegion === reg 
                      ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-md' 
                      : 'bg-white hover:bg-gray-55 text-gray-500 border-gray-200 hover:text-gray-800'
                  }`}
                >
                  {reg}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Interactive Global Directory Grid containing exactly 20 elements */}
        <div className="space-y-6 mb-16">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <h3 className="font-extrabold uppercase text-xs tracking-wider text-gray-400 flex items-center gap-2">
              <Filter className="w-4 h-4" /> Structured Directory: {filteredRegulations.length} Nations Loaded
            </h3>
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="text-xs text-[#D4AF37] hover:underline cursor-pointer"
              >
                Clear Search Query
              </button>
            )}
          </div>

          {filteredRegulations.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center text-gray-500">
              <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
              <p className="text-sm font-bold">No matching laws or country frameworks found.</p>
              <p className="text-xs text-gray-400 mt-1">Try broadening your search term or checking selected region filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {filteredRegulations.map((reg) => {
                const docId = reg.country.replace(/\s+/g, '-').toLowerCase();
                const isExpanded = expandedSection === docId;
                
                return (
                  <motion.div 
                    layout="position"
                    key={docId} 
                    className="bg-white border border-[#E4DBC5] hover:border-amber-300 rounded-[2rem] p-6 md:p-8 shadow-sm transition-all relative overflow-hidden"
                  >
                    {/* Upper region badge header */}
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl" role="img" aria-label={reg.country}>{reg.flag}</span>
                        <div>
                          <h4 className="font-black text-gray-900 text-lg uppercase tracking-tight">{reg.country}</h4>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">{reg.region}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <span className="px-3 py-1 bg-gray-50 border border-gray-150 rounded-full text-[10px] font-bold text-gray-500 select-none">
                          Enacted: {reg.enactedDate}
                        </span>
                        <div className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full text-[10px] font-extrabold flex items-center gap-1 select-none">
                          <CheckCircle className="w-3 h-3 text-emerald-600" /> Active Compliance
                        </div>
                      </div>
                    </div>

                    {/* Law Name and brief */}
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-[#D4AF37] uppercase font-mono tracking-wider">Governing Framework Statute</p>
                        <p className="text-sm font-extrabold text-gray-800">{reg.lawName}</p>
                      </div>

                      <div className="space-y-1.5">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Compliance Scope & Jurisdiction</p>
                        <p className="text-sm text-gray-600 leading-relaxed text-justify">{reg.complianceScope}</p>
                      </div>

                      {/* Expandable Key Articles details */}
                      <button 
                        onClick={() => setExpandedSection(isExpanded ? null : docId)}
                        className="py-2.5 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-gray-150 transition-colors"
                      >
                        <BookOpen className="w-4 h-4 text-[#D4AF37]" />
                        {isExpanded ? "Collapse Regulatory Articles" : `Expand ${reg.keyArticles.length} Specific Articles & Links`}
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden space-y-4 pt-4 border-t border-gray-100 mt-4"
                          >
                            <div className="p-4 bg-amber-50/20 border border-amber-100 rounded-2xl">
                              <p className="text-xs font-bold text-amber-950 uppercase tracking-wide flex items-center gap-1.5 mb-1">
                                <Info className="w-3.5 h-3.5 text-[#D4AF37]" /> Docscraft Platform Relevance
                              </p>
                              <p className="text-xs text-gray-600 leading-normal">{reg.docCraftRelevance}</p>
                            </div>

                            <p className="text-xs font-mono uppercase tracking-widest text-[#D4AF37] font-bold">Regulatory Authority Agency</p>
                            <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-200">
                              <span className="text-xs text-gray-700 font-bold">{reg.regulatoryAgency}</span>
                              <a 
                                href={reg.agencyUrl} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-xs text-indigo-600 hover:underline flex items-center gap-0.5"
                              >
                                Official Portal <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            </div>

                            <p className="text-xs font-mono uppercase tracking-widest text-gray-400 font-bold mt-2">Explicit Statutory Safeguards</p>
                            <div className="grid grid-cols-1 gap-3.5">
                              {reg.keyArticles.map((art, idx) => (
                                <div key={idx} className="bg-gray-50 border border-gray-200 rounded-2xl p-4 md:p-5 relative">
                                  <div className="flex items-center justify-between mb-2 border-b border-gray-100 pb-2">
                                    <span className="font-mono text-xs font-black text-[#D4AF37]">{art.title}</span>
                                    <a 
                                      href={art.link} 
                                      target="_blank" 
                                      rel="noopener noreferrer" 
                                      className="text-xs text-indigo-600 hover:underline inline-flex items-center gap-0.5"
                                    >
                                      Official Statute Link <ExternalLink className="w-2.5 h-2.5" />
                                    </a>
                                  </div>
                                  <p className="text-xs text-gray-600 leading-relaxed">{art.details}</p>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* FEEDBACK & ESCALATIONS BLOCK */}
        <div className="border-t border-[#E4DBC5] pt-12 flex flex-col md:flex-row justify-between items-start gap-8">
          <div className="space-y-2">
            <h4 className="font-black text-gray-900 text-lg uppercase tracking-tight">Need custom legal filings or certifications?</h4>
            <p className="text-sm text-gray-500 max-w-xl leading-relaxed">
              If your organizational control team requires custom compliance checklists, voluntary product accessibility templates (VPATs), or specific service-level agreements (SLAs), contact our secure compliance desk.
            </p>
          </div>
          <Link 
            to="/support-form?type=security" 
            className="px-6 py-3.5 bg-black text-white hover:bg-neutral-800 rounded-2xl font-bold tracking-wide text-xs flex items-center gap-2 transition-all shrink-0 shadow-md hover:shadow-lg active:scale-95 cursor-pointer font-sans uppercase"
          >
            <Mail className="w-4 h-4 text-white" /> Contact Compliance Desk
          </Link>
        </div>

      </main>

      <Footer />
    </div>
  );
}
