// Picklists from "DX Digital Workbook.xlsx" > Data Sheet, de-duplicated.
// Entries marked "added" cover DX's niche focus areas not yet in the workbook.

type CertType =
  | "admin"
  | "developer"
  | "consultant"
  | "architect"
  | "marketing"
  | "commerce"
  | "industry_cloud"
  | "designer"
  | "crm_analytics"
  | "heroku"
  | "mulesoft";

export const SKILLS: { name: string; category: string }[] = [
  { name: "Salesforce", category: "Platform" },
  { name: "Mulesoft", category: "Integration" },
  { name: "Industry Cloud", category: "Industries" },
  { name: "Heroku", category: "Platform" },
  { name: "Sales Cloud", category: "Clouds" },
  { name: "Service Cloud", category: "Clouds" },
  { name: "Marketing Cloud", category: "Clouds" },
  { name: "B2B Commerce Cloud", category: "Commerce" },
  { name: "B2C Commerce Cloud", category: "Commerce" },
  { name: "AI", category: "AI" },
  { name: "Einstein Copilot", category: "AI" },
  { name: "Experience Cloud", category: "Clouds" },
  // added
  { name: "Revenue Cloud", category: "Clouds" },
  { name: "CPQ", category: "Clouds" },
  { name: "OmniStudio", category: "Industries" },
  { name: "Data Cloud", category: "Data" },
  { name: "Agentforce", category: "AI" },
  { name: "Field Service", category: "Clouds" },
  { name: "Apex", category: "Development" },
  { name: "Lightning Web Components", category: "Development" },
];

export const INDUSTRIES: string[] = [
  "Agriculture", "Automotive", "Banking", "Biotechnology", "Chemicals",
  "Communications", "Construction", "Consulting", "Consumer Packaged Goods",
  "Education", "Energy", "Engineering", "Entertainment", "Environmental",
  "Financial Services", "Food & Beverage", "Government", "Healthcare",
  "High Tech", "Hospitality", "Insurance", "Manufacturing", "Media",
  "Nonprofit", "Other", "Pharmaceuticals", "Real Estate", "Recreation",
  "Retail", "Shipping", "Technology", "Telecommunications", "Transportation",
  "Utilities",
];

const CERTIFICATION_NAMES: string[] = [
  "Salesforce Administrator",
  "Salesforce Advanced Administrator",
  "Salesforce Platform Developer I",
  "Salesforce Platform Developer II",
  "Salesforce B2C Commerce Developer",
  "Salesforce Industries CPQ Developer",
  "Salesforce JavaScript Developer I",
  "Salesforce Certified Application Architect",
  "Salesforce Certified System Architect",
  "Salesforce Certified Technical Architect",
  "Salesforce Certified B2C Solution Architect",
  "Salesforce Certified Heroku Architect",
  "Salesforce Certified Integration Architect",
  "Salesforce Certified Data Architect",
  "Salesforce Certified Sharing and Visibility Architect",
  "Salesforce Certified Identity and Access Management Architect",
  "Salesforce Certified Development Lifecycle and Deployment Architect",
  "Salesforce Sales Cloud Consultant",
  "Salesforce Service Cloud Consultant",
  "Salesforce Experience Cloud Consultant",
  "Salesforce Marketing Cloud Consultant",
  "Salesforce Pardot Consultant",
  "Salesforce Education Cloud Consultant",
  "Salesforce Field Service Consultant",
  "Salesforce Nonprofit Cloud Consultant",
  "Salesforce OmniStudio Consultant",
  "Salesforce Tableau CRM & Einstein Discovery Consultant",
  "Salesforce Industries CPQ Consultant",
  "Salesforce Marketing Cloud Administrator",
  "Salesforce Marketing Cloud Developer",
  "Salesforce Marketing Cloud Email Specialist",
  "Salesforce Marketing Cloud Social Specialist",
  "Salesforce Pardot Specialist",
  "Salesforce B2C Commerce Architect",
  "Salesforce B2B Commerce Administrator",
  "Salesforce B2B Commerce Developer",
  "Salesforce B2C Solution Architect",
  "Salesforce OmniStudio Developer",
  "Salesforce User Experience (UX) Designer",
  "Salesforce Strategy Designer",
  "Salesforce Einstein Analytics and Discovery Consultant",
  "Salesforce Einstein Analytics and Discovery Developer",
  "Salesforce AI Associate",
  "Salesforce Data Cloud Consultant",
  // added
  "Salesforce Revenue Cloud Consultant",
  "Salesforce Agentforce Specialist",
  "MuleSoft Certified Developer - Level 1",
  "MuleSoft Certified Integration Architect - Level 1",
  "MuleSoft Certified Platform Architect - Level 1",
];

function certificationType(name: string): CertType {
  const n = name.toLowerCase();
  if (n.includes("mulesoft")) return "mulesoft";
  if (n.includes("heroku")) return "heroku";
  if (n.includes("designer")) return "designer";
  if (n.includes("tableau") || n.includes("analytics")) return "crm_analytics";
  if (n.includes("marketing cloud") || n.includes("pardot")) return "marketing";
  if (n.includes("commerce")) return "commerce";
  if (n.includes("industries") || n.includes("omnistudio")) return "industry_cloud";
  if (n.includes("architect")) return "architect";
  if (n.includes("developer")) return "developer";
  if (n.includes("administrator")) return "admin";
  return "consultant";
}

export const CERTIFICATIONS = [...new Set(CERTIFICATION_NAMES)].map((name) => ({
  name,
  issuingBody: name.startsWith("MuleSoft") ? "MuleSoft" : "Salesforce",
  type: certificationType(name),
}));
