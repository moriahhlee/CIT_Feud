/* =============================================================
   CIT FEUD
   GAME PACK: PSYCHOSIS
   WHAT ARE YOU ACTUALLY SEEING?
   ============================================================= */

window.CIT_FEUD_PACKS =
    window.CIT_FEUD_PACKS || [];


window.CIT_FEUD_PACKS.push({

    id: 'psychosis',

    title: 'Psychosis: What Are You Actually Seeing?',

    description:
        'Explore psychosis through an EMS and CIT lens: what a person may be experiencing, what may cause it, how behavior can be misinterpreted, and how responders can communicate without reinforcing or unnecessarily confronting psychotic beliefs.',

    tags: [
        'Psychosis',
        'Behavioral Health',
        'CIT',
        'EMS'
    ],

    questions: [

        /* =====================================================
           ROUND 1
           WHAT ARE YOU ACTUALLY SEEING?
           ===================================================== */

        {
            id: 'symptoms',

            title: 'What Are You Actually Seeing?',

            prompt:
                'Name something a person experiencing psychosis might perceive, believe, or demonstrate.',

            tags: [
                'Psychosis',
                'Symptoms',
                'Assessment'
            ],

            note:
                'Psychosis can affect perception, beliefs, thought organization, communication, and behavior. It is not synonymous with hearing voices or with any single diagnosis.',

            objective:
                'Recognize common manifestations of psychosis while avoiding the assumption that psychosis always means hallucinations or schizophrenia. Participants should distinguish broad symptom domains and describe observations without attempting to diagnose a patient from a single behavior or belief.',

            answers: [

                [
                    'Hearing voices or sounds (auditory hallucinations)',
                    22
                ],

                [
                    'Fixed false beliefs (delusions)',
                    18
                ],

                [
                    'Believing others intend harm (persecutory delusions / paranoia)',
                    15
                ],

                [
                    "Seeing things others don't (visual hallucinations)",
                    12
                ],

                [
                    'Disorganized speech or thought (disorganized thinking)',
                    11
                ],

                [
                    'Disorganized or unusual behavior',
                    9
                ],

                [
                    'Feeling touch without a stimulus (tactile hallucinations)',
                    7
                ],

                [
                    'Reduced expression or motivation (negative symptoms)',
                    6
                ]

            ],

            talkingPoints: [

                'Auditory hallucinations are perceptions of sound without a corresponding external stimulus. They may involve voices, music, noises, or other sounds. Do not assume every person who appears to be talking to themselves is experiencing an auditory hallucination.',

                'A delusion is a strongly held false belief that persists despite evidence to the contrary and is not better explained by the person’s cultural or religious context. EMS should avoid deciding that an unfamiliar or unusual belief is automatically delusional.',

                'Persecutory delusions involve beliefs that a person is being harmed, watched, followed, targeted, or conspired against. Paranoia or suspiciousness may occur with psychosis, but suspiciousness by itself does not establish a psychotic disorder.',

                'Visual hallucinations involve seeing something without a corresponding external visual stimulus. New visual hallucinations, particularly with altered attention, cognition, illness, intoxication, or neurologic symptoms, should reinforce the need for a broad medical differential.',

                'Disorganized thinking may become apparent through speech that is difficult to follow, frequently changes topics, contains loose connections, or becomes severely incoherent. Difficulty following someone’s speech does not by itself establish psychosis.',

                'Psychosis may be accompanied by behavior that appears unusual, poorly organized, or inconsistent with the situation. Describe what the person is actually doing before assigning a motive or psychiatric label to the behavior.',

                'Tactile hallucinations are perceptions of touch or bodily sensation without the expected external stimulus. These experiences may occur in psychiatric, substance-related, medication-related, or medical conditions.',

                'Negative symptoms can include diminished emotional expression, reduced motivation, reduced speech, social withdrawal, and decreased ability to experience pleasure. These symptoms can be mistaken for unwillingness, laziness, depression, intoxication, or intentional noncooperation.'

            ]

        },


        /* =====================================================
           ROUND 2
           PSYCHOSIS ISN'T ONE DIAGNOSIS
           ===================================================== */

        {
            id: 'causes',

            title: "Psychosis Isn't One Diagnosis",

            prompt:
                'Name a condition or circumstance that can present with psychotic symptoms.',

            tags: [
                'Differential Diagnosis',
                'Psychosis',
                'Medical Assessment'
            ],

            note:
                'Psychosis describes a set of symptoms. It does not, by itself, identify the diagnosis or tell responders whether the underlying cause is psychiatric, substance-related, medication-related, or medical.',

            objective:
                'Break the automatic association between psychosis and schizophrenia. Participants should recognize that psychotic symptoms occur in multiple psychiatric disorders and may also result from substances, medications, medical illness, neurologic disease, delirium, or severe physiologic disruption.',

            answers: [

                [
                    'Schizophrenia spectrum / psychotic disorder',
                    20
                ],

                [
                    'Bipolar disorder / mania (with psychotic features)',
                    16
                ],

                [
                    'Major depression (with psychotic features)',
                    14
                ],

                [
                    'Drugs or medications (substance/medication-induced psychotic disorder)',
                    14
                ],

                [
                    'Medical / neurologic illness (psychotic disorder due to another medical condition)',
                    12
                ],

                [
                    'Delirium',
                    10
                ],

                [
                    'Severe sleep deprivation',
                    8
                ],

                [
                    'Neurocognitive disorder / dementia',
                    6
                ]

            ],

            talkingPoints: [

                'Schizophrenia spectrum and other psychotic disorders can include hallucinations, delusions, disorganized thinking, disorganized behavior, and negative symptoms. Psychosis alone is not enough for EMS to conclude that a patient has schizophrenia.',

                'Severe manic episodes in bipolar disorder may include psychotic features such as delusions or hallucinations. Look for the broader presentation, which may include markedly elevated or irritable mood, decreased need for sleep, increased activity, pressured speech, racing thoughts, or impulsive behavior.',

                'Major depressive disorder can occur with psychotic features. Psychotic symptoms occur in the context of a severe depressive episode and may include delusions or hallucinations. Assessment should also consider suicide risk and the severity of the depressive illness.',

                'Intoxication, withdrawal, prescribed medications, and other substances can produce psychotic symptoms. Substance or medication involvement should remain part of the differential even when the patient also has an established psychiatric diagnosis.',

                'Medical and neurologic conditions can produce psychotic symptoms. New-onset psychosis, atypical presentation, abnormal vital signs, neurologic findings, significant medical symptoms, or a substantial change from baseline should increase concern for an underlying medical cause.',

                'Delirium is an acute disturbance in attention and awareness caused by an underlying physiologic process. A person with delirium may experience hallucinations, suspiciousness, agitation, or disorganized thinking, but delirium is not a primary psychotic disorder. Acute fluctuating mental status should be treated as potentially medical.',

                'Severe sleep deprivation can cause perceptual disturbances, impaired cognition, suspiciousness, and psychotic symptoms. Sleep history can therefore provide important context, particularly when symptoms are new.',

                'Neurocognitive disorders can include hallucinations, delusions, agitation, or suspiciousness. A change from the person’s established cognitive baseline may indicate delirium, infection, medication effects, metabolic disturbance, or another superimposed medical problem.'

            ]

        },


        /* =====================================================
           ROUND 3
           WHY DON'T THEY TRUST US?
           ===================================================== */

        {
            id: 'trust',

            title: "Why Don't They Trust Us?",

            prompt:
                'Name something about an EMS response that could feel threatening to someone experiencing psychosis.',

            tags: [
                'Patient Perspective',
                'Trust',
                'De-escalation'
            ],

            note:
                'Routine responder behavior may be interpreted very differently by someone who is frightened, suspicious, confused, hallucinating, or experiencing delusional beliefs.',

            objective:
                'Help participants view the response environment from the patient’s perspective. Participants should identify ways normal EMS operations can unintentionally increase fear or reinforce a patient’s perception that they are being threatened, watched, controlled, or surrounded.',

            answers: [

                [
                    'Several responders surrounding them',
                    20
                ],

                [
                    'Police presence / uniforms',
                    18
                ],

                [
                    'Being touched without warning',
                    15
                ],

                [
                    'Radios / conversations they cannot hear clearly',
                    13
                ],

                [
                    'Rapid or repeated questioning',
                    11
                ],

                [
                    'Blocking their exit / standing over them',
                    9
                ],

                [
                    'Unfamiliar equipment or procedures',
                    8
                ],

                [
                    'Responders whispering or talking about them',
                    6
                ]

            ],

            talkingPoints: [

                'Multiple responders approaching, surrounding, or simultaneously speaking to a person can feel threatening even when everyone intends to help. When safe and practical, reduce the number of people actively engaging with the patient.',

                'Uniforms and law enforcement presence may carry different meanings depending on the person’s symptoms, history, culture, and previous experiences. Do not assume fear of police or uniformed responders is itself evidence of paranoia.',

                'Unexpected touch can provoke a defensive response, particularly when someone is frightened or misinterpreting what is happening. Explain what you intend to do and seek cooperation before touching whenever circumstances allow.',

                'Radio traffic and conversations outside the patient’s hearing may be incorporated into an existing belief that people are discussing, monitoring, or conspiring against them. Be aware of how the environment may be perceived.',

                'Multiple responders asking the same questions or moving rapidly through an assessment can overwhelm someone who is already having difficulty organizing thoughts or interpreting the situation.',

                'Standing between someone and an exit, approaching from multiple directions, or standing over a seated patient may communicate containment or threat even when that was not the responder’s intention. Maintain safety while avoiding unnecessary physical intimidation.',

                'Monitors, restraints, needles, medication, and unfamiliar equipment can be frightening when the person does not understand what they are or why they are being used. Brief explanations can make unfamiliar procedures more predictable.',

                'Whispering or discussing the patient within view but outside their hearing can increase uncertainty and suspicion. When appropriate, communicate openly enough that the patient understands what is happening.'

            ]

        },


        /* =====================================================
           ROUND 4
           AGGRESSIVE... OR SOMETHING ELSE?
           ===================================================== */

        {
            id: 'behavior',

            title: 'Aggressive... or Something Else?',

            prompt:
                'Name a behavior responders might interpret as aggression that could have another explanation during psychosis.',

            tags: [
                'Behavior',
                'Assessment',
                'Bias'
            ],

            note:
                'Behavior should be described before intent is assigned to it. Psychosis does not make a person inherently aggressive or dangerous.',

            objective:
                'Teach participants to separate observable behavior from assumptions about intent. Providers should continue to identify genuine safety threats while considering whether fear, hallucinations, confusion, disorganization, sensory overload, or attempts at self-protection could explain the behavior they observe.',

            answers: [

                [
                    'Yelling / raising their voice',
                    19
                ],

                [
                    'Refusing to follow directions',
                    17
                ],

                [
                    'Pacing / repetitive movement',
                    15
                ],

                [
                    'Pulling away from responders',
                    13
                ],

                [
                    'Guarding themselves or belongings',
                    11
                ],

                [
                    'Appearing distracted / looking around the room',
                    10
                ],

                [
                    'Talking to unseen stimuli (responding to internal stimuli)',
                    8
                ],

                [
                    "Moving toward / away from something EMS can't perceive",
                    7
                ]

            ],

            talkingPoints: [

                'A raised voice tells us about volume and intensity, not necessarily intent. The person may be frightened, overwhelmed, attempting to be heard, responding to internal stimuli, or experiencing severe emotional distress.',

                'Not following a direction may reflect fear, mistrust, impaired attention, disorganized thinking, confusion, inability to process the request, or disagreement with the plan. Avoid automatically converting noncompliance into aggression.',

                'Pacing or repetitive movement may reflect anxiety, agitation, internal preoccupation, medication effects, or an attempt to self-regulate. Assess the behavior and trajectory rather than treating movement alone as a threat.',

                'Pulling away may be an attempt to create safety or distance from something the person perceives as threatening. This does not eliminate responder safety concerns, but understanding the possible motivation can change how EMS approaches the interaction.',

                'Protecting belongings, covering the body, backing into a corner, or assuming a guarded posture may reflect fear or a belief that something will be taken or done to them. Describe the behavior specifically rather than simply documenting that the patient was aggressive.',

                'A person may repeatedly look toward a doorway, ceiling, window, or empty area because they are attending to something EMS does not perceive. They may also simply be monitoring an unfamiliar environment. Observation alone does not establish hallucination.',

                'Responding to internal stimuli is a descriptive clinical phrase often used when behavior suggests attention to thoughts or perceptions not apparent to others. It remains an observation-based inference and should not be treated as proof of hallucinations without further assessment.',

                'Sudden movement can appear threatening when responders do not understand what prompted it. A person may be moving away from a perceived threat or toward something they believe is important. Maintain situational awareness while avoiding assumptions about intent.'

            ]

        },


        /* =====================================================
           ROUND 5
           FILL IN THE PICTURE
           ===================================================== */

        {
            id: 'collateral',

            title: 'Fill in the Picture',

            prompt:
                "Name something family, friends, or bystanders might know that could help EMS understand what's happening.",

            tags: [
                'Collateral Information',
                'Assessment',
                'Differential Diagnosis'
            ],

            note:
                'Collateral information can help distinguish a longstanding psychiatric presentation from an acute change and may identify medical, medication-related, substance-related, or environmental contributors.',

            objective:
                'Improve collateral information gathering during behavioral health encounters. Participants should prioritize baseline, onset, medical and psychiatric history, medication changes, substance exposure, sleep, previous episodes, and strategies that have previously helped the person.',

            answers: [

                [
                    'Normal mental / functional baseline',
                    19
                ],

                [
                    'When symptoms started / last known well',
                    17
                ],

                [
                    'Previous psychiatric diagnoses / episodes',
                    15
                ],

                [
                    'Medical / neurologic history',
                    13
                ],

                [
                    'Medications / recent changes',
                    11
                ],

                [
                    'Substance use / possible exposure',
                    10
                ],

                [
                    'Recent sleep pattern',
                    8
                ],

                [
                    'What usually helps / makes things worse',
                    7
                ]

            ],

            talkingPoints: [

                'Baseline matters. Ask what the person is normally like cognitively, behaviorally, socially, and functionally. A behavior that is longstanding for one patient may represent a dramatic acute change for another.',

                'Establishing onset and last known well helps distinguish chronic symptoms from an acute change. Sudden or rapidly developing psychotic or confused behavior should heighten concern for medical, neurologic, toxicologic, or medication-related causes.',

                'Previous diagnoses and similar episodes provide useful context, but an established psychiatric diagnosis should not prematurely end the medical assessment. Patients with psychiatric illness can also develop delirium, infection, metabolic emergencies, intoxication, trauma, and other medical conditions.',

                'Medical and neurologic history may reveal conditions capable of causing or worsening behavioral and perceptual changes. Ask about recent illness, injury, seizures, neurologic disease, endocrine or metabolic problems, and other relevant history.',

                'Starting, stopping, missing, changing, or incorrectly taking medications can contribute to a change in symptoms. Ask about psychiatric medications as well as other prescription, over-the-counter, and recently administered medications.',

                'Ask about alcohol, recreational drugs, prescribed substances, withdrawal, and possible unknown exposures without using the answer as a moral judgment. Substance use can cause, worsen, or coexist with psychiatric symptoms.',

                'A major reduction in sleep can accompany mania, substance use, severe stress, and worsening psychosis. Severe sleep deprivation itself may also contribute to perceptual and cognitive disturbance.',

                'Family and caregivers may know which communication styles, people, environments, or strategies have previously helped or worsened a crisis. Asking what works can sometimes be as valuable as asking what is wrong.'

            ]

        },


        /* =====================================================
           ROUND 6
           DON'T MAKE IT WORSE
           ===================================================== */

        {
            id: 'avoid',

            title: "Don't Make It Worse",

            prompt:
                'Name something a responder should avoid doing or saying to a person experiencing psychosis.',

            tags: [
                'Communication',
                'De-escalation',
                'Psychosis'
            ],

            note:
                'Effective communication does not require responders to agree with a delusional belief, but directly arguing about the belief may increase distress and interfere with rapport.',

            objective:
                'Teach responders to avoid both confrontation and reinforcement. Participants should recognize communication behaviors that can increase fear, mistrust, humiliation, sensory overload, or unnecessary power struggles.',

            answers: [

                [
                    "Arguing that their belief isn't real",
                    20
                ],

                [
                    'Agreeing with / reinforcing the delusion',
                    18
                ],

                [
                    'Yelling / becoming confrontational',
                    15
                ],

                [
                    'Touching them without warning',
                    13
                ],

                [
                    'Rapid-fire questioning',
                    11
                ],

                [
                    'Mocking / joking about the experience',
                    9
                ],

                [
                    "Lying / making promises you can't keep",
                    8
                ],

                [
                    'Creating an unnecessary power struggle',
                    6
                ]

            ],

            talkingPoints: [

                'Trying to win an argument about a delusion is rarely the immediate goal of an EMS encounter. You can state your own perception without ridiculing or repeatedly challenging the patient: “I don’t see what you’re describing, but I can see that this is frightening you.”',

                'Do not confirm a delusional belief as fact in an attempt to build rapport. Agreeing that someone really is being followed, poisoned, monitored, or targeted can reinforce the belief and may increase fear. Validate the person’s emotional experience without validating the delusion.',

                'Matching the patient’s volume, hostility, or intensity can rapidly turn distress into confrontation. A calm responder does not guarantee a calm patient, but it reduces one source of escalation that EMS can control.',

                'Unexpected physical contact may be interpreted as assault or confirmation that responders intend harm. Explain actions before approaching or touching whenever the situation permits.',

                'Complex, repetitive, or rapid questioning can be difficult for someone experiencing disorganized thought, internal stimuli, severe fear, mania, intoxication, or cognitive impairment. Slow the interaction and prioritize essential questions.',

                'Hallucinations and delusions can be profoundly frightening. Humor, sarcasm, imitation, or dismissive comments can humiliate the patient and destroy rapport even when responders do not intend harm.',

                'Trust becomes especially important when someone is already suspicious or uncertain about what is real. Do not promise that they will not be transported, restrained, admitted, or encounter law enforcement when you cannot guarantee that outcome.',

                'Not every disagreement requires immediate resolution. When a choice does not materially affect safety or care, allowing the person some control can prevent an unnecessary contest over authority.'

            ]

        },


        /* =====================================================
           ROUND 7
           MAKE YOURSELF EASIER TO TRUST
           ===================================================== */

        {
            id: 'communication',

            title: 'Make Yourself Easier to Trust',

            prompt:
                'Name something EMS can do to communicate more effectively with someone experiencing psychosis.',

            tags: [
                'Communication',
                'De-escalation',
                'Patient-Centered Care'
            ],

            note:
                'Responders may not be able to change what a person is experiencing, but they can influence whether the interaction feels more predictable, respectful, and safe.',

            objective:
                'Provide practical communication strategies that preserve dignity, reduce unnecessary stimulation, improve predictability, and support assessment and safety without requiring responders to endorse or directly confront psychotic beliefs.',

            answers: [

                [
                    'Speak calmly, clearly, and concretely',
                    19
                ],

                [
                    'Have one responder lead communication',
                    16
                ],

                [
                    'Explain actions before doing them',
                    15
                ],

                [
                    'Allow personal space',
                    13
                ],

                [
                    'Acknowledge their emotion / distress',
                    12
                ],

                [
                    'Offer reasonable choices',
                    10
                ],

                [
                    'Give them time to answer / process',
                    8
                ],

                [
                    'Reduce noise, people, and stimulation',
                    7
                ]

            ],

            talkingPoints: [

                'Use short, direct statements and concrete language. Someone experiencing severe fear, hallucinations, mania, or disorganized thinking may have difficulty processing lengthy explanations, figurative language, or several instructions at once.',

                'When several responders ask questions or give instructions, the interaction can become confusing and overwhelming. When safe and practical, designate one person to establish rapport and lead communication while the rest of the team supports the encounter.',

                'Predictability can reduce fear. Briefly explain who you are, what you want to do, why you want to do it, and what the person can expect next before introducing equipment, approaching, or touching them.',

                'Physical distance can decrease perceived threat and give both the patient and responders more reaction time. Avoid unnecessarily crowding, cornering, or standing over the person while maintaining appropriate scene safety.',

                'You can validate emotion without confirming the underlying belief. Statements such as “That sounds frightening” or “I can tell you feel unsafe” acknowledge the person’s experience without agreeing that the perceived threat is objectively occurring.',

                'Reasonable choices can restore a sense of control: where to sit, which arm to use for a blood pressure, whether to walk to the ambulance when appropriate, or which responder they prefer to speak with. Do not offer choices that are not actually available.',

                'A delayed response does not necessarily mean the person is ignoring you. They may be processing your question, organizing thoughts, attending to internal stimuli, or trying to determine whether they trust you. Allow silence when safety permits.',

                'Lights, sirens, radios, television, crowds, multiple conversations, and unnecessary personnel can add cognitive and sensory demands. Reducing avoidable stimulation may make communication and assessment easier.'

            ]

        }

    ]

});
