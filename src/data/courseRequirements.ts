export interface DegreeRequirement {
  requirement_id: string;
  category: string;
  courses: string[];
  credits_required: number;
}

export interface CourseCatalogEntry {
  title: string;
  description: string;
  credits: number;
  prerequisites: string[];
}

export const computerScienceDegreeRequirements = {
  degree_id: "UMGC_CMSC_BS",
  name: "Bachelor of Science in Computer Science",
  requirements: [
    {
      requirement_id: "CORE_PROGRAMMING",
      category: "Core Programming",
      courses: ["CMSC 105", "CMSC 115", "CMSC 215", "CMSC 255"],
      credits_required: 12,
    },
    {
      requirement_id: "ALGORITHMS_AND_SYSTEMS",
      category: "Algorithms and Systems",
      courses: ["CMSC 315", "CMSC 412", "CMSC 430", "CMSC 451"],
      credits_required: 12,
    },
    {
      requirement_id: "UPPER_LEVEL_ELECTIVES",
      category: "Upper-Level Electives",
      courses: ["CMSC 325", "CMSC 335", "CMSC 405"],
      credits_required: 9,
    },
    {
      requirement_id: "CAPSTONE",
      category: "Capstone",
      courses: ["CMSC 495"],
      credits_required: 3,
    },
  ] satisfies DegreeRequirement[],
};

export const courseCatalog: Record<string, CourseCatalogEntry> = {
  "CMSC 105": {
    title: "Introduction to Problem Solving and Algorithm Design",
    description:
      "Covers foundational problem-solving strategies, algorithmic thinking, and basic programming concepts.",
    credits: 3,
    prerequisites: [],
  },
  "CMSC 115": {
    title: "Introduction to Programming",
    description:
      "Introduces programming fundamentals including variables, control flow, functions, and debugging.",
    credits: 3,
    prerequisites: ["CMSC 105"],
  },
  "CMSC 215": {
    title: "Intermediate Programming",
    description:
      "Builds on introductory programming with data structures, modular design, and file handling.",
    credits: 3,
    prerequisites: ["CMSC 115"],
  },
  "CMSC 255": {
    title: "Introduction to Object-Oriented Programming",
    description:
      "Covers classes, objects, inheritance, and polymorphism using an object-oriented language.",
    credits: 3,
    prerequisites: ["CMSC 215"],
  },
  "CMSC 315": {
    title: "Advanced Data Structures and Algorithms",
    description:
      "Explores algorithm analysis, recursion, trees, graphs, and performance considerations.",
    credits: 3,
    prerequisites: ["CMSC 215"],
  },
  "CMSC 325": {
    title: "Game Design and Development",
    description:
      "Introduces game engines, rendering, physics, and interactive design principles.",
    credits: 3,
    prerequisites: ["CMSC 255"],
  },
  "CMSC 335": {
    title: "Object-Oriented and Concurrent Programming",
    description:
      "Covers advanced OOP concepts, concurrency, threads, and synchronization.",
    credits: 3,
    prerequisites: ["CMSC 255"],
  },
  "CMSC 405": {
    title: "Computer Graphics",
    description:
      "Explores rendering pipelines, transformations, lighting, and 3D modeling concepts.",
    credits: 3,
    prerequisites: ["CMSC 335"],
  },
  "CMSC 412": {
    title: "Operating Systems",
    description:
      "Covers processes, memory management, scheduling, file systems, and OS architecture.",
    credits: 3,
    prerequisites: ["CMSC 315"],
  },
  "CMSC 430": {
    title: "Introduction to Compilers",
    description:
      "Examines lexical analysis, parsing, semantic analysis, and code generation.",
    credits: 3,
    prerequisites: ["CMSC 315"],
  },
  "CMSC 451": {
    title: "Design and Analysis of Algorithms",
    description:
      "Focuses on algorithmic complexity, NP-completeness, and advanced algorithmic strategies.",
    credits: 3,
    prerequisites: ["CMSC 315"],
  },
  "CMSC 495": {
    title: "Capstone in Computer Science",
    description:
      "A culminating project integrating concepts across the computer science curriculum.",
    credits: 3,
    prerequisites: ["CMSC 412", "CMSC 430", "CMSC 451"],
  },
};

export function getRequiredCoursesForMajor(major: string): string[] {
  if (major !== "Computer Science") {
    return [];
  }

  return computerScienceDegreeRequirements.requirements.flatMap(
    (requirement) => requirement.courses,
  );
}

export function getRemainingRequirements(
  major: string,
  completedCourses: string[],
): string[] {
  const completedSet = new Set(
    completedCourses.map((course) => course.trim().toUpperCase()),
  );

  return getRequiredCoursesForMajor(major).filter(
    (requiredCourse) => !completedSet.has(requiredCourse),
  );
}

export function getEligibleCourses(remainingCourses: string[]): string[] {
  const remainingSet = new Set(remainingCourses);

  return remainingCourses.filter((courseCode) => {
    const catalogEntry = courseCatalog[courseCode];

    if (!catalogEntry) {
      return true;
    }

    return catalogEntry.prerequisites.every(
      (prerequisite) => !remainingSet.has(prerequisite),
    );
  });
}