import {
  User,
  Challenge,
  Recommendation,
  Startup,
  Evaluation,
  Pilot,
  Milestone,
  MilestoneStatus,
  Decision,
  Application,
  ApplicationStatus,
} from "@/types";
import {
  MOCK_USERS,
  MOCK_CHALLENGES,
  MOCK_RECOMMENDATIONS,
  MOCK_STARTUPS,
  MOCK_EVALUATIONS,
  MOCK_PILOTS,
  MOCK_DECISIONS,
  MOCK_DEPARTMENTS,
} from "./mock-data";

// Helper to simulate API network delay (300ms - 600ms)
function delay<T>(data: T, ms?: number): Promise<T> {
  const time = ms || Math.floor(Math.random() * 300) + 300;
  return new Promise((resolve) => setTimeout(() => resolve(data), time));
}

// Global in-memory storage for mutations during demo session
let challengesStore = [...MOCK_CHALLENGES];
let evaluationsStore = [...MOCK_EVALUATIONS];
let pilotsStore = JSON.parse(JSON.stringify(MOCK_PILOTS)) as Pilot[];
let decisionsStore = [...MOCK_DECISIONS];
let recommendationsStore = [...MOCK_RECOMMENDATIONS];

export async function login(
  email: string,
  _password?: string
): Promise<{ token: string; user: User }> {
  const foundUser = MOCK_USERS.find(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  );
  const user = foundUser || MOCK_USERS[0]; // fallback to default user if unrecognized
  return delay({
    token: `mock-jwt-token-${user.id}-${Date.now()}`,
    user,
  });
}

export async function getChallenges(): Promise<Challenge[]> {
  return delay([...challengesStore]);
}

export async function getDashboardSummary() {
  const createdCount = challengesStore.length - MOCK_CHALLENGES.length;
  return delay({
    totalChallenges: 12 + createdCount,
    applications: 48,
    activePilots: 5,
    pendingEvaluations: 7,
    scaleUpCandidates: 2,
    recentChallenges: challengesStore.slice(0, 5),
  });
}

export async function createChallenge(
  data: Omit<Challenge, "id" | "createdAt">
): Promise<Challenge> {
  const newChallenge: Challenge = {
    ...data,
    id: `chal-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  challengesStore.unshift(newChallenge);
  return delay(newChallenge);
}

export async function getRecommendations(
  challengeId: string
): Promise<Recommendation[]> {
  const matchedRecs = MOCK_RECOMMENDATIONS.filter(
    (r) => r.challengeId === challengeId
  );

  const recsToUse =
    matchedRecs.length > 0
      ? matchedRecs
      : MOCK_RECOMMENDATIONS.filter((r) => r.challengeId === "chal-1");

  const joinedRecs = recsToUse.map((r) => ({
    ...r,
    startup: MOCK_STARTUPS.find((s) => s.id === r.startupId) || r.startup,
  }));

  // Sort descending by matchScore
  joinedRecs.sort((a, b) => b.matchScore - a.matchScore);

  return delay(joinedRecs);
}

export async function compareStartups(startupIds: string[]): Promise<Startup[]> {
  const filtered = MOCK_STARTUPS.filter((s) => startupIds.includes(s.id));
  return delay(filtered.length ? filtered : MOCK_STARTUPS.slice(0, 3));
}

export async function submitEvaluation(
  data: Omit<Evaluation, "id">
): Promise<Evaluation> {
  const existingIdx = evaluationsStore.findIndex(
    (e) =>
      e.challengeId === data.challengeId && e.startupId === data.startupId
  );

  const evaluation: Evaluation = {
    ...data,
    id: existingIdx >= 0 ? evaluationsStore[existingIdx].id : `eval-${Date.now()}`,
  };

  if (existingIdx >= 0) {
    evaluationsStore[existingIdx] = evaluation;
  } else {
    evaluationsStore.push(evaluation);
  }

  return delay(evaluation);
}

export async function getPilot(pilotId: string): Promise<Pilot> {
  const found = pilotsStore.find((p) => p.id === pilotId) || pilotsStore[0];
  const challenge = challengesStore.find((c) => c.id === found.challengeId);
  const startup = MOCK_STARTUPS.find((s) => s.id === found.startupId);
  return delay({
    ...found,
    challenge,
    startup,
  });
}

export async function updateMilestone(
  milestoneId: string,
  status: MilestoneStatus
): Promise<Milestone> {
  let updatedMilestone: Milestone | null = null;
  for (const pilot of pilotsStore) {
    const ms = pilot.milestones.find((m) => m.id === milestoneId);
    if (ms) {
      ms.status = status;
      if (status === "COMPLETED") {
        ms.completedAt = new Date().toISOString();
      }
      updatedMilestone = { ...ms };
      break;
    }
  }
  if (!updatedMilestone) {
    updatedMilestone = {
      id: milestoneId,
      pilotId: "pilot-1",
      title: "Updated Milestone",
      amount: 100000,
      status,
    };
  }
  return delay(updatedMilestone);
}

export async function recordDecision(
  pilotId: string,
  outcome: string
): Promise<Decision> {
  const decision: Decision = {
    id: `dec-${Date.now()}`,
    pilotId,
    outcome,
    recommendedBy: "usr-1",
    recommendedAt: new Date().toISOString(),
  };
  decisionsStore.push(decision);
  return delay(decision);
}

export async function getChallenge(id: string): Promise<Challenge> {
  const found = challengesStore.find((c) => c.id === id);
  const fallback = challengesStore[0] || MOCK_CHALLENGES[0];
  return delay(found || { ...fallback, id });
}

export async function getStartup(id: string): Promise<Startup> {
  const found = MOCK_STARTUPS.find((s) => s.id === id);
  const fallback = MOCK_STARTUPS[0];
  return delay(found || { ...fallback, id });
}

export async function startPilot(
  challengeId: string,
  startupId: string
): Promise<Pilot> {
  const newPilotId = `pilot-${Date.now()}`;
  const challenge =
    challengesStore.find((c) => c.id === challengeId) || MOCK_CHALLENGES[0];
  const startup =
    MOCK_STARTUPS.find((s) => s.id === startupId) || MOCK_STARTUPS[0];

  const newPilot: Pilot = {
    id: newPilotId,
    challengeId,
    startupId,
    status: "ACTIVE",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    baselineValue: 35,
    targetValue: 20,
    actualValue: 17,
    challenge,
    startup,
    milestones: [
      {
        id: `ms-${Date.now()}-1`,
        pilotId: newPilotId,
        title: "Initial Hardware & Telemetry Setup",
        amount: 250000,
        status: "COMPLETED",
        completedAt: new Date().toISOString(),
      },
      {
        id: `ms-${Date.now()}-2`,
        pilotId: newPilotId,
        title: "Field Deployment & Baseline Data Calibration",
        amount: 300000,
        status: "IN_PROGRESS",
      },
      {
        id: `ms-${Date.now()}-3`,
        pilotId: newPilotId,
        title: "Final Impact Audit & Scale-Up Proposal",
        amount: 250000,
        status: "PENDING",
      },
    ],
  };

  pilotsStore.unshift(newPilot);
  return delay(newPilot);
}

const BASE_APPLICATIONS = [
  {
    id: "app-101",
    shortId: "APP-101",
    challengeId: "chal-1",
    startupId: "start-1",
    recommendationId: "rec-1",
    submittedAt: "2026-08-18T10:15:00Z",
  },
  {
    id: "app-102",
    shortId: "APP-102",
    challengeId: "chal-1",
    startupId: "start-3",
    recommendationId: "rec-2",
    submittedAt: "2026-08-20T14:30:00Z",
  },
  {
    id: "app-103",
    shortId: "APP-103",
    challengeId: "chal-1",
    startupId: "start-2",
    recommendationId: "rec-3",
    submittedAt: "2026-08-22T09:00:00Z",
  },
  {
    id: "app-104",
    shortId: "APP-104",
    challengeId: "chal-1",
    startupId: "start-5",
    recommendationId: "rec-4",
    submittedAt: "2026-08-24T16:45:00Z",
  },
  {
    id: "app-105",
    shortId: "APP-105",
    challengeId: "chal-2",
    startupId: "start-2",
    recommendationId: "rec-6",
    submittedAt: "2026-08-25T11:20:00Z",
  },
  {
    id: "app-106",
    shortId: "APP-106",
    challengeId: "chal-2",
    startupId: "start-4",
    submittedAt: "2026-08-26T13:10:00Z",
  },
  {
    id: "app-107",
    shortId: "APP-107",
    challengeId: "chal-2",
    startupId: "start-6",
    submittedAt: "2026-08-27T15:00:00Z",
  },
  {
    id: "app-108",
    shortId: "APP-108",
    challengeId: "chal-3",
    startupId: "start-3",
    submittedAt: "2026-09-02T10:00:00Z",
  },
  {
    id: "app-109",
    shortId: "APP-109",
    challengeId: "chal-3",
    startupId: "start-1",
    submittedAt: "2026-09-03T12:00:00Z",
  },
  {
    id: "app-110",
    shortId: "APP-110",
    challengeId: "chal-1",
    startupId: "start-4",
    submittedAt: "2026-08-28T09:30:00Z",
  },
  {
    id: "app-111",
    shortId: "APP-111",
    challengeId: "chal-2",
    startupId: "start-1",
    submittedAt: "2026-08-29T14:20:00Z",
  },
  {
    id: "app-112",
    shortId: "APP-112",
    challengeId: "chal-2",
    startupId: "start-5",
    submittedAt: "2026-08-30T16:00:00Z",
  },
  {
    id: "app-113",
    shortId: "APP-113",
    challengeId: "chal-3",
    startupId: "start-2",
    submittedAt: "2026-09-04T11:45:00Z",
  },
  {
    id: "app-114",
    shortId: "APP-114",
    challengeId: "chal-3",
    startupId: "start-6",
    submittedAt: "2026-09-05T15:30:00Z",
  },
];

let applicationsStore = [...BASE_APPLICATIONS];

function buildApplicationRecord(base: (typeof BASE_APPLICATIONS)[0]): Application {
  const challenge =
    challengesStore.find((c) => c.id === base.challengeId) || MOCK_CHALLENGES[0];
  const startup =
    MOCK_STARTUPS.find((s) => s.id === base.startupId) || MOCK_STARTUPS[0];
  const recommendation = base.recommendationId
    ? recommendationsStore.find((r) => r.id === base.recommendationId)
    : undefined;
  const evaluation = evaluationsStore.find(
    (e) => e.challengeId === base.challengeId && e.startupId === base.startupId
  );
  const pilot = pilotsStore.find(
    (p) => p.challengeId === base.challengeId && p.startupId === base.startupId
  );

  let status: ApplicationStatus = "UNDER_REVIEW";
  if (pilot) {
    status = "SELECTED";
  } else if (evaluation && evaluation.status === "SUBMITTED") {
    status = "EVALUATED";
  }

  return {
    id: base.id,
    shortId: base.shortId,
    challengeId: base.challengeId,
    startupId: base.startupId,
    recommendationId: base.recommendationId,
    submittedAt: base.submittedAt,
    status,
    challenge,
    startup,
    evaluation,
    pilot,
    recommendation,
  };
}

export async function getApplications(): Promise<Application[]> {
  const list = applicationsStore.map(buildApplicationRecord);
  return delay(list);
}

export async function getApplicationDetail(id: string): Promise<Application> {
  const all = applicationsStore.map(buildApplicationRecord);
  const found =
    all.find(
      (a) =>
        a.id.toLowerCase() === id.toLowerCase() ||
        a.shortId.toLowerCase() === id.toLowerCase()
    ) || all[0];
  return delay(found);
}

export async function getEvaluations(): Promise<Evaluation[]> {
  const joined = evaluationsStore.map((e) => {
    const startup = MOCK_STARTUPS.find((s) => s.id === e.startupId);
    const challenge = challengesStore.find((c) => c.id === e.challengeId);
    const evaluator =
      MOCK_USERS.find((u) => u.id === e.evaluatorId) || MOCK_USERS[2];
    return {
      ...e,
      startup,
      challenge,
      evaluator,
    };
  });

  return delay(joined);
}

export async function getAllPilots(): Promise<Pilot[]> {
  const joined = pilotsStore.map((pilot) => {
    const challenge =
      challengesStore.find((c) => c.id === pilot.challengeId) ||
      MOCK_CHALLENGES[0];
    const startup =
      MOCK_STARTUPS.find((s) => s.id === pilot.startupId) || MOCK_STARTUPS[0];
    const dept = MOCK_DEPARTMENTS.find(
      (d) => d.id === challenge.departmentId
    );
    const decision = decisionsStore.find((d) => d.pilotId === pilot.id);

    return {
      ...pilot,
      challenge,
      startup,
      departmentName: dept?.name || "Public Works Department",
      decision,
    };
  });

  return delay(joined);
}

export async function getMyPilots(startupId: string): Promise<Pilot[]> {
  const allPilots = pilotsStore.map((pilot) => {
    const challenge =
      challengesStore.find((c) => c.id === pilot.challengeId) ||
      MOCK_CHALLENGES[0];
    const startup =
      MOCK_STARTUPS.find((s) => s.id === pilot.startupId) || MOCK_STARTUPS[0];
    const dept = MOCK_DEPARTMENTS.find(
      (d) => d.id === challenge.departmentId
    );
    const decision = decisionsStore.find((d) => d.pilotId === pilot.id);

    return {
      ...pilot,
      challenge,
      startup,
      departmentName: dept?.name || "Public Works Department",
      decision,
    };
  });

  const myPilots = allPilots.filter((p) => p.startupId === startupId);
  return delay(myPilots);
}

export async function getPilotDetail(id: string): Promise<Pilot> {
  const allPilots = pilotsStore.map((pilot) => {
    const challenge =
      challengesStore.find((c) => c.id === pilot.challengeId) ||
      MOCK_CHALLENGES[0];
    const startup =
      MOCK_STARTUPS.find((s) => s.id === pilot.startupId) || MOCK_STARTUPS[0];
    const dept = MOCK_DEPARTMENTS.find(
      (d) => d.id === challenge.departmentId
    );
    const decision = decisionsStore.find((d) => d.pilotId === pilot.id);

    return {
      ...pilot,
      challenge,
      startup,
      departmentName: dept?.name || "Public Works Department",
      decision,
    };
  });

  const found = allPilots.find((p) => p.id.toLowerCase() === id.toLowerCase()) || allPilots[0];
  return delay(found);
}

export async function getMyApplications(startupId: string): Promise<Application[]> {
  const all = applicationsStore.map(buildApplicationRecord);
  const myApps = all.filter((a) => a.startupId === startupId);
  return delay(myApps);
}

export async function getStartupDashboardStats(startupId: string) {
  const allApps = applicationsStore.map(buildApplicationRecord);
  const myApps = allApps.filter((a) => a.startupId === startupId);

  const totalApplications = myApps.length;
  const underReview = myApps.filter((a) => a.status === "UNDER_REVIEW").length;

  const joinedPilots = pilotsStore.map((p) => ({
    ...p,
    startup: MOCK_STARTUPS.find((s) => s.id === p.startupId),
  }));
  const activePilots = joinedPilots.filter(
    (p) => p.startupId === startupId && p.status === "ACTIVE"
  ).length;

  const recs = recommendationsStore.filter((r) => r.startupId === startupId);
  const bestMatchScore = recs.length > 0 ? Math.max(...recs.map((r) => r.matchScore)) : 94;

  return delay({
    totalApplications,
    underReview,
    activePilots,
    bestMatchScore,
    myApplications: myApps,
  });
}

export async function getOpenChallengesForStartup(startupId: string) {
  const activeChallenges = challengesStore.filter((c) => c.status === "ACTIVE");
  const myApps = applicationsStore.filter((a) => a.startupId === startupId);
  const myAppChallengeIds = new Set(myApps.map((a) => a.challengeId));

  const annotated = activeChallenges.map((c) => {
    const dept = MOCK_DEPARTMENTS.find((d) => d.id === c.departmentId);
    const applicantCount = applicationsStore.filter((a) => a.challengeId === c.id).length;
    return {
      ...c,
      hasApplied: myAppChallengeIds.has(c.id),
      departmentName: dept?.name || "Public Works Department",
      applicantCount,
    };
  });

  return delay(annotated);
}

export async function submitApplication(
  startupId: string,
  challengeId: string,
  proposalData: { capabilitySummary?: string; teamSize?: number; location?: string; sector?: string }
): Promise<Application> {
  const newRecId = `rec-${Date.now()}`;
  const newRec: Recommendation = {
    id: newRecId,
    challengeId,
    startupId,
    matchScore: 88 + Math.floor(Math.random() * 8),
    matchReason: proposalData.capabilitySummary || "Direct startup application submission",
  };
  recommendationsStore.push(newRec);

  const newAppId = `app-${Date.now()}`;
  const nextNum = applicationsStore.length + 101;
  const newAppBase = {
    id: newAppId,
    shortId: `APP-${nextNum}`,
    challengeId,
    startupId,
    recommendationId: newRecId,
    submittedAt: new Date().toISOString(),
  };
  applicationsStore.unshift(newAppBase);

  const startup = MOCK_STARTUPS.find((s) => s.id === startupId);
  if (startup && proposalData) {
    if (proposalData.capabilitySummary) startup.capabilitySummary = proposalData.capabilitySummary;
    if (proposalData.teamSize) startup.teamSize = Number(proposalData.teamSize);
    if (proposalData.location) startup.location = proposalData.location;
    if (proposalData.sector && !startup.sectorTags.includes(proposalData.sector)) {
      startup.sectorTags.unshift(proposalData.sector);
    }
  }

  const fullApp = buildApplicationRecord(newAppBase);
  return delay(fullApp);
}

export async function getMyApplicationDetail(
  startupId: string,
  applicationId: string
): Promise<Application | null> {
  const all = applicationsStore.map(buildApplicationRecord);
  const found = all.find(
    (a) =>
      a.startupId === startupId &&
      (a.id.toLowerCase() === applicationId.toLowerCase() ||
        a.shortId.toLowerCase() === applicationId.toLowerCase())
  );

  if (!found) return delay(null);

  const founderApp: Application = {
    ...found,
    evaluation: found.evaluation
      ? {
          ...found.evaluation,
          evaluator: undefined,
        }
      : undefined,
  };

  return delay(founderApp);
}


