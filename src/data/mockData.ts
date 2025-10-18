export type TaskStatus = 'open' | 'in-progress' | 'submitted' | 'completed' | 'cancelled';
export type TaskCategory = 'coding' | 'design' | 'translation' | 'math' | 'writing' | 'other';
export type ApplicationStatus = 'pending' | 'approved' | 'rejected';
export type SubmissionStatus = 'not-submitted' | 'submitted' | 'verified' | 'rejected';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'publisher' | 'freelancer';
}

export interface Submission {
  id: string;
  freelancerId: string;
  freelancerName: string;
  taskId: string;
  submittedAt: string;
  status: SubmissionStatus;
  content: string;
  fileUrl?: string;
  fileType?: 'image' | 'text' | 'code' | 'pdf';
  aiVerification?: {
    score: number;
    feedback: string;
    verified: boolean;
    verifiedAt: string;
  };
}

export interface Application {
  id: string;
  freelancerId: string;
  freelancerName: string;
  taskId: string;
  appliedAt: string;
  status: ApplicationStatus;
  experience: string;
  aiAssessment?: {
    score: number;
    feedback: string;
    eligible: boolean;
  };
}

export interface Task {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  budget: number;
  deadline: string;
  status: TaskStatus;
  publisherId: string;
  publisherName: string;
  createdAt: string;
  requirements: string[];
  applications: Application[];
  submissions: Submission[];
  difficulty?: 'easy' | 'medium' | 'hard';
}

// Mock current user
export const currentUser: User = {
  id: 'user-1',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'publisher',
};

// Mock tasks
export const mockTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Build a React Component Library',
    description: 'Create a reusable component library with TypeScript and Tailwind CSS. The library should include common UI components like buttons, cards, modals, and forms. Documentation is required.',
    category: 'coding',
    budget: 500,
    deadline: '2025-11-15',
    status: 'open',
    publisherId: 'user-1',
    publisherName: 'John Doe',
    createdAt: '2025-10-10',
    difficulty: 'hard',
    requirements: [
      'TypeScript experience',
      'React expertise',
      'Tailwind CSS knowledge',
      'Documentation skills'
    ],
    applications: [
      {
        id: 'app-1',
        freelancerId: 'freelancer-1',
        freelancerName: 'Alice Smith',
        taskId: 'task-1',
        appliedAt: '2025-10-11',
        status: 'approved',
        experience: '5 years of React development, built 10+ component libraries',
        aiAssessment: {
          score: 92,
          feedback: 'Excellent match. Strong background in React and TypeScript. Has relevant portfolio projects.',
          eligible: true,
        }
      },
      {
        id: 'app-2',
        freelancerId: 'freelancer-2',
        freelancerName: 'Bob Johnson',
        taskId: 'task-1',
        appliedAt: '2025-10-12',
        status: 'pending',
        experience: '2 years of React development',
      }
    ],
    submissions: [],
  },
  {
    id: 'task-2',
    title: 'Design Modern Landing Page',
    description: 'Design a modern, responsive landing page for a SaaS product. Must include hero section, features, pricing, and contact form. Figma or Adobe XD format.',
    category: 'design',
    budget: 300,
    deadline: '2025-10-30',
    status: 'in-progress',
    publisherId: 'user-1',
    publisherName: 'John Doe',
    createdAt: '2025-10-05',
    difficulty: 'medium',
    requirements: [
      'UI/UX design experience',
      'Figma or Adobe XD proficiency',
      'Portfolio of landing pages'
    ],
    applications: [
      {
        id: 'app-3',
        freelancerId: 'freelancer-3',
        freelancerName: 'Carol White',
        taskId: 'task-2',
        appliedAt: '2025-10-06',
        status: 'approved',
        experience: 'Professional UI/UX designer with 50+ landing pages in portfolio',
        aiAssessment: {
          score: 95,
          feedback: 'Perfect match. Extensive landing page design experience.',
          eligible: true,
        }
      }
    ],
    submissions: [
      {
        id: 'sub-1',
        freelancerId: 'freelancer-3',
        freelancerName: 'Carol White',
        taskId: 'task-2',
        submittedAt: '2025-10-15',
        status: 'verified',
        content: 'Modern landing page design with hero section, features grid, and pricing table',
        fileUrl: '/mock-designs/landing-page.png',
        fileType: 'image',
        aiVerification: {
          score: 88,
          feedback: 'Design meets all requirements. Modern aesthetic with good use of whitespace. Responsive layout considerations evident.',
          verified: true,
          verifiedAt: '2025-10-15',
        }
      }
    ],
  },
  {
    id: 'task-3',
    title: 'Translate Technical Documentation (EN to ES)',
    description: 'Translate 50 pages of technical documentation from English to Spanish. Must maintain technical accuracy and context.',
    category: 'translation',
    budget: 200,
    deadline: '2025-11-01',
    status: 'open',
    publisherId: 'user-2',
    publisherName: 'Jane Smith',
    createdAt: '2025-10-08',
    difficulty: 'medium',
    requirements: [
      'Native Spanish speaker',
      'Technical translation experience',
      'English proficiency'
    ],
    applications: [],
    submissions: [],
  },
  {
    id: 'task-4',
    title: 'Solve Calculus Problem Set',
    description: 'Complete 20 advanced calculus problems including derivatives, integrals, and differential equations. Show all work.',
    category: 'math',
    budget: 150,
    deadline: '2025-10-25',
    status: 'open',
    publisherId: 'user-2',
    publisherName: 'Jane Smith',
    createdAt: '2025-10-12',
    difficulty: 'hard',
    requirements: [
      'Advanced calculus knowledge',
      'Clear problem-solving methodology',
      'LaTeX formatting preferred'
    ],
    applications: [
      {
        id: 'app-4',
        freelancerId: 'freelancer-4',
        freelancerName: 'David Lee',
        taskId: 'task-4',
        appliedAt: '2025-10-13',
        status: 'approved',
        experience: 'PhD in Mathematics, 10 years teaching calculus',
        aiAssessment: {
          score: 98,
          feedback: 'Exceptional qualifications. PhD level mathematics expertise.',
          eligible: true,
        }
      }
    ],
    submissions: [],
  },
  {
    id: 'task-5',
    title: 'Write SEO Blog Posts',
    description: 'Write 5 SEO-optimized blog posts (1000 words each) about web development trends. Must include keyword research and meta descriptions.',
    category: 'writing',
    budget: 250,
    deadline: '2025-11-10',
    status: 'open',
    publisherId: 'user-1',
    publisherName: 'John Doe',
    createdAt: '2025-10-14',
    difficulty: 'easy',
    requirements: [
      'SEO writing experience',
      'Web development knowledge',
      'Grammar excellence'
    ],
    applications: [],
    submissions: [],
  },
  {
    id: 'task-6',
    title: 'Develop REST API with Node.js',
    description: 'Build a RESTful API using Node.js, Express, and MongoDB. Must include authentication, CRUD operations, and documentation.',
    category: 'coding',
    budget: 600,
    deadline: '2025-11-20',
    status: 'submitted',
    publisherId: 'user-1',
    publisherName: 'John Doe',
    createdAt: '2025-10-01',
    difficulty: 'hard',
    requirements: [
      'Node.js expertise',
      'MongoDB experience',
      'API design skills',
      'Documentation abilities'
    ],
    applications: [
      {
        id: 'app-5',
        freelancerId: 'freelancer-5',
        freelancerName: 'Emma Brown',
        taskId: 'task-6',
        appliedAt: '2025-10-02',
        status: 'approved',
        experience: 'Senior backend developer, 8 years Node.js experience',
        aiAssessment: {
          score: 94,
          feedback: 'Highly qualified. Extensive backend and API development experience.',
          eligible: true,
        }
      }
    ],
    submissions: [
      {
        id: 'sub-2',
        freelancerId: 'freelancer-5',
        freelancerName: 'Emma Brown',
        taskId: 'task-6',
        submittedAt: '2025-10-16',
        status: 'submitted',
        content: 'Complete REST API with authentication, CRUD operations, and Swagger documentation',
        fileUrl: 'https://github.com/mock/rest-api',
        fileType: 'code',
        aiVerification: {
          score: 91,
          feedback: 'Excellent implementation. All endpoints functional, authentication secure, documentation comprehensive. Minor optimization opportunities identified.',
          verified: true,
          verifiedAt: '2025-10-16',
        }
      }
    ],
  },
  {
    id: 'task-7',
    title: 'Create Logo and Brand Identity',
    description: 'Design a complete brand identity package including logo, color palette, typography guidelines, and usage examples.',
    category: 'design',
    budget: 400,
    deadline: '2025-11-05',
    status: 'open',
    publisherId: 'user-2',
    publisherName: 'Jane Smith',
    createdAt: '2025-10-09',
    difficulty: 'medium',
    requirements: [
      'Brand identity design experience',
      'Logo design portfolio',
      'Vector graphics skills'
    ],
    applications: [],
    submissions: [],
  },
  {
    id: 'task-8',
    title: 'Translate Marketing Copy (EN to FR)',
    description: 'Translate marketing materials including website copy, email campaigns, and social media posts from English to French.',
    category: 'translation',
    budget: 180,
    deadline: '2025-10-28',
    status: 'open',
    publisherId: 'user-1',
    publisherName: 'John Doe',
    createdAt: '2025-10-11',
    difficulty: 'easy',
    requirements: [
      'Native French speaker',
      'Marketing translation experience',
      'Cultural adaptation skills'
    ],
    applications: [],
    submissions: [],
  },
  {
    id: 'task-9',
    title: 'Statistical Analysis with Python',
    description: 'Perform statistical analysis on dataset using Python (pandas, numpy, scipy). Create visualizations and write report.',
    category: 'coding',
    budget: 350,
    deadline: '2025-11-12',
    status: 'open',
    publisherId: 'user-2',
    publisherName: 'Jane Smith',
    createdAt: '2025-10-13',
    difficulty: 'medium',
    requirements: [
      'Python data analysis skills',
      'Statistics knowledge',
      'Data visualization experience'
    ],
    applications: [],
    submissions: [],
  },
  {
    id: 'task-10',
    title: 'Write Product Documentation',
    description: 'Create comprehensive product documentation including user guides, API references, and troubleshooting sections.',
    category: 'writing',
    budget: 300,
    deadline: '2025-11-08',
    status: 'completed',
    publisherId: 'user-1',
    publisherName: 'John Doe',
    createdAt: '2025-09-20',
    difficulty: 'medium',
    requirements: [
      'Technical writing experience',
      'Clear communication skills',
      'Attention to detail'
    ],
    applications: [
      {
        id: 'app-6',
        freelancerId: 'freelancer-6',
        freelancerName: 'Frank Wilson',
        taskId: 'task-10',
        appliedAt: '2025-09-21',
        status: 'approved',
        experience: 'Technical writer with 6 years experience in software documentation',
        aiAssessment: {
          score: 89,
          feedback: 'Strong technical writing background. Portfolio shows quality documentation work.',
          eligible: true,
        }
      }
    ],
    submissions: [
      {
        id: 'sub-3',
        freelancerId: 'freelancer-6',
        freelancerName: 'Frank Wilson',
        taskId: 'task-10',
        submittedAt: '2025-10-05',
        status: 'verified',
        content: 'Complete product documentation with user guides, API reference, and troubleshooting guide',
        fileUrl: '/mock-docs/product-documentation.pdf',
        fileType: 'pdf',
        aiVerification: {
          score: 93,
          feedback: 'Excellent documentation. Clear structure, comprehensive coverage, good examples. Meets all requirements.',
          verified: true,
          verifiedAt: '2025-10-05',
        }
      }
    ],
  },
  {
    id: 'task-11',
    title: 'Mobile App UI Design',
    description: 'Design UI screens for a mobile fitness tracking app. Include onboarding, dashboard, workout tracking, and profile screens.',
    category: 'design',
    budget: 450,
    deadline: '2025-11-18',
    status: 'open',
    publisherId: 'user-2',
    publisherName: 'Jane Smith',
    createdAt: '2025-10-15',
    difficulty: 'hard',
    requirements: [
      'Mobile UI/UX design experience',
      'Fitness app knowledge',
      'High-fidelity mockups'
    ],
    applications: [],
    submissions: [],
  },
  {
    id: 'task-12',
    title: 'Solve Linear Algebra Problems',
    description: 'Solve 15 linear algebra problems including matrix operations, eigenvalues, and vector spaces. Detailed explanations required.',
    category: 'math',
    budget: 120,
    deadline: '2025-10-27',
    status: 'open',
    publisherId: 'user-1',
    publisherName: 'John Doe',
    createdAt: '2025-10-16',
    difficulty: 'medium',
    requirements: [
      'Linear algebra expertise',
      'Clear explanations',
      'Step-by-step solutions'
    ],
    applications: [],
    submissions: [],
  },
];

// Helper functions
export const getTaskById = (id: string): Task | undefined => {
  return mockTasks.find(task => task.id === id);
};

export const getTasksByPublisher = (publisherId: string): Task[] => {
  return mockTasks.filter(task => task.publisherId === publisherId);
};

export const getAvailableTasks = (): Task[] => {
  return mockTasks.filter(task => task.status === 'open');
};

export const getTasksByFreelancer = (freelancerId: string): Task[] => {
  return mockTasks.filter(task => 
    task.applications.some(app => app.freelancerId === freelancerId)
  );
};

