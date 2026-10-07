/* =============================================================
   CIT FEUD
   GAME PACK: DISABILITY & SUPPORT NEEDS
   CHANGE THE APPROACH
   ============================================================= */

window.CIT_FEUD_PACKS =
    window.CIT_FEUD_PACKS || [];


window.CIT_FEUD_PACKS.push({

    id: 'disability-support',

    title: 'Disability & Support Needs: Change the Approach',

    description:
        'Explore how disability, communication differences, sensory needs, cognition, and functional support needs can affect an EMS encounter, and how responders can adapt without making assumptions about understanding, behavior, or capacity.',

    tags: [
        'Special Needs Populations',
        'Disability',
        'Communication',
        'CIT',
        'EMS'
    ],

    questions: [

        /* =====================================================
           ROUND 1
           DIFFERENT NEEDS, DIFFERENT APPROACH
           ===================================================== */

        {
            id: 'populations',

            title: 'Different Needs, Different Approach',

            prompt:
                'Name a condition or disability that might change how EMS communicates with or assesses a patient.',

            tags: [
                'Disability',
                'Assessment',
                'Communication'
            ],

            note:
                'A diagnosis may help explain why an interaction is different, but it does not tell EMS everything about how a particular person communicates, understands, functions, or makes decisions.',

            objective:
                'Introduce the range of disabilities and conditions that may require responders to adapt communication, assessment, or the environment. Participants should focus on the individual patient’s functional and communication needs rather than assuming abilities or limitations from a diagnostic label.',

            answers: [

                [
                    'Autism spectrum disorder (ASD)',
                    18
                ],

                [
                    'Intellectual disability (ID)',
                    16
                ],

                [
                    'Dementia (major neurocognitive disorder)',
                    15
                ],

                [
                    'Deafness / hearing impairment',
                    13
                ],

                [
                    'Blindness / visual impairment',
                    11
                ],

                [
                    'Speech / language or communication disorder',
                    10
                ],

                [
                    'Cerebral palsy / physical disability',
                    9
                ],

                [
                    'Traumatic / acquired brain injury (TBI / ABI)',
                    8
                ]

            ],

            talkingPoints: [

                'Autism spectrum disorder can affect communication, social interaction, sensory processing, routines, and responses to unfamiliar situations. Autism varies substantially between individuals, so ask what helps this particular person rather than relying on assumptions about autistic people generally.',

                'Intellectual disability can affect learning, reasoning, problem-solving, and adaptive functioning to different degrees. Use developmentally appropriate communication without infantilizing an adult or assuming they cannot understand what is happening.',

                'Major neurocognitive disorders such as dementia can affect memory, language, judgment, orientation, and function. Establish the patient’s normal baseline whenever possible because a sudden change may represent delirium or another acute medical problem rather than progression of dementia.',

                'A Deaf or hard-of-hearing patient may communicate through American Sign Language, another sign language, spoken language, writing, lip-reading, hearing technology, or a combination of methods. Ask the patient what communication method works best rather than assuming.',

                'A person who is blind or has low vision may need verbal orientation to the environment and clear explanations before equipment is moved or physical contact occurs. Visual impairment does not imply cognitive impairment.',

                'Communication disabilities can affect speech production, language comprehension, expression, or both. A person who cannot communicate effectively through speech may still understand the conversation and may use another communication method.',

                'Cerebral palsy and other physical disabilities can affect movement, posture, coordination, and speech. Motor or speech impairment should not be used as a proxy for intelligence, comprehension, or decision-making ability.',

                'Traumatic or acquired brain injury can affect memory, attention, processing speed, emotional regulation, impulse control, communication, and behavior. Presentation varies depending on the injury and the individual’s baseline.'

            ]

        },


        /* =====================================================
           ROUND 2
           BEHAVIOR IS COMMUNICATION
           ===================================================== */

        {
            id: 'behavior',

            title: 'Behavior Is Communication',

            prompt:
                'Name something EMS might misinterpret as refusal, aggression, or noncompliance in a person with a disability.',

            tags: [
                'Behavior',
                'Bias',
                'Communication'
            ],

            note:
                'What responders observe and what responders believe the behavior means are not necessarily the same thing. Describe the behavior before assigning intent to it.',

            objective:
                'Help participants recognize behaviors that may reflect communication differences, sensory needs, fear, processing time, self-regulation, or disability rather than intentional defiance or aggression. Genuine safety concerns should still be addressed based on observable behavior and circumstances.',

            answers: [

                [
                    'Avoiding eye contact',
                    17
                ],

                [
                    'Not answering verbally',
                    16
                ],

                [
                    'Repetitive movement (stimming)',
                    15
                ],

                [
                    'Pulling away from touch',
                    13
                ],

                [
                    'Covering ears / eyes',
                    12
                ],

                [
                    'Repeating words or phrases (echolalia)',
                    10
                ],

                [
                    'Not immediately following a direction',
                    9
                ],

                [
                    'Distress when routine changes',
                    8
                ]

            ],

            talkingPoints: [

                'Eye contact varies across individuals, disabilities, cultures, and situations. Avoiding eye contact does not establish dishonesty, inattention, disrespect, or lack of understanding. Forcing eye contact may make communication more difficult.',

                'A person may be nonspeaking, temporarily unable to speak under stress, have a speech or language disability, or communicate through another method. Lack of spoken language does not mean lack of understanding.',

                'Stimming, or self-stimulatory behavior, can include repetitive movements, sounds, or other actions used for sensory regulation, expression, or coping. Rocking, hand movements, pacing, or other repetitive behavior should not automatically be interpreted as agitation requiring suppression.',

                'Pulling away may communicate pain, fear, sensory sensitivity, lack of understanding, or discomfort with unexpected physical contact. When circumstances allow, explain what you intend to do before touching the patient.',

                'Covering the ears or eyes may be an attempt to reduce overwhelming sensory input rather than refusal to interact. Lights, sirens, radios, crowds, and multiple conversations can significantly increase sensory demand.',

                'Echolalia is repetition of words or phrases and may serve several functions, including communication, processing, self-regulation, or expression. Repetition should not automatically be interpreted as mocking, meaningless speech, or unwillingness to answer.',

                'Some people need additional time to process spoken information, organize a response, transition between activities, or understand what is being requested. Repeating the instruction more loudly or rapidly may make processing more difficult.',

                'Unexpected changes in routine, environment, people, or expectations can cause significant distress for some individuals. EMS itself represents a major disruption, so maintaining predictability where possible can help.'

            ]

        },


        /* =====================================================
           ROUND 3
           THE SCENE IS PART OF THE ASSESSMENT
           ===================================================== */

        {
            id: 'scene',

            title: 'The Scene Is Part of the Assessment',

            prompt:
                'Name something EMS might notice that tells you how this person normally communicates, moves, or functions.',

            tags: [
                'Scene Assessment',
                'Adaptive Equipment',
                'Function'
            ],

            note:
                'Adaptive equipment and communication supports can provide important information about a patient’s baseline and may be essential to maintaining communication, mobility, independence, or safety.',

            objective:
                'Teach participants to recognize communication aids, mobility devices, sensory supports, medical equipment, and other environmental clues as meaningful parts of the patient assessment rather than background objects.',

            answers: [

                [
                    'Communication device / board (AAC)',
                    18
                ],

                [
                    'Wheelchair / walker / mobility equipment',
                    16
                ],

                [
                    'Hearing aids / cochlear implant',
                    14
                ],

                [
                    'Glasses / visual aids',
                    12
                ],

                [
                    'Picture board / visual schedule',
                    11
                ],

                [
                    'Medical alert identification',
                    10
                ],

                [
                    'Service animal',
                    10
                ],

                [
                    'Adaptive / home medical equipment',
                    9
                ]

            ],

            talkingPoints: [

                'Augmentative and alternative communication (AAC) includes devices, applications, picture systems, letter boards, and other methods used to supplement or replace speech. An AAC device may function as the patient’s voice, so keep it accessible whenever possible.',

                'Mobility devices can tell you about the patient’s usual level of function and may be important to their independence after the encounter. Ask how the patient normally transfers or moves rather than assuming the safest method based only on appearance.',

                'Hearing aids and cochlear implants may be essential communication tools, but neither guarantees typical hearing. Confirm that the device is available and functioning and ask the patient what additional communication support is helpful.',

                'Glasses, magnifiers, and other visual aids may significantly affect a patient’s ability to orient, read, communicate, and understand what is occurring. If safe, avoid unnecessarily separating patients from equipment they routinely depend on.',

                'Visual schedules, picture systems, and other structured supports may show how a person receives information or prepares for transitions. These tools may also help responders explain what will happen next.',

                'Medical alert jewelry, identification cards, phone information, or other identification may provide information about diagnoses, communication needs, allergies, medical devices, or emergency contacts. Use it as a source of information rather than as a substitute for assessing the patient.',

                'A trained service animal may perform disability-related tasks and should not be treated simply as a pet. Consider the animal’s role when planning movement, transport, and communication with the patient.',

                'Home oxygen, feeding equipment, lifts, positioning equipment, suction, monitoring devices, and other adaptive technology can provide important information about baseline needs and what may need to accompany the patient or be addressed before they leave.'

            ]

        },


        /* =====================================================
           ROUND 4
           ASK THE PERSON WHO KNOWS
           ===================================================== */

        {
            id: 'collateral',

            title: 'Ask the Person Who Knows',

            prompt:
                'Name something a caregiver, family member, or support person might know that would help EMS care for the patient.',

            tags: [
                'Collateral Information',
                'Baseline',
                'Caregivers'
            ],

            note:
                'Caregivers and support people can provide valuable collateral information, but their presence should not cause responders to stop communicating directly with the patient.',

            objective:
                'Improve collateral information gathering while preserving patient-centered communication. Participants should use caregivers and support people to better understand baseline function, communication, pain behaviors, triggers, regulation strategies, medical history, and acute changes without automatically speaking for or over the patient.',

            answers: [

                [
                    'Normal cognitive / functional baseline',
                    18
                ],

                [
                    'How the person communicates',
                    16
                ],

                [
                    'How they normally show pain / illness',
                    14
                ],

                [
                    'What causes distress (triggers)',
                    12
                ],

                [
                    'What helps them calm / regulate',
                    12
                ],

                [
                    'Medications / medical history',
                    11
                ],

                [
                    'What has changed from baseline',
                    9
                ],

                [
                    'Level of assistance normally needed',
                    8
                ]

            ],

            talkingPoints: [

                'Baseline is one of the most useful pieces of collateral information. Ask what the patient is normally like cognitively, behaviorally, physically, and functionally so that acute changes are easier to identify.',

                'A support person may know whether the patient uses speech, sign language, an AAC device, gestures, pictures, yes/no responses, writing, or another established communication system. Whenever possible, continue directing communication toward the patient.',

                'Pain may be expressed through behavior, movement, facial expression, vocalization, withdrawal, changes in activity, or other individualized signs. Ask what pain or illness normally looks like for this person rather than assuming absence of a conventional complaint means absence of pain.',

                'A caregiver may know that particular sounds, touch, people, environments, procedures, or disruptions reliably increase distress. Knowing these triggers can help EMS avoid preventable escalation.',

                'Ask what has worked before. A familiar object, specific communication technique, quiet space, movement, music, caregiver, positioning strategy, or additional processing time may be more effective than responders guessing what will calm the patient.',

                'Medication lists and medical history may be particularly important when the patient cannot easily provide a conventional history. Still assess for new medical problems rather than attributing every symptom to a known disability.',

                'A caregiver saying “this is not normal for them” is clinically meaningful. New confusion, reduced interaction, behavioral change, weakness, agitation, or loss of function may represent acute illness even when the patient has a developmental, cognitive, or psychiatric diagnosis.',

                'Understanding what assistance the person normally needs with communication, mobility, eating, toileting, medication, or activities of daily living helps distinguish baseline support needs from a new functional decline.'

            ]

        },


        /* =====================================================
           ROUND 5
           MAKE THE ENVIRONMENT WORK FOR THEM
           ===================================================== */

        {
            id: 'environment',

            title: 'Make the Environment Work for Them',

            prompt:
                'Name something EMS could change about the environment to make the encounter easier for a person with different sensory, communication, or support needs.',

            tags: [
                'Environment',
                'Sensory Needs',
                'De-escalation'
            ],

            note:
                'Sometimes the most effective intervention is not changing the patient’s behavior. It is reducing unnecessary demands in the environment around them.',

            objective:
                'Encourage responders to identify reasonable environmental modifications that can reduce sensory overload, improve predictability, support communication, and preserve the patient’s normal coping strategies while maintaining scene and patient safety.',

            answers: [

                [
                    'Reduce lights / sirens',
                    18
                ],

                [
                    'Reduce unnecessary personnel',
                    16
                ],

                [
                    'Lower noise / competing conversations',
                    14
                ],

                [
                    'Allow more physical space',
                    13
                ],

                [
                    'Let them keep a familiar object',
                    11
                ],

                [
                    'Preserve routine when possible',
                    10
                ],

                [
                    'Move slowly / warn before touching',
                    10
                ],

                [
                    'Allow a support person nearby',
                    8
                ]

            ],

            talkingPoints: [

                'Emergency lights and sirens may be visually or auditorily overwhelming. Once they are no longer operationally necessary, reducing avoidable sensory stimulation may improve the patient’s ability to communicate and participate.',

                'A large group of unfamiliar responders can increase anxiety, sensory load, and confusion. When safe and practical, limit the number of people actively interacting with the patient.',

                'Radios, televisions, equipment alarms, multiple conversations, and people asking questions simultaneously can compete for attention. A quieter environment may make processing and communication substantially easier.',

                'Crowding can increase distress and can also reduce reaction time for everyone involved. Giving the patient appropriate personal space may improve both perceived and actual safety.',

                'A comfort object, sensory item, headphones, tablet, blanket, toy, or other familiar item may help the patient regulate during a highly unfamiliar event. Age alone should not determine whether a coping object is considered appropriate.',

                'Preserving parts of the patient’s routine can make an unpredictable event more manageable. EMS cannot preserve every routine during an emergency, but unnecessary disruptions can often be avoided.',

                'Move deliberately and explain physical contact before it occurs. Unexpected touch can be painful, startling, frightening, or overwhelming, particularly for someone with sensory sensitivities, trauma history, visual impairment, or difficulty interpreting the situation.',

                'A familiar caregiver or support person may help with communication, regulation, history, and transitions. Their involvement should support rather than replace the patient’s own participation whenever possible.'

            ]

        },


        /* =====================================================
           ROUND 6
           DON'T CONFUSE DISABILITY WITH INCAPACITY
           ===================================================== */

        {
            id: 'capacity',

            title: "Don't Confuse Disability With Incapacity",

            prompt:
                'Name something that does NOT, by itself, mean a patient cannot understand or participate in decisions about their medical care.',

            tags: [
                'Capacity',
                'Autonomy',
                'Disability'
            ],

            note:
                'Communication ability, cognitive ability, and decision-making capacity are related concepts, but they are not interchangeable. Disability alone does not establish incapacity.',

            objective:
                'Challenge assumptions about decision-making ability. Participants should recognize that capacity must be assessed in the context of the specific decision and should not be inferred solely from diagnosis, disability, appearance, communication method, or the amount of assistance a person receives.',

            answers: [

                [
                    'Intellectual / developmental disability',
                    18
                ],

                [
                    'Autism',
                    16
                ],

                [
                    'Being nonspeaking',
                    15
                ],

                [
                    'Having a legal guardian',
                    13
                ],

                [
                    'Difficulty communicating',
                    11
                ],

                [
                    'Physical disability',
                    10
                ],

                [
                    'Psychiatric diagnosis',
                    9
                ],

                [
                    'Needing help with daily activities',
                    8
                ]

            ],

            talkingPoints: [

                'An intellectual or developmental disability does not automatically mean a person lacks capacity for a particular healthcare decision. Assessment should focus on what the individual can understand, appreciate, communicate, and decide with appropriate supports.',

                'Autism does not establish incapacity. Autistic people have widely varying communication styles and support needs. Adjusting how information is presented may reveal understanding that was not apparent during a conventional rapid EMS interview.',

                'A nonspeaking person may communicate through AAC, writing, sign language, gestures, eye gaze, or another system and may fully understand the situation. Speech production and comprehension are different abilities.',

                'The existence of a guardian is important legal and clinical information, but EMS should not infer the exact scope of another person’s decision-making authority solely from hearing that the patient “has a guardian.” Follow applicable law, policy, documentation, and the circumstances of the emergency.',

                'Difficulty expressing an answer is not the same as being unable to understand the decision. Before concluding that someone cannot participate, identify and address communication barriers whenever the clinical situation permits.',

                'A physical disability may significantly affect movement, speech, or independence without impairing cognition at all. Never infer cognitive ability from posture, motor function, facial movement, or speech production.',

                'A psychiatric diagnosis does not automatically remove decision-making capacity. Symptoms may affect capacity in some circumstances, but the presence of a diagnosis alone does not answer the question.',

                'Needing assistance with bathing, dressing, mobility, medication, finances, or other daily activities does not automatically establish inability to participate in healthcare decisions. Functional dependence and decision-making capacity are not the same concept.'

            ]

        },


        /* =====================================================
           ROUND 7
           CHANGE THE APPROACH
           ===================================================== */

        {
            id: 'communication',

            title: 'Change the Approach',

            prompt:
                'Name something EMS can do to communicate more effectively with a patient who has different communication or support needs.',

            tags: [
                'Communication',
                'Patient-Centered Care',
                'Accessibility'
            ],

            note:
                'The goal is not to force every patient to communicate in the way EMS normally expects. The goal is to find an effective way for EMS and the patient to communicate with each other.',

            objective:
                'Give participants practical strategies for accessible, respectful communication. Providers should adapt communication to the individual, preserve useful supports, provide adequate processing time, and involve the patient directly to the greatest extent possible.',

            answers: [

                [
                    'Ask how they prefer to communicate',
                    18
                ],

                [
                    'Speak directly to the patient',
                    16
                ],

                [
                    'Use simple, concrete language',
                    14
                ],

                [
                    'Ask one question at a time',
                    13
                ],

                [
                    'Allow additional processing time',
                    12
                ],

                [
                    'Explain before touching / procedures',
                    10
                ],

                [
                    'Use their normal communication aids',
                    9
                ],

                [
                    'Ask what would make this easier',
                    8
                ]

            ],

            talkingPoints: [

                'Start by asking the patient how they communicate best. Do not assume speech, writing, sign language, pictures, or an AAC device is preferred simply because it is available.',

                'Speak to the patient rather than automatically directing questions to the caregiver, interpreter, or support person. Other people may assist communication, but the patient should remain the focus of the interaction whenever possible.',

                'Clear, concrete language can reduce ambiguity and processing demands. Avoid unnecessary jargon, figurative language, complicated explanations, or treating simplified language as a reason to use a childish tone.',

                'One question or instruction at a time reduces competing information and gives the patient a clearer opportunity to respond. If the person does not answer immediately, avoid stacking several additional questions on top of the first.',

                'Some people need more time to understand a question, organize an answer, use a communication device, coordinate speech, or transition between tasks. Silence is not necessarily failure to understand or refusal to cooperate.',

                'Explain what you are going to do before touching the patient, moving equipment, exposing part of the body, or beginning a procedure. Predictability can improve both cooperation and the patient’s sense of control.',

                'AAC devices, hearing technology, glasses, communication boards, interpreters, visual supports, and other aids exist to make communication accessible. Incorporate them into the assessment rather than removing them because EMS normally communicates differently.',

                'One of the simplest accessibility questions is also one of the most useful: “What would make this easier for you?” The patient or someone who knows them may identify an accommodation responders would never have considered.'

            ]

        }

    ]

});
