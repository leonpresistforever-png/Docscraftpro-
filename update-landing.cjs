const fs = require('fs');
let code = fs.readFileSync('src/pages/LandingPage.tsx', 'utf-8');

// 1. Remove "Interactive Architecture"
code = code.replace('Interactive Architecture', 'ENTERPRISE READY');

// 2. Real-World Use Cases
// Legal & Contracts
code = code.replace('Generate NDAs, vendor agreements, and essential contracts confidently. Apply offline editing controls and review historical versions effortlessly.',
'Generate NDAs, vendor agreements, and essential contracts confidently. Apply offline editing controls and review historical versions effortlessly. Keep track of complex clauses, format legal terminology precisely, and ensure your confidential drafts remain perfectly structured across infinite revisions.');

// Technical Documentation
code = code.replace('Build developer manuals, structural references, and engineering blueprints right next to your codebase with embedded diagram tools.',
'Build developer manuals, structural references, and engineering blueprints right next to your codebase with embedded diagram tools. Organize expansive knowledge bases, maintain hierarchical outlines for massive API documentation, and seamlessly structure deep technical concepts with perfect typographical clarity.');

// HR & Onboarding
code = code.replace('Draft offer letters, employee directories, and performance schedules with rich formatting options that print beautifully.',
'Draft offer letters, employee directories, and performance schedules with rich formatting options that print beautifully. Standardize corporate communication, build extensive onboarding guides, and craft professional internal memos that align flawlessly with your organizational standards.');

// Creative Content & Strategy
code = code.replace('Brainstorm marketing campaigns, outline detailed research papers, and maintain structural consistency across massive content projects.',
'Brainstorm marketing campaigns, outline detailed research papers, and maintain structural consistency across massive content projects. Keep your narrative flowing without distraction, break down complex storyboards, and organize expansive volumes of research notes in a clean, distraction-free creative vault.');

fs.writeFileSync('src/pages/LandingPage.tsx', code);
