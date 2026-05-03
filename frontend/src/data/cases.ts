export type Risk = "low" | "medium" | "high" | "critical";
export type CaseStatus = "processing" | "needs_review" | "completed";
export type PipelineStage = "ocr" | "extraction" | "reasoning" | "action_plan";

export interface Highlight {
  id: string;
  kind: "directive" | "date" | "party" | "statute";
  text: string;
  /** index of paragraph in pdfBody this highlight belongs to */
  paragraph: number;
  note?: string;
}

export interface DecisionAction {
  id: string;
  action: string;
  reasoning: string;
  alternatives?: string[];
  confidence: number; // 0-100
  risk: Risk;
  deadline: string; // ISO
  sourceHighlightId?: string;
}

export interface ExtractedField {
  id: string;
  label: string;
  value: string;
  confidence: number;
  sourceHighlightId?: string;
}

export interface GraphNode {
  id: string;
  label: string;
  sub?: string;
  kind: "court" | "department" | "officer" | "action" | "status";
  state?: "ok" | "delayed" | "pending";
}
export interface GraphEdge { from: string; to: string; state?: "ok" | "active" | "delayed"; }

export interface CourtCase {
  id: string;
  title: string;
  court: string;
  department: string;
  filedOn: string;
  status: CaseStatus;
  stage: PipelineStage;
  pipelineProgress: number; // 0-100
  urgency: Risk;
  pdfBody: string[]; // paragraphs
  highlights: Highlight[];
  decisions: DecisionAction[];
  fields: ExtractedField[];
  graph: { nodes: GraphNode[]; edges: GraphEdge[] };
  actionType: string;
}

const inDays = (d: number) => new Date(Date.now() + d * 86400000).toISOString();

export const cases: CourtCase[] = [
  {
    id: "WP-2024-08712",
    title: "Ramesh Kumar vs. State of Maharashtra",
    court: "Bombay High Court",
    department: "Revenue",
    filedOn: "2024-11-12",
    status: "needs_review",
    stage: "action_plan",
    pipelineProgress: 100,
    urgency: "critical",
    actionType: "File Appeal",
    pdfBody: [
      "IN THE HIGH COURT OF JUDICATURE AT BOMBAY — Civil Writ Petition No. 8712 of 2024. Between Ramesh Kumar, son of Late Shri Mohan Kumar, resident of Thane West, hereinafter referred to as the Petitioner, AND The State of Maharashtra, through the Collector of Thane, the Respondent.",
      "The petitioner challenges the order dated 03.09.2024 passed by the Sub-Divisional Officer, Thane, whereby the mutation entry No. 4421/2019 in respect of land bearing Survey No. 117/2 admeasuring 1.42 hectares was cancelled without affording an opportunity of hearing to the petitioner.",
      "Having heard the learned counsel for the parties and on perusal of the record, this Court is of the considered view that the impugned order suffers from violation of principles of natural justice. The Sub-Divisional Officer is directed to restore the mutation entry within thirty (30) days from the date of this order and to conduct a fresh inquiry after issuing notice to all interested parties.",
      "The State is further directed to deposit a compensatory cost of Rs. 25,000/- payable to the petitioner within sixty (60) days. Compliance report shall be submitted to the Registrar (Judicial) on or before 15.01.2025. List for compliance on 22.01.2025.",
    ],
    highlights: [
      { id: "h1", kind: "party", text: "Ramesh Kumar", paragraph: 0 },
      { id: "h2", kind: "party", text: "State of Maharashtra", paragraph: 0 },
      { id: "h3", kind: "directive", text: "restore the mutation entry within thirty (30) days", paragraph: 2, note: "Primary directive" },
      { id: "h4", kind: "directive", text: "deposit a compensatory cost of Rs. 25,000/-", paragraph: 3 },
      { id: "h5", kind: "date", text: "15.01.2025", paragraph: 3, note: "Compliance report deadline" },
      { id: "h6", kind: "statute", text: "principles of natural justice", paragraph: 2 },
    ],
    decisions: [
      {
        id: "d1",
        action: "Restore Mutation Entry",
        reasoning: "Court mandates restoration of mutation entry No. 4421/2019 within 30 days. Action is unambiguous and mandatory.",
        confidence: 96,
        risk: "high",
        deadline: inDays(12),
        sourceHighlightId: "h3",
      },
      {
        id: "d2",
        action: "Deposit ₹25,000 Compensation",
        reasoning: "Compensatory cost payable to petitioner within 60 days. Treasury route via DDO required.",
        confidence: 92,
        risk: "medium",
        deadline: inDays(38),
        sourceHighlightId: "h4",
      },
      {
        id: "d3",
        action: "File Compliance Report",
        reasoning: "Submission to Registrar (Judicial) by 15.01.2025. Listing for compliance hearing on 22.01.2025 — non-filing risks contempt.",
        alternatives: [
          "Seek extension via Misc. Application if inquiry incomplete.",
          "File interim status report instead, citing pending notices.",
        ],
        confidence: 71,
        risk: "critical",
        deadline: inDays(5),
        sourceHighlightId: "h5",
      },
    ],
    fields: [
      { id: "f1", label: "Petitioner", value: "Ramesh Kumar", confidence: 99, sourceHighlightId: "h1" },
      { id: "f2", label: "Respondent", value: "State of Maharashtra (Collector, Thane)", confidence: 97, sourceHighlightId: "h2" },
      { id: "f3", label: "Primary Directive", value: "Restore mutation entry No. 4421/2019", confidence: 94, sourceHighlightId: "h3" },
      { id: "f4", label: "Compliance Deadline", value: "15 Jan 2025", confidence: 88, sourceHighlightId: "h5" },
      { id: "f5", label: "Department", value: "Revenue / Sub-Divisional Office, Thane", confidence: 90 },
    ],
    graph: {
      nodes: [
        { id: "n1", label: "Bombay HC", sub: "Order 03.09.2024", kind: "court" },
        { id: "n2", label: "Revenue Dept", sub: "Thane Division", kind: "department" },
        { id: "n3", label: "SDO Thane", sub: "Smt. A. Pawar", kind: "officer", state: "delayed" },
        { id: "n4", label: "Restore Mutation", sub: "30-day window", kind: "action", state: "pending" },
        { id: "n5", label: "Compliance Report", sub: "Due 15 Jan", kind: "status", state: "pending" },
      ],
      edges: [
        { from: "n1", to: "n2", state: "ok" },
        { from: "n2", to: "n3", state: "delayed" },
        { from: "n3", to: "n4", state: "active" },
        { from: "n4", to: "n5", state: "active" },
      ],
    },
  },
  {
    id: "CRL-2025-00214",
    title: "State vs. Anand Verma",
    court: "Delhi High Court",
    department: "Police",
    filedOn: "2025-01-04",
    status: "processing",
    stage: "reasoning",
    pipelineProgress: 68,
    urgency: "high",
    actionType: "Issue Notice",
    pdfBody: [
      "IN THE HIGH COURT OF DELHI AT NEW DELHI — Criminal Miscellaneous Petition No. 214 of 2025. The accused, Shri Anand Verma, has moved this Court under Section 482 CrPC seeking quashing of FIR No. 119/2024 registered at PS Saket.",
      "The State, represented by the learned Additional Public Prosecutor, opposes the petition citing pendency of investigation and recovery of incriminating material from the premises of the accused on 14.10.2024.",
      "Issue notice to the Investigating Officer to file a status report within four (4) weeks. The Commissioner of Police, Delhi shall ensure compliance. Matter to be listed thereafter for further consideration.",
    ],
    highlights: [
      { id: "h1", kind: "party", text: "Anand Verma", paragraph: 0 },
      { id: "h2", kind: "directive", text: "Issue notice to the Investigating Officer", paragraph: 2 },
      { id: "h3", kind: "date", text: "four (4) weeks", paragraph: 2 },
    ],
    decisions: [
      {
        id: "d1",
        action: "Issue Notice to IO",
        reasoning: "Notice required to IO of PS Saket to file status report within 4 weeks. Routine compliance.",
        confidence: 89,
        risk: "medium",
        deadline: inDays(28),
        sourceHighlightId: "h2",
      },
      {
        id: "d2",
        action: "Prepare Status Report",
        reasoning: "Investigation summary covering recovery on 14.10.2024 and current status of probe.",
        alternatives: ["File interim report if forensic results pending."],
        confidence: 64,
        risk: "high",
        deadline: inDays(26),
      },
    ],
    fields: [
      { id: "f1", label: "Accused", value: "Anand Verma", confidence: 98, sourceHighlightId: "h1" },
      { id: "f2", label: "FIR No.", value: "119/2024 — PS Saket", confidence: 95 },
      { id: "f3", label: "Action", value: "Issue notice & file status report", confidence: 87, sourceHighlightId: "h2" },
    ],
    graph: {
      nodes: [
        { id: "n1", label: "Delhi HC", kind: "court" },
        { id: "n2", label: "Delhi Police", sub: "South District", kind: "department" },
        { id: "n3", label: "IO, PS Saket", kind: "officer", state: "pending" },
        { id: "n4", label: "Status Report", sub: "4 weeks", kind: "action", state: "pending" },
        { id: "n5", label: "Awaiting", kind: "status" },
      ],
      edges: [
        { from: "n1", to: "n2", state: "ok" },
        { from: "n2", to: "n3", state: "active" },
        { from: "n3", to: "n4", state: "active" },
        { from: "n4", to: "n5" },
      ],
    },
  },
  {
    id: "MUN-2025-00091",
    title: "Resident Welfare Assn. vs. BBMP",
    court: "Karnataka High Court",
    department: "Municipal",
    filedOn: "2025-02-18",
    status: "needs_review",
    stage: "action_plan",
    pipelineProgress: 100,
    urgency: "medium",
    actionType: "Conduct Survey",
    pdfBody: [
      "Karnataka High Court — W.P. No. 91 of 2025. The petitioner Resident Welfare Association, HSR Layout Sector 6, seeks a writ of mandamus directing BBMP to repair stormwater drains prior to monsoon.",
      "BBMP submits that tenders have been floated and work shall commence by 30.04.2025. The Court directs BBMP to conduct a ward-level survey within 21 days and submit a phase-wise repair schedule.",
      "Compliance affidavit to be filed by the Chief Engineer, BBMP (West Zone) on or before 12.05.2025.",
    ],
    highlights: [
      { id: "h1", kind: "directive", text: "conduct a ward-level survey within 21 days", paragraph: 1 },
      { id: "h2", kind: "date", text: "12.05.2025", paragraph: 2 },
      { id: "h3", kind: "party", text: "Chief Engineer, BBMP (West Zone)", paragraph: 2 },
    ],
    decisions: [
      {
        id: "d1",
        action: "Conduct Ward Survey",
        reasoning: "Direct survey of stormwater drains in HSR Layout Sector 6 within 21 days.",
        confidence: 93,
        risk: "medium",
        deadline: inDays(19),
        sourceHighlightId: "h1",
      },
      {
        id: "d2",
        action: "Submit Repair Schedule",
        reasoning: "Phase-wise schedule to accompany compliance affidavit by 12 May.",
        confidence: 90,
        risk: "medium",
        deadline: inDays(34),
        sourceHighlightId: "h2",
      },
    ],
    fields: [
      { id: "f1", label: "Petitioner", value: "RWA HSR Layout Sec 6", confidence: 96 },
      { id: "f2", label: "Responsible Officer", value: "Chief Engineer, BBMP West", confidence: 91, sourceHighlightId: "h3" },
      { id: "f3", label: "Compliance Date", value: "12 May 2025", confidence: 94, sourceHighlightId: "h2" },
    ],
    graph: {
      nodes: [
        { id: "n1", label: "Karnataka HC", kind: "court" },
        { id: "n2", label: "BBMP", sub: "West Zone", kind: "department" },
        { id: "n3", label: "Chief Engineer", kind: "officer", state: "ok" },
        { id: "n4", label: "Ward Survey", kind: "action", state: "pending" },
        { id: "n5", label: "Repair Schedule", kind: "status", state: "pending" },
      ],
      edges: [
        { from: "n1", to: "n2", state: "ok" },
        { from: "n2", to: "n3", state: "ok" },
        { from: "n3", to: "n4", state: "active" },
        { from: "n4", to: "n5", state: "active" },
      ],
    },
  },
  {
    id: "EDU-2024-04420",
    title: "Sunita Devi vs. Education Board",
    court: "Patna High Court",
    department: "Education",
    filedOn: "2024-12-29",
    status: "completed",
    stage: "action_plan",
    pipelineProgress: 100,
    urgency: "low",
    actionType: "Reinstate Result",
    pdfBody: [
      "Patna High Court directs the Bihar School Examination Board to declare the withheld Class XII result of the petitioner's daughter, Kumari Anjali, within 15 days.",
      "The Secretary of the Board shall personally ensure compliance and file an affidavit.",
    ],
    highlights: [
      { id: "h1", kind: "directive", text: "declare the withheld Class XII result", paragraph: 0 },
      { id: "h2", kind: "date", text: "within 15 days", paragraph: 0 },
    ],
    decisions: [
      {
        id: "d1",
        action: "Declare Result",
        reasoning: "Result of Kumari Anjali to be declared within 15 days. Done — affidavit filed 12.03.2025.",
        confidence: 99,
        risk: "low",
        deadline: inDays(-2),
        sourceHighlightId: "h1",
      },
    ],
    fields: [
      { id: "f1", label: "Student", value: "Kumari Anjali", confidence: 98 },
      { id: "f2", label: "Action", value: "Declare withheld result", confidence: 97, sourceHighlightId: "h1" },
    ],
    graph: {
      nodes: [
        { id: "n1", label: "Patna HC", kind: "court" },
        { id: "n2", label: "BSEB", kind: "department" },
        { id: "n3", label: "Board Secretary", kind: "officer", state: "ok" },
        { id: "n4", label: "Declare Result", kind: "action", state: "ok" },
        { id: "n5", label: "Completed", kind: "status", state: "ok" },
      ],
      edges: [
        { from: "n1", to: "n2", state: "ok" },
        { from: "n2", to: "n3", state: "ok" },
        { from: "n3", to: "n4", state: "ok" },
        { from: "n4", to: "n5", state: "ok" },
      ],
    },
  },
  {
    id: "REV-2025-01103",
    title: "Greenfield Estates vs. Municipal Corp.",
    court: "Madras High Court",
    department: "Revenue",
    filedOn: "2025-03-02",
    status: "processing",
    stage: "extraction",
    pipelineProgress: 42,
    urgency: "high",
    actionType: "Reassess Tax",
    pdfBody: ["Reassess property tax for survey nos. 88, 89 of Anna Nagar within 45 days and refund excess collection."],
    highlights: [{ id: "h1", kind: "directive", text: "Reassess property tax", paragraph: 0 }],
    decisions: [
      {
        id: "d1",
        action: "Reassess Property Tax",
        reasoning: "Survey nos. 88 & 89, Anna Nagar — reassess and refund excess.",
        confidence: 81,
        risk: "high",
        deadline: inDays(45),
      },
    ],
    fields: [
      { id: "f1", label: "Survey Nos.", value: "88, 89 — Anna Nagar", confidence: 92 },
      { id: "f2", label: "Action", value: "Reassess & refund", confidence: 84 },
    ],
    graph: {
      nodes: [
        { id: "n1", label: "Madras HC", kind: "court" },
        { id: "n2", label: "Municipal Corp.", kind: "department" },
        { id: "n3", label: "Asst. Commissioner", kind: "officer", state: "pending" },
        { id: "n4", label: "Reassessment", kind: "action", state: "pending" },
        { id: "n5", label: "Refund", kind: "status" },
      ],
      edges: [
        { from: "n1", to: "n2" },
        { from: "n2", to: "n3" },
        { from: "n3", to: "n4" },
        { from: "n4", to: "n5" },
      ],
    },
  },
  {
    id: "POL-2025-00077",
    title: "PIL — Traffic Congestion",
    court: "Allahabad High Court",
    department: "Police",
    filedOn: "2025-03-19",
    status: "processing",
    stage: "ocr",
    pipelineProgress: 18,
    urgency: "medium",
    actionType: "Deploy Personnel",
    pdfBody: ["Deploy additional traffic personnel at Civil Lines junction during peak hours and submit weekly report."],
    highlights: [{ id: "h1", kind: "directive", text: "Deploy additional traffic personnel", paragraph: 0 }],
    decisions: [
      {
        id: "d1",
        action: "Deploy Traffic Personnel",
        reasoning: "Peak hour deployment at Civil Lines junction.",
        confidence: 76,
        risk: "medium",
        deadline: inDays(7),
      },
    ],
    fields: [{ id: "f1", label: "Location", value: "Civil Lines Junction", confidence: 90 }],
    graph: {
      nodes: [
        { id: "n1", label: "Allahabad HC", kind: "court" },
        { id: "n2", label: "UP Police", kind: "department" },
        { id: "n3", label: "SP Traffic", kind: "officer" },
        { id: "n4", label: "Deployment", kind: "action" },
        { id: "n5", label: "Weekly Report", kind: "status" },
      ],
      edges: [
        { from: "n1", to: "n2" },
        { from: "n2", to: "n3" },
        { from: "n3", to: "n4" },
        { from: "n4", to: "n5" },
      ],
    },
  },
  {
    id: "MUN-2025-00188",
    title: "Heritage Society vs. PMC",
    court: "Bombay High Court",
    department: "Municipal",
    filedOn: "2025-03-22",
    status: "needs_review",
    stage: "action_plan",
    pipelineProgress: 100,
    urgency: "low",
    actionType: "Halt Demolition",
    pdfBody: ["Halt demolition of structure at Plot 14, Camp Area pending heritage review committee report within 90 days."],
    highlights: [{ id: "h1", kind: "directive", text: "Halt demolition", paragraph: 0 }],
    decisions: [
      {
        id: "d1",
        action: "Stay Demolition",
        reasoning: "Immediate stay until heritage committee report (90 days).",
        confidence: 95,
        risk: "low",
        deadline: inDays(2),
      },
    ],
    fields: [{ id: "f1", label: "Property", value: "Plot 14, Camp Area, Pune", confidence: 96 }],
    graph: {
      nodes: [
        { id: "n1", label: "Bombay HC", kind: "court" },
        { id: "n2", label: "PMC", kind: "department" },
        { id: "n3", label: "Ward Officer", kind: "officer", state: "ok" },
        { id: "n4", label: "Stay Order", kind: "action", state: "pending" },
        { id: "n5", label: "Committee Review", kind: "status" },
      ],
      edges: [
        { from: "n1", to: "n2", state: "ok" },
        { from: "n2", to: "n3", state: "ok" },
        { from: "n3", to: "n4", state: "active" },
        { from: "n4", to: "n5" },
      ],
    },
  },
  {
    id: "REV-2025-00990",
    title: "Patel Farms vs. Land Acquisition Officer",
    court: "Gujarat High Court",
    department: "Revenue",
    filedOn: "2025-02-04",
    status: "processing",
    stage: "reasoning",
    pipelineProgress: 74,
    urgency: "critical",
    actionType: "Pay Compensation",
    pdfBody: [
      "Land Acquisition Officer is directed to pay enhanced compensation of Rs. 4,80,000/- per hectare with interest at 9% p.a. from the date of possession until payment.",
      "Disbursement to be completed within 45 days. Failure shall attract contempt proceedings.",
    ],
    highlights: [
      { id: "h1", kind: "directive", text: "pay enhanced compensation of Rs. 4,80,000/- per hectare", paragraph: 0 },
      { id: "h2", kind: "date", text: "within 45 days", paragraph: 1 },
    ],
    decisions: [
      {
        id: "d1",
        action: "Disburse Enhanced Compensation",
        reasoning: "Pay ₹4,80,000/hectare + 9% interest from possession date. Strict 45-day window with contempt risk.",
        alternatives: ["File review petition citing comparable rates if budget approval pending."],
        confidence: 68,
        risk: "critical",
        deadline: inDays(11),
        sourceHighlightId: "h1",
      },
    ],
    fields: [
      { id: "f1", label: "Compensation Rate", value: "₹4,80,000 / hectare", confidence: 90 },
      { id: "f2", label: "Interest", value: "9% p.a. from possession", confidence: 85 },
      { id: "f3", label: "Window", value: "45 days", confidence: 92, sourceHighlightId: "h2" },
    ],
    graph: {
      nodes: [
        { id: "n1", label: "Gujarat HC", kind: "court" },
        { id: "n2", label: "Revenue Dept", kind: "department" },
        { id: "n3", label: "LAO", kind: "officer", state: "delayed" },
        { id: "n4", label: "Disbursement", kind: "action", state: "pending" },
        { id: "n5", label: "Pending", kind: "status", state: "delayed" },
      ],
      edges: [
        { from: "n1", to: "n2", state: "ok" },
        { from: "n2", to: "n3", state: "delayed" },
        { from: "n3", to: "n4", state: "active" },
        { from: "n4", to: "n5", state: "delayed" },
      ],
    },
  },
];

export const getCase = (id: string) => cases.find((c) => c.id === id) ?? cases[0];

export const stages: { key: PipelineStage; label: string }[] = [
  { key: "ocr", label: "OCR" },
  { key: "extraction", label: "Extraction" },
  { key: "reasoning", label: "Reasoning" },
  { key: "action_plan", label: "Action Plan" },
];
