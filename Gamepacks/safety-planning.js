/* =============================================================
   CIT FEUD
   GAME PACK: SUICIDE SAFETY PLANNING
   ============================================================= */

window.CIT_FEUD_PACKS =
    window.CIT_FEUD_PACKS || [];


window.CIT_FEUD_PACKS.push({

    id: 'safety',

    title: 'Suicide Safety Planning',

    description:
        'Build a practical, collaborative safety plan from warning signs through environmental safety.',

    tags: [
        'Suicide',
        'Safety Planning',
        'CIT'
    ],

    questions: [

        /* =====================================================
           ROUND 1
           WARNING SIGNS
           ===================================================== */

        {
            id: 'warn',

            title: 'Warning Signs',

            prompt:
                "Name a warning sign that someone's mental health crisis may be getting worse.",

            tags: [
                'Warning Signs',
                'Assessment',
                'Suicide'
            ],

            note:
                'A safety plan starts with the patient’s own warning signs, not only what responders observe.',

            answers: [

                [
                    'Talking about suicide or death',
                    30
                ],

                [
                    'Isolation / withdrawal',
                    25
                ],

                [
                    'Increased substance use',
                    20
                ],

                [
                    'Major mood or behavior change',
                    15
                ],

                [
                    'Giving things away / saying goodbye',
                    12
                ],

                [
                    'Sleep changes',
                    10
                ],

                [
                    'Agitation / anger',
                    8
                ],

                [
                    'Stopping normal routines',
                    5
                ]

            ]

        },


        /* =====================================================
           ROUND 2
           INTERNAL COPING
           ===================================================== */

        {
            id: 'cope',

            title: 'Internal Coping',

            prompt:
                'Name something someone could do by themselves to get through a difficult moment.',

            tags: [
                'Coping',
                'Safety Plan',
                'Skills'
            ],

            note:
                'Internal coping creates an immediate layer before the person needs to involve someone else.',

            answers: [

                [
                    'Listen to music',
                    25
                ],

                [
                    'Walk / exercise',
                    20
                ],

                [
                    'Watch a show or movie',
                    15
                ],

                [
                    'Breathing / grounding',
                    15
                ],

                [
                    'Spend time with a pet',
                    10
                ],

                [
                    'Game / puzzle',
                    8
                ],

                [
                    'Shower / self-care',
                    5
                ],

                [
                    'Art / journal / hobby',
                    5
                ]

            ]

        },


        /* =====================================================
           ROUND 3
           PEOPLE & PLACES FOR DISTRACTION
           ===================================================== */

        {
            id: 'distract',

            title: 'People & Places',

            prompt:
                'Name a person or place that could provide distraction from a crisis.',

            tags: [
                'Social Support',
                'Distraction',
                'Safety Plan'
            ],

            note:
                'Social distraction does not always require disclosing suicidal thoughts. Sometimes the goal is simply not being alone.',

            answers: [

                [
                    'Friend',
                    25
                ],

                [
                    'Family member',
                    20
                ],

                [
                    'Coffee shop / restaurant',
                    15
                ],

                [
                    'Gym / recreation',
                    12
                ],

                [
                    'Park / public space',
                    10
                ],

                [
                    'Work / school',
                    8
                ],

                [
                    'Faith / community space',
                    6
                ],

                [
                    'Neighbor',
                    4
                ]

            ]

        },


        /* =====================================================
           ROUND 4
           PEOPLE WHO CAN HELP
           ===================================================== */

        {
            id: 'help',

            title: 'People Who Can Help',

            prompt:
                "Name someone you could actually tell, 'I'm not safe right now.'",

            tags: [
                'Help Seeking',
                'Support',
                'Safety Plan'
            ],

            note:
                'Someone who is good company is not automatically someone the patient trusts with a crisis disclosure.',

            answers: [

                [
                    'Spouse / partner',
                    25
                ],

                [
                    'Close friend',
                    22
                ],

                [
                    'Parent',
                    18
                ],

                [
                    'Sibling / family',
                    15
                ],

                [
                    'Coworker / supervisor',
                    8
                ],

                [
                    'Peer',
                    5
                ],

                [
                    'Teacher / coach',
                    4
                ],

                [
                    'Neighbor',
                    3
                ]

            ]

        },


        /* =====================================================
           ROUND 5
           PROFESSIONAL RESOURCES
           ===================================================== */

        {
            id: 'professional',

            title: 'Professional Resources',

            prompt:
                'Name a professional or service someone could contact during a mental health crisis.',

            tags: [
                'Resources',
                'Crisis',
                'Professional'
            ],

            note:
                'Match the resource to the need and urgency rather than treating every crisis identically.',

            answers: [

                [
                    '988',
                    25
                ],

                [
                    'Therapist / counselor',
                    20
                ],

                [
                    '911',
                    18
                ],

                [
                    'Emergency department',
                    15
                ],

                [
                    'Psychiatrist',
                    10
                ],

                [
                    'Crisis response team',
                    8
                ],

                [
                    'Primary care provider',
                    5
                ],

                [
                    'Peer / recovery specialist',
                    4
                ]

            ]

        },


        /* =====================================================
           ROUND 6
           MAKING THE ENVIRONMENT SAFER
           ===================================================== */

        {
            id: 'safer',

            title: 'Safer Environment',

            prompt:
                "Name something we could change to make someone's environment safer tonight.",

            tags: [
                'Means Safety',
                'Environment',
                'Suicide'
            ],

            note:
                'Environmental safety creates time and distance between a suicidal impulse and access to a lethal method.',

            answers: [

                [
                    'Firearm access',
                    30
                ],

                [
                    'Medication access',
                    22
                ],

                [
                    'Alcohol / drugs',
                    16
                ],

                [
                    'Knives / sharps',
                    10
                ],

                [
                    'Being alone',
                    8
                ],

                [
                    'Vehicle / keys',
                    6
                ],

                [
                    'Dangerous locations',
                    5
                ],

                [
                    'Other identified means',
                    3
                ]

            ]

        }

    ]

});
