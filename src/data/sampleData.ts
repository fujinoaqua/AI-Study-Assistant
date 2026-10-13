import { StudyDocument, Flashcard, QuizAttempt, ExamCountdown, ActivityItem } from '../types';

export const INITIAL_DOCUMENTS: StudyDocument[] = [
  {
    id: 'doc-bio-101',
    title: 'Cellular Respiration & Photosynthesis',
    category: 'Biology',
    tags: ['Metabolism', 'ATP', 'Biochemistry', 'Cellular Energy'],
    createdAt: '2026-10-10T14:20:00Z',
    wordCount: 840,
    readingTimeMinutes: 4,
    content: `Cellular respiration is the primary biochemical pathway through which eukaryotic and prokaryotic cells harvest energy stored in chemical bonds of organic nutrients, primarily glucose (C6H12O6), and convert it into adenosine triphosphate (ATP). The overall balanced aerobic respiration reaction is: C6H12O6 + 6O2 -> 6CO2 + 6H2O + ~30-32 ATP.

The aerobic respiration pathway proceeds across four major discrete stages:
1. Glycolysis: Takes place exclusively in the cytoplasm. One 6-carbon glucose molecule is broken down anaerobically into two 3-carbon pyruvate molecules, yielding a net gain of 2 ATP (via substrate-level phosphorylation) and 2 NADH.
2. Pyruvate Oxidation: Pyruvate moves into the mitochondrial matrix. An enzyme complex decarboxylates pyruvate, releasing CO2, forming NADH, and attaching Coenzyme A to yield Acetyl-CoA.
3. The Citric Acid Cycle (Krebs Cycle): Occurs in the mitochondrial matrix. Acetyl-CoA combines with oxaloacetate to form citrate. Across eight enzymatic steps, two turns of the cycle (per original glucose) release 4 CO2, generate 2 ATP (or GTP), 6 NADH, and 2 FADH2.
4. Oxidative Phosphorylation: Takes place across the inner mitochondrial membrane (cristae). High-energy electrons donated by NADH and FADH2 pass through a four-complex Electron Transport Chain (ETC). As electrons travel down electronegativity gradients to oxygen (the terminal electron acceptor), protons (H+) are pumped into the intermembrane space, building a steep electrochemical proton gradient. Protons drive rotational kinetic energy in ATP Synthase via chemiosmosis, producing the bulk (~26-28) of cellular ATP.

In contrast, Photosynthesis is the anabolic, endergonic process occurring in chloroplasts of plant and algal cells. The chemical formula is: 6CO2 + 6H2O + light energy -> C6H12O6 + 6O2.
Photosynthesis consists of two interconnected phases:
1. Light-Dependent Reactions: Located within the thylakoid membranes. Photons excite chlorophyll pigment molecules in Photosystem II (P680) and Photosystem I (P700). Water photolysis splits H2O into oxygen gas, protons, and replacement electrons. Electron transfer drives photophosphorylation to produce ATP and reduces NADP+ to NADPH.
2. The Calvin Cycle (Light-Independent Reactions): Occurs in the chloroplast stroma. Ribulose 1,5-bisphosphate carboxylase/oxygenase (RuBisCO) catalyzes the fixation of atmospheric carbon dioxide onto RuBP. In the reduction phase, ATP and NADPH convert 3-PGA into glyceraldehyde-3-phosphate (G3P). For every six turns of the cycle, two G3P molecules exit to assemble glucose, while the remaining G3P molecules are regenerated into RuBP using additional ATP.

Metabolic Coupling: The products of photosynthesis (glucose and molecular oxygen) serve as the direct substrates for cellular respiration. Conversely, the byproducts of respiration (carbon dioxide and water) supply the necessary raw materials for photosynthesis, maintaining the terrestrial carbon and oxygen balance.`
  },
  {
    id: 'doc-cs-301',
    title: 'Operating Systems: Virtual Memory & Concurrency',
    category: 'Computer Science',
    tags: ['OS Architecture', 'Paging', 'Threads', 'Deadlocks'],
    createdAt: '2026-10-11T09:15:00Z',
    wordCount: 780,
    readingTimeMinutes: 4,
    content: `An operating system (OS) acts as the fundamental abstraction layer managing hardware resources while presenting an intuitive, secure runtime environment to user-space applications.

Part 1: Virtual Memory and Paging
Virtual memory provides each process with an illusion of a contiguous, private address space independent of physical RAM constraints.
- Paging Architecture: Virtual memory is partitioned into fixed-sized blocks called pages (typically 4 KB). Physical RAM is divided into frames of identical size. The Memory Management Unit (MMU) translates virtual addresses into physical addresses using per-process Page Tables.
- Translation Lookaside Buffer (TLB): A hardware cache of recent page translations. A TLB hit resolves an address in ~1 nanosecond, while a TLB miss triggers a page table walk.
- Page Faults: When a process accesses a page marked non-present in the page table, the CPU generates an interrupt. The OS page fault handler fetches the page from swap storage, updates the page table, and restarts the instruction.
- Replacement Algorithms: When memory is full, the OS must evict pages. Common strategies include Least Recently Used (LRU), First-In First-Out (FIFO), and Clock (second-chance).
- Thrashing occurs when high page fault frequency causes the system to spend more time paging data than executing application code.

Part 2: Concurrency, Synchronization, and Deadlocks
Threads share memory space within the same process, enabling high-performance parallel execution but introducing race conditions.
- Race Conditions occur when the outcome of concurrent execution depends on non-deterministic thread scheduling. Critical sections require mutual exclusion.
- Synchronization Primitives:
  * Mutex: A locking mechanism where only the thread acquiring the lock can access the protected resource.
  * Semaphores: Integer counters supporting atomic wait (P) and signal (V) operations, allowing a controlled number of concurrent units.
  * Condition Variables: Allow threads to sleep until a specific boolean state changes.
- Deadlock: A state where a set of threads is permanently blocked because each is holding a resource requested by another.
The four Coffman conditions necessary for deadlock are:
1. Mutual Exclusion: At least one resource must be held in a non-shareable mode.
2. Hold and Wait: A thread holds a resource while requesting others.
3. No Preemption: Resources cannot be forcibly taken from holding threads.
4. Circular Wait: A closed chain of threads exists where each waits for a resource held by the next.`
  },
  {
    id: 'doc-hist-202',
    title: 'The Industrial Revolution & Economic Transformations',
    category: 'History',
    tags: ['18th Century', 'Steam Engine', 'Urbanization', 'Economics'],
    createdAt: '2026-10-12T16:45:00Z',
    wordCount: 720,
    readingTimeMinutes: 4,
    content: `The Industrial Revolution, beginning in Great Britain during the mid-18th century, marked a profound structural transition from agrarian, handicraft-based economies to mechanized industrial production powered by fossil fuels.

Key Technological Catalysts:
1. Textile Mechanization: Inventions such as John Kay's Flying Shuttle (1733), James Hargreaves' Spinning Jenny (1764), and Richard Arkwright's Water Frame (1769) shifted textile manufacturing out of domestic cottage workshops and into centralized water-powered factories.
2. The Steam Engine: James Watt's separate condenser improvement (1769) on Thomas Newcomen's atmospheric engine radically improved thermal efficiency. Steam engines uncoupled manufacturing from riverbanks, allowing factories to concentrate near coalfields and urban transportation hubs.
3. Metallurgy: Abraham Darby's coke-smelting technique and Henry Cort's puddling process permitted commercial mass production of wrought iron and later Bessemer steel, facilitating railway networks and civil engineering feats.

Socioeconomic Consequences:
- Urbanization: Rural enclosures and farm mechanization displaced agricultural laborers, propelling unprecedented migration into rapidly expanding industrial centers like Manchester, Birmingham, and Leeds. Urban infrastructure struggled, leading to overcrowded tenements and public health crises.
- Division of Labor: Adam Smith's Wealth of Nations (1776) articulated how specialized assembly lines increased output exponentially compared to traditional guild craftsmanship.
- Labor Movements and Policy: Working conditions in early mills were harsh, with 14-hour workdays and widespread child labor. Public pressure spurred legislation such as the British Factory Act of 1833 and the rise of trade unionism.
- Global Economic Divergence: Industrialized Western nations experienced sustained per-capita GDP expansion, shifting terms of global trade and stimulating imperial expansions to secure raw commodities (cotton, rubber) and captive consumer markets.`
  }
];

export const INITIAL_FLASHCARDS: Flashcard[] = [
  {
    id: 'fc-1',
    documentId: 'doc-bio-101',
    category: 'Biology 101',
    front: 'Where does Glycolysis occur in eukaryotic cells, and what is its net ATP yield?',
    back: 'Glycolysis occurs in the cytoplasm. It produces a net yield of 2 ATP (via substrate-level phosphorylation) and 2 NADH per glucose.',
    hint: 'Think outside the mitochondria!',
    isBookmarked: true,
    mastered: true,
    reviewCount: 4,
    lastReviewed: '2026-10-12T11:00:00Z',
  },
  {
    id: 'fc-2',
    documentId: 'doc-bio-101',
    category: 'Biology 101',
    front: 'What is the role of Oxygen in aerobic cellular respiration?',
    back: 'Oxygen serves as the terminal electron acceptor in the Electron Transport Chain (ETC), binding with electrons and protons to form water (H2O).',
    hint: 'End of the electron transport chain.',
    isBookmarked: false,
    mastered: false,
    reviewCount: 2,
    lastReviewed: '2026-10-12T11:05:00Z',
  },
  {
    id: 'fc-3',
    documentId: 'doc-bio-101',
    category: 'Biology 101',
    front: 'What primary enzyme fixes atmospheric CO2 in the Calvin cycle?',
    back: 'RuBisCO (Ribulose 1,5-bisphosphate carboxylase/oxygenase) catalyzes the attachment of CO2 to RuBP.',
    hint: 'The most abundant enzyme on Earth.',
    isBookmarked: true,
    mastered: true,
    reviewCount: 3,
    lastReviewed: '2026-10-12T11:10:00Z',
  },
  {
    id: 'fc-4',
    documentId: 'doc-cs-301',
    category: 'Computer Science',
    front: 'List the four Coffman conditions necessary for a Deadlock.',
    back: '1. Mutual Exclusion\n2. Hold and Wait\n3. No Preemption\n4. Circular Wait',
    hint: 'M-H-N-C mnemonic.',
    isBookmarked: true,
    mastered: false,
    reviewCount: 5,
    lastReviewed: '2026-10-13T06:30:00Z',
  },
  {
    id: 'fc-5',
    documentId: 'doc-cs-301',
    category: 'Computer Science',
    front: 'What is the function of the Translation Lookaside Buffer (TLB)?',
    back: 'The TLB is a high-speed hardware cache in the MMU that stores recent virtual-to-physical page translations to avoid slow memory table lookups.',
    hint: 'Cache for MMU page tables.',
    isBookmarked: false,
    mastered: true,
    reviewCount: 3,
    lastReviewed: '2026-10-13T06:35:00Z',
  },
  {
    id: 'fc-6',
    documentId: 'doc-hist-202',
    category: 'World History',
    front: 'How did James Watt revolutionize the early steam engine?',
    back: 'Watt added a separate condenser (1769), preventing repeated cooling and heating of the main cylinder and drastically improving thermal efficiency.',
    hint: 'Separate condenser design.',
    isBookmarked: false,
    mastered: false,
    reviewCount: 1,
    lastReviewed: '2026-10-11T15:20:00Z',
  }
];

export const INITIAL_EXAMS: ExamCountdown[] = [
  {
    id: 'exam-1',
    subject: 'Biology Midterm: Cellular Energetics',
    examDate: '2026-10-24',
    targetScore: '95%',
    priority: 'urgent',
    topics: ['Glycolysis', 'Krebs Cycle', 'ETC & Chemiosmosis', 'Light Reactions', 'Calvin Cycle']
  },
  {
    id: 'exam-2',
    subject: 'Operating Systems Final Exam',
    examDate: '2026-11-08',
    targetScore: '90%',
    priority: 'medium',
    topics: ['Virtual Memory Paging', 'TLB', 'Deadlock Avoidance', 'Synchronization Primitives']
  },
  {
    id: 'exam-3',
    subject: 'Modern World History Essay Assessment',
    examDate: '2026-11-19',
    targetScore: 'A',
    priority: 'normal',
    topics: ['Industrial Revolution Technologies', 'Urbanization', 'Labor Reform Acts']
  }
];

export const INITIAL_ACTIVITY: ActivityItem[] = [
  {
    id: 'act-1',
    type: 'quiz',
    title: 'Completed Biology 101 Quiz',
    detail: 'Scored 92% (5/5 correct on Medium difficulty)',
    timestamp: '2 hours ago',
    score: 92,
  },
  {
    id: 'act-2',
    type: 'flashcard',
    title: 'Practiced CS Operating Systems Cards',
    detail: 'Mastered 2 cards and bookmarked Coffman conditions',
    timestamp: '5 hours ago',
  },
  {
    id: 'act-3',
    type: 'summary',
    title: 'Generated Detailed Summary',
    detail: 'Summarized "Cellular Respiration & Photosynthesis"',
    timestamp: 'Yesterday',
  },
  {
    id: 'act-4',
    type: 'pomodoro',
    title: 'Completed 50-minute Deep Study Session',
    detail: 'Studied Operating Systems with White Noise soundscape',
    timestamp: 'Yesterday',
  }
];
