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

            objective:
                'Help participants distinguish patient-specific warning signs from general suicide risk factors. The goal is to recognize changes that can signal a crisis is developing early enough to use the safety plan before the person reaches the point of immediate danger.',

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

            ],

            talkingPoints: [

                'Direct or indirect talk about suicide, death, wanting to die, or being a burden warrants further assessment. Do not rely on a particular phrase or wait for an explicit statement of intent.',

                'Withdrawal from relationships, activities, or usual supports may signal worsening distress. What matters most is a meaningful change from the person’s usual pattern.',

                'Increasing alcohol or drug use can reflect worsening coping and may also increase impulsivity, impair judgment, and reduce the effectiveness of other safety strategies.',

                'A marked change in mood or behavior can be significant even when the change appears positive. Sudden calm after severe distress should be understood in context rather than automatically interpreted as improvement.',

                'Giving away meaningful possessions, making unusual arrangements, or saying goodbye can represent preparation for death and should prompt direct, respectful assessment.',

                'Major changes in sleep, including sleeping far more or far less than usual, can accompany worsening depression, mania, substance use, anxiety, and other forms of crisis.',

                'Increasing agitation, irritability, or anger may be part of a suicidal crisis. Suicide risk does not always present as sadness or tearfulness.',

                'Stopping work, school, hygiene, medications, hobbies, appointments, or other normal routines may show that the person is losing function or disengaging from protective structure.'

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

            objective:
                'Identify practical coping strategies a person can use independently during an escalating crisis. Emphasize that these strategies are meant to create time, reduce intensity, and help the person move toward the next step of the safety plan rather than solve the underlying problem.',

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

            ],

            talkingPoints: [

                'Music can redirect attention, regulate emotion, and provide a familiar activity that requires little preparation. The useful choice is whatever the individual already finds calming or absorbing.',

                'Walking or exercise can provide movement, environmental change, and a structured task. The activity should be realistic and safe for the individual and the circumstances.',

                'A familiar show or movie can temporarily redirect attention away from overwhelming thoughts. Distraction is not avoidance when it is intentionally being used to survive a high-risk moment.',

                'Breathing, grounding, and sensory techniques can help shift attention toward the present moment and reduce physiologic arousal. The best technique is one the person has practiced and is willing to use.',

                'Time with a pet can provide connection, routine, sensory comfort, and a reason to remain engaged in the immediate moment.',

                'Games and puzzles can occupy attention and working memory. A coping strategy does not have to be therapeutic in appearance to be useful.',

                'A shower or another familiar self-care routine can create a change in sensory input, environment, and momentum when someone feels stuck in escalating distress.',

                'Writing, drawing, crafts, music, or another hobby can provide expression and focused activity. Safety planning works best when coping strategies are specific to what the person actually enjoys.'

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

            objective:
                'Differentiate social distraction from direct help-seeking. Participants should recognize that being around safe people or in safe places can interrupt isolation and provide connection even when the person is not ready to disclose the crisis.',

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

            ],

            talkingPoints: [

                'A friend can provide company and normal conversation without requiring the person to disclose everything they are experiencing. The purpose of this step may simply be connection and interruption of isolation.',

                'Family can provide familiarity and companionship, but family should not automatically be assumed to be safe or supportive. The patient identifies who belongs on their plan.',

                'A coffee shop or restaurant can provide a populated, structured environment where someone can be around other people without needing to explain the crisis.',

                'A gym, recreation center, or similar setting can combine social exposure, routine, movement, and distraction when that environment is familiar and safe for the person.',

                'A park or public space may provide a change of environment and reduce isolation. Consider whether the specific location is actually safe for this individual during a crisis.',

                'Work or school may provide routine, familiar people, and purposeful activity. For some people these settings are protective; for others they may be a major source of stress.',

                'A faith or community space can offer familiarity, belonging, structure, and connection to people the individual trusts, when those communities are meaningful to them.',

                'A trusted neighbor can be an immediately accessible source of company or a safe place to go, especially when other supports are geographically distant.'

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

            objective:
                'Identify trusted people who can provide direct support when a person can no longer manage the crisis alone. Emphasize the difference between someone who is available for distraction and someone the patient is actually willing to tell that they are unsafe.',

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

            ],

            talkingPoints: [

                'A spouse or partner may be the first person someone thinks of, but relationship status does not guarantee safety or trust. Confirm that this is actually someone the patient can contact during a crisis.',

                'A close friend may be easier to approach than family and may already recognize changes in the person’s behavior. A useful support is someone who can tolerate hearing that the person is not safe and help with the next step.',

                'A parent can provide emotional and practical support, but the patient’s age and family dynamics matter. Avoid assuming a parent is automatically an appropriate crisis contact.',

                'A sibling or other family member may be a trusted support even when they are not the closest relative. Safety plans should reflect actual relationships rather than conventional family roles.',

                'A coworker or supervisor may be an important support when the person spends substantial time at work or has developed trusted relationships there. Consider privacy and the patient’s comfort with disclosure.',

                'A peer with relevant lived experience may offer credibility, connection, and hope that differs from professional support. Peer support can complement rather than replace clinical care.',

                'A teacher, coach, mentor, or similar trusted adult may be particularly important for younger people or anyone whose strongest support relationships exist outside the family.',

                'A trusted neighbor may be physically close enough to provide immediate support when distant friends or family cannot. Proximity can matter during an acute crisis.'

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

            objective:
                'Expand participants’ understanding of professional crisis resources and reinforce matching the resource to the patient’s needs, level of risk, existing relationships, and urgency rather than defaulting every behavioral health crisis to the same destination.',

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

            ],

            talkingPoints: [

                '988 provides crisis support by call, text, or chat and can be appropriate when someone needs immediate behavioral health support, assessment, or connection to local crisis resources.',

                'An established therapist or counselor may already understand the person’s history, warning signs, and treatment plan. Existing therapeutic relationships can be especially valuable when the situation allows them to be used.',

                '911 is appropriate when an emergency response is needed, particularly when there is immediate danger, a serious medical concern, or the person cannot remain safe with less intensive support.',

                'The emergency department can provide medical evaluation, stabilization, and access to additional behavioral health assessment when the person’s condition or level of risk requires hospital-based care.',

                'A psychiatrist can address psychiatric assessment and medication management, particularly when symptoms, medication effects, or treatment changes are contributing to the crisis.',

                'A mobile or community crisis response team may be able to provide behavioral health assessment and intervention outside the traditional emergency department pathway when available and appropriate.',

                'A primary care provider may be an important point of continuity, particularly when behavioral health symptoms overlap with medical conditions, medications, or an established longitudinal relationship.',

                'Peer and recovery specialists bring lived experience and can support engagement, navigation, recovery, and connection. Their role is complementary to clinical and emergency services.'

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

            objective:
                'Reinforce collaborative means-safety planning as a practical intervention that creates time and distance between suicidal impulses and potentially lethal methods. Participants should consider the specific environment and identified risk rather than relying on a generic checklist.',

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

            ],

            talkingPoints: [

                'When firearms are part of the identified risk, the goal is to create meaningful time and distance from access. Discuss practical, lawful options collaboratively rather than assuming one solution fits every household.',

                'Medication safety may involve limiting quantities, securing medications, or having a trusted person assist with access when appropriate. Consider both prescription and over-the-counter medications relevant to the individual’s plan.',

                'Alcohol and other drugs can increase impulsivity and impair judgment. Reducing access or changing the environment around substance use may be an important part of getting through a high-risk period safely.',

                'Sharps may be relevant when they are part of the person’s identified method or history. Means-safety conversations should be driven by the individual risk rather than removing ordinary household objects indiscriminately.',

                'Being alone can increase risk for some people. A safer environment may include staying with someone, inviting a trusted person over, or moving temporarily to a setting with appropriate support.',

                'Vehicle access may matter when a vehicle or driving is connected to the person’s identified suicide plan, impulsivity, intoxication, or access to a dangerous location.',

                'Bridges, rooftops, railways, bodies of water, or other locations may be relevant when the person has identified a specific place or repeatedly goes somewhere associated with suicidal thoughts.',

                'Means are individual. Ask directly what the person has thought about using or what they are worried they might do, then build the environmental plan around the actual risk identified.'

            ]

        }

    ]

});
