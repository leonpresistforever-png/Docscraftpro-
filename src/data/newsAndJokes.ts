export interface CodeJoke {
  language: string;
  code: string;
  punchline: string;
}

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  time: string;
  category: string;
  description: string;
}

export const CODE_JOKES: CodeJoke[] = [
  {
    language: 'typescript',
    code: `const developer: Dev = {
  coffee: "infinite",
  sanity: 0,
  codeQuality: "outstanding",
  sleepNeeded: true,
  work: () => {
    while (developer.coffee) {
      writeCode();
      if (bugFound) {
        cryQuietly();
        blameCompiler();
      }
    }
  }
};`,
    punchline: '// Loop runs infinitely because coffee never drains, unlike sanity!'
  },
  {
    language: 'python',
    code: `def coder_life_cycle():
    code = write_features()
    try:
        deploy_to_production(code)
    except Exception as e:
        git_blame_senior_dev()
    finally:
        pretend_it_worked()
        claim_it_was_local_caching()`,
    punchline: '# Standard deployment lifecycle: when in doubt, blame the CDN!'
  },
  {
    language: 'sql',
    code: `SELECT user_beverage_choice, count(*) 
FROM smart_pub 
WHERE taste = 'exquisite'
  AND cost = 'free'
GROUP BY beverage_choice;`,
    punchline: '-- Database returned: "0 rows found." Reality checked.'
  },
  {
    language: 'javascript',
    code: `try {
  relationship.engage();
  happiness = "100%";
} catch (HeartbreakException e) {
  session.clear();
  happiness = "0%";
  window.location.href = "https://github.com";
} finally {
  console.log("Back to coding neat apps offline!");
}`,
    punchline: '// Error handled beautifully. Code compiles fine.'
  },
  {
    language: 'cpp',
    code: `#include <iostream>
using namespace std;

int main() {
    bool compilerHappy = false;
    while (!compilerHappy) {
        removeSemicolon();
        addRandomBrackets();
        compilerHappy = true; // Ignorance is bliss
    }
    return 0;
}`,
    punchline: '// 404: Semicolon expected at line 349102.'
  },
  {
    language: 'rust',
    code: `fn borrow_checker_dance() {
    let mut brain = Brain::new();
    let memory_pointer = &mut brain;
    
    // Rust borrow checker screaming
    let secondary_read = &brain; 
    println!("Shared mutability is the devil!");
}`,
    punchline: '// Cargo build failed: Cannot borrow brain as mutable and immutable simultaneously.'
  },
  {
    language: 'typescript',
    code: `// Finding a bug at 3:00 AM
function searchForAnomaly() {
  const line = Math.floor(Math.random() * linesOfCode);
  if (line === 42) {
    throw new Error('Scoffs in Assembler');
  }
}`,
    punchline: '// Rebuilt 28 times. Works perfectly on local machine!'
  }
];

export const TECH_NEWS: NewsItem[] = [
  {
    id: 'news_1',
    title: 'TypeScript 5.8 announced: Native Type-Stripping natively supported in stable engines',
    source: 'TypeScript Blog',
    time: '2 hours ago',
    category: 'LANG-CORE',
    description: 'The latest TypeScript release allows Node.js and major browsers to evaluate typed buffers natively without bundled compilation stages.'
  },
  {
    id: 'news_2',
    title: 'React 19 Server Actions roll out across mainstream secure cloud adapters',
    source: 'React News',
    time: '5 hours ago',
    category: 'VIRTUAL-DOM',
    description: 'Stable server-side execution handlers reach standard distributions, eliminating boilerplate data fetching and proxy code entirely.'
  },
  {
    id: 'news_3',
    title: 'WebGPU v2.0 specifications support running 8B Parameter Models inside mobile tabs',
    source: 'W3C Syndicate',
    time: '12 hours ago',
    category: 'SANDBOX-GPU',
    description: 'Hardware-accelerated WebGPU pipelines bypass centralized cloud overhead, bringing neural vector operations directly to personal devices.'
  },
  {
    id: 'news_4',
    title: 'Tailwind CSS v4.0 goes live: Pure CSS engine with zero-runtime compilation',
    source: 'WebDev Trends',
    time: '1 day ago',
    category: 'ENGINE-UI',
    description: 'A revolutionary core built from scratch delivers 10x faster compiling speeds and streamlined builds by mapping utilities natively.'
  },
  {
    id: 'news_5',
    title: 'P2P local sync schemas validated to protect users from cloud telemetry outages',
    source: 'Security Wire',
    time: '2 days ago',
    category: 'SECURE-SYNC',
    description: 'Independent consensus tests confirm peer-to-peer state machines sync millions of nodes locally with fully secure, localized cryptography.'
  }
];
