/* =============================================================
   CIT FEUD
   GAME PACK: SOCIAL DETERMINANTS OF HEALTH
   ============================================================= */

window.CIT_FEUD_PACKS =
    window.CIT_FEUD_PACKS || [];


window.CIT_FEUD_PACKS.push({

    id: 'sdoh',

    title: 'Social Determinants of Health',

    description:
        'Explore how social conditions influence health, crisis, decision-making, and the care EMS provides.',

    tags: [
        'Social Determinants of Health',
        'CIT',
        'EMS'
    ],

    questions: [

        /* =====================================================
           ROUND 1
           HEALTH HAPPENS OUTSIDE THE HOSPITAL
           ===================================================== */

        {
            id: 'influence',

            title: 'Health Happens Outside the Hospital',

            prompt:
                "Name something outside of medical care that can influence a person's health.",

            tags: [
                'SDOH',
                'Health',
                'Foundations'
            ],

            note:
                'Health is shaped by the conditions in which people live, work, learn, and interact, not only by the medical care they receive.',

            objective:
                'Introduce social determinants of health as conditions surrounding a person’s life rather than simply barriers to healthcare. Participants should recognize that medical care is only one contributor to health and well-being.',

            answers: [

                [
                    'Income / financial stability',
                    20
                ],

                [
                    'Housing',
                    18
                ],

                [
                    'Food access',
                    16
                ],

                [
                    'Education',
                    13
                ],

                [
                    'Transportation',
                    11
                ],

                [
                    'Employment',
                    9
                ],

                [
                    'Social relationships / support',
                    7
                ],

                [
                    'Neighborhood / environment',
                    6
                ]

            ],

            talkingPoints: [

                'Income affects far more than whether someone can pay a medical bill. It can influence housing, food, transportation, medications, safety, and the choices realistically available to a patient.',

                'Housing affects health through stability, affordability, physical safety, and environmental conditions. Having a home does not necessarily mean having safe or stable housing.',

                'Health is affected by both having enough food and having reasonable access to nutritious food. Those are related, but not identical, problems.',

                'Education can influence employment opportunities, income, literacy, the ability to navigate complex systems, and access to health information.',

                'Transportation affects access to work, pharmacies, groceries, appointments, social supports, and other resources, not just the ability to get to a doctor’s office.',

                'Employment can affect income, insurance, housing stability, daily structure, stress, and the ability to take time away for medical care.',

                'Relationships and social support affect both physical health and psychosocial well-being. The people surrounding a patient can be protective, absent, or sometimes part of the problem.',

                'Where someone lives can affect exposure to violence, pollution, extreme temperatures, safe recreation, food access, transportation, and other health risks.'

            ]

        },


        /* =====================================================
           ROUND 2
           WHAT DOES THE SCENE TELL YOU?
           ===================================================== */

        {
            id: 'scene',

            title: 'What Does the Scene Tell You?',

            prompt:
                "Name something EMS might notice in a patient's home that you probably wouldn't learn from their medical chart.",

            tags: [
                'Scene Assessment',
                'Environment',
                'Observation'
            ],

            note:
                'EMS has unusual access to the environment patients actually live in. The scene may reveal needs and risks that never appear in a traditional medical assessment.',

            objective:
                'Highlight the unique opportunity EMS has to observe a patient’s lived environment. Participants should recognize environmental observations as potentially meaningful clinical and social information rather than simply background scenery.',

            answers: [

                [
                    'No food / empty refrigerator',
                    18
                ],

                [
                    'Fall hazards / unsafe setup',
                    17
                ],

                [
                    'Poor living conditions / disrepair',
                    15
                ],

                [
                    'No heat, AC, water, or electricity',
                    14
                ],

                [
                    'Hoarding / extreme clutter',
                    12
                ],

                [
                    'Missing mobility equipment / inaccessible home',
                    10
                ],

                [
                    'Pests / infestation',
                    8
                ],

                [
                    'Difficulty managing ADLs',
                    6
                ]

            ],

            talkingPoints: [

                'An empty refrigerator can completely change how we understand weakness, medication management, diabetes, recovery from illness, or a patient’s ability to follow discharge instructions.',

                'Rugs, stairs, cords, poor lighting, furniture placement, and bathroom setup may explain recurrent falls better than anything contained in the medical record.',

                'Leaks, mold, structural problems, damaged flooring, and other housing conditions can directly affect health and safety. Housing quality itself can be a health issue.',

                'Utilities are health issues. Temperature extremes, inability to refrigerate medications, lack of running water, or inability to power medical equipment can turn social problems into medical emergencies.',

                'Clutter may create fall, fire, sanitation, mobility, or emergency-access concerns. The goal is to recognize functional risk, not simply judge how someone keeps their home.',

                'A patient may technically own a walker or wheelchair and still live in an environment where they cannot safely use it. Look at whether the environment actually supports the patient’s functional needs.',

                'Infestation can indicate unsafe housing conditions and may contribute to respiratory, infectious, dermatologic, and psychological concerns.',

                'The scene may reveal that someone is struggling with bathing, dressing, eating, toileting, medications, or household tasks even when they never explicitly tell EMS they need help.'

            ]

        },


        /* =====================================================
           ROUND 3
           WHY DIDN'T THEY CALL SOONER?
           ===================================================== */

        {
            id: 'delay',

            title: "Why Didn't They Call Sooner?",

            prompt:
                'Name a reason someone might delay calling 911 or seeking medical care.',

            tags: [
                'Access to Care',
                'Help Seeking',
                'Barriers'
            ],

            note:
                'Delayed care does not necessarily mean a patient was irresponsible or unconcerned. Seeking help may carry financial, practical, emotional, or social consequences.',

            objective:
                'Challenge assumptions about patients who delay seeking care. Participants should consider barriers, previous experiences, responsibilities, stigma, and other factors before attributing delayed care to poor judgment or lack of concern.',

            answers: [

                [
                    'Cost / fear of the bill',
                    20
                ],

                [
                    'Fear of hospitalization',
                    17
                ],

                [
                    'Embarrassment / stigma',
                    15
                ],

                [
                    'Previous bad healthcare experience',
                    13
                ],

                [
                    'Fear of police / authorities',
                    11
                ],

                [
                    'Cannot leave children, pets, or dependents',
                    10
                ],

                [
                    "Didn't recognize the severity",
                    8
                ],

                [
                    'Cultural / language barriers',
                    6
                ]

            ],

            talkingPoints: [

                'Financial concerns can lead people to delay or avoid needed care. Telling someone they need to get checked out sounds different when the patient is worried about whether they can afford what follows.',

                'Calling for help can feel like surrendering control. A patient may fear admission, psychiatric hospitalization, procedures, institutionalization, or simply not knowing when they will return home.',

                'Behavioral health, substance use, poverty, hygiene, living conditions, and even the circumstances surrounding an injury can make asking for help feel exposing or humiliating.',

                'A previous experience of feeling dismissed, judged, restrained, discriminated against, or simply not helped can influence whether someone trusts the healthcare system enough to return.',

                'Patients may worry that seeking help could involve law enforcement, CPS, APS, legal consequences, or another authority they fear. Understanding the concern does not require promising an outcome EMS cannot control.',

                'Seeking treatment may mean leaving another person or animal who depends on them. Before interpreting hesitation as refusal, consider what the patient believes will happen if they leave.',

                'Patients interpret symptoms through their own knowledge and previous experiences. Something that is obviously dangerous to a paramedic may not have been obviously dangerous to the patient.',

                'Language, health literacy, cultural expectations, and unfamiliarity with the healthcare system can affect when, where, and how someone seeks help.'

            ]

        },


        /* =====================================================
           ROUND 4
           WHAT DOES GOING WITH US COST?
           ===================================================== */

        {
            id: 'transport',

            title: 'What Does Going With Us Cost?',

            prompt:
                'Name something a person may be worried about if EMS tells them they need to go to the hospital.',

            tags: [
                'Transport',
                'Patient Perspective',
                'Decision Making'
            ],

            note:
                'A medically appropriate recommendation can still create significant practical consequences for the patient.',

            objective:
                'Build perspective-taking during transport and refusal discussions. Participants should recognize that accepting the medically preferred disposition may create immediate nonmedical consequences that influence a patient’s decision.',

            answers: [

                [
                    'Who will care for their children',
                    19
                ],

                [
                    'Who will care for their pet',
                    16
                ],

                [
                    'Missing work / losing income',
                    15
                ],

                [
                    "How they'll get home",
                    13
                ],

                [
                    'Leaving a spouse / family member alone',
                    12
                ],

                [
                    'What happens to their home / belongings',
                    10
                ],

                [
                    'Getting their regular medications',
                    8
                ],

                [
                    "How long they'll be gone",
                    7
                ]

            ],

            talkingPoints: [

                'Going to the hospital may mean finding childcare immediately, sometimes in the middle of the night. That problem can feel more urgent to the patient than the medical risk EMS is describing.',

                'Pets may be a major source of emotional support and may have no one else available to care for them. This concern can be very real even when it seems minor compared with the medical emergency.',

                'A hospital visit can mean lost wages, disciplinary consequences, or job insecurity. For someone already financially strained, a few hours at the hospital may have consequences lasting much longer.',

                'An ambulance solves transportation to the hospital, not transportation home. This can become a significant barrier when the receiving facility is far away or transportation is unavailable later.',

                'The patient may also be somebody else’s caregiver. Their resistance may have less to do with themselves than with the person they believe depends on them.',

                'Someone experiencing homelessness, housing insecurity, or an unsafe living situation may reasonably fear losing possessions, access to shelter, or even their place to sleep by leaving.',

                'Patients may worry about medications left at home, doses due soon, controlled medications, or whether the hospital will have an accurate medication list.',

                'Uncertainty itself can be a barrier. EMS usually cannot tell someone whether they will be gone for three hours or three days, and that uncertainty may influence their decision.'

            ]

        },


        /* =====================================================
           ROUND 5
           NOW WHAT?
           ===================================================== */

        {
            id: 'action',

            title: 'Now What?',

            prompt:
                "Name something EMS could do that might help a patient beyond treating today's immediate medical complaint.",

            tags: [
                'Intervention',
                'Resources',
                'Continuity of Care'
            ],

            note:
                'EMS does not have to solve every social problem on scene. Recognizing the need and helping connect the patient to an appropriate next step can still change what happens next.',

            objective:
                'Translate recognition into action. Participants should identify realistic ways EMS can respond to social needs while understanding that the EMS role is not to personally solve poverty, housing instability, food insecurity, or every other problem identified on scene.',

            answers: [

                [
                    'Make an appropriate referral',
                    20
                ],

                [
                    'Connect them with community resources',
                    17
                ],

                [
                    'Ask what they actually need',
                    15
                ],

                [
                    'Involve their existing care team',
                    13
                ],

                [
                    'Include family / supports when appropriate',
                    11
                ],

                [
                    'Provide education / resource information',
                    10
                ],

                [
                    'Document the concern',
                    8
                ],

                [
                    'Advocate during handoff',
                    6
                ]

            ],

            talkingPoints: [

                'Recognition only becomes useful when information reaches someone capable of acting on it. Use the referral pathways available in your system rather than assuming another provider will eventually notice the same problem.',

                'The right resource may exist outside traditional medicine. Effective crisis intervention sometimes means recognizing when the patient’s need belongs to another part of the community care system.',

                'Do not assume the problem you noticed is the problem the patient wants solved. Asking what would actually help can uncover priorities that completely change the encounter.',

                'A primary care provider, behavioral health clinician, case manager, social worker, MIH team, or other established provider may already know the patient and be positioned to continue the work after EMS leaves.',

                'Support people may provide collateral information, help overcome practical barriers, or assist with the plan. Their involvement should be appropriate to the patient’s wishes, circumstances, and privacy requirements.',

                'Sometimes the useful intervention is making sure the patient knows what exists, how to access it, and what to expect. A resource the patient cannot navigate is not much of a resource.',

                'Social observations can disappear at handoff if nobody records or communicates them. Relevant documentation helps the next provider understand the context surrounding the medical complaint.',

                'Handoff is an opportunity to communicate more than vital signs and treatment. When a social issue materially affects the patient’s health or disposition, make sure the receiving team understands why it matters.'

            ]

        }

    ]

});
