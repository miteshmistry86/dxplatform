// Fictional listed resources so the catalogue can be demoed. Run with `npm run db:seed -- --demo`.

type Level = "junior" | "middle" | "expert";
type Role = "architect" | "business_analyst" | "developer" | "qa" | "project_manager" | "consultant";

export interface DemoResource {
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  country: string;
  timezone: string;
  headline: string;
  summary: string;
  role: Role;
  years: number;
  availableFrom: string;
  skills: [string, Level][];
  certifications: string[];
  industries: string[];
  experience: {
    jobTitle: string;
    company: string;
    start: string;
    end?: string;
    industry: string;
    description: string;
  }[];
}

export const DEMO_RESOURCES: DemoResource[] = [
  {
    firstName: "Priya",
    lastName: "Raman",
    email: "demo.priya@example.com",
    jobTitle: "Revenue Cloud Solution Architect",
    country: "United Kingdom",
    timezone: "Europe/London",
    headline: "Revenue Cloud & CPQ architect for complex quote-to-cash",
    summary:
      "Designed Revenue Cloud and CPQ solutions for subscription businesses, covering pricing, contract lifecycle and billing integration.",
    role: "architect",
    years: 11,
    availableFrom: "2026-12-01",
    skills: [["Revenue Cloud", "expert"], ["CPQ", "expert"], ["Sales Cloud", "expert"], ["Mulesoft", "middle"]],
    certifications: ["Salesforce Revenue Cloud Consultant", "Salesforce Certified Application Architect", "Salesforce Industries CPQ Consultant"],
    industries: ["High Tech", "Telecommunications"],
    experience: [
      { jobTitle: "Lead Solution Architect", company: "Global SaaS vendor", start: "2021-03-01", industry: "High Tech", description: "Quote-to-cash re-platform onto Revenue Cloud across 4 regions." },
      { jobTitle: "CPQ Consultant", company: "Telco operator", start: "2017-06-01", end: "2021-02-28", industry: "Telecommunications", description: "Configured product bundles and approval flows for B2B sales." },
    ],
  },
  {
    firstName: "Marco",
    lastName: "Bianchi",
    email: "demo.marco@example.com",
    jobTitle: "Salesforce Industries Developer",
    country: "Italy",
    timezone: "Europe/Rome",
    headline: "OmniStudio developer specialising in Insurance & FSC",
    summary: "Builds OmniScripts, FlexCards and Integration Procedures for Financial Services and Insurance clouds.",
    role: "developer",
    years: 7,
    availableFrom: "2026-11-15",
    skills: [["OmniStudio", "expert"], ["Industry Cloud", "expert"], ["Apex", "middle"], ["Lightning Web Components", "middle"]],
    certifications: ["Salesforce OmniStudio Developer", "Salesforce OmniStudio Consultant", "Salesforce Platform Developer I"],
    industries: ["Insurance", "Financial Services"],
    experience: [
      { jobTitle: "Senior Industries Developer", company: "European insurer", start: "2022-01-01", industry: "Insurance", description: "Policy servicing journeys in OmniStudio for 2M policyholders." },
    ],
  },
  {
    firstName: "Daniel",
    lastName: "Okafor",
    email: "demo.daniel@example.com",
    jobTitle: "MuleSoft Integration Architect",
    country: "Ireland",
    timezone: "Europe/Dublin",
    headline: "API-led connectivity across Salesforce, SAP and data platforms",
    summary: "Integration architect delivering MuleSoft API networks and event-driven patterns for enterprise Salesforce estates.",
    role: "architect",
    years: 12,
    availableFrom: "2027-01-05",
    skills: [["Mulesoft", "expert"], ["Salesforce", "expert"], ["Data Cloud", "middle"]],
    certifications: ["MuleSoft Certified Integration Architect - Level 1", "MuleSoft Certified Platform Architect - Level 1", "Salesforce Certified Integration Architect"],
    industries: ["Manufacturing", "Retail"],
    experience: [
      { jobTitle: "Integration Architect", company: "Manufacturing group", start: "2020-05-01", industry: "Manufacturing", description: "Designed 60+ APIs connecting Salesforce to SAP S/4HANA." },
    ],
  },
  {
    firstName: "Sofia",
    lastName: "Lindqvist",
    email: "demo.sofia@example.com",
    jobTitle: "Agentforce & Data Cloud Consultant",
    country: "Sweden",
    timezone: "Europe/Stockholm",
    headline: "Agentforce and Data Cloud consultant for service transformation",
    summary: "Delivers Agentforce agents grounded in Data Cloud, from use-case discovery to production rollout.",
    role: "consultant",
    years: 6,
    availableFrom: "2026-11-20",
    skills: [["Agentforce", "expert"], ["Data Cloud", "expert"], ["Service Cloud", "expert"], ["AI", "middle"]],
    certifications: ["Salesforce Agentforce Specialist", "Salesforce Data Cloud Consultant", "Salesforce Service Cloud Consultant"],
    industries: ["Retail", "Hospitality"],
    experience: [
      { jobTitle: "Lead Consultant", company: "Retail chain", start: "2023-02-01", industry: "Retail", description: "Rolled out service agents deflecting 35% of case volume." },
    ],
  },
  {
    firstName: "Arjun",
    lastName: "Mehta",
    email: "demo.arjun@example.com",
    jobTitle: "AI-Powered Salesforce Developer",
    country: "India",
    timezone: "Asia/Kolkata",
    headline: "Full-stack Salesforce developer trained on the DX Delivery Agent",
    summary: "Uses the DX agentic toolkit to accelerate build: generated metadata, Apex, LWC and automated tests.",
    role: "developer",
    years: 5,
    availableFrom: "2026-11-10",
    skills: [["Apex", "expert"], ["Lightning Web Components", "expert"], ["Sales Cloud", "middle"], ["AI", "middle"]],
    certifications: ["Salesforce Platform Developer I", "Salesforce Platform Developer II", "Salesforce JavaScript Developer I"],
    industries: ["Technology", "Healthcare"],
    experience: [
      { jobTitle: "Salesforce Developer", company: "Healthcare provider", start: "2022-07-01", industry: "Healthcare", description: "Patient engagement portal on Experience Cloud with LWC." },
    ],
  },
  {
    firstName: "Hannah",
    lastName: "Schmidt",
    email: "demo.hannah@example.com",
    jobTitle: "Salesforce Business Analyst",
    country: "Germany",
    timezone: "Europe/Berlin",
    headline: "BA bridging business stakeholders and Salesforce delivery teams",
    summary: "Runs discovery workshops, writes user stories and acceptance criteria, and owns UAT for Sales and Service Cloud programmes.",
    role: "business_analyst",
    years: 8,
    availableFrom: "2026-12-15",
    skills: [["Sales Cloud", "expert"], ["Service Cloud", "middle"], ["Experience Cloud", "middle"]],
    certifications: ["Salesforce Administrator", "Salesforce Sales Cloud Consultant"],
    industries: ["Automotive", "Energy"],
    experience: [
      { jobTitle: "Senior Business Analyst", company: "Automotive OEM", start: "2021-09-01", industry: "Automotive", description: "Dealer network CRM programme across 12 markets." },
    ],
  },
];
