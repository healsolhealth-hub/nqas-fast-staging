
const DAYS_12A=[{day:1,aoc:'AE',service:'Pregnancy & Child Birth',title:'Pregnancy & Child Birth — Availability & Clinical Quality',task:'Assess Pregnancy & Child Birth services — verify availability (AoC A) and clinical quality (AoC E).',me:'ME A1 | ME E',aocTags:['AoC A — Service Provision','AoC E — Clinical Services'],methods:['SI','RR','CI'],roles:{prime:'CHO',support:['ANM','ASHA']},cps:[{t:'Availability of functional ANC services  with minimum 4 ANC check-ups',r:'CHO',aoc:'A',me:'ME A1.1',method:['SI','RR']},{t:'First aid, referral  & follow up services for high risk pregnancies are provided',r:'CHO',aoc:'A',me:'ME A1.1',method:['SI','RR']},{t:'Facility provides and updates “Mother and Child Protection Card”',r:'CHO',aoc:'E',me:'ME E16.1',method:['RR','CI']},{t:'Facility ensures early registration & line listing of high risk ANC  cases',r:'CHO',aoc:'E',me:'ME E16.1',method:['SI','RR']},{t:'Clinical information & records of ANC is kept with Ayushman Arogya Mandir',r:'ANM',aoc:'E',me:'ME E16.1',method:['SI','RR']},{t:'Staff has knowledge of calculating expected pregnancies in the area',r:'CHO',aoc:'E',me:'ME E16.1',method:['SI','RR']},{t:'Tracking of Missed and left out ANC',r:'CHO',aoc:'E',me:'ME E16.1',method:['SI','RR']},{t:'All pregnant women get ANC check-up as per recommended schedule',r:'CHO',aoc:'E',me:'ME E16.1',method:['SI','RR']},{t:'At ANC clinic, Pregnancy is confirmed by performing urine test',r:'CHO',aoc:'E',me:'ME E16.2',method:['RR']},{t:'Last menstrual period (LMP) is recorded and Expected date of Delivery (EDD) is calculated on first visit.',r:'CHO',aoc:'E',me:'ME E16.2',method:['SI','RR']},{t:'Comprehensive Obstetric history is recorded',r:'CHO',aoc:'E',me:'ME E16.2',method:['SI','RR']},{t:'Physical Examination & vitals  of Pregnant Women is done on every ANC visit',r:'CHO',aoc:'E',me:'ME E16.2',method:['RR']},{t:'Abdominal Examination is done as per protocol',r:'CHO',aoc:'E',me:'ME E16.2',method:['SI','RR']},{t:'Diagnostic  test for every pregnant women',r:'CHO',aoc:'E',me:'ME E16.3',method:['SI','RR']},{t:'Tetanus Toxoid (2 Dosages/ Booster) have been during ANC visits',r:'CHO',aoc:'E',me:'ME E16.3',method:['SI','RR']},{t:'Staff can recognize the cases, which would need referral to higher centre(FRU)',r:'CHO',aoc:'E',me:'ME E16.4',method:['SI','RR']},{t:'Staff is competent to identify Hypertension / Pregnancy Induced Hypertension',r:'CHO',aoc:'E',me:'ME E16.4',method:['SI','RR']},{t:'Staff is competent to identify Pre-Eclampsia',r:'CHO',aoc:'E',me:'ME E16.4',method:['SI','RR']},{t:'Staff is competent to classify anaemia according to Haemoglobin Level',r:'CHO',aoc:'E',me:'ME E16.4',method:['SI','RR']},{t:'Staff is aware of prophylactic & Therapeutic dose of IFA &  progress is monitored',r:'CHO',aoc:'E',me:'ME E16.4',method:['SI','RR']},{t:'Pregnant women is counselled for planning and preparation for birth',r:'CHO',aoc:'E',me:'ME E16.5',method:['SI','CI']},{t:'Pregnant women is counselled recognize danger signs during pregnancy',r:'CHO',aoc:'E',me:'ME E16.5',method:['SI','CI']},{t:'Pregnant women is counselled diet, rest, breast feeding & family planning.',r:'CHO',aoc:'E',me:'ME E16.5',method:['SI','CI']}]},{day:2,aoc:'AE',service:'Neonatal & Infant Care',title:'Neonatal & Infant Care — Availability & Clinical Quality',task:'Assess Neonatal & Infant Care services — verify availability (AoC A) and clinical quality (AoC E).',me:'ME A1 | ME E',aocTags:['AoC A — Service Provision','AoC E — Clinical Services'],methods:['SI','RR','CI','OB'],roles:{prime:'CHO',support:['ANM','ASHA']},cps:[{t:'Identification, primary management & prompt referral  of sick new born & infant',r:'CHO',aoc:'A',me:'ME A1.2',method:['SI','RR']},{t:'Availability of Immunization Services',r:'ANM',aoc:'A',me:'ME A1.2',method:['SI','RR']},{t:'CHO & CHW  are aware of danger signs of new born & infant',r:'CHO',aoc:'E',me:'ME E13.1',method:['SI','RR']},{t:'Primary management & prompt referral of sick new born & infants',r:'CHO',aoc:'E',me:'ME E13.1',method:['SI','RR']},{t:'Staff is aware of post natal care Counselling',r:'CHO',aoc:'E',me:'ME E13.1',method:['SI','CI']},{t:'Check for vaccines & diluents are kept as per the recommendation of guidelines',r:'OB',aoc:'E',me:'ME E13.2',method:['SI','OB']},{t:'Reconstituted vaccines are not used after recommended time',r:'ANM',aoc:'E',me:'ME E13.2',method:['SI','OB']},{t:'Staff checks VVM level before using vaccines  and identify discard point',r:'ANM',aoc:'E',me:'ME E13.2',method:['SI']},{t:'Parents are counselled for informing any untoward event of concern following vaccination',r:'CI',aoc:'E',me:'ME E13.2',method:['CI','OB']},{t:'Vaccinator is aware about how to manage any immediate serious reaction/anaphylaxis',r:'ANM',aoc:'E',me:'ME E13.2',method:['SI']},{t:'Check the availability of anaphylaxis kit with ANM at session site',r:'ANM',aoc:'E',me:'ME E13.2',method:['OB']},{t:'Check adrenaline is not expired in kit',r:'ANM',aoc:'E',me:'ME E13.2',method:['OB']},{t:'Staff is aware of the shelf life of Vit A once it is opened and ensures it is not given after shelf life',r:'ANM',aoc:'E',me:'ME E13.2',method:['SI','OB']},{t:'ANM/CHW is aware segregation policy after completion of immunization session',r:'ANM',aoc:'E',me:'ME E13.2',method:['SI','OB']},{t:'Staff is aware of  Open vial policy',r:'ANM',aoc:'E',me:'ME E13.2',method:['SI','OB']},{t:'Staff is aware of how to calculate the number of beneficiaries, quantity of vaccines & syringes',r:'ANM',aoc:'E',me:'ME E13.2',method:['SI','RR']},{t:'Ayushman Arogya Mandir -SC maintain tracking bag/ tickler box',r:'ANM',aoc:'E',me:'ME E13.2',method:['SI','RR']},{t:'Check Vaccinator is aware of different categories of AEFI',r:'ANM',aoc:'E',me:'ME E13.2',method:['SI','RR']},{t:'Check person responsible for notifying & reporting of the AEFI is identified',r:'ANM',aoc:'E',me:'ME E13.2',method:['SI','RR']},{t:'Process of reporting and route is communicated to all concerned',r:'ANM',aoc:'E',me:'ME E13.2',method:['SI','RR']},{t:'Reporting  of AEFI cases is ensured by ANM',r:'ANM',aoc:'E',me:'ME E13.2',method:['RR']},{t:'Vaccinator is aware about how to prevent immunization error related reactions',r:'ANM',aoc:'E',me:'ME E13.2',method:['SI']}]},{day:3,aoc:'AE',service:'Childhood & Adolescent Health',title:'Childhood & Adolescent Health — Availability & Clinical Quality',task:'Assess Childhood & Adolescent Health services — verify availability (AoC A) and clinical quality (AoC E).',me:'ME A1 | ME E',aocTags:['AoC A — Service Provision','AoC E — Clinical Services'],methods:['SI','RR','CI'],roles:{prime:'CHO',support:['ANM','ASHA']},cps:[{t:'Identification, primary management, referral & follow up services for Childhood ailments',r:'CHO',aoc:'A',me:'ME A1.3',method:['SI','RR']},{t:'Education, Counselling and referral  services for Adolescent health',r:'CHO',aoc:'A',me:'ME A1.3',method:['SI','CI']},{t:'Assessment for identification of ARI, diarrhoea, malnutrition and Other Illness',r:'CHO',aoc:'E',me:'ME E13.3',method:['SI','RR']},{t:'Assessment for identification of possible serious bacterial infections among young infant (0-59 days) & children (2 -59 months)',r:'CHO',aoc:'E',me:'ME E13.3',method:['SI','RR']},{t:'Management of diarrhoea  is  done as per protocols',r:'CHO',aoc:'E',me:'ME E13.3',method:['SI','RR']},{t:'Management of ARI  is  done as per protocols',r:'CHO',aoc:'E',me:'ME E13.3',method:['SI','RR']},{t:'Management of Possible serious bacterial infection as per protocols',r:'CHO',aoc:'E',me:'ME E13.3',method:['SI','RR']},{t:'Management of Malnutrition  is  done as per protocols',r:'CHO',aoc:'E',me:'ME E13.3',method:['SI','CI']},{t:'Screening, referral and follow up of children for anomalies, disabilities and developmental delays',r:'CHO',aoc:'E',me:'ME E13.3',method:['SI','RR']},{t:'Provision of education & counselling services for  adolescent',r:'CHO',aoc:'E',me:'ME E15.1',method:['SI','CI']},{t:'Services for treatment & referral  of common  RTI/STI\'s, Nutritional Anaemia & Menstrual disorders',r:'CHO',aoc:'E',me:'ME E15.1',method:['RR','CI']}]},{day:4,aoc:'AE',service:'Family Planning',title:'Family Planning — Availability & Clinical Quality',task:'Assess Family Planning services — verify availability (AoC A) and clinical quality (AoC E).',me:'ME A1 | ME E',aocTags:['AoC A — Service Provision','AoC E — Clinical Services'],methods:['SI','RR','CI'],roles:{prime:'CHO',support:['ANM','ASHA']},cps:[{t:'Availability of family planning services',r:'CHO',aoc:'A',me:'ME A1.4',method:['SI','RR']},{t:'Education, Counselling and referral services for family planning services',r:'CI',aoc:'A',me:'ME A1.4',method:['SI','CI']},{t:'The client is given full information about family planning methods',r:'CHO',aoc:'E',me:'ME E14.1',method:['SI','RR']},{t:'Staff is aware of Method specific counselling approaches',r:'CHO',aoc:'E',me:'ME E14.1',method:['SI','CI']},{t:'Staff is aware of case selection criteria for family planning spacing  methods',r:'CHO',aoc:'E',me:'ME E14.2',method:['SI','RR']},{t:'Staff is aware of  options, indications & methods for administration for Oral Contraceptives',r:'CHO',aoc:'E',me:'ME E14.2',method:['SI','RR']},{t:'IUD insertion & follow up is done as per standard protocol',r:'CHO',aoc:'E',me:'ME E14.2',method:['SI','RR']},{t:'Injectable Contraceptives are given as per protocols',r:'CHO',aoc:'E',me:'ME E14.2',method:['SI','RR']},{t:'Staff is aware of case selection criteria for limiting mentors',r:'CHO',aoc:'E',me:'ME E14.3',method:['SI','RR']},{t:'AAM is supporting & encouraging the clients for post sterilization follow up',r:'CHO',aoc:'E',me:'ME E14.3',method:['SI','RR']}]},{day:5,aoc:'AE',service:'Management of Communicable Diseases',title:'Management of Communicable Diseases — Availability & Clinical Quality',task:'Assess Management of Communicable Diseases services — verify availability (AoC A) and clinical quality (AoC E).',me:'ME A1 | ME E',aocTags:['AoC A — Service Provision','AoC E — Clinical Services'],methods:['SI','RR','CI','OB'],roles:{prime:'CHO',support:['ANM','ASHA']},cps:[{t:'Preventive & promotive services under NVBDCP',r:'CHO',aoc:'A',me:'ME A1.5',method:['SI','RR']},{t:'Case detection, treatment, referral & follow up of cases under NVBDCP',r:'CHO',aoc:'A',me:'ME A1.5',method:['SI','RR']},{t:'Preventive & promotive measures  under NTEP',r:'CI',aoc:'A',me:'ME A1.5',method:['SI','CI']},{t:'Case detection, treatment, referral & follow up of cases under NTEP',r:'CHO',aoc:'A',me:'ME A1.5',method:['SI','RR']},{t:'Preventive & promotive measures under NLEP',r:'CHO',aoc:'A',me:'ME A1.5',method:['SI','CI']},{t:'Case detection, treatment, referral & follow up of cases under NLEP',r:'CHO',aoc:'A',me:'ME A1.5',method:['SI','RR']},{t:'Preventive & promotive services under NACP',r:'CHO',aoc:'A',me:'ME A1.5',method:['SI','CI']},{t:'Referral & follow up of cases under NACP',r:'CHO',aoc:'A',me:'ME A1.5',method:['SI','RR']},{t:'Preventive & promotive measures  under NVHCP',r:'CHO',aoc:'A',me:'ME A1.5',method:['SI','CI']},{t:'Case detection, treatment, referral & follow up of cases under NVHCP',r:'CHO',aoc:'A',me:'ME A1.5',method:['SI','RR']},{t:'Availability of functional services under IDSP/ IHIP',r:'CHO',aoc:'A',me:'ME A1.5',method:['SI','RR']},{t:'Identification, management and  referral of acute illness & minor aliments',r:'CHO',aoc:'A',me:'ME A1.6',method:['SI','RR']},{t:'Preventive & promotive measures  for acute illness',r:'CHO',aoc:'A',me:'ME A1.6',method:['SI','CI']},{t:'Primary care team  is aware of  vector born disease control strategies',r:'CHO',aoc:'E',me:'ME E10.1',method:['SI','RR']},{t:'Case detection is done for Malaria',r:'CHO',aoc:'E',me:'ME E10.1',method:['SI','RR']},{t:'Staff is aware of Malaria treatment protocols',r:'CHO',aoc:'E',me:'ME E10.1',method:['SI','RR']},{t:'Staff is aware of Malaria referral protocols',r:'CHO',aoc:'E',me:'ME E10.1',method:['SI','RR']},{t:'Staff is aware of diagnostic & management of dengue as per protocols',r:'CHO',aoc:'E',me:'ME E10.1',method:['SI','RR']},{t:'NVBDCP register & records are maintained',r:'ASHA',aoc:'E',me:'ME E10.1',method:['SI','RR']},{t:'Facilities have adequate stock of commodities & drugs',r:'CHO',aoc:'E',me:'ME E10.1',method:['SI','RR']},{t:'Staff is aware of sign & symptoms of prevalent vector born diseases in area',r:'CHO',aoc:'E',me:'ME E10.1',method:['SI']},{t:'Identification of presumptive case  & their referral',r:'CHO',aoc:'E',me:'ME E10.2',method:['RR']},{t:'Ayushman Arogya Mandir support, supervision & manage presumptive, confirmed & on treatment cases including DR- TB patients',r:'CHO',aoc:'E',me:'ME E10.2',method:['RR','OB']},{t:'Staff is aware of follow up protocol after treatment completion',r:'CHO',aoc:'E',me:'ME E10.2',method:['SI','RR']},{t:'NTEP register & records are maintained',r:'CHO',aoc:'E',me:'ME E10.2',method:['RR']},{t:'Primary healthcare team  identify and ensure referral of suspected cases of Leprosy',r:'CHO',aoc:'E',me:'ME E10.3',method:['SI','RR']},{t:'NLEP register & records are maintained',r:'CHO',aoc:'E',me:'ME E10.3',method:['RR']},{t:'Facility provide awareness about leprosy & availability of its treatment',r:'CHO',aoc:'E',me:'ME E10.3',method:['SI','CI']},{t:'Ayushman Arogya Mandir-HSC is aware of their roles in NACP',r:'CHO',aoc:'E',me:'ME E10.4',method:['SI','RR']},{t:'Ayushman Arogya Mandir -SC has linkage for management of HIV/AIDS complications',r:'CHO',aoc:'E',me:'ME E10.4',method:['RR']},{t:'Staff is aware of promotional & supportive  activities done under NACP',r:'CHO',aoc:'E',me:'ME E10.4',method:['SI','RR']},{t:'Staff is aware of syndrome under surveillance in IDSP/IHIP',r:'CHO',aoc:'E',me:'ME E10.5',method:['SI','RR']},{t:'Check process to collect information in form S/ IHIP',r:'CHO',aoc:'E',me:'ME E10.5',method:['RR']},{t:'Check  Analysis & reporting of information for syndromic surveillance is done',r:'CHO',aoc:'E',me:'ME E10.5',method:['SI','RR']},{t:'Availability of diagnostic & treatment services',r:'CHO',aoc:'E',me:'ME E10.6',method:['RR']},{t:'Staff is aware of preventive measures for NVHCP',r:'CHO',aoc:'E',me:'ME E10.6',method:['SI','OB']}]},{day:6,aoc:'AE',service:'Management of Non-Communicable Diseases',title:'Management of Non-Communicable Diseases — Availability & Clinical Quality',task:'Assess Management of Non-Communicable Diseases services — verify availability (AoC A) and clinical quality (AoC E).',me:'ME A1 | ME E',aocTags:['AoC A — Service Provision','AoC E — Clinical Services'],methods:['SI','RR','CI'],roles:{prime:'CHO',support:['ANM','ASHA']},cps:[{t:'Availability of services for Hypertension',r:'CHO',aoc:'A',me:'ME A1.7',method:['SI','RR']},{t:'Availability of services for Diabetes',r:'CHO',aoc:'A',me:'ME A1.7',method:['SI','RR']},{t:'Availability of services for Nonalcoholic fatty liver disease (NAFLD)',r:'CHO',aoc:'A',me:'ME A1.7',method:['SI','RR']},{t:'Availability of Services for  Cancers',r:'CHO',aoc:'A',me:'ME A1.7',method:['SI','RR']},{t:'Availability of services for respiratory diseases',r:'CHO',aoc:'A',me:'ME A1.7',method:['SI','RR']},{t:'Availability of services for Epilepsy',r:'CHO',aoc:'A',me:'ME A1.7',method:['SI','RR']},{t:'Availability of  services for  locally prevalent health diseases & substance abuse',r:'CHO',aoc:'A',me:'ME A1.7',method:['RR']},{t:'Preventive & promotive services under NCD',r:'CHO',aoc:'A',me:'ME A1.7',method:['SI','CI']},{t:'Ayushman Arogya Mandir undertakes  health promotion and disease prevention activities through Community level resources',r:'CI',aoc:'A',me:'ME A1.14',method:['RR','CI']},{t:'Provision of wellness services through Yoga and other activities',r:'CHO',aoc:'A',me:'ME A1.14',method:['SI','CI']},{t:'Provision of AYUSH services',r:'CHO',aoc:'A',me:'ME A1.14',method:['SI','RR']},{t:'Provision of counselling services for Eat Right',r:'CHO',aoc:'A',me:'ME A1.14',method:['SI','CI']},{t:'Staff is aware of process of population identification and referral for hypertension',r:'CHO',aoc:'E',me:'ME E11.1',method:['SI','RR']},{t:'CHO is  aware of sign & symptoms  of Hypertension',r:'CHO',aoc:'E',me:'ME E11.1',method:['SI']},{t:'Ayushman Arogya Mandir ensures frequency of follow up & supply of required medicines',r:'CHO',aoc:'E',me:'ME E11.1',method:['RR','CI']},{t:'Staff is aware of promotional & supportive  activities for Hypertension',r:'CHO',aoc:'E',me:'ME E11.1',method:['SI','CI']},{t:'Staff is aware of process of population identification and referral for diabetes',r:'CHO',aoc:'E',me:'ME E11.2',method:['SI','RR']},{t:'CHO is  aware of sign & symptoms  of diabetes',r:'CHO',aoc:'E',me:'ME E11.2',method:['SI']},{t:'Ayushman Arogya Mandir ensures frequency of follow up & supply of required medicines',r:'CHO',aoc:'E',me:'ME E11.2',method:['RR','CI']},{t:'Check Patient is counselled about identification & immediate management hypoglycaemia',r:'CHO',aoc:'E',me:'ME E11.2',method:['SI','CI']},{t:'Ayushman Arogya Mandir is aware of  risk factors of  Nonalcoholic fatty liver disease (NAFLD)',r:'CHO',aoc:'E',me:'ME E11.2',method:['SI','RR']},{t:'Staff is aware of promotional & supportive  activities for diabetes',r:'CHO',aoc:'E',me:'ME E11.2',method:['SI','CI']},{t:'Check cancer screening services are provided through Ayushman Arogya Mandir',r:'CHO',aoc:'E',me:'ME E11.3',method:['SI','RR']},{t:'Staff is aware about sign & symptom of cervical cancer',r:'CHO',aoc:'E',me:'ME E11.3',method:['SI']},{t:'Staff is aware about sign & symptom of Breast cancer',r:'CHO',aoc:'E',me:'ME E11.3',method:['SI']},{t:'Staff is aware about sign & symptom of Oral Cancer',r:'CHO',aoc:'E',me:'ME E11.3',method:['SI']},{t:'Check with  staff about methodology followed for  cancer screening',r:'CHO',aoc:'E',me:'ME E11.3',method:['SI','RR']},{t:'Check CHW is aware of referral centre for all types of cancer',r:'CHO',aoc:'E',me:'ME E11.3',method:['SI','RR']},{t:'Staff is aware of promotional & supportive  activities for cancers',r:'CHO',aoc:'E',me:'ME E11.3',method:['SI','CI']},{t:'Confirmation and referral of cases for Tobacco/alcohol/ substance abuse',r:'CHO',aoc:'E',me:'ME E11.4',method:['SI','RR']},{t:'Promotional & supportive  activities for Tobacco/alcohol/ substance abuse',r:'CHO',aoc:'E',me:'ME E11.4',method:['SI','RR','CI']},{t:'Check Screening & referral  locally prevalent diseases',r:'CHO',aoc:'E',me:'ME E11.4',method:['SI','CI']},{t:'Check Ayushman Arogya Mandir is providing Yoga services',r:'ASHA',aoc:'E',me:'ME E11.5',method:['SI','RR']},{t:'Check Yoga sessions are conducted regularly',r:'CHO',aoc:'E',me:'ME E11.5',method:['RR','CI']},{t:'Check counselling of mother\'s for nutrition & hygiene maintenance under Eat right',r:'CHO',aoc:'E',me:'ME E11.5',method:['SI','CI']},{t:'Check staff counsel and guide the mother\'s about household preparation of complementary feeds',r:'CHO',aoc:'E',me:'ME E11.5',method:['SI','CI']},{t:'Check Primary  health care team generate awareness  in community about balanced diet',r:'CHO',aoc:'E',me:'ME E11.5',method:['SI','CI']},{t:'Check Primary  health care team generate awareness  in community about food fortification',r:'CHO',aoc:'E',me:'ME E11.5',method:['SI','CI']},{t:'Check Primary  health care team generate awareness  in community about Eat safe practices',r:'CHO',aoc:'E',me:'ME E11.5',method:['SI','CI']},{t:'Check Primary  health care team generate awareness  in community about food safety',r:'CHO',aoc:'E',me:'ME E11.5',method:['SI','CI']}]},{day:7,aoc:'AE',service:'Drugs & Diagnostics',title:'Drugs & Diagnostics — Availability & Clinical Quality',task:'Assess Drugs & Diagnostics services — verify availability (AoC A) and clinical quality (AoC E).',me:'ME A1 | ME E',aocTags:['AoC A — Service Provision','AoC E — Clinical Services'],methods:['RR','CI','SI'],roles:{prime:'CHO',support:['ANM','ASHA']},cps:[{t:'Availability of basic diagnostic services including NHP',r:'ANM',aoc:'A',me:'ME A2.1',method:['RR','CI']},{t:'Linkages with the Central diagnostic units (Hub & spoke)',r:'ANM',aoc:'A',me:'ME A2.1',method:['SI','RR']},{t:'Availability of drugs as per EDL',r:'CHO',aoc:'A',me:'ME A2.2',method:['SI','RR']},{t:'Availability of drugs for refill for chronic cases',r:'CHO',aoc:'A',me:'ME A2.2',method:['SI','RR']}]},{day:8,aoc:'AE',service:'Emergency',title:'Emergency — Availability & Clinical Quality',task:'Assess Emergency services — verify availability (AoC A) and clinical quality (AoC E).',me:'ME A1 | ME E',aocTags:['AoC A — Service Provision','AoC E — Clinical Services'],methods:['SI','RR','CI','OB'],roles:{prime:'CHO',support:['ANM','ASHA']},cps:[{t:'Availability of services for Medical Emergencies including trauma & burns',r:'CHO',aoc:'A',me:'ME A1.12',method:['SI','RR']},{t:'Emergency protocols for first aid and stabilization are available',r:'CHO',aoc:'E',me:'ME E 7.1',method:['SI','RR']},{t:'Staff is aware of  procedure for CPR',r:'CHO',aoc:'E',me:'ME E 7.1',method:['SI','RR']},{t:'Ayushman Arogya Mandir ensures timely availability of ambulances services for emergency cases',r:'CHO',aoc:'E',me:'ME E 7.1',method:['RR','CI']},{t:'Emergency care is given in case of disaster',r:'CHO',aoc:'E',me:'ME E 7.2',method:['SI','OB']},{t:'Staff is aware of  process of sorting the patients in case of mass causalty/ outbreak',r:'CHO',aoc:'E',me:'ME E 7.2',method:['SI','RR']}]},{day:9,aoc:'AE',service:'Care of Common Ophthalmic and ENT',title:'Care of Common Ophthalmic and ENT — Availability & Clinical Quality',task:'Assess Care of Common Ophthalmic and ENT services — verify availability (AoC A) and clinical quality (AoC E).',me:'ME A1 | ME E',aocTags:['AoC A — Service Provision','AoC E — Clinical Services'],methods:['SI','RR','CI','OB'],roles:{prime:'CHO',support:['ANM','ASHA']},cps:[{t:'Availability of  Ophthalmic  Services',r:'CHO',aoc:'A',me:'ME A1.8',method:['SI','RR']},{t:'Preventive & promotive services under for Ophthalmic',r:'CHO',aoc:'A',me:'ME A1.8',method:['SI','CI']},{t:'Availability of  ENT Services',r:'CHO',aoc:'A',me:'ME A1.9',method:['SI','RR']},{t:'Preventive & promotive services under for ENT',r:'CHO',aoc:'A',me:'ME A1.9',method:['SI','CI']},{t:'Staff screen & refer cases of common ophthalmic aliments  lead to blindness & refractive errors',r:'CHO',aoc:'E',me:'ME E8.1',method:['SI','RR']},{t:'Staff is aware of identification & primary management common ophthalmic conditions including emergencies',r:'CHO',aoc:'E',me:'ME E8.1',method:['SI','RR','OB']},{t:'Staff is aware of  methods for measuring the refractive errors',r:'CHO',aoc:'E',me:'ME E8.1',method:['SI','RR']},{t:'Staff maintain records under ophthalmic care',r:'CHO',aoc:'E',me:'ME E8.1',method:['SI','RR']},{t:'Promotion & supportive activities for ophthalmic care',r:'CHO',aoc:'E',me:'ME E8.1',method:['RR','CI']},{t:'Screening of population for ENT aliments',r:'CHO',aoc:'E',me:'ME E8.2',method:['SI','RR']},{t:'Identification & primary management of common ear problems',r:'CHO',aoc:'E',me:'ME E8.2',method:['SI','RR']},{t:'Staff is trained & using diagnostic tools for identification of ear problems',r:'CHO',aoc:'E',me:'ME E8.2',method:['RR','OB']},{t:'Identification & management of nose problem',r:'CHO',aoc:'E',me:'ME E8.2',method:['RR','OB']},{t:'Staff is trained & using diagnostic tools for identification of Nose aliments',r:'CHO',aoc:'E',me:'ME E8.2',method:['SI','OB']},{t:'Identification & primary management  of throat aliments',r:'CHO',aoc:'E',me:'ME E8.2',method:['SI','RR']},{t:'Check staff is trained & able to  perform Heimlich manoeuvre/ dislodge obstruction from windpipe',r:'CHO',aoc:'E',me:'ME E8.2',method:['SI','RR']},{t:'Staff is trained to identify ENT aliments require referral to higher centre',r:'CHO',aoc:'E',me:'ME E8.2',method:['SI','RR']},{t:'Promotion & supportive activities for ENT',r:'CHO',aoc:'E',me:'ME E8.2',method:['SI','RR','CI']}]},{day:10,aoc:'AE',service:'Oral Health Care',title:'Oral Health Care — Availability & Clinical Quality',task:'Assess Oral Health Care services — verify availability (AoC A) and clinical quality (AoC E).',me:'ME A1 | ME E',aocTags:['AoC A — Service Provision','AoC E — Clinical Services'],methods:['SI','RR','CI'],roles:{prime:'CHO',support:['ANM','ASHA']},cps:[{t:'Availability of  early identification & referral services for oral Health conditions',r:'CHO',aoc:'A',me:'ME A1.10',method:['SI','RR']},{t:'Availability of  symptomatic management & referral services for oral Health conditions',r:'CHO',aoc:'A',me:'ME A1.10',method:['SI','RR']},{t:'Preventive & promotive services under oral health',r:'CHO',aoc:'A',me:'ME A1.10',method:['SI','CI']},{t:'Staff is aware about Oral health conditions, primary management & referral',r:'CHO',aoc:'E',me:'ME E8.3',method:['SI']},{t:'Staff is aware of symptomatic  treatment for dental emergencies',r:'CHO',aoc:'E',me:'ME E8.3',method:['SI','RR']},{t:'Screening of oral health conditions is done as per protocol',r:'CHO',aoc:'E',me:'ME E8.3',method:['SI','RR']},{t:'Promotion & supportive activities for oral health',r:'CHO',aoc:'E',me:'ME E8.3',method:['SI','CI']}]},{day:11,aoc:'AE',service:'Mental Health',title:'Mental Health — Availability & Clinical Quality',task:'Assess Mental Health services — verify availability (AoC A) and clinical quality (AoC E).',me:'ME A1 | ME E',aocTags:['AoC A — Service Provision','AoC E — Clinical Services'],methods:['SI','RR','CI'],roles:{prime:'CHO',support:['ANM','ASHA']},cps:[{t:'Availability of services for mental health',r:'CHO',aoc:'A',me:'ME A1.13',method:['SI','RR']},{t:'Preventive & promotive services under mental health',r:'CHO',aoc:'A',me:'ME A1.13',method:['SI','CI']},{t:'Check staff is aware of MNS (Mental, neurological & substance use)  conditions',r:'CHO',aoc:'E',me:'ME E9.1',method:['SI','RR']},{t:'Check Staff  uses specific  tools for early identification & screening of MNS',r:'ASHA',aoc:'E',me:'ME E9.1',method:['SI','RR']},{t:'Staff is competent for basic management, referral & follow up of MNS',r:'CHO',aoc:'E',me:'ME E9.1',method:['SI','RR']},{t:'Check staff is trained for emergency management of  Epilepsy',r:'CHO',aoc:'E',me:'ME E9.1',method:['SI','RR']},{t:'Promotion & supportive activities for mental health',r:'CHO',aoc:'E',me:'ME E9.1',method:['SI','CI']}]},{day:12,aoc:'AE',service:'Elderly & Pallative Care',title:'Elderly & Pallative Care — Availability & Clinical Quality',task:'Assess Elderly & Pallative Care services — verify availability (AoC A) and clinical quality (AoC E).',me:'ME A1 | ME E',aocTags:['AoC A — Service Provision','AoC E — Clinical Services'],methods:['SI','RR','OB','CI'],roles:{prime:'CHO',support:['ANM','ASHA']},cps:[{t:'Availability of services for elderly care',r:'CHO',aoc:'A',me:'ME A1.11',method:['SI','RR']},{t:'Availability of services for palliative care',r:'CHO',aoc:'A',me:'ME A1.11',method:['SI','RR']},{t:'Elderly population is mapped & screened',r:'CHO',aoc:'E',me:'ME E12.1',method:['SI','RR']},{t:'CHO is aware &  competent to use various geriatric tools',r:'CHO',aoc:'E',me:'ME E12.1',method:['RR','OB']},{t:'Ayushman Arogya Mandir ­undertake preliminary assessment for the need of assistive devices',r:'CHO',aoc:'E',me:'ME E12.1',method:['RR']},{t:'Promotional & supportive activities for Geriatric care',r:'CHO',aoc:'E',me:'ME E12.1',method:['SI','CI']},{t:'Screening, basic management & referral  of Palliative Care patient is done',r:'CHO',aoc:'E',me:'ME E12.2',method:['RR','CI']},{t:'Home based palliative care services are being provided',r:'CHO',aoc:'E',me:'ME E12.2',method:['SI','RR']},{t:'Check Home care kit is available & case sheet are  updated',r:'CHO',aoc:'E',me:'ME E12.2',method:['SI','RR']},{t:'Check patient support groups are available',r:'CHO',aoc:'E',me:'ME E12.2',method:['SI','RR']},{t:'Promotional & supportive activities for palliative care',r:'CHO',aoc:'E',me:'ME E12.2',method:['SI','CI']}]},{day:13,aoc:'B',service:'Patient Rights',title:'Patient Rights, Dignity & Consent',task:'Verify patient rights charter, informed consent, privacy, and dignity.',me:'ME B1 | ME B2',aocTags:['AoC B — Patient Rights'],methods:['SI','OB','CI'],roles:{prime:'CHO',support:['ANM']},cps:[{t:'Name of the facility & list of services and drugs available are displayed prominently',r:'OB',aoc:'B',me:'ME B1.1',method:['OB']},{t:'Branding of Ayushman Arogya Mandir is done as per guidelines',r:'OB',aoc:'B',me:'ME B1.1',method:['OB']},{t:'Name of AAM is written in regional language',r:'OB',aoc:'B',me:'ME B1.1',method:['SI','OB']},{t:'Citizen charter is displayed',r:'OB',aoc:'B',me:'ME B1.1',method:['OB']},{t:'IEC Material is displayed as per services provided',r:'OB',aoc:'B',me:'ME B1.2',method:['OB']},{t:'Ayushman Arogya Mandir promotes wellness through EAT right campaign',r:'OB',aoc:'B',me:'ME B1.2',method:['CI','OB']},{t:'Patient is informed about clinical condition and treatment plan',r:'CI',aoc:'B',me:'ME B1.3',method:['RR','CI']},{t:'Primary healthcare team  provide information to beneficiaries or families regarding their entitlements',r:'CHO',aoc:'B',me:'ME B1.3',method:['SI','CI']},{t:'Ayushman Arogya Mandir is located closer to community',r:'CHO',aoc:'B',me:'ME B2.1',method:['SI','CI']},{t:'Check outreach sessions are conducted',r:'CHO',aoc:'B',me:'ME B2.1',method:['SI','RR']},{t:'The full range of services are available for the time period, as mandated',r:'CHO',aoc:'B',me:'ME B2.1',method:['RR','CI']},{t:'Check Ayushman Arogya Mandir premises is free from any physical barrier',r:'OB',aoc:'B',me:'ME B2.2',method:['OB']},{t:'Check Ayushman Arogya Mandir premises is obstacle free for ambulatory and semi ambulatory individuals',r:'OB',aoc:'B',me:'ME B2.2',method:['OB']}]},{day:14,aoc:'B',service:'Patient Rights',title:'Equity, Feedback & Non-Discrimination',task:'Verify non-discrimination in services, feedback system, and complaint resolution.',me:'ME B2 | ME B3',aocTags:['AoC B — Patient Rights'],methods:['CI','SI','RR'],roles:{prime:'CHO',support:['ANM']},cps:[{t:'Check for special precaution is taken for maintaining privacy  & confidentiality of cases having social stigma',r:'CHO',aoc:'B',me:'ME B2.3',method:['SI','RR']},{t:'Availability of female staff / attendant, if a male CHO examines a female patients',r:'CHO',aoc:'B',me:'ME B3.1',method:['SI','CI']},{t:'There is no discrimination based religion, ethnicity, socio economic status, cast, gender & language etc',r:'CI',aoc:'B',me:'ME B3.1',method:['SI','RR']},{t:'Check Staff and Communities is aware of Patient rights and responsibilities',r:'OB',aoc:'B',me:'ME B3.2',method:['SI','OB']},{t:'Check staff & community is aware of grievance redressal system',r:'CHO',aoc:'B',me:'ME B3.3',method:['SI','CI']},{t:'Availability of  complaint reporting system',r:'OB',aoc:'B',me:'ME B3.3',method:['RR','OB']},{t:'Availability of screen/ curtains in examination area and in windows',r:'OB',aoc:'B',me:'ME B4.1',method:['OB']},{t:'Patient records are kept in safe custody',r:'OB',aoc:'B',me:'ME B4.2',method:['SI','OB']},{t:'Check patient and their kin\'s have access to clinical records',r:'CHO',aoc:'B',me:'ME B4.2',method:['SI','RR']},{t:'Behaviour of staff is empathetic and courteous to patients and visitors',r:'CI',aoc:'B',me:'ME B4.3',method:['CI']},{t:'Ayushman Arogya Mandir provide free of cost  access to all the services',r:'CHO',aoc:'B',me:'ME B5.1',method:['RR','CI']},{t:'The facility provides free of cost essential medicines and refills as per treatment plan',r:'CHO',aoc:'B',me:'ME B5.1',method:['SI','CI']},{t:'Availability of free teleconsultation and diagnostic services',r:'CHO',aoc:'B',me:'ME B5.1',method:['SI','CI']}]},{day:15,aoc:'C',service:'Human Resources',title:'Human Resources & Attendance',task:'Verify all sanctioned positions filled, attendance registers, and training records.',me:'ME C1',aocTags:['AoC C — Inputs'],methods:['RR','SI'],roles:{prime:'CHO',support:['ANM']},cps:[{t:'Well ventilated & illuminated clinic room with examination space',r:'OB',aoc:'C',me:'ME C1.1',method:['OB']},{t:'Availability of adequate patient amentities',r:'OB',aoc:'C',me:'ME C1.1',method:['OB']},{t:'Demarcated space for Laboratory / diagnostics, drug storage',r:'OB',aoc:'C',me:'ME C1.1',method:['OB']},{t:'Adequate space/ room for Yoga and immunization activities',r:'OB',aoc:'C',me:'ME C1.1',method:['OB']},{t:'Availability of regular &  uninterrupted electricity supply',r:'OB',aoc:'C',me:'ME C1.1',method:['SI','OB']},{t:'Adequate water supply with storage facility',r:'OB',aoc:'C',me:'ME C1.1',method:['SI','OB']},{t:'Ayushman Arogya Mandir has installed fire  extinguisher and staff know how to operate it',r:'OB',aoc:'C',me:'ME C1.2',method:['SI','OB']},{t:'Ayushman Arogya Mandir does not have temporary connections and loosely hanging wires',r:'OB',aoc:'C',me:'ME C1.2',method:['SI','OB']},{t:'Ayushman Arogya Mandir has adequate ICT hardware  for  efficient delivery of services',r:'CHO',aoc:'C',me:'ME C1.3',method:['SI','RR']},{t:'Ayushman Arogya Mandir has adequate ICT software  for  efficient delivery of services',r:'CHO',aoc:'C',me:'ME C1.3',method:['SI','RR']},{t:'Availability of Community Health Officer',r:'CHO',aoc:'C',me:'ME C2.1',method:['SI','RR']},{t:'Availability of ANM',r:'CHO',aoc:'C',me:'ME C2.2',method:['SI','RR']},{t:'Availability of Multipurpose Worker',r:'CHO',aoc:'C',me:'ME C2.2',method:['SI','RR']},{t:'Availability of ASHA & ASHA facilitator',r:'CHO',aoc:'C',me:'ME C2.2',method:['SI','RR']},{t:'Check duty roster is prepared prepared, updated & followed for all cadres',r:'CHO',aoc:'C',me:'ME C2.3',method:['RR']},{t:'Check field visit plans are prepared, updated & followed by primary healthcare team',r:'CHO',aoc:'C',me:'ME C2.3',method:['RR']},{t:'Check parameters for assessing skills and proficiency of  staff has been defined',r:'CHO',aoc:'C',me:'ME C3.1',method:['SI','RR']},{t:'Check for performance evaluation is done at least once in a year',r:'CHO',aoc:'C',me:'ME C3.1',method:['SI','RR']},{t:'CHO is trained as per mandate',r:'CHO',aoc:'C',me:'ME C3.2',method:['SI','RR']}]},{day:16,aoc:'C',service:'Drugs & Equipment',title:'Drugs, Equipment & Diagnostics',task:'Inspect drug availability, expiry, storage, equipment calibration, and diagnostic services.',me:'ME C2 | ME C3',aocTags:['AoC C — Inputs'],methods:['OB','RR'],roles:{prime:'ANM',support:['CHO']},cps:[{t:'MPW is trained as per mandate',r:'MPW',aoc:'C',me:'ME C3.2',method:['SI','RR']},{t:'AHSA  is trained as per mandate',r:'ASHA',aoc:'C',me:'ME C3.2',method:['SI','RR']},{t:'Staff is provided with Quality assurance training',r:'CHO',aoc:'C',me:'ME C3.2',method:['SI','RR']},{t:'Availability of disposables for Dressing / Emergency management',r:'OB',aoc:'C',me:'ME C4.2',method:['RR','OB']},{t:'Availability of disposables at Clinics',r:'OB',aoc:'C',me:'ME C4.2',method:['RR','OB']},{t:'Availability of functional Equipment & instruments  for examination & Monitoring  at Clinic',r:'OB',aoc:'C',me:'ME C5.1',method:['OB']},{t:'Availability of functional Equipment & instruments  for ENT services',r:'OB',aoc:'C',me:'ME C5.1',method:['OB']},{t:'Availability of furniture & fixture at Clinics',r:'OB',aoc:'C',me:'ME C5.2',method:['OB']},{t:'Availability of Anaesthetics agents',r:'CHO',aoc:'C',me:'ME C4.1',method:['RR','OB']},{t:'Availability of  Analgesics, Anti Pyretic, NSAIDS, and Anti-allergic',r:'CHO',aoc:'C',me:'ME C4.1',method:['RR','OB']},{t:'Availability on Anticonvulsants /Anti epileptics',r:'CHO',aoc:'C',me:'ME C4.1',method:['RR','OB']},{t:'Availability of Intestinal Anti Helminthes and Antifilarial',r:'CHO',aoc:'C',me:'ME C4.1',method:['RR','OB']},{t:'Availability of Anti Bacterial',r:'CHO',aoc:'C',me:'ME C4.1',method:['RR','OB']},{t:'Availability of Anti leprosy',r:'CHO',aoc:'C',me:'ME C4.1',method:['RR','OB']},{t:'Availability of Anti Malarial',r:'CHO',aoc:'C',me:'ME C4.1',method:['RR','OB']},{t:'Availability of anti Anaemic drug',r:'CHO',aoc:'C',me:'ME C4.1',method:['RR','OB']},{t:'Availability of drugs for Palliative care',r:'CHO',aoc:'C',me:'ME C4.1',method:['RR','OB']},{t:'Availability of Cardiovascular medicines',r:'CHO',aoc:'C',me:'ME C4.1',method:['RR','OB']},{t:'Availability of drugs for Hypertension',r:'CHO',aoc:'C',me:'ME C4.1',method:['RR','OB']}]},{day:17,aoc:'C',service:'Infrastructure',title:'Infrastructure, WASH & Safety',task:'Inspect SC building, water, sanitation, electricity, waste disposal, and fire safety.',me:'ME C4 | ME C5',aocTags:['AoC C — Inputs'],methods:['OB'],roles:{prime:'CHO',support:['ANM']},cps:[{t:'Availability of drugs for Hypolipidemic',r:'CHO',aoc:'C',me:'ME C4.1',method:['RR','OB']},{t:'Availability of Dermatological & antifungal  Medicines',r:'CHO',aoc:'C',me:'ME C4.1',method:['RR','OB']},{t:'Availability of Diuretics',r:'CHO',aoc:'C',me:'ME C4.1',method:['RR','OB']},{t:'Availability of Drugs for dementia',r:'CHO',aoc:'C',me:'ME C4.1',method:['RR','OB']},{t:'Availability of Eye drugs',r:'CHO',aoc:'C',me:'ME C4.1',method:['RR','OB']},{t:'Availability of ENT drugs',r:'CHO',aoc:'C',me:'ME C4.1',method:['RR','OB']},{t:'Availability of Gastroinstinal medicines',r:'CHO',aoc:'C',me:'ME C4.1',method:['RR','OB']},{t:'Availability of Contraceptives',r:'CHO',aoc:'C',me:'ME C4.1',method:['RR','OB']},{t:'Availability of drugs for diabetes Mellitus',r:'CHO',aoc:'C',me:'ME C4.1',method:['RR','OB']},{t:'Availability of drugs for Thyroid',r:'CHO',aoc:'C',me:'ME C4.1',method:['RR','OB']},{t:'Availability of medicines for Tespiratory tract',r:'CHO',aoc:'C',me:'ME C4.1',method:['RR','OB']},{t:'Availability of IV Fluids',r:'CHO',aoc:'C',me:'ME C4.1',method:['RR','OB']},{t:'Availability of Vitamins and Minerals',r:'CHO',aoc:'C',me:'ME C4.1',method:['RR','OB']},{t:'Availability of Antidotes',r:'CHO',aoc:'C',me:'ME C4.1',method:['RR','OB']},{t:'Availability of injectables and antispetics',r:'CHO',aoc:'C',me:'ME C4.1',method:['RR','OB']},{t:'Availability of Emergency Drug Tray / injectables at injection room',r:'CHO',aoc:'C',me:'ME C4.1',method:['OB']},{t:'Availability of drugs for oral health',r:'CHO',aoc:'C',me:'ME C4.1',method:['RR','OB']},{t:'Availability of  Rapid Diagnostic Kits',r:'OB',aoc:'C',me:'ME C4.2',method:['RR','OB']},{t:'Availability of Drugs and Consumables for  VHNDs or camps',r:'OB',aoc:'C',me:'ME C4.2',method:['RR','OB']}]},{day:18,aoc:'D',service:'BMW & Housekeeping',title:'Biomedical Waste & Housekeeping',task:'Inspect BMW segregation, disposal, and SC cleanliness.',me:'ME D1 | ME D2',aocTags:['AoC D — Support Services'],methods:['OB','RR','SI'],roles:{prime:'CHO',support:['ANM']},cps:[{t:'Ayushman Arogya Mandir Building is painted/whitewashed in uniform colour & its branding done as per the guideline',r:'OB',aoc:'D',me:'ME D1.1',method:['OB']},{t:'Check building & its premises is well maintained',r:'OB',aoc:'D',me:'ME D1.1',method:['OB']},{t:'No condemned/Junk material in Ayushman Arogya Mandir (corridors, roof,  administrative area , backyard)',r:'CHO',aoc:'D',me:'ME D1.1',method:['RR','OB']},{t:'There is system of timely corrective & preventive   break down maintenance of the equipment',r:'CHO',aoc:'D',me:'ME D1.1',method:['RR']},{t:'All the measuring equipment/ instrument  are calibrated',r:'CHO',aoc:'D',me:'ME D1.1',method:['RR']},{t:'Check all the areas are clean & hygienic',r:'OB',aoc:'D',me:'ME D1.2',method:['OB']},{t:'Check availability of adequate supply of cleaning material',r:'OB',aoc:'D',me:'ME D1.2',method:['RR','OB']},{t:'Check staff is aware of use of 2 bucket system & disinfection of mop after cleaning',r:'ANM',aoc:'D',me:'ME D1.2',method:['SI','OB']},{t:'Clean and adequate linen is available',r:'ANM',aoc:'D',me:'ME D1.2',method:['RR','OB']},{t:'Information regarding  illness and minor aliments are recorded & updated using IT platform',r:'CHO',aoc:'D',me:'ME D3.1',method:['SI','RR']},{t:'Information regarding RMNCHA care seekers are recorded & updated using IT platform',r:'CHO',aoc:'D',me:'ME D3.1',method:['RR']},{t:'Information regarding cases of  communicable & Non- communicable  diseases  are recorded & updated using IT platform',r:'CHO',aoc:'D',me:'ME D3.1',method:['RR']},{t:'Functional platform/s and updated digital records   to assess the coverage and measure outcomes of healthcare facility',r:'CHO',aoc:'D',me:'ME D3.1',method:['RR']},{t:'Functional platform/s and updated digital records for work/ task management and reporting and monitoring of the  performance of health care provider',r:'CHO',aoc:'D',me:'ME D3.1',method:['RR']},{t:'Ayushman Arogya Mandir has established  procedure for safe keeping & retrieval of  paper based records',r:'OB',aoc:'D',me:'ME D3.2',method:['SI','OB']},{t:'Ayushman Arogya Mandir has established procedure for access & retrieval of  electronic records',r:'ANM',aoc:'D',me:'ME D3.2',method:['SI','OB']},{t:'Hubs are identified for tele consultation',r:'CHO',aoc:'D',me:'ME D3.3',method:['RR','OB']},{t:'Cases are identified for tele consultation for specialist & non specialist consultation',r:'CHO',aoc:'D',me:'ME D3.3',method:['SI','RR']}]},{day:19,aoc:'D',service:'Sterilisation',title:'Sterilisation, Linen & Referral Transport',task:'Verify sterilisation procedures, linen management, and referral transport linkages.',me:'ME D3 | ME D4',aocTags:['AoC D — Support Services'],methods:['OB','RR'],roles:{prime:'ANM',support:['CHO']},cps:[{t:'Co ordination with specialist / super specialist and patients for tele consultation',r:'CHO',aoc:'D',me:'ME D3.3',method:['SI','RR']},{t:'Dispense drugs as per prescription received through tele consultation',r:'CHO',aoc:'D',me:'ME D3.3',method:['RR']},{t:'Ayushman Arogya Mandir has functional  Jan Arogya  Samiti',r:'CHO',aoc:'D',me:'ME D4.1',method:['SI','RR']},{t:'Committee members are aware of its roles & responsibilities',r:'CHO',aoc:'D',me:'ME D4.1',method:['SI','RR','CI']},{t:'JAS  meetings are held at defined intervals',r:'CHO',aoc:'D',me:'ME D4.1',method:['RR']},{t:'Timely planning & utilization of untied funds',r:'CHO',aoc:'D',me:'ME D4.1',method:['RR']},{t:'Check JAS   provide support for Health promotion & prevention activities',r:'ANM',aoc:'D',me:'ME D4.1',method:['SI','RR']},{t:'Check social accountability mechanism are place and conducted at periodic intervals.',r:'CHO',aoc:'D',me:'ME D4.2',method:['RR']},{t:'Check JAS committee has prepared action plan along with Ayushman Arogya Mandir',r:'CHO',aoc:'D',me:'ME D4.2',method:['RR']},{t:'Check CHO conducts periodic meetings with MPW & ASHA',r:'MPW',aoc:'D',me:'ME D4.3',method:['SI','RR']},{t:'Check CHO provide  on job mentoring & supervision for VHSND or  campaign and household visits',r:'ANM',aoc:'D',me:'ME D4.3',method:['SI','RR']},{t:'Check PHC -MO provide supportive supervision  & monitoring for Ayushman Arogya Mandir activities',r:'CHO',aoc:'D',me:'ME D4.3',method:['SI','RR']},{t:'Check Ayushman Arogya Mandir is aware of community level approaches for health promotion and disease  prevention',r:'ANM',aoc:'D',me:'ME D5.1',method:['SI','CI']},{t:'Check VHSNC are constituted & functional',r:'CHO',aoc:'D',me:'ME D5.1',method:['SI','RR']},{t:'Check number of VHND planned & conducted in CHO\'s catering area in preceding quarter',r:'CHO',aoc:'D',me:'ME D5.1',method:['RR','CI']},{t:'Check the process followed to identify key challenges and list of priorities for monthly campaigns',r:'ASHA',aoc:'D',me:'ME D5.1',method:['SI','RR']},{t:'Check Annual calendar is prepared for monthly campaign  based on situational analysis',r:'CHO',aoc:'D',me:'ME D5.1',method:['RR']},{t:'Check health promotion campaign  are conducted as per planning',r:'CHO',aoc:'D',me:'ME D5.1',method:['RR']}]},{day:20,aoc:'D',service:'Records & MIS',title:'Records, MIS & HMIS Reporting',task:'Review all SC registers and HMIS reporting for completeness, accuracy, and timely submission.',me:'ME D5',aocTags:['AoC D — Support Services'],methods:['RR','SI'],roles:{prime:'ANM',support:['CHO']},cps:[{t:'There is a system of taking feedback  from ASHAs / VHNSCs/ VHND to improve the services',r:'ASHA',aoc:'D',me:'ME D5.1',method:['SI','RR']},{t:'Ayushman Arogya Mandir have created Patient support groups for  various issues/ disease conditions',r:'CI',aoc:'D',me:'ME D5.2',method:['RR','CI']},{t:'Check members of PSGs aware of their roles',r:'CI',aoc:'D',me:'ME D5.2',method:['SI','CI']},{t:'Check the  frequency , location & timing of PSG meetings facilitated by Ayushman Arogya Mandir',r:'CI',aoc:'D',me:'ME D5.2',method:['RR','CI']},{t:'Primary health care team/worker is aware of their role in conducting PSGs',r:'CI',aoc:'D',me:'ME D5.2',method:['SI']},{t:'Ayushman Arogya Mandir engage other allied departments for intersectoral convergence',r:'CHO',aoc:'D',me:'ME D5.3',method:['SI','RR']},{t:'Ayushman Arogya Mandir promotes wellness & health promotion through Yoga',r:'CHO',aoc:'D',me:'ME D5.3',method:['SI','RR']},{t:'Authorization for Bio Medical waste Management  and latest copy of regulation is available',r:'CHO',aoc:'D',me:'ME D6.1',method:['RR']},{t:'No Smoking sign is displayed at the prominent places',r:'OB',aoc:'D',me:'ME D6.1',method:['OB']},{t:'Any positive report of notifiable disease is intimated to designated authorities',r:'CHO',aoc:'D',me:'ME D6.1',method:['RR']},{t:'Ayushman Arogya Mandir  has a process to consolidate and calculate the consumption',r:'CHO',aoc:'D',me:'ME D2.1',method:['SI','RR']},{t:'Check Drugs and consumables forecasting  and indenting is IT enabled',r:'CHO',aoc:'D',me:'ME D2.1',method:['RR']},{t:'Check there is established system to timely indent the drugs as per services package',r:'CHO',aoc:'D',me:'ME D2.1',method:['SI','RR']},{t:'Check there is no stock out of essential & vital drugs',r:'CHO',aoc:'D',me:'ME D2.1',method:['RR']},{t:'There is specified place to store medicines in Ayushman Arogya Mandir',r:'OB',aoc:'D',me:'ME D2.2',method:['OB']},{t:'Check drugs are kept in  racks and shelves with proper  labelling',r:'OB',aoc:'D',me:'ME D2.2',method:['OB']},{t:'Check process followed to maintain the temperature of  refrigerator used for drugs/ vaccine/ lab kits',r:'OB',aoc:'D',me:'ME D2.2',method:['RR','OB']},{t:'There is system in place to maintain expiry & near expiry of drugs',r:'CHO',aoc:'D',me:'ME D2.3',method:['SI','OB']},{t:'No expired drug is found in Ayushman Arogya Mandir',r:'CHO',aoc:'D',me:'ME D2.3',method:['OB']}]},{day:21,aoc:'Boss',service:'Boss Battle',title:'⚔️ BOSS BATTLE I — Mid-Programme Mock Assessment',task:'⚔️ Full self-audit of all Areas of Concern. Score each area honestly and prepare gap closure plan.',me:'All MEs',aocTags:['All Areas of Concern'],methods:['SI','RR','OB','CI'],roles:{prime:'CHO',support:['ANM','ASHA']},isBoss:true,cps:[{t:'AoC A (Service Provision) — self-audit complete',r:'CHO',aoc:'Boss',me:'',method:['SI']},{t:'AoC B (Patient Rights) — self-audit complete',r:'CHO',aoc:'Boss',me:'',method:['CI']},{t:'AoC C (Inputs) — self-audit complete',r:'CHO',aoc:'Boss',me:'',method:['OB']},{t:'AoC D (Support Services) — self-audit complete',r:'CHO',aoc:'Boss',me:'',method:['OB']},{t:'AoC E (Clinical Services) — self-audit complete',r:'CHO',aoc:'Boss',me:'',method:['SI']},{t:'AoC F (Infection Control) — self-audit complete',r:'CHO',aoc:'Boss',me:'',method:['OB']},{t:'AoC G (Quality Management) — self-audit complete',r:'CHO',aoc:'Boss',me:'',method:['RR']},{t:'AoC H (Outcome) — reviewed and documented',r:'CHO',aoc:'Boss',me:'',method:['RR']},{t:'Top gaps identified — corrective action plan prepared',r:'CHO',aoc:'Boss',me:'',method:['RR']},{t:'Block/PHC supervisor informed of readiness status',r:'CHO',aoc:'Boss',me:'',method:['SI']}]},{day:22,aoc:'F',service:'Hand Hygiene',title:'Hand Hygiene, PPE & Standard Precautions',task:'Observe hand hygiene practices, PPE use, needle disposal, and standard precautions.',me:'ME F1 | ME F2',aocTags:['AoC F — Infection Control'],methods:['OB','SI'],roles:{prime:'CHO',support:['ANM']},cps:[{t:'Staff is working as team to improve sanitation & hygiene of the facility',r:'CHO',aoc:'F',me:'ME F1.1',method:['SI','RR']},{t:'Check Records of Medical Check-up and Immunization',r:'CHO',aoc:'F',me:'ME F1.1',method:['RR']},{t:'Facility  has a system to monitor cleanliness & hygiene  practices',r:'OB',aoc:'F',me:'ME F1.1',method:['RR','OB']},{t:'Availability of Hand washing facilities',r:'OB',aoc:'F',me:'ME F2.1',method:['OB']},{t:'Check  Washbasin, tap & running water as per standard protocols',r:'OB',aoc:'F',me:'ME F2.1',method:['SI','OB']},{t:'Staff is trained and adheres to hand washing practices',r:'CHO',aoc:'F',me:'ME F2.1',method:['SI','OB']},{t:'Check availability & use of  PPE',r:'OB',aoc:'F',me:'ME F3.1',method:['RR','OB']},{t:'Compliance to correct method of wearing and removing PPE',r:'CHO',aoc:'F',me:'ME F3.1',method:['SI','OB']},{t:'Adequate supply of decontamination  and cleaning agents  at the point of use',r:'OB',aoc:'F',me:'ME F4.1',method:['RR','OB']},{t:'Decontamination and cleaning of instruments and surfaces',r:'ANM',aoc:'F',me:'ME F4.1',method:['SI','OB']},{t:'Availability of disinfectants',r:'OB',aoc:'F',me:'ME F4.2',method:['RR','OB']},{t:'Staff adhere to the process of disinfection',r:'ANM',aoc:'F',me:'ME F4.2',method:['SI','RR']},{t:'Sterilization/HLD records are maintained',r:'CHO',aoc:'F',me:'ME F4.2',method:['RR']}]},{day:23,aoc:'F',service:'Sterilisation',title:'Antisepsis, Sterilisation & HAI Prevention',task:'Inspect antisepsis, sterilisation practices, surface disinfection, and HAI prevention.',me:'ME F3 | ME F4',aocTags:['AoC F — Infection Control'],methods:['OB','RR'],roles:{prime:'ANM',support:['CHO']},cps:[{t:'Availability of colour coded bins and non chlorinated plastic bags and needle cutters  at point of waste generation',r:'OB',aoc:'F',me:'ME F5.1',method:['SI','OB']},{t:'Segregation of BMW is done as per latest prevalent rules',r:'OB',aoc:'F',me:'ME F5.1',method:['SI','OB']},{t:'Check there is no mixing of the Biomedical & general waste',r:'OB',aoc:'F',me:'ME F5.1',method:['OB']},{t:'Ayushman Arogya Mandir has designated area for storage for BMW',r:'OB',aoc:'F',me:'ME F5.1',method:['SI','OB']},{t:'Disinfection of  broken / discarded Glassware   is done as per recommended procedure',r:'OB',aoc:'F',me:'ME F5.2',method:['SI','OB']},{t:'Sharp waste is stored in puncture proof container',r:'OB',aoc:'F',me:'ME F5.2',method:['SI','OB']},{t:'Check saff is aware what to do in case of exposure to injury or any blood/body fluid',r:'CHO',aoc:'F',me:'ME F5.2',method:['SI','RR']},{t:'Facility has provision for liquid waste management',r:'OB',aoc:'F',me:'ME F5.3',method:['SI','OB']},{t:'Check facility is mercury free',r:'OB',aoc:'F',me:'ME F5.3',method:['SI','OB']},{t:'Ayushman Arogya Mandir  waste is collected & transported in close container/bag',r:'CHO',aoc:'F',me:'ME F5.4',method:['RR']},{t:'Ayushman Arogya Mandir has facility for disposal of Biomedical waste',r:'CHO',aoc:'F',me:'ME F5.4',method:['RR']},{t:'Facility manages recyclable waste as per approved procedure',r:'CHO',aoc:'F',me:'ME F5.4',method:['RR']},{t:'No burning of any category of waste within/outside Ayushman Arogya Mandir',r:'OB',aoc:'F',me:'ME F5.4',method:['OB']}]},{day:24,aoc:'G',service:'QI System',title:'Quality Improvement System & SOPs',task:'Review QI meetings, SOPs, quality indicators, and KAYAKALP/5S activities.',me:'ME G1 | ME G2',aocTags:['AoC G — Quality Management'],methods:['RR','SI'],roles:{prime:'CHO',support:['ANM']},cps:[{t:'The Ayushman Arogya Mandir  has  Quality team in place',r:'CHO',aoc:'G',me:'ME G1.1',method:['RR']},{t:'Quality  team meets monthly and review its activities',r:'CHO',aoc:'G',me:'ME G1.1',method:['RR']},{t:'Review the minutes of meeting',r:'CHO',aoc:'G',me:'ME G1.1',method:['RR']},{t:'Results of Kayakalp and NQAS Internal /External assessments are reviewed',r:'CHO',aoc:'G',me:'ME G1.1',method:['RR']},{t:'Client satisfaction survey is done',r:'CHO',aoc:'G',me:'ME G2.1',method:['RR']},{t:'Analysis of low performing attributes is done and action is planned',r:'CHO',aoc:'G',me:'ME G2.1',method:['RR']},{t:'Instructions for using RDK are available',r:'CHO',aoc:'G',me:'ME G3.1',method:['RR']},{t:'Work instruction for RMNCHA services',r:'CHO',aoc:'G',me:'ME G3.1',method:['RR']},{t:'Protocols and instructions for preventing, identifying and managing AEFI are displayed at immunization site',r:'CHO',aoc:'G',me:'ME G3.1',method:['RR']},{t:'WI for screening, management and appropriate referral of NCDs',r:'CHO',aoc:'G',me:'ME G3.1',method:['RR']},{t:'WI for screening, management and appropriate referral of Communicable disease',r:'CHO',aoc:'G',me:'ME G3.1',method:['RR']},{t:'WI for screening and referral of patients with mental disorders',r:'CHO',aoc:'G',me:'ME G3.1',method:['RR']},{t:'WI for screening of common ophthalmic  problems',r:'CHO',aoc:'G',me:'ME G3.1',method:['RR']}]},{day:25,aoc:'G',service:'Patient Safety',title:'Patient Safety, Staff Training & Competency',task:'Verify patient safety systems, training records, and skill competency assessments.',me:'ME G3 | ME G4',aocTags:['AoC G — Quality Management'],methods:['OB','RR','SI'],roles:{prime:'CHO',support:['ANM','ASHA']},cps:[{t:'WI for screening of  ENT problems',r:'CHO',aoc:'G',me:'ME G3.1',method:['RR']},{t:'WI for screening of common oral  problems',r:'CHO',aoc:'G',me:'ME G3.1',method:['RR']},{t:'WI for screening of common elderly & palliative care',r:'CHO',aoc:'G',me:'ME G3.1',method:['RR']},{t:'WI for management of emergency medical services',r:'CHO',aoc:'G',me:'ME G3.1',method:['RR']},{t:'Service delivery and performance of Ayushman Arogya Mandir is reviewed  regularly',r:'CHO',aoc:'G',me:'ME G4.1',method:['SI','RR']},{t:'Ayushman Arogya Mandir performance is reviewed regularly by block/district/state nodal officer',r:'CHO',aoc:'G',me:'ME G4.1',method:['RR']},{t:'Check gaps have been identified and actions are taken',r:'CHO',aoc:'G',me:'ME G4.1',method:['RR']},{t:'Periodic assessment using NQAS checklist',r:'CHO',aoc:'G',me:'ME G4.2',method:['RR']},{t:'Periodic assessment using Kayakalp checklist',r:'CHO',aoc:'G',me:'ME G4.2',method:['RR']},{t:'Non Compliance found in the internal Assessment using NQAS, Kayakalp and other monitoring checklists are recorded',r:'CHO',aoc:'G',me:'ME G4.3',method:['RR']},{t:'Root cause analysis is done',r:'CHO',aoc:'G',me:'ME G4.3',method:['RR']},{t:'Ayushman Arogya Mandir team improve  on the identified non compliances & action are taken',r:'CHO',aoc:'G',me:'ME G4.3',method:['RR']},{t:'Quality policy are defined',r:'CHO',aoc:'G',me:'ME G5.1',method:['RR']},{t:'Quality objectives are defined for the Ayushman Arogya Mandir',r:'CHO',aoc:'G',me:'ME G5.1',method:['RR']}]},{day:26,aoc:'H',service:'Outcomes',title:'Health Outcomes & Patient Satisfaction',task:'Review health outcome indicators, patient satisfaction, and NQAS score improvement.',me:'ME H',aocTags:['AoC H — Outcome'],methods:['RR','CI'],roles:{prime:'CHO',support:['ANM','ASHA']},cps:[{t:'No. of Case specific OPD of pregnant mothers per month',r:'CHO',aoc:'H',me:'ME H1.1',method:['RR']},{t:'No. of follow up cases (repeat visit) per month pregnant mothers',r:'CHO',aoc:'H',me:'ME H1.1',method:['RR']},{t:'No. of  cases referred to higher centre per month (Case specific referral of pregnant mothers)',r:'CHO',aoc:'H',me:'ME H1.1',method:['RR']},{t:'Percentage of women receiving all four ANCs',r:'CHO',aoc:'H',me:'ME H2.1',method:['RR']},{t:'No. of high risk pregnancy identified during ANC',r:'CHO',aoc:'H',me:'ME H3.1',method:['RR']},{t:'No. of Case specific OPD of neonate &  infant per month',r:'CHO',aoc:'H',me:'ME H1.1',method:['RR']},{t:'No. of follow up cases (repeat visit) per month neonate & infant',r:'CHO',aoc:'H',me:'ME H1.1',method:['RR']},{t:'No. of  cases referred to higher centre per month (Case specific referral of neonate & infant)',r:'CHO',aoc:'H',me:'ME H1.1',method:['RR']},{t:'Drop out rate for Pentavalent immunization',r:'CHO',aoc:'H',me:'ME H2.1',method:['RR']},{t:'No. of AEFI cases reported',r:'CHO',aoc:'H',me:'ME H3.1',method:['RR']},{t:'No. of Children with diarrhoea treated with ORS & Zn',r:'CHO',aoc:'H',me:'ME H3.1',method:['RR']},{t:'No. of Case specific OPD of children & adolescent per month',r:'CHO',aoc:'H',me:'ME H1.1',method:['RR']},{t:'No. of follow up cases (repeat visit) per month children & adolescent',r:'CHO',aoc:'H',me:'ME H1.1',method:['RR']},{t:'No. of  cases referred to higher centre per month (Case specific referral of children & adolescent)',r:'CHO',aoc:'H',me:'ME H1.1',method:['RR']},{t:'No. of Anaemia cases treated successfully',r:'CHO',aoc:'H',me:'ME H3.1',method:['RR']},{t:'No. of Case specific OPD of Family Planning per month',r:'CHO',aoc:'H',me:'ME H1.1',method:['RR']},{t:'No. of follow up cases (repeat visit) per month of FP',r:'CHO',aoc:'H',me:'ME H1.1',method:['RR']},{t:'No. of  cases referred to higher centre per month (Case specific referral of Femily Planning)',r:'CHO',aoc:'H',me:'ME H1.1',method:['RR']},{t:'Contraceptives acceptance rate',r:'CHO',aoc:'H',me:'ME H3.1',method:['RR']},{t:'No. of Case specific OPD of CD per month',r:'CHO',aoc:'H',me:'ME H1.1',method:['RR']},{t:'No. of follow up cases (repeat visit) per month of CD',r:'CHO',aoc:'H',me:'ME H1.1',method:['RR']},{t:'No. of  cases referred to higher centre per month (Case specific referral of Communicable Diseases)',r:'CHO',aoc:'H',me:'ME H1.1',method:['RR']},{t:'Treatment completion rate for Tuberculosis',r:'CHO',aoc:'H',me:'ME H3.1',method:['RR']},{t:'No. of Case specific OPD per month NCD (Hypertension, Diabetes & cancer)',r:'CHO',aoc:'H',me:'ME H1.1',method:['RR']},{t:'No. of  cases referred to higher centre per month NCD (Hypertension, Diabetes & cancer)',r:'CHO',aoc:'H',me:'ME H1.1',method:['RR']},{t:'No. of case specific follow up per month NCD (Hypertension, Diabetes & cancer)',r:'CHO',aoc:'H',me:'ME H1.1',method:['RR']},{t:'No. of  drop out rate cases following identification NCD (Hypertension, Diabetes & cancer)',r:'CHO',aoc:'H',me:'ME H1.1',method:['RR']},{t:'Drop out rate for NCDs',r:'CHO',aoc:'H',me:'ME H2.1',method:['RR']},{t:'Percentage of cases on treatment achieved blood pressure control',r:'CHO',aoc:'H',me:'ME H3.1',method:['RR']},{t:'Percentage of cases on treatment achieved blood sugar control',r:'CHO',aoc:'H',me:'ME H3.1',method:['RR']},{t:'Percentage of cases screened positive for cancer underwent biopsy',r:'CHO',aoc:'H',me:'ME H3.1',method:['RR']},{t:'Percentage of cancer cases underwent treatment for each cancer',r:'CHO',aoc:'H',me:'ME H3.1',method:['RR']},{t:'Percentage of  chronic cases who started treatment at PHC/above are still under treatment for last 3 months',r:'CHO',aoc:'H',me:'ME H4.1',method:['RR']},{t:'No. of Case specific OPD per month (Eye & ENT)',r:'CHO',aoc:'H',me:'ME H1.1',method:['RR']},{t:'No. of  cases referred to higher centre per month (Eye & ENT)',r:'CHO',aoc:'H',me:'ME H1.1',method:['RR']},{t:'No. of case specific follow up per month (Eye & ENT)',r:'CHO',aoc:'H',me:'ME H1.1',method:['RR']},{t:'No. of  drop out rate cases following identification (Eye & ENT)',r:'CHO',aoc:'H',me:'ME H1.1',method:['RR']},{t:'No. of Case specific OPD per month (Oral Health)',r:'CHO',aoc:'H',me:'ME H1.1',method:['RR']},{t:'No. of  cases referred to higher centre per month (Oral Health)',r:'CHO',aoc:'H',me:'ME H1.1',method:['RR']},{t:'No. of case specific follow up per month (Oral Health)',r:'CHO',aoc:'H',me:'ME H1.1',method:['RR']},{t:'No. of  drop out rate cases following identification (Oral Health)',r:'CHO',aoc:'H',me:'ME H1.1',method:['RR']},{t:'No. of Case specific OPD per month (Elderly & Palliative Care)',r:'CHO',aoc:'H',me:'ME H1.1',method:['RR']},{t:'No. of  cases referred to higher centre per month (Elderly & Palliative Care)',r:'CHO',aoc:'H',me:'ME H1.1',method:['RR']},{t:'No. of case specific follow up per month (Elderly & Palliative Care)',r:'CHO',aoc:'H',me:'ME H1.1',method:['RR']},{t:'No. of  drop out rate cases following identification (Elderly & Palliative Care)',r:'CHO',aoc:'H',me:'ME H1.1',method:['RR']},{t:'No. of Case specific OPD per month (Medical Emergency)',r:'CHO',aoc:'H',me:'ME H1.1',method:['RR']},{t:'No. of  cases referred to higher centre per month (Medical Emergency)',r:'CHO',aoc:'H',me:'ME H1.1',method:['RR']},{t:'No. of case specific follow up per month (Medical Emergency)',r:'CHO',aoc:'H',me:'ME H1.1',method:['RR']},{t:'No. of  drop out rate cases following identification (Medical Emergency)',r:'CHO',aoc:'H',me:'ME H1.1',method:['RR']},{t:'No. of Case specific OPD per month (Mental Health)',r:'CHO',aoc:'H',me:'ME H1.1',method:['RR']},{t:'No. of  cases referred to higher centre per month (Mental Health)',r:'CHO',aoc:'H',me:'ME H1.1',method:['RR']},{t:'No. of case specific follow up per month (Mental Health)',r:'CHO',aoc:'H',me:'ME H1.1',method:['RR']},{t:'No. of  drop out rate cases following identification (Mental Health)',r:'CHO',aoc:'H',me:'ME H1.1',method:['RR']},{t:'No. of stock out days of essential medicines',r:'CHO',aoc:'H',me:'ME H2.1',method:['RR']},{t:'No. of stock out days of essential diagnostic test',r:'CHO',aoc:'H',me:'ME H2.1',method:['RR']},{t:'No. of Yoga session conducted in month',r:'CHO',aoc:'H',me:'ME H2.1',method:['RR']},{t:'No of VHNDs conducted (for vulnerable population)',r:'CHO',aoc:'H',me:'ME H2.1',method:['RR']},{t:'Client Satisfaction Score (Patients)',r:'CHO',aoc:'H',me:'ME H4.1',method:['RR']},{t:'Client Satisfaction Score (Community)',r:'CHO',aoc:'H',me:'ME H4.1',method:['RR']}]},{day:27,aoc:'Boss',service:'Boss Battle',title:'⚔️ BOSS BATTLE II — Pre-Revision Mock Assessment',task:'⚔️ Full self-audit of all Areas of Concern. Score each area honestly and prepare gap closure plan.',me:'All MEs',aocTags:['All Areas of Concern'],methods:['SI','RR','OB','CI'],roles:{prime:'CHO',support:['ANM','ASHA']},isBoss:true,cps:[{t:'AoC A (Service Provision) — self-audit complete',r:'CHO',aoc:'Boss',me:'',method:['SI']},{t:'AoC B (Patient Rights) — self-audit complete',r:'CHO',aoc:'Boss',me:'',method:['CI']},{t:'AoC C (Inputs) — self-audit complete',r:'CHO',aoc:'Boss',me:'',method:['OB']},{t:'AoC D (Support Services) — self-audit complete',r:'CHO',aoc:'Boss',me:'',method:['OB']},{t:'AoC E (Clinical Services) — self-audit complete',r:'CHO',aoc:'Boss',me:'',method:['SI']},{t:'AoC F (Infection Control) — self-audit complete',r:'CHO',aoc:'Boss',me:'',method:['OB']},{t:'AoC G (Quality Management) — self-audit complete',r:'CHO',aoc:'Boss',me:'',method:['RR']},{t:'AoC H (Outcome) — reviewed and documented',r:'CHO',aoc:'Boss',me:'',method:['RR']},{t:'Top gaps identified — corrective action plan prepared',r:'CHO',aoc:'Boss',me:'',method:['RR']},{t:'Block/PHC supervisor informed of readiness status',r:'CHO',aoc:'Boss',me:'',method:['SI']}]},{day:28,aoc:'AE',service:'Pregnancy & Child Birth',title:'[Deep Dive] Pregnancy & Child Birth — Gap Closure & Evidence',task:'Deep-dive revision of Pregnancy & Child Birth — close all identified gaps, strengthen evidence folder.',me:'ME A | ME E',aocTags:['AoC A+E — Deep Dive Revision'],methods:['SI','RR','CI'],roles:{prime:'CHO',support:['ANM','ASHA']},cps:[{t:'Availability of functional ANC services  with minimum 4 ANC check-ups',r:'CHO',aoc:'A',me:'ME A1.1',method:['SI','RR']},{t:'First aid, referral  & follow up services for high risk pregnancies are provided',r:'CHO',aoc:'A',me:'ME A1.1',method:['SI','RR']},{t:'Facility provides and updates “Mother and Child Protection Card”',r:'CHO',aoc:'E',me:'ME E16.1',method:['RR','CI']},{t:'Facility ensures early registration & line listing of high risk ANC  cases',r:'CHO',aoc:'E',me:'ME E16.1',method:['SI','RR']},{t:'Clinical information & records of ANC is kept with Ayushman Arogya Mandir',r:'ANM',aoc:'E',me:'ME E16.1',method:['SI','RR']},{t:'Staff has knowledge of calculating expected pregnancies in the area',r:'CHO',aoc:'E',me:'ME E16.1',method:['SI','RR']},{t:'Tracking of Missed and left out ANC',r:'CHO',aoc:'E',me:'ME E16.1',method:['SI','RR']},{t:'All pregnant women get ANC check-up as per recommended schedule',r:'CHO',aoc:'E',me:'ME E16.1',method:['SI','RR']},{t:'At ANC clinic, Pregnancy is confirmed by performing urine test',r:'CHO',aoc:'E',me:'ME E16.2',method:['RR']},{t:'Last menstrual period (LMP) is recorded and Expected date of Delivery (EDD) is calculated on first visit.',r:'CHO',aoc:'E',me:'ME E16.2',method:['SI','RR']},{t:'Comprehensive Obstetric history is recorded',r:'CHO',aoc:'E',me:'ME E16.2',method:['SI','RR']},{t:'Physical Examination & vitals  of Pregnant Women is done on every ANC visit',r:'CHO',aoc:'E',me:'ME E16.2',method:['RR']},{t:'Abdominal Examination is done as per protocol',r:'CHO',aoc:'E',me:'ME E16.2',method:['SI','RR']},{t:'Diagnostic  test for every pregnant women',r:'CHO',aoc:'E',me:'ME E16.3',method:['SI','RR']},{t:'Tetanus Toxoid (2 Dosages/ Booster) have been during ANC visits',r:'CHO',aoc:'E',me:'ME E16.3',method:['SI','RR']},{t:'Staff can recognize the cases, which would need referral to higher centre(FRU)',r:'CHO',aoc:'E',me:'ME E16.4',method:['SI','RR']},{t:'Staff is competent to identify Hypertension / Pregnancy Induced Hypertension',r:'CHO',aoc:'E',me:'ME E16.4',method:['SI','RR']},{t:'Staff is competent to identify Pre-Eclampsia',r:'CHO',aoc:'E',me:'ME E16.4',method:['SI','RR']},{t:'Staff is competent to classify anaemia according to Haemoglobin Level',r:'CHO',aoc:'E',me:'ME E16.4',method:['SI','RR']},{t:'Staff is aware of prophylactic & Therapeutic dose of IFA &  progress is monitored',r:'CHO',aoc:'E',me:'ME E16.4',method:['SI','RR']},{t:'Pregnant women is counselled for planning and preparation for birth',r:'CHO',aoc:'E',me:'ME E16.5',method:['SI','CI']},{t:'Pregnant women is counselled recognize danger signs during pregnancy',r:'CHO',aoc:'E',me:'ME E16.5',method:['SI','CI']},{t:'Pregnant women is counselled diet, rest, breast feeding & family planning.',r:'CHO',aoc:'E',me:'ME E16.5',method:['SI','CI']}]},{day:29,aoc:'AE',service:'Neonatal & Infant Care',title:'[Deep Dive] Neonatal & Infant Care — Gap Closure & Evidence',task:'Deep-dive revision of Neonatal & Infant Care — close all identified gaps, strengthen evidence folder.',me:'ME A | ME E',aocTags:['AoC A+E — Deep Dive Revision'],methods:['SI','RR','CI','OB'],roles:{prime:'CHO',support:['ANM','ASHA']},cps:[{t:'Identification, primary management & prompt referral  of sick new born & infant',r:'CHO',aoc:'A',me:'ME A1.2',method:['SI','RR']},{t:'Availability of Immunization Services',r:'ANM',aoc:'A',me:'ME A1.2',method:['SI','RR']},{t:'CHO & CHW  are aware of danger signs of new born & infant',r:'CHO',aoc:'E',me:'ME E13.1',method:['SI','RR']},{t:'Primary management & prompt referral of sick new born & infants',r:'CHO',aoc:'E',me:'ME E13.1',method:['SI','RR']},{t:'Staff is aware of post natal care Counselling',r:'CHO',aoc:'E',me:'ME E13.1',method:['SI','CI']},{t:'Check for vaccines & diluents are kept as per the recommendation of guidelines',r:'OB',aoc:'E',me:'ME E13.2',method:['SI','OB']},{t:'Reconstituted vaccines are not used after recommended time',r:'ANM',aoc:'E',me:'ME E13.2',method:['SI','OB']},{t:'Staff checks VVM level before using vaccines  and identify discard point',r:'ANM',aoc:'E',me:'ME E13.2',method:['SI']},{t:'Parents are counselled for informing any untoward event of concern following vaccination',r:'CI',aoc:'E',me:'ME E13.2',method:['CI','OB']},{t:'Vaccinator is aware about how to manage any immediate serious reaction/anaphylaxis',r:'ANM',aoc:'E',me:'ME E13.2',method:['SI']},{t:'Check the availability of anaphylaxis kit with ANM at session site',r:'ANM',aoc:'E',me:'ME E13.2',method:['OB']},{t:'Check adrenaline is not expired in kit',r:'ANM',aoc:'E',me:'ME E13.2',method:['OB']},{t:'Staff is aware of the shelf life of Vit A once it is opened and ensures it is not given after shelf life',r:'ANM',aoc:'E',me:'ME E13.2',method:['SI','OB']},{t:'ANM/CHW is aware segregation policy after completion of immunization session',r:'ANM',aoc:'E',me:'ME E13.2',method:['SI','OB']},{t:'Staff is aware of  Open vial policy',r:'ANM',aoc:'E',me:'ME E13.2',method:['SI','OB']},{t:'Staff is aware of how to calculate the number of beneficiaries, quantity of vaccines & syringes',r:'ANM',aoc:'E',me:'ME E13.2',method:['SI','RR']},{t:'Ayushman Arogya Mandir -SC maintain tracking bag/ tickler box',r:'ANM',aoc:'E',me:'ME E13.2',method:['SI','RR']},{t:'Check Vaccinator is aware of different categories of AEFI',r:'ANM',aoc:'E',me:'ME E13.2',method:['SI','RR']},{t:'Check person responsible for notifying & reporting of the AEFI is identified',r:'ANM',aoc:'E',me:'ME E13.2',method:['SI','RR']},{t:'Process of reporting and route is communicated to all concerned',r:'ANM',aoc:'E',me:'ME E13.2',method:['SI','RR']},{t:'Reporting  of AEFI cases is ensured by ANM',r:'ANM',aoc:'E',me:'ME E13.2',method:['RR']},{t:'Vaccinator is aware about how to prevent immunization error related reactions',r:'ANM',aoc:'E',me:'ME E13.2',method:['SI']}]},{day:30,aoc:'AE',service:'Childhood & Adolescent Health',title:'[Deep Dive] Childhood & Adolescent Health — Gap Closure & Evidence',task:'Deep-dive revision of Childhood & Adolescent Health — close all identified gaps, strengthen evidence folder.',me:'ME A | ME E',aocTags:['AoC A+E — Deep Dive Revision'],methods:['SI','RR','CI'],roles:{prime:'CHO',support:['ANM','ASHA']},cps:[{t:'Identification, primary management, referral & follow up services for Childhood ailments',r:'CHO',aoc:'A',me:'ME A1.3',method:['SI','RR']},{t:'Education, Counselling and referral  services for Adolescent health',r:'CHO',aoc:'A',me:'ME A1.3',method:['SI','CI']},{t:'Assessment for identification of ARI, diarrhoea, malnutrition and Other Illness',r:'CHO',aoc:'E',me:'ME E13.3',method:['SI','RR']},{t:'Assessment for identification of possible serious bacterial infections among young infant (0-59 days) & children (2 -59 months)',r:'CHO',aoc:'E',me:'ME E13.3',method:['SI','RR']},{t:'Management of diarrhoea  is  done as per protocols',r:'CHO',aoc:'E',me:'ME E13.3',method:['SI','RR']},{t:'Management of ARI  is  done as per protocols',r:'CHO',aoc:'E',me:'ME E13.3',method:['SI','RR']},{t:'Management of Possible serious bacterial infection as per protocols',r:'CHO',aoc:'E',me:'ME E13.3',method:['SI','RR']},{t:'Management of Malnutrition  is  done as per protocols',r:'CHO',aoc:'E',me:'ME E13.3',method:['SI','CI']},{t:'Screening, referral and follow up of children for anomalies, disabilities and developmental delays',r:'CHO',aoc:'E',me:'ME E13.3',method:['SI','RR']},{t:'Provision of education & counselling services for  adolescent',r:'CHO',aoc:'E',me:'ME E15.1',method:['SI','CI']},{t:'Services for treatment & referral  of common  RTI/STI\'s, Nutritional Anaemia & Menstrual disorders',r:'CHO',aoc:'E',me:'ME E15.1',method:['RR','CI']}]},{day:31,aoc:'AE',service:'Family Planning',title:'[Deep Dive] Family Planning — Gap Closure & Evidence',task:'Deep-dive revision of Family Planning — close all identified gaps, strengthen evidence folder.',me:'ME A | ME E',aocTags:['AoC A+E — Deep Dive Revision'],methods:['SI','RR','CI'],roles:{prime:'CHO',support:['ANM','ASHA']},cps:[{t:'Availability of family planning services',r:'CHO',aoc:'A',me:'ME A1.4',method:['SI','RR']},{t:'Education, Counselling and referral services for family planning services',r:'CI',aoc:'A',me:'ME A1.4',method:['SI','CI']},{t:'The client is given full information about family planning methods',r:'CHO',aoc:'E',me:'ME E14.1',method:['SI','RR']},{t:'Staff is aware of Method specific counselling approaches',r:'CHO',aoc:'E',me:'ME E14.1',method:['SI','CI']},{t:'Staff is aware of case selection criteria for family planning spacing  methods',r:'CHO',aoc:'E',me:'ME E14.2',method:['SI','RR']},{t:'Staff is aware of  options, indications & methods for administration for Oral Contraceptives',r:'CHO',aoc:'E',me:'ME E14.2',method:['SI','RR']},{t:'IUD insertion & follow up is done as per standard protocol',r:'CHO',aoc:'E',me:'ME E14.2',method:['SI','RR']},{t:'Injectable Contraceptives are given as per protocols',r:'CHO',aoc:'E',me:'ME E14.2',method:['SI','RR']},{t:'Staff is aware of case selection criteria for limiting mentors',r:'CHO',aoc:'E',me:'ME E14.3',method:['SI','RR']},{t:'AAM is supporting & encouraging the clients for post sterilization follow up',r:'CHO',aoc:'E',me:'ME E14.3',method:['SI','RR']}]},{day:32,aoc:'AE',service:'Management of Communicable Diseases',title:'[Deep Dive] Management of Communicable Diseases — Gap Closure & Evidence',task:'Deep-dive revision of Management of Communicable Diseases — close all identified gaps, strengthen evidence folder.',me:'ME A | ME E',aocTags:['AoC A+E — Deep Dive Revision'],methods:['SI','RR','CI','OB'],roles:{prime:'CHO',support:['ANM','ASHA']},cps:[{t:'Preventive & promotive services under NVBDCP',r:'CHO',aoc:'A',me:'ME A1.5',method:['SI','RR']},{t:'Case detection, treatment, referral & follow up of cases under NVBDCP',r:'CHO',aoc:'A',me:'ME A1.5',method:['SI','RR']},{t:'Preventive & promotive measures  under NTEP',r:'CI',aoc:'A',me:'ME A1.5',method:['SI','CI']},{t:'Case detection, treatment, referral & follow up of cases under NTEP',r:'CHO',aoc:'A',me:'ME A1.5',method:['SI','RR']},{t:'Preventive & promotive measures under NLEP',r:'CHO',aoc:'A',me:'ME A1.5',method:['SI','CI']},{t:'Case detection, treatment, referral & follow up of cases under NLEP',r:'CHO',aoc:'A',me:'ME A1.5',method:['SI','RR']},{t:'Preventive & promotive services under NACP',r:'CHO',aoc:'A',me:'ME A1.5',method:['SI','CI']},{t:'Referral & follow up of cases under NACP',r:'CHO',aoc:'A',me:'ME A1.5',method:['SI','RR']},{t:'Preventive & promotive measures  under NVHCP',r:'CHO',aoc:'A',me:'ME A1.5',method:['SI','CI']},{t:'Case detection, treatment, referral & follow up of cases under NVHCP',r:'CHO',aoc:'A',me:'ME A1.5',method:['SI','RR']},{t:'Availability of functional services under IDSP/ IHIP',r:'CHO',aoc:'A',me:'ME A1.5',method:['SI','RR']},{t:'Identification, management and  referral of acute illness & minor aliments',r:'CHO',aoc:'A',me:'ME A1.6',method:['SI','RR']},{t:'Preventive & promotive measures  for acute illness',r:'CHO',aoc:'A',me:'ME A1.6',method:['SI','CI']},{t:'Primary care team  is aware of  vector born disease control strategies',r:'CHO',aoc:'E',me:'ME E10.1',method:['SI','RR']},{t:'Case detection is done for Malaria',r:'CHO',aoc:'E',me:'ME E10.1',method:['SI','RR']},{t:'Staff is aware of Malaria treatment protocols',r:'CHO',aoc:'E',me:'ME E10.1',method:['SI','RR']},{t:'Staff is aware of Malaria referral protocols',r:'CHO',aoc:'E',me:'ME E10.1',method:['SI','RR']},{t:'Staff is aware of diagnostic & management of dengue as per protocols',r:'CHO',aoc:'E',me:'ME E10.1',method:['SI','RR']},{t:'NVBDCP register & records are maintained',r:'ASHA',aoc:'E',me:'ME E10.1',method:['SI','RR']},{t:'Facilities have adequate stock of commodities & drugs',r:'CHO',aoc:'E',me:'ME E10.1',method:['SI','RR']},{t:'Staff is aware of sign & symptoms of prevalent vector born diseases in area',r:'CHO',aoc:'E',me:'ME E10.1',method:['SI']},{t:'Identification of presumptive case  & their referral',r:'CHO',aoc:'E',me:'ME E10.2',method:['RR']},{t:'Ayushman Arogya Mandir support, supervision & manage presumptive, confirmed & on treatment cases including DR- TB patients',r:'CHO',aoc:'E',me:'ME E10.2',method:['RR','OB']},{t:'Staff is aware of follow up protocol after treatment completion',r:'CHO',aoc:'E',me:'ME E10.2',method:['SI','RR']},{t:'NTEP register & records are maintained',r:'CHO',aoc:'E',me:'ME E10.2',method:['RR']},{t:'Primary healthcare team  identify and ensure referral of suspected cases of Leprosy',r:'CHO',aoc:'E',me:'ME E10.3',method:['SI','RR']},{t:'NLEP register & records are maintained',r:'CHO',aoc:'E',me:'ME E10.3',method:['RR']},{t:'Facility provide awareness about leprosy & availability of its treatment',r:'CHO',aoc:'E',me:'ME E10.3',method:['SI','CI']},{t:'Ayushman Arogya Mandir-HSC is aware of their roles in NACP',r:'CHO',aoc:'E',me:'ME E10.4',method:['SI','RR']},{t:'Ayushman Arogya Mandir -SC has linkage for management of HIV/AIDS complications',r:'CHO',aoc:'E',me:'ME E10.4',method:['RR']},{t:'Staff is aware of promotional & supportive  activities done under NACP',r:'CHO',aoc:'E',me:'ME E10.4',method:['SI','RR']},{t:'Staff is aware of syndrome under surveillance in IDSP/IHIP',r:'CHO',aoc:'E',me:'ME E10.5',method:['SI','RR']},{t:'Check process to collect information in form S/ IHIP',r:'CHO',aoc:'E',me:'ME E10.5',method:['RR']},{t:'Check  Analysis & reporting of information for syndromic surveillance is done',r:'CHO',aoc:'E',me:'ME E10.5',method:['SI','RR']},{t:'Availability of diagnostic & treatment services',r:'CHO',aoc:'E',me:'ME E10.6',method:['RR']},{t:'Staff is aware of preventive measures for NVHCP',r:'CHO',aoc:'E',me:'ME E10.6',method:['SI','OB']}]},{day:33,aoc:'AE',service:'Management of Non-Communicable Diseases',title:'[Deep Dive] Management of Non-Communicable Diseases — Gap Closure & Evidence',task:'Deep-dive revision of Management of Non-Communicable Diseases — close all identified gaps, strengthen evidence folder.',me:'ME A | ME E',aocTags:['AoC A+E — Deep Dive Revision'],methods:['SI','RR','CI'],roles:{prime:'CHO',support:['ANM','ASHA']},cps:[{t:'Availability of services for Hypertension',r:'CHO',aoc:'A',me:'ME A1.7',method:['SI','RR']},{t:'Availability of services for Diabetes',r:'CHO',aoc:'A',me:'ME A1.7',method:['SI','RR']},{t:'Availability of services for Nonalcoholic fatty liver disease (NAFLD)',r:'CHO',aoc:'A',me:'ME A1.7',method:['SI','RR']},{t:'Availability of Services for  Cancers',r:'CHO',aoc:'A',me:'ME A1.7',method:['SI','RR']},{t:'Availability of services for respiratory diseases',r:'CHO',aoc:'A',me:'ME A1.7',method:['SI','RR']},{t:'Availability of services for Epilepsy',r:'CHO',aoc:'A',me:'ME A1.7',method:['SI','RR']},{t:'Availability of  services for  locally prevalent health diseases & substance abuse',r:'CHO',aoc:'A',me:'ME A1.7',method:['RR']},{t:'Preventive & promotive services under NCD',r:'CHO',aoc:'A',me:'ME A1.7',method:['SI','CI']},{t:'Ayushman Arogya Mandir undertakes  health promotion and disease prevention activities through Community level resources',r:'CI',aoc:'A',me:'ME A1.14',method:['RR','CI']},{t:'Provision of wellness services through Yoga and other activities',r:'CHO',aoc:'A',me:'ME A1.14',method:['SI','CI']},{t:'Provision of AYUSH services',r:'CHO',aoc:'A',me:'ME A1.14',method:['SI','RR']},{t:'Provision of counselling services for Eat Right',r:'CHO',aoc:'A',me:'ME A1.14',method:['SI','CI']},{t:'Staff is aware of process of population identification and referral for hypertension',r:'CHO',aoc:'E',me:'ME E11.1',method:['SI','RR']},{t:'CHO is  aware of sign & symptoms  of Hypertension',r:'CHO',aoc:'E',me:'ME E11.1',method:['SI']},{t:'Ayushman Arogya Mandir ensures frequency of follow up & supply of required medicines',r:'CHO',aoc:'E',me:'ME E11.1',method:['RR','CI']},{t:'Staff is aware of promotional & supportive  activities for Hypertension',r:'CHO',aoc:'E',me:'ME E11.1',method:['SI','CI']},{t:'Staff is aware of process of population identification and referral for diabetes',r:'CHO',aoc:'E',me:'ME E11.2',method:['SI','RR']},{t:'CHO is  aware of sign & symptoms  of diabetes',r:'CHO',aoc:'E',me:'ME E11.2',method:['SI']},{t:'Ayushman Arogya Mandir ensures frequency of follow up & supply of required medicines',r:'CHO',aoc:'E',me:'ME E11.2',method:['RR','CI']},{t:'Check Patient is counselled about identification & immediate management hypoglycaemia',r:'CHO',aoc:'E',me:'ME E11.2',method:['SI','CI']},{t:'Ayushman Arogya Mandir is aware of  risk factors of  Nonalcoholic fatty liver disease (NAFLD)',r:'CHO',aoc:'E',me:'ME E11.2',method:['SI','RR']},{t:'Staff is aware of promotional & supportive  activities for diabetes',r:'CHO',aoc:'E',me:'ME E11.2',method:['SI','CI']},{t:'Check cancer screening services are provided through Ayushman Arogya Mandir',r:'CHO',aoc:'E',me:'ME E11.3',method:['SI','RR']},{t:'Staff is aware about sign & symptom of cervical cancer',r:'CHO',aoc:'E',me:'ME E11.3',method:['SI']},{t:'Staff is aware about sign & symptom of Breast cancer',r:'CHO',aoc:'E',me:'ME E11.3',method:['SI']},{t:'Staff is aware about sign & symptom of Oral Cancer',r:'CHO',aoc:'E',me:'ME E11.3',method:['SI']},{t:'Check with  staff about methodology followed for  cancer screening',r:'CHO',aoc:'E',me:'ME E11.3',method:['SI','RR']},{t:'Check CHW is aware of referral centre for all types of cancer',r:'CHO',aoc:'E',me:'ME E11.3',method:['SI','RR']},{t:'Staff is aware of promotional & supportive  activities for cancers',r:'CHO',aoc:'E',me:'ME E11.3',method:['SI','CI']},{t:'Confirmation and referral of cases for Tobacco/alcohol/ substance abuse',r:'CHO',aoc:'E',me:'ME E11.4',method:['SI','RR']},{t:'Promotional & supportive  activities for Tobacco/alcohol/ substance abuse',r:'CHO',aoc:'E',me:'ME E11.4',method:['SI','RR','CI']},{t:'Check Screening & referral  locally prevalent diseases',r:'CHO',aoc:'E',me:'ME E11.4',method:['SI','CI']},{t:'Check Ayushman Arogya Mandir is providing Yoga services',r:'ASHA',aoc:'E',me:'ME E11.5',method:['SI','RR']},{t:'Check Yoga sessions are conducted regularly',r:'CHO',aoc:'E',me:'ME E11.5',method:['RR','CI']},{t:'Check counselling of mother\'s for nutrition & hygiene maintenance under Eat right',r:'CHO',aoc:'E',me:'ME E11.5',method:['SI','CI']},{t:'Check staff counsel and guide the mother\'s about household preparation of complementary feeds',r:'CHO',aoc:'E',me:'ME E11.5',method:['SI','CI']},{t:'Check Primary  health care team generate awareness  in community about balanced diet',r:'CHO',aoc:'E',me:'ME E11.5',method:['SI','CI']},{t:'Check Primary  health care team generate awareness  in community about food fortification',r:'CHO',aoc:'E',me:'ME E11.5',method:['SI','CI']},{t:'Check Primary  health care team generate awareness  in community about Eat safe practices',r:'CHO',aoc:'E',me:'ME E11.5',method:['SI','CI']},{t:'Check Primary  health care team generate awareness  in community about food safety',r:'CHO',aoc:'E',me:'ME E11.5',method:['SI','CI']}]},{day:34,aoc:'AE',service:'Drugs & Diagnostics',title:'[Deep Dive] Drugs & Diagnostics — Gap Closure & Evidence',task:'Deep-dive revision of Drugs & Diagnostics — close all identified gaps, strengthen evidence folder.',me:'ME A | ME E',aocTags:['AoC A+E — Deep Dive Revision'],methods:['RR','CI','SI'],roles:{prime:'CHO',support:['ANM','ASHA']},cps:[{t:'Availability of basic diagnostic services including NHP',r:'ANM',aoc:'A',me:'ME A2.1',method:['RR','CI']},{t:'Linkages with the Central diagnostic units (Hub & spoke)',r:'ANM',aoc:'A',me:'ME A2.1',method:['SI','RR']},{t:'Availability of drugs as per EDL',r:'CHO',aoc:'A',me:'ME A2.2',method:['SI','RR']},{t:'Availability of drugs for refill for chronic cases',r:'CHO',aoc:'A',me:'ME A2.2',method:['SI','RR']}]},{day:35,aoc:'AE',service:'Emergency',title:'[Deep Dive] Emergency — Gap Closure & Evidence',task:'Deep-dive revision of Emergency — close all identified gaps, strengthen evidence folder.',me:'ME A | ME E',aocTags:['AoC A+E — Deep Dive Revision'],methods:['SI','RR','CI','OB'],roles:{prime:'CHO',support:['ANM','ASHA']},cps:[{t:'Availability of services for Medical Emergencies including trauma & burns',r:'CHO',aoc:'A',me:'ME A1.12',method:['SI','RR']},{t:'Emergency protocols for first aid and stabilization are available',r:'CHO',aoc:'E',me:'ME E 7.1',method:['SI','RR']},{t:'Staff is aware of  procedure for CPR',r:'CHO',aoc:'E',me:'ME E 7.1',method:['SI','RR']},{t:'Ayushman Arogya Mandir ensures timely availability of ambulances services for emergency cases',r:'CHO',aoc:'E',me:'ME E 7.1',method:['RR','CI']},{t:'Emergency care is given in case of disaster',r:'CHO',aoc:'E',me:'ME E 7.2',method:['SI','OB']},{t:'Staff is aware of  process of sorting the patients in case of mass causalty/ outbreak',r:'CHO',aoc:'E',me:'ME E 7.2',method:['SI','RR']}]},{day:36,aoc:'AE',service:'Care of Common Ophthalmic and ENT',title:'[Deep Dive] Care of Common Ophthalmic and ENT — Gap Closure & Evidence',task:'Deep-dive revision of Care of Common Ophthalmic and ENT — close all identified gaps, strengthen evidence folder.',me:'ME A | ME E',aocTags:['AoC A+E — Deep Dive Revision'],methods:['SI','RR','CI','OB'],roles:{prime:'CHO',support:['ANM','ASHA']},cps:[{t:'Availability of  Ophthalmic  Services',r:'CHO',aoc:'A',me:'ME A1.8',method:['SI','RR']},{t:'Preventive & promotive services under for Ophthalmic',r:'CHO',aoc:'A',me:'ME A1.8',method:['SI','CI']},{t:'Availability of  ENT Services',r:'CHO',aoc:'A',me:'ME A1.9',method:['SI','RR']},{t:'Preventive & promotive services under for ENT',r:'CHO',aoc:'A',me:'ME A1.9',method:['SI','CI']},{t:'Staff screen & refer cases of common ophthalmic aliments  lead to blindness & refractive errors',r:'CHO',aoc:'E',me:'ME E8.1',method:['SI','RR']},{t:'Staff is aware of identification & primary management common ophthalmic conditions including emergencies',r:'CHO',aoc:'E',me:'ME E8.1',method:['SI','RR','OB']},{t:'Staff is aware of  methods for measuring the refractive errors',r:'CHO',aoc:'E',me:'ME E8.1',method:['SI','RR']},{t:'Staff maintain records under ophthalmic care',r:'CHO',aoc:'E',me:'ME E8.1',method:['SI','RR']},{t:'Promotion & supportive activities for ophthalmic care',r:'CHO',aoc:'E',me:'ME E8.1',method:['RR','CI']},{t:'Screening of population for ENT aliments',r:'CHO',aoc:'E',me:'ME E8.2',method:['SI','RR']},{t:'Identification & primary management of common ear problems',r:'CHO',aoc:'E',me:'ME E8.2',method:['SI','RR']},{t:'Staff is trained & using diagnostic tools for identification of ear problems',r:'CHO',aoc:'E',me:'ME E8.2',method:['RR','OB']},{t:'Identification & management of nose problem',r:'CHO',aoc:'E',me:'ME E8.2',method:['RR','OB']},{t:'Staff is trained & using diagnostic tools for identification of Nose aliments',r:'CHO',aoc:'E',me:'ME E8.2',method:['SI','OB']},{t:'Identification & primary management  of throat aliments',r:'CHO',aoc:'E',me:'ME E8.2',method:['SI','RR']},{t:'Check staff is trained & able to  perform Heimlich manoeuvre/ dislodge obstruction from windpipe',r:'CHO',aoc:'E',me:'ME E8.2',method:['SI','RR']},{t:'Staff is trained to identify ENT aliments require referral to higher centre',r:'CHO',aoc:'E',me:'ME E8.2',method:['SI','RR']},{t:'Promotion & supportive activities for ENT',r:'CHO',aoc:'E',me:'ME E8.2',method:['SI','RR','CI']}]},{day:37,aoc:'AE',service:'Oral Health Care',title:'[Deep Dive] Oral Health Care — Gap Closure & Evidence',task:'Deep-dive revision of Oral Health Care — close all identified gaps, strengthen evidence folder.',me:'ME A | ME E',aocTags:['AoC A+E — Deep Dive Revision'],methods:['SI','RR','CI'],roles:{prime:'CHO',support:['ANM','ASHA']},cps:[{t:'Availability of  early identification & referral services for oral Health conditions',r:'CHO',aoc:'A',me:'ME A1.10',method:['SI','RR']},{t:'Availability of  symptomatic management & referral services for oral Health conditions',r:'CHO',aoc:'A',me:'ME A1.10',method:['SI','RR']},{t:'Preventive & promotive services under oral health',r:'CHO',aoc:'A',me:'ME A1.10',method:['SI','CI']},{t:'Staff is aware about Oral health conditions, primary management & referral',r:'CHO',aoc:'E',me:'ME E8.3',method:['SI']},{t:'Staff is aware of symptomatic  treatment for dental emergencies',r:'CHO',aoc:'E',me:'ME E8.3',method:['SI','RR']},{t:'Screening of oral health conditions is done as per protocol',r:'CHO',aoc:'E',me:'ME E8.3',method:['SI','RR']},{t:'Promotion & supportive activities for oral health',r:'CHO',aoc:'E',me:'ME E8.3',method:['SI','CI']}]},{day:38,aoc:'AE',service:'Mental Health',title:'[Deep Dive] Mental Health — Gap Closure & Evidence',task:'Deep-dive revision of Mental Health — close all identified gaps, strengthen evidence folder.',me:'ME A | ME E',aocTags:['AoC A+E — Deep Dive Revision'],methods:['SI','RR','CI'],roles:{prime:'CHO',support:['ANM','ASHA']},cps:[{t:'Availability of services for mental health',r:'CHO',aoc:'A',me:'ME A1.13',method:['SI','RR']},{t:'Preventive & promotive services under mental health',r:'CHO',aoc:'A',me:'ME A1.13',method:['SI','CI']},{t:'Check staff is aware of MNS (Mental, neurological & substance use)  conditions',r:'CHO',aoc:'E',me:'ME E9.1',method:['SI','RR']},{t:'Check Staff  uses specific  tools for early identification & screening of MNS',r:'ASHA',aoc:'E',me:'ME E9.1',method:['SI','RR']},{t:'Staff is competent for basic management, referral & follow up of MNS',r:'CHO',aoc:'E',me:'ME E9.1',method:['SI','RR']},{t:'Check staff is trained for emergency management of  Epilepsy',r:'CHO',aoc:'E',me:'ME E9.1',method:['SI','RR']},{t:'Promotion & supportive activities for mental health',r:'CHO',aoc:'E',me:'ME E9.1',method:['SI','CI']}]},{day:39,aoc:'AE',service:'Elderly & Pallative Care',title:'[Deep Dive] Elderly & Pallative Care — Gap Closure & Evidence',task:'Deep-dive revision of Elderly & Pallative Care — close all identified gaps, strengthen evidence folder.',me:'ME A | ME E',aocTags:['AoC A+E — Deep Dive Revision'],methods:['SI','RR','OB','CI'],roles:{prime:'CHO',support:['ANM','ASHA']},cps:[{t:'Availability of services for elderly care',r:'CHO',aoc:'A',me:'ME A1.11',method:['SI','RR']},{t:'Availability of services for palliative care',r:'CHO',aoc:'A',me:'ME A1.11',method:['SI','RR']},{t:'Elderly population is mapped & screened',r:'CHO',aoc:'E',me:'ME E12.1',method:['SI','RR']},{t:'CHO is aware &  competent to use various geriatric tools',r:'CHO',aoc:'E',me:'ME E12.1',method:['RR','OB']},{t:'Ayushman Arogya Mandir ­undertake preliminary assessment for the need of assistive devices',r:'CHO',aoc:'E',me:'ME E12.1',method:['RR']},{t:'Promotional & supportive activities for Geriatric care',r:'CHO',aoc:'E',me:'ME E12.1',method:['SI','CI']},{t:'Screening, basic management & referral  of Palliative Care patient is done',r:'CHO',aoc:'E',me:'ME E12.2',method:['RR','CI']},{t:'Home based palliative care services are being provided',r:'CHO',aoc:'E',me:'ME E12.2',method:['SI','RR']},{t:'Check Home care kit is available & case sheet are  updated',r:'CHO',aoc:'E',me:'ME E12.2',method:['SI','RR']},{t:'Check patient support groups are available',r:'CHO',aoc:'E',me:'ME E12.2',method:['SI','RR']},{t:'Promotional & supportive activities for palliative care',r:'CHO',aoc:'E',me:'ME E12.2',method:['SI','CI']}]},{day:40,aoc:'AE',service:'Pregnancy & Child Birth',title:'[Revision] Pregnancy & Child Birth — Verification & Documentation',task:'Revisit Pregnancy & Child Birth — verify all corrective actions implemented and documentation complete.',me:'ME A | ME E',aocTags:['AoC A+E — Revision'],methods:['SI','RR','CI'],roles:{prime:'CHO',support:['ANM','ASHA']},cps:[{t:'Availability of functional ANC services  with minimum 4 ANC check-ups',r:'CHO',aoc:'A',me:'ME A1.1',method:['SI','RR']},{t:'First aid, referral  & follow up services for high risk pregnancies are provided',r:'CHO',aoc:'A',me:'ME A1.1',method:['SI','RR']},{t:'Facility provides and updates “Mother and Child Protection Card”',r:'CHO',aoc:'E',me:'ME E16.1',method:['RR','CI']},{t:'Facility ensures early registration & line listing of high risk ANC  cases',r:'CHO',aoc:'E',me:'ME E16.1',method:['SI','RR']},{t:'Clinical information & records of ANC is kept with Ayushman Arogya Mandir',r:'ANM',aoc:'E',me:'ME E16.1',method:['SI','RR']},{t:'Staff has knowledge of calculating expected pregnancies in the area',r:'CHO',aoc:'E',me:'ME E16.1',method:['SI','RR']},{t:'Tracking of Missed and left out ANC',r:'CHO',aoc:'E',me:'ME E16.1',method:['SI','RR']},{t:'All pregnant women get ANC check-up as per recommended schedule',r:'CHO',aoc:'E',me:'ME E16.1',method:['SI','RR']},{t:'At ANC clinic, Pregnancy is confirmed by performing urine test',r:'CHO',aoc:'E',me:'ME E16.2',method:['RR']},{t:'Last menstrual period (LMP) is recorded and Expected date of Delivery (EDD) is calculated on first visit.',r:'CHO',aoc:'E',me:'ME E16.2',method:['SI','RR']},{t:'Comprehensive Obstetric history is recorded',r:'CHO',aoc:'E',me:'ME E16.2',method:['SI','RR']},{t:'Physical Examination & vitals  of Pregnant Women is done on every ANC visit',r:'CHO',aoc:'E',me:'ME E16.2',method:['RR']},{t:'Abdominal Examination is done as per protocol',r:'CHO',aoc:'E',me:'ME E16.2',method:['SI','RR']},{t:'Diagnostic  test for every pregnant women',r:'CHO',aoc:'E',me:'ME E16.3',method:['SI','RR']},{t:'Tetanus Toxoid (2 Dosages/ Booster) have been during ANC visits',r:'CHO',aoc:'E',me:'ME E16.3',method:['SI','RR']},{t:'Staff can recognize the cases, which would need referral to higher centre(FRU)',r:'CHO',aoc:'E',me:'ME E16.4',method:['SI','RR']},{t:'Staff is competent to identify Hypertension / Pregnancy Induced Hypertension',r:'CHO',aoc:'E',me:'ME E16.4',method:['SI','RR']},{t:'Staff is competent to identify Pre-Eclampsia',r:'CHO',aoc:'E',me:'ME E16.4',method:['SI','RR']},{t:'Staff is competent to classify anaemia according to Haemoglobin Level',r:'CHO',aoc:'E',me:'ME E16.4',method:['SI','RR']},{t:'Staff is aware of prophylactic & Therapeutic dose of IFA &  progress is monitored',r:'CHO',aoc:'E',me:'ME E16.4',method:['SI','RR']},{t:'Pregnant women is counselled for planning and preparation for birth',r:'CHO',aoc:'E',me:'ME E16.5',method:['SI','CI']},{t:'Pregnant women is counselled recognize danger signs during pregnancy',r:'CHO',aoc:'E',me:'ME E16.5',method:['SI','CI']},{t:'Pregnant women is counselled diet, rest, breast feeding & family planning.',r:'CHO',aoc:'E',me:'ME E16.5',method:['SI','CI']}]},{day:41,aoc:'AE',service:'Neonatal & Infant Care',title:'[Revision] Neonatal & Infant Care — Verification & Documentation',task:'Revisit Neonatal & Infant Care — verify all corrective actions implemented and documentation complete.',me:'ME A | ME E',aocTags:['AoC A+E — Revision'],methods:['SI','RR','CI','OB'],roles:{prime:'CHO',support:['ANM','ASHA']},cps:[{t:'Identification, primary management & prompt referral  of sick new born & infant',r:'CHO',aoc:'A',me:'ME A1.2',method:['SI','RR']},{t:'Availability of Immunization Services',r:'ANM',aoc:'A',me:'ME A1.2',method:['SI','RR']},{t:'CHO & CHW  are aware of danger signs of new born & infant',r:'CHO',aoc:'E',me:'ME E13.1',method:['SI','RR']},{t:'Primary management & prompt referral of sick new born & infants',r:'CHO',aoc:'E',me:'ME E13.1',method:['SI','RR']},{t:'Staff is aware of post natal care Counselling',r:'CHO',aoc:'E',me:'ME E13.1',method:['SI','CI']},{t:'Check for vaccines & diluents are kept as per the recommendation of guidelines',r:'OB',aoc:'E',me:'ME E13.2',method:['SI','OB']},{t:'Reconstituted vaccines are not used after recommended time',r:'ANM',aoc:'E',me:'ME E13.2',method:['SI','OB']},{t:'Staff checks VVM level before using vaccines  and identify discard point',r:'ANM',aoc:'E',me:'ME E13.2',method:['SI']},{t:'Parents are counselled for informing any untoward event of concern following vaccination',r:'CI',aoc:'E',me:'ME E13.2',method:['CI','OB']},{t:'Vaccinator is aware about how to manage any immediate serious reaction/anaphylaxis',r:'ANM',aoc:'E',me:'ME E13.2',method:['SI']},{t:'Check the availability of anaphylaxis kit with ANM at session site',r:'ANM',aoc:'E',me:'ME E13.2',method:['OB']},{t:'Check adrenaline is not expired in kit',r:'ANM',aoc:'E',me:'ME E13.2',method:['OB']},{t:'Staff is aware of the shelf life of Vit A once it is opened and ensures it is not given after shelf life',r:'ANM',aoc:'E',me:'ME E13.2',method:['SI','OB']},{t:'ANM/CHW is aware segregation policy after completion of immunization session',r:'ANM',aoc:'E',me:'ME E13.2',method:['SI','OB']},{t:'Staff is aware of  Open vial policy',r:'ANM',aoc:'E',me:'ME E13.2',method:['SI','OB']},{t:'Staff is aware of how to calculate the number of beneficiaries, quantity of vaccines & syringes',r:'ANM',aoc:'E',me:'ME E13.2',method:['SI','RR']},{t:'Ayushman Arogya Mandir -SC maintain tracking bag/ tickler box',r:'ANM',aoc:'E',me:'ME E13.2',method:['SI','RR']},{t:'Check Vaccinator is aware of different categories of AEFI',r:'ANM',aoc:'E',me:'ME E13.2',method:['SI','RR']},{t:'Check person responsible for notifying & reporting of the AEFI is identified',r:'ANM',aoc:'E',me:'ME E13.2',method:['SI','RR']},{t:'Process of reporting and route is communicated to all concerned',r:'ANM',aoc:'E',me:'ME E13.2',method:['SI','RR']},{t:'Reporting  of AEFI cases is ensured by ANM',r:'ANM',aoc:'E',me:'ME E13.2',method:['RR']},{t:'Vaccinator is aware about how to prevent immunization error related reactions',r:'ANM',aoc:'E',me:'ME E13.2',method:['SI']}]},{day:42,aoc:'AE',service:'Childhood & Adolescent Health',title:'[Revision] Childhood & Adolescent Health — Verification & Documentation',task:'Revisit Childhood & Adolescent Health — verify all corrective actions implemented and documentation complete.',me:'ME A | ME E',aocTags:['AoC A+E — Revision'],methods:['SI','RR','CI'],roles:{prime:'CHO',support:['ANM','ASHA']},cps:[{t:'Identification, primary management, referral & follow up services for Childhood ailments',r:'CHO',aoc:'A',me:'ME A1.3',method:['SI','RR']},{t:'Education, Counselling and referral  services for Adolescent health',r:'CHO',aoc:'A',me:'ME A1.3',method:['SI','CI']},{t:'Assessment for identification of ARI, diarrhoea, malnutrition and Other Illness',r:'CHO',aoc:'E',me:'ME E13.3',method:['SI','RR']},{t:'Assessment for identification of possible serious bacterial infections among young infant (0-59 days) & children (2 -59 months)',r:'CHO',aoc:'E',me:'ME E13.3',method:['SI','RR']},{t:'Management of diarrhoea  is  done as per protocols',r:'CHO',aoc:'E',me:'ME E13.3',method:['SI','RR']},{t:'Management of ARI  is  done as per protocols',r:'CHO',aoc:'E',me:'ME E13.3',method:['SI','RR']},{t:'Management of Possible serious bacterial infection as per protocols',r:'CHO',aoc:'E',me:'ME E13.3',method:['SI','RR']},{t:'Management of Malnutrition  is  done as per protocols',r:'CHO',aoc:'E',me:'ME E13.3',method:['SI','CI']},{t:'Screening, referral and follow up of children for anomalies, disabilities and developmental delays',r:'CHO',aoc:'E',me:'ME E13.3',method:['SI','RR']},{t:'Provision of education & counselling services for  adolescent',r:'CHO',aoc:'E',me:'ME E15.1',method:['SI','CI']},{t:'Services for treatment & referral  of common  RTI/STI\'s, Nutritional Anaemia & Menstrual disorders',r:'CHO',aoc:'E',me:'ME E15.1',method:['RR','CI']}]},{day:43,aoc:'AE',service:'Family Planning',title:'[Revision] Family Planning — Verification & Documentation',task:'Revisit Family Planning — verify all corrective actions implemented and documentation complete.',me:'ME A | ME E',aocTags:['AoC A+E — Revision'],methods:['SI','RR','CI'],roles:{prime:'CHO',support:['ANM','ASHA']},cps:[{t:'Availability of family planning services',r:'CHO',aoc:'A',me:'ME A1.4',method:['SI','RR']},{t:'Education, Counselling and referral services for family planning services',r:'CI',aoc:'A',me:'ME A1.4',method:['SI','CI']},{t:'The client is given full information about family planning methods',r:'CHO',aoc:'E',me:'ME E14.1',method:['SI','RR']},{t:'Staff is aware of Method specific counselling approaches',r:'CHO',aoc:'E',me:'ME E14.1',method:['SI','CI']},{t:'Staff is aware of case selection criteria for family planning spacing  methods',r:'CHO',aoc:'E',me:'ME E14.2',method:['SI','RR']},{t:'Staff is aware of  options, indications & methods for administration for Oral Contraceptives',r:'CHO',aoc:'E',me:'ME E14.2',method:['SI','RR']},{t:'IUD insertion & follow up is done as per standard protocol',r:'CHO',aoc:'E',me:'ME E14.2',method:['SI','RR']},{t:'Injectable Contraceptives are given as per protocols',r:'CHO',aoc:'E',me:'ME E14.2',method:['SI','RR']},{t:'Staff is aware of case selection criteria for limiting mentors',r:'CHO',aoc:'E',me:'ME E14.3',method:['SI','RR']},{t:'AAM is supporting & encouraging the clients for post sterilization follow up',r:'CHO',aoc:'E',me:'ME E14.3',method:['SI','RR']}]},{day:44,aoc:'AE',service:'Management of Communicable Diseases',title:'[Revision] Management of Communicable Diseases — Verification & Documentation',task:'Revisit Management of Communicable Diseases — verify all corrective actions implemented and documentation complete.',me:'ME A | ME E',aocTags:['AoC A+E — Revision'],methods:['SI','RR','CI','OB'],roles:{prime:'CHO',support:['ANM','ASHA']},cps:[{t:'Preventive & promotive services under NVBDCP',r:'CHO',aoc:'A',me:'ME A1.5',method:['SI','RR']},{t:'Case detection, treatment, referral & follow up of cases under NVBDCP',r:'CHO',aoc:'A',me:'ME A1.5',method:['SI','RR']},{t:'Preventive & promotive measures  under NTEP',r:'CI',aoc:'A',me:'ME A1.5',method:['SI','CI']},{t:'Case detection, treatment, referral & follow up of cases under NTEP',r:'CHO',aoc:'A',me:'ME A1.5',method:['SI','RR']},{t:'Preventive & promotive measures under NLEP',r:'CHO',aoc:'A',me:'ME A1.5',method:['SI','CI']},{t:'Case detection, treatment, referral & follow up of cases under NLEP',r:'CHO',aoc:'A',me:'ME A1.5',method:['SI','RR']},{t:'Preventive & promotive services under NACP',r:'CHO',aoc:'A',me:'ME A1.5',method:['SI','CI']},{t:'Referral & follow up of cases under NACP',r:'CHO',aoc:'A',me:'ME A1.5',method:['SI','RR']},{t:'Preventive & promotive measures  under NVHCP',r:'CHO',aoc:'A',me:'ME A1.5',method:['SI','CI']},{t:'Case detection, treatment, referral & follow up of cases under NVHCP',r:'CHO',aoc:'A',me:'ME A1.5',method:['SI','RR']},{t:'Availability of functional services under IDSP/ IHIP',r:'CHO',aoc:'A',me:'ME A1.5',method:['SI','RR']},{t:'Identification, management and  referral of acute illness & minor aliments',r:'CHO',aoc:'A',me:'ME A1.6',method:['SI','RR']},{t:'Preventive & promotive measures  for acute illness',r:'CHO',aoc:'A',me:'ME A1.6',method:['SI','CI']},{t:'Primary care team  is aware of  vector born disease control strategies',r:'CHO',aoc:'E',me:'ME E10.1',method:['SI','RR']},{t:'Case detection is done for Malaria',r:'CHO',aoc:'E',me:'ME E10.1',method:['SI','RR']},{t:'Staff is aware of Malaria treatment protocols',r:'CHO',aoc:'E',me:'ME E10.1',method:['SI','RR']},{t:'Staff is aware of Malaria referral protocols',r:'CHO',aoc:'E',me:'ME E10.1',method:['SI','RR']},{t:'Staff is aware of diagnostic & management of dengue as per protocols',r:'CHO',aoc:'E',me:'ME E10.1',method:['SI','RR']},{t:'NVBDCP register & records are maintained',r:'ASHA',aoc:'E',me:'ME E10.1',method:['SI','RR']},{t:'Facilities have adequate stock of commodities & drugs',r:'CHO',aoc:'E',me:'ME E10.1',method:['SI','RR']},{t:'Staff is aware of sign & symptoms of prevalent vector born diseases in area',r:'CHO',aoc:'E',me:'ME E10.1',method:['SI']},{t:'Identification of presumptive case  & their referral',r:'CHO',aoc:'E',me:'ME E10.2',method:['RR']},{t:'Ayushman Arogya Mandir support, supervision & manage presumptive, confirmed & on treatment cases including DR- TB patients',r:'CHO',aoc:'E',me:'ME E10.2',method:['RR','OB']},{t:'Staff is aware of follow up protocol after treatment completion',r:'CHO',aoc:'E',me:'ME E10.2',method:['SI','RR']},{t:'NTEP register & records are maintained',r:'CHO',aoc:'E',me:'ME E10.2',method:['RR']},{t:'Primary healthcare team  identify and ensure referral of suspected cases of Leprosy',r:'CHO',aoc:'E',me:'ME E10.3',method:['SI','RR']},{t:'NLEP register & records are maintained',r:'CHO',aoc:'E',me:'ME E10.3',method:['RR']},{t:'Facility provide awareness about leprosy & availability of its treatment',r:'CHO',aoc:'E',me:'ME E10.3',method:['SI','CI']},{t:'Ayushman Arogya Mandir-HSC is aware of their roles in NACP',r:'CHO',aoc:'E',me:'ME E10.4',method:['SI','RR']},{t:'Ayushman Arogya Mandir -SC has linkage for management of HIV/AIDS complications',r:'CHO',aoc:'E',me:'ME E10.4',method:['RR']},{t:'Staff is aware of promotional & supportive  activities done under NACP',r:'CHO',aoc:'E',me:'ME E10.4',method:['SI','RR']},{t:'Staff is aware of syndrome under surveillance in IDSP/IHIP',r:'CHO',aoc:'E',me:'ME E10.5',method:['SI','RR']},{t:'Check process to collect information in form S/ IHIP',r:'CHO',aoc:'E',me:'ME E10.5',method:['RR']},{t:'Check  Analysis & reporting of information for syndromic surveillance is done',r:'CHO',aoc:'E',me:'ME E10.5',method:['SI','RR']},{t:'Availability of diagnostic & treatment services',r:'CHO',aoc:'E',me:'ME E10.6',method:['RR']},{t:'Staff is aware of preventive measures for NVHCP',r:'CHO',aoc:'E',me:'ME E10.6',method:['SI','OB']}]},{day:45,aoc:'AE',service:'Management of Non-Communicable Diseases',title:'[Revision] Management of Non-Communicable Diseases — Verification & Documentation',task:'Revisit Management of Non-Communicable Diseases — verify all corrective actions implemented and documentation complete.',me:'ME A | ME E',aocTags:['AoC A+E — Revision'],methods:['SI','RR','CI'],roles:{prime:'CHO',support:['ANM','ASHA']},cps:[{t:'Availability of services for Hypertension',r:'CHO',aoc:'A',me:'ME A1.7',method:['SI','RR']},{t:'Availability of services for Diabetes',r:'CHO',aoc:'A',me:'ME A1.7',method:['SI','RR']},{t:'Availability of services for Nonalcoholic fatty liver disease (NAFLD)',r:'CHO',aoc:'A',me:'ME A1.7',method:['SI','RR']},{t:'Availability of Services for  Cancers',r:'CHO',aoc:'A',me:'ME A1.7',method:['SI','RR']},{t:'Availability of services for respiratory diseases',r:'CHO',aoc:'A',me:'ME A1.7',method:['SI','RR']},{t:'Availability of services for Epilepsy',r:'CHO',aoc:'A',me:'ME A1.7',method:['SI','RR']},{t:'Availability of  services for  locally prevalent health diseases & substance abuse',r:'CHO',aoc:'A',me:'ME A1.7',method:['RR']},{t:'Preventive & promotive services under NCD',r:'CHO',aoc:'A',me:'ME A1.7',method:['SI','CI']},{t:'Ayushman Arogya Mandir undertakes  health promotion and disease prevention activities through Community level resources',r:'CI',aoc:'A',me:'ME A1.14',method:['RR','CI']},{t:'Provision of wellness services through Yoga and other activities',r:'CHO',aoc:'A',me:'ME A1.14',method:['SI','CI']},{t:'Provision of AYUSH services',r:'CHO',aoc:'A',me:'ME A1.14',method:['SI','RR']},{t:'Provision of counselling services for Eat Right',r:'CHO',aoc:'A',me:'ME A1.14',method:['SI','CI']},{t:'Staff is aware of process of population identification and referral for hypertension',r:'CHO',aoc:'E',me:'ME E11.1',method:['SI','RR']},{t:'CHO is  aware of sign & symptoms  of Hypertension',r:'CHO',aoc:'E',me:'ME E11.1',method:['SI']},{t:'Ayushman Arogya Mandir ensures frequency of follow up & supply of required medicines',r:'CHO',aoc:'E',me:'ME E11.1',method:['RR','CI']},{t:'Staff is aware of promotional & supportive  activities for Hypertension',r:'CHO',aoc:'E',me:'ME E11.1',method:['SI','CI']},{t:'Staff is aware of process of population identification and referral for diabetes',r:'CHO',aoc:'E',me:'ME E11.2',method:['SI','RR']},{t:'CHO is  aware of sign & symptoms  of diabetes',r:'CHO',aoc:'E',me:'ME E11.2',method:['SI']},{t:'Ayushman Arogya Mandir ensures frequency of follow up & supply of required medicines',r:'CHO',aoc:'E',me:'ME E11.2',method:['RR','CI']},{t:'Check Patient is counselled about identification & immediate management hypoglycaemia',r:'CHO',aoc:'E',me:'ME E11.2',method:['SI','CI']},{t:'Ayushman Arogya Mandir is aware of  risk factors of  Nonalcoholic fatty liver disease (NAFLD)',r:'CHO',aoc:'E',me:'ME E11.2',method:['SI','RR']},{t:'Staff is aware of promotional & supportive  activities for diabetes',r:'CHO',aoc:'E',me:'ME E11.2',method:['SI','CI']},{t:'Check cancer screening services are provided through Ayushman Arogya Mandir',r:'CHO',aoc:'E',me:'ME E11.3',method:['SI','RR']},{t:'Staff is aware about sign & symptom of cervical cancer',r:'CHO',aoc:'E',me:'ME E11.3',method:['SI']},{t:'Staff is aware about sign & symptom of Breast cancer',r:'CHO',aoc:'E',me:'ME E11.3',method:['SI']},{t:'Staff is aware about sign & symptom of Oral Cancer',r:'CHO',aoc:'E',me:'ME E11.3',method:['SI']},{t:'Check with  staff about methodology followed for  cancer screening',r:'CHO',aoc:'E',me:'ME E11.3',method:['SI','RR']},{t:'Check CHW is aware of referral centre for all types of cancer',r:'CHO',aoc:'E',me:'ME E11.3',method:['SI','RR']},{t:'Staff is aware of promotional & supportive  activities for cancers',r:'CHO',aoc:'E',me:'ME E11.3',method:['SI','CI']},{t:'Confirmation and referral of cases for Tobacco/alcohol/ substance abuse',r:'CHO',aoc:'E',me:'ME E11.4',method:['SI','RR']},{t:'Promotional & supportive  activities for Tobacco/alcohol/ substance abuse',r:'CHO',aoc:'E',me:'ME E11.4',method:['SI','RR','CI']},{t:'Check Screening & referral  locally prevalent diseases',r:'CHO',aoc:'E',me:'ME E11.4',method:['SI','CI']},{t:'Check Ayushman Arogya Mandir is providing Yoga services',r:'ASHA',aoc:'E',me:'ME E11.5',method:['SI','RR']},{t:'Check Yoga sessions are conducted regularly',r:'CHO',aoc:'E',me:'ME E11.5',method:['RR','CI']},{t:'Check counselling of mother\'s for nutrition & hygiene maintenance under Eat right',r:'CHO',aoc:'E',me:'ME E11.5',method:['SI','CI']},{t:'Check staff counsel and guide the mother\'s about household preparation of complementary feeds',r:'CHO',aoc:'E',me:'ME E11.5',method:['SI','CI']},{t:'Check Primary  health care team generate awareness  in community about balanced diet',r:'CHO',aoc:'E',me:'ME E11.5',method:['SI','CI']},{t:'Check Primary  health care team generate awareness  in community about food fortification',r:'CHO',aoc:'E',me:'ME E11.5',method:['SI','CI']},{t:'Check Primary  health care team generate awareness  in community about Eat safe practices',r:'CHO',aoc:'E',me:'ME E11.5',method:['SI','CI']},{t:'Check Primary  health care team generate awareness  in community about food safety',r:'CHO',aoc:'E',me:'ME E11.5',method:['SI','CI']}]},{day:46,aoc:'AE',service:'Drugs & Diagnostics',title:'[Revision] Drugs & Diagnostics — Verification & Documentation',task:'Revisit Drugs & Diagnostics — verify all corrective actions implemented and documentation complete.',me:'ME A | ME E',aocTags:['AoC A+E — Revision'],methods:['RR','CI','SI'],roles:{prime:'CHO',support:['ANM','ASHA']},cps:[{t:'Availability of basic diagnostic services including NHP',r:'ANM',aoc:'A',me:'ME A2.1',method:['RR','CI']},{t:'Linkages with the Central diagnostic units (Hub & spoke)',r:'ANM',aoc:'A',me:'ME A2.1',method:['SI','RR']},{t:'Availability of drugs as per EDL',r:'CHO',aoc:'A',me:'ME A2.2',method:['SI','RR']},{t:'Availability of drugs for refill for chronic cases',r:'CHO',aoc:'A',me:'ME A2.2',method:['SI','RR']}]},{day:47,aoc:'AE',service:'Emergency',title:'[Revision] Emergency — Verification & Documentation',task:'Revisit Emergency — verify all corrective actions implemented and documentation complete.',me:'ME A | ME E',aocTags:['AoC A+E — Revision'],methods:['SI','RR','CI','OB'],roles:{prime:'CHO',support:['ANM','ASHA']},cps:[{t:'Availability of services for Medical Emergencies including trauma & burns',r:'CHO',aoc:'A',me:'ME A1.12',method:['SI','RR']},{t:'Emergency protocols for first aid and stabilization are available',r:'CHO',aoc:'E',me:'ME E 7.1',method:['SI','RR']},{t:'Staff is aware of  procedure for CPR',r:'CHO',aoc:'E',me:'ME E 7.1',method:['SI','RR']},{t:'Ayushman Arogya Mandir ensures timely availability of ambulances services for emergency cases',r:'CHO',aoc:'E',me:'ME E 7.1',method:['RR','CI']},{t:'Emergency care is given in case of disaster',r:'CHO',aoc:'E',me:'ME E 7.2',method:['SI','OB']},{t:'Staff is aware of  process of sorting the patients in case of mass causalty/ outbreak',r:'CHO',aoc:'E',me:'ME E 7.2',method:['SI','RR']}]},{day:48,aoc:'AE',service:'Care of Common Ophthalmic and ENT',title:'[Revision] Care of Common Ophthalmic and ENT — Verification & Documentation',task:'Revisit Care of Common Ophthalmic and ENT — verify all corrective actions implemented and documentation complete.',me:'ME A | ME E',aocTags:['AoC A+E — Revision'],methods:['SI','RR','CI','OB'],roles:{prime:'CHO',support:['ANM','ASHA']},cps:[{t:'Availability of  Ophthalmic  Services',r:'CHO',aoc:'A',me:'ME A1.8',method:['SI','RR']},{t:'Preventive & promotive services under for Ophthalmic',r:'CHO',aoc:'A',me:'ME A1.8',method:['SI','CI']},{t:'Availability of  ENT Services',r:'CHO',aoc:'A',me:'ME A1.9',method:['SI','RR']},{t:'Preventive & promotive services under for ENT',r:'CHO',aoc:'A',me:'ME A1.9',method:['SI','CI']},{t:'Staff screen & refer cases of common ophthalmic aliments  lead to blindness & refractive errors',r:'CHO',aoc:'E',me:'ME E8.1',method:['SI','RR']},{t:'Staff is aware of identification & primary management common ophthalmic conditions including emergencies',r:'CHO',aoc:'E',me:'ME E8.1',method:['SI','RR','OB']},{t:'Staff is aware of  methods for measuring the refractive errors',r:'CHO',aoc:'E',me:'ME E8.1',method:['SI','RR']},{t:'Staff maintain records under ophthalmic care',r:'CHO',aoc:'E',me:'ME E8.1',method:['SI','RR']},{t:'Promotion & supportive activities for ophthalmic care',r:'CHO',aoc:'E',me:'ME E8.1',method:['RR','CI']},{t:'Screening of population for ENT aliments',r:'CHO',aoc:'E',me:'ME E8.2',method:['SI','RR']},{t:'Identification & primary management of common ear problems',r:'CHO',aoc:'E',me:'ME E8.2',method:['SI','RR']},{t:'Staff is trained & using diagnostic tools for identification of ear problems',r:'CHO',aoc:'E',me:'ME E8.2',method:['RR','OB']},{t:'Identification & management of nose problem',r:'CHO',aoc:'E',me:'ME E8.2',method:['RR','OB']},{t:'Staff is trained & using diagnostic tools for identification of Nose aliments',r:'CHO',aoc:'E',me:'ME E8.2',method:['SI','OB']},{t:'Identification & primary management  of throat aliments',r:'CHO',aoc:'E',me:'ME E8.2',method:['SI','RR']},{t:'Check staff is trained & able to  perform Heimlich manoeuvre/ dislodge obstruction from windpipe',r:'CHO',aoc:'E',me:'ME E8.2',method:['SI','RR']},{t:'Staff is trained to identify ENT aliments require referral to higher centre',r:'CHO',aoc:'E',me:'ME E8.2',method:['SI','RR']},{t:'Promotion & supportive activities for ENT',r:'CHO',aoc:'E',me:'ME E8.2',method:['SI','RR','CI']}]},{day:49,aoc:'AE',service:'Oral Health Care',title:'[Revision] Oral Health Care — Verification & Documentation',task:'Revisit Oral Health Care — verify all corrective actions implemented and documentation complete.',me:'ME A | ME E',aocTags:['AoC A+E — Revision'],methods:['SI','RR','CI'],roles:{prime:'CHO',support:['ANM','ASHA']},cps:[{t:'Availability of  early identification & referral services for oral Health conditions',r:'CHO',aoc:'A',me:'ME A1.10',method:['SI','RR']},{t:'Availability of  symptomatic management & referral services for oral Health conditions',r:'CHO',aoc:'A',me:'ME A1.10',method:['SI','RR']},{t:'Preventive & promotive services under oral health',r:'CHO',aoc:'A',me:'ME A1.10',method:['SI','CI']},{t:'Staff is aware about Oral health conditions, primary management & referral',r:'CHO',aoc:'E',me:'ME E8.3',method:['SI']},{t:'Staff is aware of symptomatic  treatment for dental emergencies',r:'CHO',aoc:'E',me:'ME E8.3',method:['SI','RR']},{t:'Screening of oral health conditions is done as per protocol',r:'CHO',aoc:'E',me:'ME E8.3',method:['SI','RR']},{t:'Promotion & supportive activities for oral health',r:'CHO',aoc:'E',me:'ME E8.3',method:['SI','CI']}]},{day:50,aoc:'AE',service:'Mental Health',title:'[Revision] Mental Health — Verification & Documentation',task:'Revisit Mental Health — verify all corrective actions implemented and documentation complete.',me:'ME A | ME E',aocTags:['AoC A+E — Revision'],methods:['SI','RR','CI'],roles:{prime:'CHO',support:['ANM','ASHA']},cps:[{t:'Availability of services for mental health',r:'CHO',aoc:'A',me:'ME A1.13',method:['SI','RR']},{t:'Preventive & promotive services under mental health',r:'CHO',aoc:'A',me:'ME A1.13',method:['SI','CI']},{t:'Check staff is aware of MNS (Mental, neurological & substance use)  conditions',r:'CHO',aoc:'E',me:'ME E9.1',method:['SI','RR']},{t:'Check Staff  uses specific  tools for early identification & screening of MNS',r:'ASHA',aoc:'E',me:'ME E9.1',method:['SI','RR']},{t:'Staff is competent for basic management, referral & follow up of MNS',r:'CHO',aoc:'E',me:'ME E9.1',method:['SI','RR']},{t:'Check staff is trained for emergency management of  Epilepsy',r:'CHO',aoc:'E',me:'ME E9.1',method:['SI','RR']},{t:'Promotion & supportive activities for mental health',r:'CHO',aoc:'E',me:'ME E9.1',method:['SI','CI']}]},{day:51,aoc:'AE',service:'Elderly & Pallative Care',title:'[Revision] Elderly & Pallative Care — Verification & Documentation',task:'Revisit Elderly & Pallative Care — verify all corrective actions implemented and documentation complete.',me:'ME A | ME E',aocTags:['AoC A+E — Revision'],methods:['SI','RR','OB','CI'],roles:{prime:'CHO',support:['ANM','ASHA']},cps:[{t:'Availability of services for elderly care',r:'CHO',aoc:'A',me:'ME A1.11',method:['SI','RR']},{t:'Availability of services for palliative care',r:'CHO',aoc:'A',me:'ME A1.11',method:['SI','RR']},{t:'Elderly population is mapped & screened',r:'CHO',aoc:'E',me:'ME E12.1',method:['SI','RR']},{t:'CHO is aware &  competent to use various geriatric tools',r:'CHO',aoc:'E',me:'ME E12.1',method:['RR','OB']},{t:'Ayushman Arogya Mandir ­undertake preliminary assessment for the need of assistive devices',r:'CHO',aoc:'E',me:'ME E12.1',method:['RR']},{t:'Promotional & supportive activities for Geriatric care',r:'CHO',aoc:'E',me:'ME E12.1',method:['SI','CI']},{t:'Screening, basic management & referral  of Palliative Care patient is done',r:'CHO',aoc:'E',me:'ME E12.2',method:['RR','CI']},{t:'Home based palliative care services are being provided',r:'CHO',aoc:'E',me:'ME E12.2',method:['SI','RR']},{t:'Check Home care kit is available & case sheet are  updated',r:'CHO',aoc:'E',me:'ME E12.2',method:['SI','RR']},{t:'Check patient support groups are available',r:'CHO',aoc:'E',me:'ME E12.2',method:['SI','RR']},{t:'Promotional & supportive activities for palliative care',r:'CHO',aoc:'E',me:'ME E12.2',method:['SI','CI']}]},{day:52,aoc:'AE',service:'Consolidation',title:'AoC B+C Consolidation',task:'Review patient rights evidence folder and confirm all input resources are documented.',me:'All MEs',aocTags:['All Areas of Concern — Consolidation'],methods:['RR','SI','OB'],roles:{prime:'CHO',support:['ANM','ASHA']},cps:[{t:'AoC B evidence folder verified — consent forms, rights charter in place',r:'CHO',aoc:'AE',me:'',method:['RR']},{t:'AoC C — all essential medicines, equipment, and HR documents ready',r:'ANM',aoc:'AE',me:'',method:['OB']},{t:'Patient feedback system active — last 3 months records available',r:'CHO',aoc:'AE',me:'',method:['RR']}]},{day:53,aoc:'AE',service:'Consolidation',title:'AoC D+F Consolidation',task:'Verify all support services and infection control gaps are closed.',me:'All MEs',aocTags:['All Areas of Concern — Consolidation'],methods:['RR','SI','OB'],roles:{prime:'CHO',support:['ANM','ASHA']},cps:[{t:'BMW management fully compliant — no open waste found',r:'CHO',aoc:'AE',me:'',method:['OB']},{t:'Sterilisation records accurate — all instruments within sterile period',r:'ANM',aoc:'AE',me:'',method:['RR']},{t:'Hand hygiene compliance >90% — observed and documented',r:'CHO',aoc:'AE',me:'',method:['OB']}]},{day:54,aoc:'AE',service:'Consolidation',title:'AoC G+H Consolidation',task:'Complete quality management evidence and confirm all outcome indicators are documented.',me:'All MEs',aocTags:['All Areas of Concern — Consolidation'],methods:['RR','SI','OB'],roles:{prime:'CHO',support:['ANM','ASHA']},cps:[{t:'QI meeting minutes for last 3 months filed and accessible',r:'CHO',aoc:'AE',me:'',method:['RR']},{t:'All health outcome indicators documented and improving vs baseline',r:'CHO',aoc:'AE',me:'',method:['RR']},{t:'Patient satisfaction survey results compiled and displayed',r:'CHO',aoc:'AE',me:'',method:['RR']}]},{day:55,aoc:'AE',service:'Consolidation',title:'Final Evidence Review',task:'Final check of all 8 Area of Concern evidence folders — nothing missing.',me:'All MEs',aocTags:['All Areas of Concern — Consolidation'],methods:['RR','SI','OB'],roles:{prime:'CHO',support:['ANM','ASHA']},cps:[{t:'All 8 AoC evidence folders complete with supporting documents',r:'CHO',aoc:'AE',me:'',method:['RR']},{t:'Each ME has at least 1 supporting document in evidence folder',r:'CHO',aoc:'AE',me:'',method:['RR']},{t:'Evidence folder indexed and organised for quick access during assessment',r:'ANM',aoc:'AE',me:'',method:['RR']}]},{day:56,aoc:'AE',service:'Consolidation',title:'Staff Confidence Drill',task:'Final staff interview and observation drill — all team members confident in their roles.',me:'All MEs',aocTags:['All Areas of Concern — Consolidation'],methods:['RR','SI','OB'],roles:{prime:'CHO',support:['ANM','ASHA']},cps:[{t:'CHO can answer all AoC A,B,C questions confidently',r:'CHO',aoc:'AE',me:'',method:['SI']},{t:'ANM can answer all immunisation, ANC, and drug-related questions',r:'ANM',aoc:'AE',me:'',method:['SI']},{t:'ASHA can explain her community role, records, and outreach activities',r:'ASHA',aoc:'AE',me:'',method:['SI']}]},{day:57,aoc:'AE',service:'Consolidation',title:'Display & Documentation Check',task:'Verify all display boards, registers, and facility readiness for NQAS assessor visit.',me:'All MEs',aocTags:['All Areas of Concern — Consolidation'],methods:['RR','SI','OB'],roles:{prime:'CHO',support:['ANM','ASHA']},cps:[{t:'All display boards updated — patient rights, services list, contact numbers',r:'CHO',aoc:'AE',me:'',method:['OB']},{t:'SC premises clean, well-lit, and equipment in working order',r:'CHO',aoc:'AE',me:'',method:['OB']},{t:'All registers up to date — no missing entries for last 3 months',r:'ANM',aoc:'AE',me:'',method:['RR']}]},{day:58,aoc:'AE',service:'Consolidation',title:'Peer Assessment',task:'Internal peer assessment — team members assess each other across all AoC.',me:'All MEs',aocTags:['All Areas of Concern — Consolidation'],methods:['RR','SI','OB'],roles:{prime:'CHO',support:['ANM','ASHA']},cps:[{t:'Peer assessment completed — each staff member assessed by colleague',r:'CHO',aoc:'AE',me:'',method:['OB']},{t:'All peer assessment findings documented and corrective actions taken',r:'CHO',aoc:'AE',me:'',method:['RR']},{t:'Team debrief conducted — final motivation session held',r:'CHO',aoc:'AE',me:'',method:['SI']}]},{day:59,aoc:'AE',service:'Mock Assessment',title:'Mock Assessment — Evidence Folder & Staff Drill',task:'Full mock assessment run-through. Simulate NQAS assessor visit across all Areas of Concern.',me:'All MEs',aocTags:['All Areas of Concern'],methods:['SI','RR','OB','CI'],roles:{prime:'CHO',support:['ANM','ASHA']},cps:[{t:'SI drill: All staff can answer their role-specific questions',r:'CHO',aoc:'AE',me:'',method:['SI']},{t:'RR drill: All registers produced and verified within 2 minutes',r:'ANM',aoc:'AE',me:'',method:['RR']},{t:'OB drill: SC premises — zero violations found',r:'CHO',aoc:'AE',me:'',method:['OB']},{t:'Evidence folder complete for all 8 Areas of Concern',r:'CHO',aoc:'AE',me:'',method:['RR']},{t:'All gap closure actions confirmed complete',r:'CHO',aoc:'AE',me:'',method:['SI']},{t:'Block/PHC supervisor briefed on final readiness',r:'CHO',aoc:'AE',me:'',method:['SI']},{t:'Team confident and motivated — ready for NQAS assessment',r:'CHO',aoc:'AE',me:'',method:['SI']}]},{day:60,aoc:'Boss',service:'Grand Finale',title:'🏆 GRAND FINALE — Complete NQAS Mock Assessment',task:'🏆 Full simulation of NQAS assessment across all 8 Areas of Concern. Celebrate your preparation!',me:'All MEs',aocTags:['All Areas of Concern'],methods:['SI','RR','OB','CI'],roles:{prime:'CHO',support:['ANM','ASHA']},isBoss:true,cps:[{t:'AoC A (Service Provision) — verified and fully compliant',r:'CHO',aoc:'Boss',me:'',method:['SI']},{t:'AoC B (Patient Rights) — verified and fully compliant',r:'CHO',aoc:'Boss',me:'',method:['CI']},{t:'AoC C (Inputs) — verified and fully compliant',r:'CHO',aoc:'Boss',me:'',method:['OB']},{t:'AoC D (Support Services) — verified and fully compliant',r:'CHO',aoc:'Boss',me:'',method:['OB']},{t:'AoC E (Clinical Services) — verified and fully compliant',r:'CHO',aoc:'Boss',me:'',method:['SI']},{t:'AoC F (Infection Control) — verified and fully compliant',r:'CHO',aoc:'Boss',me:'',method:['OB']},{t:'AoC G (Quality Management) — verified and fully compliant',r:'CHO',aoc:'Boss',me:'',method:['RR']},{t:'AoC H (Outcome) — reviewed and documented',r:'CHO',aoc:'Boss',me:'',method:['RR']},{t:'Evidence folder complete for all 8 Areas of Concern',r:'CHO',aoc:'Boss',me:'',method:['RR']},{t:'🎉 Team celebrated — NQAS | FAST Programme Complete!',r:'CHO',aoc:'Boss',me:'',method:['SI']}]}];
const DAYS_12B=[{day:1,aoc:'AE',service:'Pregnancy & Child Birth',title:'Pregnancy & Child Birth — Availability & Clinical Quality',task:'Assess Pregnancy & Child Birth services — verify availability (AoC A) and clinical quality (AoC E).',me:'ME A1 | ME E',aocTags:['AoC A — Service Provision','AoC E — Clinical Services'],methods:['SI','RR','CI','OB'],roles:{prime:'CHO',support:['ANM','ASHA']},cps:[{t:'Availability of functional ANC services  with minimum 4 ANC check-ups',r:'CHO',aoc:'A',me:'ME A1.1',method:['SI','RR']},{t:'First aid, referral  & follow up services for high risk pregnancies are provided',r:'CHO',aoc:'A',me:'ME A1.1',method:['SI','RR']},{t:'Availability of Normal Vaginal delivery services  and referral services for Obstetrics emergencies',r:'CHO',aoc:'A',me:'ME A1.1',method:['SI','RR']},{t:'Availability of  prompt referral services for Obstetrics emergencies',r:'CHO',aoc:'A',me:'ME A1.1',method:['SI','RR']},{t:'Facility provides and updates “Mother and Child Protection Card”',r:'CHO',aoc:'E',me:'ME E16.1',method:['RR','CI']},{t:'Facility ensures early registration & line listing of high risk ANC  cases',r:'CHO',aoc:'E',me:'ME E16.1',method:['SI','RR']},{t:'Clinical information & records of ANC is kept with Ayushman Arogya Mandir',r:'ANM',aoc:'E',me:'ME E16.1',method:['SI','RR']},{t:'Staff has knowledge of calculating expected pregnancies in the area',r:'CHO',aoc:'E',me:'ME E16.1',method:['SI','RR']},{t:'Tracking of Missed and left out ANC',r:'CHO',aoc:'E',me:'ME E16.1',method:['SI','RR']},{t:'All pregnant women get ANC check-up as per recommended schedule',r:'CHO',aoc:'E',me:'ME E16.1',method:['SI','RR']},{t:'At ANC clinic, Pregnancy is confirmed by performing urine test',r:'CHO',aoc:'E',me:'ME E16.2',method:['RR']},{t:'Last menstrual period (LMP) is recorded and Expected date of Delivery (EDD) is calculated on first visit.',r:'CHO',aoc:'E',me:'ME E16.2',method:['SI','RR']},{t:'Comprehensive Obstetric history is recorded',r:'CHO',aoc:'E',me:'ME E16.2',method:['SI','RR']},{t:'Physical Examination & vitals  of Pregnant Women is done on every ANC visit',r:'CHO',aoc:'E',me:'ME E16.2',method:['RR']},{t:'Abdominal Examination is done as per protocol',r:'CHO',aoc:'E',me:'ME E16.2',method:['SI','RR']},{t:'Diagnostic  test for every pregnant women',r:'CHO',aoc:'E',me:'ME E16.3',method:['SI','RR']},{t:'Tetanus Toxoid (2 Dosages/ Booster) have been during ANC visits',r:'CHO',aoc:'E',me:'ME E16.3',method:['SI','RR']},{t:'Staff can recognize the cases, which would need referral to higher centre(FRU)',r:'CHO',aoc:'E',me:'ME E16.4',method:['SI','RR']},{t:'Staff is competent to identify Hypertension / Pregnancy Induced Hypertension',r:'CHO',aoc:'E',me:'ME E16.4',method:['SI','RR']},{t:'Staff is competent to identify Pre-Eclampsia',r:'CHO',aoc:'E',me:'ME E16.4',method:['SI','RR']},{t:'Staff is competent to identify high risk cases based on Abdominal examination',r:'CHO',aoc:'E',me:'ME E16.4',method:['SI','RR']},{t:'Staff is competent to classify anaemia according to Haemoglobin Level',r:'CHO',aoc:'E',me:'ME E16.4',method:['SI','RR']},{t:'Staff is aware of prophylactic & Therapeutic dose of IFA &  progress is monitored',r:'CHO',aoc:'E',me:'ME E16.4',method:['SI','RR']},{t:'Pregnant women is counselled for planning and preparation for birth',r:'CHO',aoc:'E',me:'ME E16.5',method:['SI','CI']},{t:'Pregnant women is counselled recognize danger signs during pregnancy',r:'CHO',aoc:'E',me:'ME E16.5',method:['SI','CI']},{t:'Pregnant women is counselled diet, rest, breast feeding & family planning.',r:'CHO',aoc:'E',me:'ME E16.5',method:['SI','CI']},{t:'Management of 1st stage of labour:',r:'CHO',aoc:'E',me:'ME E17.1',method:['SI','RR']},{t:'Management of 2nd stage of labour:',r:'CHO',aoc:'E',me:'ME E17.1',method:['SI','RR']},{t:'Check no unnecessary episiotomy and unnecessary augmentation and induction labour is done using uterotonic drugs',r:'CHO',aoc:'E',me:'ME E17.1',method:['SI','RR']},{t:'Active Management of Third stage of labour',r:'CHO',aoc:'E',me:'ME E17.1',method:['SI','RR']},{t:'Staff is aware of route, doses and time of Uterotonic Drugs',r:'CHO',aoc:'E',me:'ME E17.1',method:['SI','RR']},{t:'Wipes the baby with a clean pre-warmed towel and wraps baby in second pre-warmed towel.',r:'CHO',aoc:'E',me:'ME E17.2',method:['SI','RR']},{t:'Performs delayed cord clamping and cutting (1-3 min) & Initiates breast-feeding soon after birth',r:'CHO',aoc:'E',me:'ME E17.2',method:['SI','OB']},{t:'Records birth weight and gives injection vitamin K',r:'CHO',aoc:'E',me:'ME E17.2',method:['SI','RR']},{t:'New born Resuscitation',r:'CHO',aoc:'E',me:'ME E17.2',method:['SI','OB']},{t:'Staff is aware of Indications for reffering patient for to higher centre',r:'CHO',aoc:'E',me:'ME E17.3',method:['SI','RR']},{t:'Initial Management of  Eclampsia \\Pre Eclampsia',r:'CHO',aoc:'E',me:'ME E17.3',method:['SI','RR']},{t:'Post Partum Haemorrhage',r:'CHO',aoc:'E',me:'ME E17.3',method:['SI','RR']},{t:'Mother is monitored as per post natal care guideline',r:'CHO',aoc:'E',me:'ME E18.1',method:['SI','RR']},{t:'Check Mother is educated & counselled about danger signs during puerperium &  during postnatal visit',r:'CHO',aoc:'E',me:'ME E18.2',method:['SI','RR']}]},{day:2,aoc:'AE',service:'Neonatal & Infant Care',title:'Neonatal & Infant Care — Availability & Clinical Quality',task:'Assess Neonatal & Infant Care services — verify availability (AoC A) and clinical quality (AoC E).',me:'ME A1 | ME E',aocTags:['AoC A — Service Provision','AoC E — Clinical Services'],methods:['SI','RR','CI','OB'],roles:{prime:'CHO',support:['ANM','ASHA']},cps:[{t:'Identification, primary management & prompt referral  of sick new born & infant',r:'CHO',aoc:'A',me:'ME A1.2',method:['SI','RR']},{t:'Availability of Immunization Services',r:'ANM',aoc:'A',me:'ME A1.2',method:['SI','RR']},{t:'CHO & CHW  are aware of danger signs of new born & infant',r:'CHO',aoc:'E',me:'ME E13.1',method:['SI','RR']},{t:'Primary management & prompt referral of sick new born & infants',r:'CHO',aoc:'E',me:'ME E13.1',method:['SI','RR']},{t:'Staff is aware of post natal care Counselling',r:'CHO',aoc:'E',me:'ME E13.1',method:['SI','CI']},{t:'Check for vaccines & diluents are kept as per the recommendation of guidelines',r:'OB',aoc:'E',me:'ME E13.2',method:['SI','OB']},{t:'Reconstituted vaccines are not used after recommended time',r:'ANM',aoc:'E',me:'ME E13.2',method:['SI','OB']},{t:'Staff checks VVM level before using vaccines  and identify discard point',r:'ANM',aoc:'E',me:'ME E13.2',method:['SI']},{t:'Parents are counselled for informing any untoward event of concern following vaccination',r:'CI',aoc:'E',me:'ME E13.2',method:['CI','OB']},{t:'Vaccinator is aware about how to manage any immediate serious reaction/anaphylaxis',r:'ANM',aoc:'E',me:'ME E13.2',method:['SI']},{t:'Check the availability of anaphylaxis kit with ANM at session site',r:'ANM',aoc:'E',me:'ME E13.2',method:['OB']},{t:'Check adrenaline is not expired in kit',r:'ANM',aoc:'E',me:'ME E13.2',method:['OB']},{t:'Staff is aware of the shelf life of Vit A once it is opened and ensures it is not given after shelf life',r:'ANM',aoc:'E',me:'ME E13.2',method:['SI','OB']},{t:'ANM/CHW is aware segregation policy after completion of immunization session',r:'ANM',aoc:'E',me:'ME E13.2',method:['SI','OB']},{t:'Staff is aware of  Open vial policy',r:'ANM',aoc:'E',me:'ME E13.2',method:['SI','OB']},{t:'Staff is aware of how to calculate the number of beneficiaries, quantity of vaccines & syringes',r:'ANM',aoc:'E',me:'ME E13.2',method:['SI','RR']},{t:'Ayushman Arogya Mandir -SC maintain tracking bag/ tickler box',r:'ANM',aoc:'E',me:'ME E13.2',method:['SI','RR']},{t:'Check Vaccinator is aware of different categories of AEFI',r:'ANM',aoc:'E',me:'ME E13.2',method:['SI','RR']},{t:'Check person responsible for notifying & reporting of the AEFI is identified',r:'ANM',aoc:'E',me:'ME E13.2',method:['SI','RR']},{t:'Process of reporting and route is communicated to all concerned',r:'ANM',aoc:'E',me:'ME E13.2',method:['SI','RR']},{t:'Reporting  of AEFI cases is ensured by ANM',r:'ANM',aoc:'E',me:'ME E13.2',method:['RR']},{t:'Vaccinator is aware about how to prevent immunization error related reactions',r:'ANM',aoc:'E',me:'ME E13.2',method:['SI']}]},{day:3,aoc:'AE',service:'Childhood & Adolescent Health',title:'Childhood & Adolescent Health — Availability & Clinical Quality',task:'Assess Childhood & Adolescent Health services — verify availability (AoC A) and clinical quality (AoC E).',me:'ME A1 | ME E',aocTags:['AoC A — Service Provision','AoC E — Clinical Services'],methods:['SI','RR','CI'],roles:{prime:'CHO',support:['ANM','ASHA']},cps:[{t:'Identification, primary management, referral & follow up services for Childhood ailments',r:'CHO',aoc:'A',me:'ME A1.3',method:['SI','RR']},{t:'Education, Counselling and referral  services for Adolescent health',r:'CHO',aoc:'A',me:'ME A1.3',method:['SI','CI']},{t:'Assessment for identification of ARI, diarrhoea, malnutrition and Other Illness',r:'CHO',aoc:'E',me:'ME E13.3',method:['SI','RR']},{t:'Assessment for identification of possible serious bacterial infections among young infant (0-59 days) & children (2 -59 months)',r:'CHO',aoc:'E',me:'ME E13.3',method:['SI','RR']},{t:'Management of diarrhoea  is  done as per protocols',r:'CHO',aoc:'E',me:'ME E13.3',method:['SI','RR']},{t:'Management of ARI  is  done as per protocols',r:'CHO',aoc:'E',me:'ME E13.3',method:['SI','RR']},{t:'Management of Possible serious bacterial infection as per protocols',r:'CHO',aoc:'E',me:'ME E13.3',method:['SI','RR']},{t:'Management of Malnutrition  is  done as per protocols',r:'CHO',aoc:'E',me:'ME E13.3',method:['SI','CI']},{t:'Screening, referral and follow up of children for anomalies, disabilities and developmental delays',r:'CHO',aoc:'E',me:'ME E13.3',method:['SI','RR']},{t:'Provision of education & counselling services for  adolescent',r:'CHO',aoc:'E',me:'ME E15.1',method:['SI','CI']},{t:'Services for treatment & referral  of common  RTI/STI\'s, Nutritional Anaemia & Menstrual disorders',r:'CHO',aoc:'E',me:'ME E15.1',method:['RR','CI']}]},{day:4,aoc:'AE',service:'Family Planning',title:'Family Planning — Availability & Clinical Quality',task:'Assess Family Planning services — verify availability (AoC A) and clinical quality (AoC E).',me:'ME A1 | ME E',aocTags:['AoC A — Service Provision','AoC E — Clinical Services'],methods:['SI','RR','CI'],roles:{prime:'CHO',support:['ANM','ASHA']},cps:[{t:'Availability of family planning services',r:'CHO',aoc:'A',me:'ME A1.4',method:['SI','RR']},{t:'Education, Counselling and referral services for family planning services',r:'CI',aoc:'A',me:'ME A1.4',method:['SI','CI']},{t:'The client is given full information about family planning methods',r:'CHO',aoc:'E',me:'ME E14.1',method:['SI','RR']},{t:'Staff is aware of Method specific counselling approaches',r:'CHO',aoc:'E',me:'ME E14.1',method:['SI','CI']},{t:'Staff is aware of case selection criteria for family planning spacing  methods',r:'CHO',aoc:'E',me:'ME E14.2',method:['SI','RR']},{t:'Staff is aware of  options, indications & methods for administration for Oral Contraceptives',r:'CHO',aoc:'E',me:'ME E14.2',method:['SI','RR']},{t:'IUD insertion & follow up is done as per standard protocol',r:'CHO',aoc:'E',me:'ME E14.2',method:['SI','RR']},{t:'Injectable Contraceptives are given as per protocols',r:'CHO',aoc:'E',me:'ME E14.2',method:['SI','RR']},{t:'Staff is aware of case selection criteria for limiting mentors',r:'CHO',aoc:'E',me:'ME E14.3',method:['SI','RR']},{t:'AAM is supporting & encouraging the clients for post sterilization follow up',r:'CHO',aoc:'E',me:'ME E14.3',method:['SI','RR']}]},{day:5,aoc:'AE',service:'Management of Communicable Diseases',title:'Management of Communicable Diseases — Availability & Clinical Quality',task:'Assess Management of Communicable Diseases services — verify availability (AoC A) and clinical quality (AoC E).',me:'ME A1 | ME E',aocTags:['AoC A — Service Provision','AoC E — Clinical Services'],methods:['SI','RR','CI','OB'],roles:{prime:'CHO',support:['ANM','ASHA']},cps:[{t:'Preventive & promotive services under NVBDCP',r:'CHO',aoc:'A',me:'ME A1.5',method:['SI','RR']},{t:'Case detection, treatment, referral & follow up of cases under NVBDCP',r:'CHO',aoc:'A',me:'ME A1.5',method:['SI','RR']},{t:'Preventive & promotive measures  under NTEP',r:'CI',aoc:'A',me:'ME A1.5',method:['SI','CI']},{t:'Case detection, treatment, referral & follow up of cases under NTEP',r:'CHO',aoc:'A',me:'ME A1.5',method:['SI','RR']},{t:'Preventive & promotive measures under NLEP',r:'CHO',aoc:'A',me:'ME A1.5',method:['SI','CI']},{t:'Case detection, treatment, referral & follow up of cases under NLEP',r:'CHO',aoc:'A',me:'ME A1.5',method:['SI','RR']},{t:'Preventive & promotive services under NACP',r:'CHO',aoc:'A',me:'ME A1.5',method:['SI','CI']},{t:'Referral & follow up of cases under NACP',r:'CHO',aoc:'A',me:'ME A1.5',method:['SI','RR']},{t:'Provision for the screening for HIV',r:'CHO',aoc:'A',me:'ME A1.5',method:['SI','RR']},{t:'Preventive & promotive measures  under NVHCP',r:'CHO',aoc:'A',me:'ME A1.5',method:['SI','CI']},{t:'Case detection, treatment, referral & follow up of cases under NVHCP',r:'CHO',aoc:'A',me:'ME A1.5',method:['SI','RR']},{t:'Availability of functional services under IDSP/ IHIP',r:'CHO',aoc:'A',me:'ME A1.5',method:['SI','RR']},{t:'Identification, management and  referral of acute illness & minor aliments',r:'CHO',aoc:'A',me:'ME A1.6',method:['SI','RR']},{t:'Preventive & promotive measures  for acute illness',r:'CHO',aoc:'A',me:'ME A1.6',method:['SI','CI']},{t:'Primary care team  is aware of  vector born disease control strategies',r:'CHO',aoc:'E',me:'ME E10.1',method:['SI','RR']},{t:'Case detection is done for Malaria',r:'CHO',aoc:'E',me:'ME E10.1',method:['SI','RR']},{t:'Staff is aware of Malaria treatment protocols',r:'CHO',aoc:'E',me:'ME E10.1',method:['SI','RR']},{t:'Staff is aware of Malaria referral protocols',r:'CHO',aoc:'E',me:'ME E10.1',method:['SI','RR']},{t:'Staff is aware of diagnostic & management of dengue as per protocols',r:'CHO',aoc:'E',me:'ME E10.1',method:['SI','RR']},{t:'NVBDCP register & records are maintained',r:'ASHA',aoc:'E',me:'ME E10.1',method:['SI','RR']},{t:'Facilities have adequate stock of commodities & drugs',r:'CHO',aoc:'E',me:'ME E10.1',method:['SI','RR']},{t:'Staff is aware of sign & symptoms of prevalent vector born diseases in area',r:'CHO',aoc:'E',me:'ME E10.1',method:['SI']},{t:'Identification of presumptive case  & their referral',r:'CHO',aoc:'E',me:'ME E10.2',method:['RR']},{t:'Ayushman Arogya Mandir support, supervision & manage presumptive, confirmed & on treatment cases including DR- TB patients',r:'CHO',aoc:'E',me:'ME E10.2',method:['RR','OB']},{t:'Staff is aware of follow up protocol after treatment completion',r:'CHO',aoc:'E',me:'ME E10.2',method:['SI','RR']},{t:'NTEP register & records are maintained',r:'CHO',aoc:'E',me:'ME E10.2',method:['RR']},{t:'Primary healthcare team  identify and ensure referral of suspected cases of Leprosy',r:'CHO',aoc:'E',me:'ME E10.3',method:['SI','RR']},{t:'NLEP register & records are maintained',r:'CHO',aoc:'E',me:'ME E10.3',method:['RR']},{t:'Facility provide awareness about leprosy & availability of its treatment',r:'CHO',aoc:'E',me:'ME E10.3',method:['SI','CI']},{t:'Ayushman Arogya Mandir-HSC is aware of their roles in NACP',r:'CHO',aoc:'E',me:'ME E10.4',method:['SI','RR']},{t:'Ayushman Arogya Mandir -SC has linkage for management of HIV/AIDS complications',r:'CHO',aoc:'E',me:'ME E10.4',method:['RR']},{t:'Staff is aware of promotional & supportive  activities done under NACP',r:'CHO',aoc:'E',me:'ME E10.4',method:['SI','RR']},{t:'Staff is aware of syndrome under surveillance in IDSP/IHIP',r:'CHO',aoc:'E',me:'ME E10.5',method:['SI','RR']},{t:'Check process to collect information in form S/ IHIP',r:'CHO',aoc:'E',me:'ME E10.5',method:['RR']},{t:'Check  Analysis & reporting of information for syndromic surveillance is done',r:'CHO',aoc:'E',me:'ME E10.5',method:['SI','RR']},{t:'Availability of diagnostic & treatment services',r:'CHO',aoc:'E',me:'ME E10.6',method:['RR']},{t:'Staff is aware of preventive measures for NVHCP',r:'CHO',aoc:'E',me:'ME E10.6',method:['SI','OB']}]},{day:6,aoc:'AE',service:'Management of Non-Communicable Diseases',title:'Management of Non-Communicable Diseases — Availability & Clinical Quality',task:'Assess Management of Non-Communicable Diseases services — verify availability (AoC A) and clinical quality (AoC E).',me:'ME A1 | ME E',aocTags:['AoC A — Service Provision','AoC E — Clinical Services'],methods:['SI','RR','CI'],roles:{prime:'CHO',support:['ANM','ASHA']},cps:[{t:'Availability of services for Hypertension',r:'CHO',aoc:'A',me:'ME A1.7',method:['SI','RR']},{t:'Availability of services for Diabetes',r:'CHO',aoc:'A',me:'ME A1.7',method:['SI','RR']},{t:'Availability of services for Nonalcoholic fatty liver disease (NAFLD)',r:'CHO',aoc:'A',me:'ME A1.7',method:['SI','RR']},{t:'Availability of Services for  Cancers',r:'CHO',aoc:'A',me:'ME A1.7',method:['SI','RR']},{t:'Availability of services for respiratory diseases',r:'CHO',aoc:'A',me:'ME A1.7',method:['SI','RR']},{t:'Availability of services for Epilepsy',r:'CHO',aoc:'A',me:'ME A1.7',method:['SI','RR']},{t:'Availability of  services for  locally prevalent health diseases & substance abuse',r:'CHO',aoc:'A',me:'ME A1.7',method:['RR']},{t:'Preventive & promotive services under NCD',r:'CHO',aoc:'A',me:'ME A1.7',method:['SI','CI']},{t:'Ayushman Arogya Mandir undertakes  health promotion and disease prevention activities through Community level resources',r:'CI',aoc:'A',me:'ME A1.14',method:['RR','CI']},{t:'Provision of wellness services through Yoga and other activities',r:'CHO',aoc:'A',me:'ME A1.14',method:['SI','CI']},{t:'Provision of AYUSH services',r:'CHO',aoc:'A',me:'ME A1.14',method:['SI','RR']},{t:'Provision of counselling services for Eat Right',r:'CHO',aoc:'A',me:'ME A1.14',method:['SI','CI']},{t:'Staff is aware of process of population identification and referral for hypertension',r:'CHO',aoc:'E',me:'ME E11.1',method:['SI','RR']},{t:'CHO is  aware of sign & symptoms  of Hypertension',r:'CHO',aoc:'E',me:'ME E11.1',method:['SI']},{t:'Ayushman Arogya Mandir ensures frequency of follow up & supply of required medicines',r:'CHO',aoc:'E',me:'ME E11.1',method:['RR','CI']},{t:'Staff is aware of promotional & supportive  activities for Hypertension',r:'CHO',aoc:'E',me:'ME E11.1',method:['SI','CI']},{t:'Staff is aware of process of population identification and referral for diabetes',r:'CHO',aoc:'E',me:'ME E11.2',method:['SI','RR']},{t:'CHO is  aware of sign & symptoms  of diabetes',r:'CHO',aoc:'E',me:'ME E11.2',method:['SI']},{t:'Ayushman Arogya Mandir ensures frequency of follow up & supply of required medicines',r:'CHO',aoc:'E',me:'ME E11.2',method:['RR','CI']},{t:'Check Patient is counselled about identification & immediate management hypoglycaemia',r:'CHO',aoc:'E',me:'ME E11.2',method:['SI','CI']},{t:'Ayushman Arogya Mandir is aware of  risk factors of  Nonalcoholic fatty liver disease (NAFLD)',r:'CHO',aoc:'E',me:'ME E11.2',method:['SI','RR']},{t:'Staff is aware of promotional & supportive  activities for diabetes',r:'CHO',aoc:'E',me:'ME E11.2',method:['SI','CI']},{t:'Check cancer screening services are provided through Ayushman Arogya Mandir',r:'CHO',aoc:'E',me:'ME E11.3',method:['SI','RR']},{t:'Staff is aware about sign & symptom of cervical cancer',r:'CHO',aoc:'E',me:'ME E11.3',method:['SI']},{t:'Staff is aware about sign & symptom of Breast cancer',r:'CHO',aoc:'E',me:'ME E11.3',method:['SI']},{t:'Staff is aware about sign & symptom of Oral Cancer',r:'CHO',aoc:'E',me:'ME E11.3',method:['SI']},{t:'Check with  staff about methodology followed for  cancer screening',r:'CHO',aoc:'E',me:'ME E11.3',method:['SI','RR']},{t:'Check CHW is aware of referral centre for all types of cancer',r:'CHO',aoc:'E',me:'ME E11.3',method:['SI','RR']},{t:'Staff is aware of promotional & supportive  activities for cancers',r:'CHO',aoc:'E',me:'ME E11.3',method:['SI','CI']},{t:'Confirmation and referral of cases for Tobacco/alcohol/ substance abuse',r:'CHO',aoc:'E',me:'ME E11.4',method:['SI','RR']},{t:'Promotional & supportive  activities for Tobacco/alcohol/ substance abuse',r:'CHO',aoc:'E',me:'ME E11.4',method:['SI','RR','CI']},{t:'Check Screening & referral  locally prevalent diseases',r:'CHO',aoc:'E',me:'ME E11.4',method:['SI','CI']},{t:'Check Ayushman Arogya Mandir is providing Yoga services',r:'ASHA',aoc:'E',me:'ME E11.5',method:['SI','RR']},{t:'Check Yoga sessions are conducted regularly',r:'CHO',aoc:'E',me:'ME E11.5',method:['RR','CI']},{t:'Check counselling of mother\'s for nutrition & hygiene maintenance under Eat right',r:'CHO',aoc:'E',me:'ME E11.5',method:['SI','CI']},{t:'Check staff counsel and guide the mother\'s about household preparation of complementary feeds',r:'CHO',aoc:'E',me:'ME E11.5',method:['SI','CI']},{t:'Check Primary  health care team generate awareness  in community about balanced diet',r:'CHO',aoc:'E',me:'ME E11.5',method:['SI','CI']},{t:'Check Primary  health care team generate awareness  in community about food fortification',r:'CHO',aoc:'E',me:'ME E11.5',method:['SI','CI']},{t:'Check Primary  health care team generate awareness  in community about Eat safe practices',r:'CHO',aoc:'E',me:'ME E11.5',method:['SI','CI']},{t:'Check Primary  health care team generate awareness  in community about food safety',r:'CHO',aoc:'E',me:'ME E11.5',method:['SI','CI']}]},{day:7,aoc:'AE',service:'Drugs & Diagnostics',title:'Drugs & Diagnostics — Availability & Clinical Quality',task:'Assess Drugs & Diagnostics services — verify availability (AoC A) and clinical quality (AoC E).',me:'ME A1 | ME E',aocTags:['AoC A — Service Provision','AoC E — Clinical Services'],methods:['RR','CI','SI'],roles:{prime:'CHO',support:['ANM','ASHA']},cps:[{t:'Availability of basic diagnostic services including NHP',r:'ANM',aoc:'A',me:'ME A2.1',method:['RR','CI']},{t:'Linkages with the Central diagnostic units (Hub & spoke)',r:'ANM',aoc:'A',me:'ME A2.1',method:['SI','RR']},{t:'Availability of drugs as per EDL',r:'CHO',aoc:'A',me:'ME A2.2',method:['SI','RR']},{t:'Availability of drugs for refill for chronic cases',r:'CHO',aoc:'A',me:'ME A2.2',method:['SI','RR']}]},{day:8,aoc:'AE',service:'Emergency',title:'Emergency — Availability & Clinical Quality',task:'Assess Emergency services — verify availability (AoC A) and clinical quality (AoC E).',me:'ME A1 | ME E',aocTags:['AoC A — Service Provision','AoC E — Clinical Services'],methods:['SI','RR','CI','OB'],roles:{prime:'CHO',support:['ANM','ASHA']},cps:[{t:'Availability of services for Medical Emergencies including trauma & burns',r:'CHO',aoc:'A',me:'ME A1.12',method:['SI','RR']},{t:'Emergency protocols for first aid and stabilization are available',r:'CHO',aoc:'E',me:'ME E 7.1',method:['SI','RR']},{t:'Staff is aware of  procedure for CPR',r:'CHO',aoc:'E',me:'ME E 7.1',method:['SI','RR']},{t:'Ayushman Arogya Mandir ensures timely availability of ambulances services for emergency cases',r:'CHO',aoc:'E',me:'ME E 7.1',method:['RR','CI']},{t:'Emergency care is given in case of disaster',r:'CHO',aoc:'E',me:'ME E 7.2',method:['SI','OB']},{t:'Staff is aware of  process of sorting the patients in case of mass causalty/ outbreak',r:'CHO',aoc:'E',me:'ME E 7.2',method:['SI','RR']}]},{day:9,aoc:'AE',service:'Care of Common Ophthalmic and ENT',title:'Care of Common Ophthalmic and ENT — Availability & Clinical Quality',task:'Assess Care of Common Ophthalmic and ENT services — verify availability (AoC A) and clinical quality (AoC E).',me:'ME A1 | ME E',aocTags:['AoC A — Service Provision','AoC E — Clinical Services'],methods:['SI','RR','CI','OB'],roles:{prime:'CHO',support:['ANM','ASHA']},cps:[{t:'Availability of  Ophthalmic  Services',r:'CHO',aoc:'A',me:'ME A1.8',method:['SI','RR']},{t:'Preventive & promotive services under for Ophthalmic',r:'CHO',aoc:'A',me:'ME A1.8',method:['SI','CI']},{t:'Availability of  ENT Services',r:'CHO',aoc:'A',me:'ME A1.9',method:['SI','RR']},{t:'Preventive & promotive services under for ENT',r:'CHO',aoc:'A',me:'ME A1.9',method:['SI','CI']},{t:'Staff screen & refer cases of common ophthalmic aliments  lead to blindness & refractive errors',r:'CHO',aoc:'E',me:'ME E8.1',method:['SI','RR']},{t:'Staff is aware of identification & primary management common ophthalmic conditions including emergencies',r:'CHO',aoc:'E',me:'ME E8.1',method:['SI','RR','OB']},{t:'Staff is aware of  methods for measuring the refractive errors',r:'CHO',aoc:'E',me:'ME E8.1',method:['SI','RR']},{t:'Staff maintain records under ophthalmic care',r:'CHO',aoc:'E',me:'ME E8.1',method:['SI','RR']},{t:'Promotion & supportive activities for ophthalmic care',r:'CHO',aoc:'E',me:'ME E8.1',method:['RR','CI']},{t:'Screening of population for ENT aliments',r:'CHO',aoc:'E',me:'ME E8.2',method:['SI','RR']},{t:'Identification & primary management of common ear problems',r:'CHO',aoc:'E',me:'ME E8.2',method:['SI','RR']},{t:'Staff is trained & using diagnostic tools for identification of ear problems',r:'CHO',aoc:'E',me:'ME E8.2',method:['RR','OB']},{t:'Identification & management of nose problem',r:'CHO',aoc:'E',me:'ME E8.2',method:['RR','OB']},{t:'Staff is trained & using diagnostic tools for identification of Nose aliments',r:'CHO',aoc:'E',me:'ME E8.2',method:['SI','OB']},{t:'Identification & primary management  of throat aliments',r:'CHO',aoc:'E',me:'ME E8.2',method:['SI','RR']},{t:'Check staff is trained & able to  perform Heimlich manoeuvre/ dislodge obstruction from windpipe',r:'CHO',aoc:'E',me:'ME E8.2',method:['SI','RR']},{t:'Staff is trained to identify ENT aliments require referral to higher centre',r:'CHO',aoc:'E',me:'ME E8.2',method:['SI','RR']},{t:'Promotion & supportive activities for ENT',r:'CHO',aoc:'E',me:'ME E8.2',method:['SI','RR','CI']}]},{day:10,aoc:'AE',service:'Oral Health Care',title:'Oral Health Care — Availability & Clinical Quality',task:'Assess Oral Health Care services — verify availability (AoC A) and clinical quality (AoC E).',me:'ME A1 | ME E',aocTags:['AoC A — Service Provision','AoC E — Clinical Services'],methods:['SI','RR','CI'],roles:{prime:'CHO',support:['ANM','ASHA']},cps:[{t:'Availability of  early identification & referral services for oral Health conditions',r:'CHO',aoc:'A',me:'ME A1.10',method:['SI','RR']},{t:'Availability of  symptomatic management & referral services for oral Health conditions',r:'CHO',aoc:'A',me:'ME A1.10',method:['SI','RR']},{t:'Preventive & promotive services under oral health',r:'CHO',aoc:'A',me:'ME A1.10',method:['SI','CI']},{t:'Staff is aware about Oral health conditions, primary management & referral',r:'CHO',aoc:'E',me:'ME E8.3',method:['SI']},{t:'Staff is aware of symptomatic  treatment for dental emergencies',r:'CHO',aoc:'E',me:'ME E8.3',method:['SI','RR']},{t:'Screening of oral health conditions is done as per protocol',r:'CHO',aoc:'E',me:'ME E8.3',method:['SI','RR']},{t:'Promotion & supportive activities for oral health',r:'CHO',aoc:'E',me:'ME E8.3',method:['SI','CI']}]},{day:11,aoc:'AE',service:'Mental Health',title:'Mental Health — Availability & Clinical Quality',task:'Assess Mental Health services — verify availability (AoC A) and clinical quality (AoC E).',me:'ME A1 | ME E',aocTags:['AoC A — Service Provision','AoC E — Clinical Services'],methods:['SI','RR','CI'],roles:{prime:'CHO',support:['ANM','ASHA']},cps:[{t:'Availability of services for mental health',r:'CHO',aoc:'A',me:'ME A1.13',method:['SI','RR']},{t:'Preventive & promotive services under mental health',r:'CHO',aoc:'A',me:'ME A1.13',method:['SI','CI']},{t:'Check staff is aware of MNS (Mental, neurological & substance use)  conditions',r:'CHO',aoc:'E',me:'ME E9.1',method:['SI','RR']},{t:'Check Staff  uses specific  tools for early identification & screening of MNS',r:'ASHA',aoc:'E',me:'ME E9.1',method:['SI','RR']},{t:'Staff is competent for basic management, referral & follow up of MNS',r:'CHO',aoc:'E',me:'ME E9.1',method:['SI','RR']},{t:'Check staff is trained for emergency management of  Epilepsy',r:'CHO',aoc:'E',me:'ME E9.1',method:['SI','RR']},{t:'Promotion & supportive activities for mental health',r:'CHO',aoc:'E',me:'ME E9.1',method:['SI','CI']}]},{day:12,aoc:'AE',service:'Elderly & Pallative Care',title:'Elderly & Pallative Care — Availability & Clinical Quality',task:'Assess Elderly & Pallative Care services — verify availability (AoC A) and clinical quality (AoC E).',me:'ME A1 | ME E',aocTags:['AoC A — Service Provision','AoC E — Clinical Services'],methods:['SI','RR','OB','CI'],roles:{prime:'CHO',support:['ANM','ASHA']},cps:[{t:'Availability of services for elderly care',r:'CHO',aoc:'A',me:'ME A1.11',method:['SI','RR']},{t:'Availability of services for palliative care',r:'CHO',aoc:'A',me:'ME A1.11',method:['SI','RR']},{t:'Elderly population is mapped & screened',r:'CHO',aoc:'E',me:'ME E12.1',method:['SI','RR']},{t:'CHO is aware &  competent to use various geriatric tools',r:'CHO',aoc:'E',me:'ME E12.1',method:['RR','OB']},{t:'Ayushman Arogya Mandir ­undertake preliminary assessment for the need of assistive devices',r:'CHO',aoc:'E',me:'ME E12.1',method:['RR']},{t:'Promotional & supportive activities for Geriatric care',r:'CHO',aoc:'E',me:'ME E12.1',method:['SI','CI']},{t:'Screening, basic management & referral  of Palliative Care patient is done',r:'CHO',aoc:'E',me:'ME E12.2',method:['RR','CI']},{t:'Home based palliative care services are being provided',r:'CHO',aoc:'E',me:'ME E12.2',method:['SI','RR']},{t:'Check Home care kit is available & case sheet are  updated',r:'CHO',aoc:'E',me:'ME E12.2',method:['SI','RR']},{t:'Check patient support groups are available',r:'CHO',aoc:'E',me:'ME E12.2',method:['SI','RR']},{t:'Promotional & supportive activities for palliative care',r:'CHO',aoc:'E',me:'ME E12.2',method:['SI','CI']}]},{day:13,aoc:'B',service:'Patient Rights',title:'Patient Rights, Dignity & Consent',task:'Verify patient rights charter, informed consent, privacy, and dignity.',me:'ME B1 | ME B2',aocTags:['AoC B — Patient Rights'],methods:['SI','OB','CI'],roles:{prime:'CHO',support:['ANM']},cps:[{t:'Name of the facility & list of services and drugs available are displayed prominently',r:'OB',aoc:'B',me:'ME B1.1',method:['OB']},{t:'Branding of Ayushman Arogya Mandir is done as per guidelines',r:'OB',aoc:'B',me:'ME B1.1',method:['OB']},{t:'Name of AAM is written in regional language',r:'OB',aoc:'B',me:'ME B1.1',method:['SI','OB']},{t:'Citizen charter is displayed',r:'OB',aoc:'B',me:'ME B1.1',method:['OB']},{t:'IEC Material is displayed as per services provided',r:'OB',aoc:'B',me:'ME B1.2',method:['OB']},{t:'Ayushman Arogya Mandir promotes wellness through EAT right campaign',r:'OB',aoc:'B',me:'ME B1.2',method:['CI','OB']},{t:'Patient is informed about clinical condition and treatment plan',r:'CI',aoc:'B',me:'ME B1.3',method:['RR','CI']},{t:'Primary healthcare team  provide information to beneficiaries or families regarding their entitlements',r:'CHO',aoc:'B',me:'ME B1.3',method:['SI','CI']},{t:'Ayushman Arogya Mandir is located closer to community',r:'CHO',aoc:'B',me:'ME B2.1',method:['SI','CI']},{t:'Check outreach sessions are conducted',r:'CHO',aoc:'B',me:'ME B2.1',method:['SI','RR']},{t:'The full range of services are available for the time period, as mandated',r:'CHO',aoc:'B',me:'ME B2.1',method:['RR','CI']},{t:'Check Ayushman Arogya Mandir premises is free from any physical barrier',r:'OB',aoc:'B',me:'ME B2.2',method:['OB']},{t:'Check Ayushman Arogya Mandir premises is obstacle free for ambulatory and semi ambulatory individuals',r:'OB',aoc:'B',me:'ME B2.2',method:['OB']}]},{day:14,aoc:'B',service:'Patient Rights',title:'Equity, Feedback & Non-Discrimination',task:'Verify non-discrimination in services, feedback system, and complaint resolution.',me:'ME B2 | ME B3',aocTags:['AoC B — Patient Rights'],methods:['CI','SI','RR'],roles:{prime:'CHO',support:['ANM']},cps:[{t:'Check for special precaution is taken for maintaining privacy  & confidentiality of cases having social stigma',r:'CHO',aoc:'B',me:'ME B2.3',method:['SI','RR']},{t:'Availability of female staff / attendant, if a male CHO examines a female patients',r:'CHO',aoc:'B',me:'ME B3.1',method:['SI','CI']},{t:'There is no discrimination based religion, ethnicity, socio economic status, cast, gender & language etc',r:'CI',aoc:'B',me:'ME B3.1',method:['SI','RR']},{t:'Check Staff and Communities is aware of Patient rights and responsibilities',r:'OB',aoc:'B',me:'ME B3.2',method:['SI','OB']},{t:'Check staff & community is aware of grievance redressal system',r:'CHO',aoc:'B',me:'ME B3.3',method:['SI','CI']},{t:'Availability of  complaint reporting system',r:'OB',aoc:'B',me:'ME B3.3',method:['RR','OB']},{t:'Availability of screen/ curtains in examination area and in windows',r:'OB',aoc:'B',me:'ME B4.1',method:['OB']},{t:'Patient records are kept in safe custody',r:'OB',aoc:'B',me:'ME B4.2',method:['SI','OB']},{t:'Check patient and their kin\'s have access to clinical records',r:'CHO',aoc:'B',me:'ME B4.2',method:['SI','RR']},{t:'Behaviour of staff is empathetic and courteous to patients and visitors',r:'CI',aoc:'B',me:'ME B4.3',method:['CI']},{t:'Ayushman Arogya Mandir provide free of cost  access to all the services',r:'CHO',aoc:'B',me:'ME B5.1',method:['RR','CI']},{t:'The facility provides free of cost essential medicines and refills as per treatment plan',r:'CHO',aoc:'B',me:'ME B5.1',method:['SI','CI']},{t:'Availability of free teleconsultation and diagnostic services',r:'CHO',aoc:'B',me:'ME B5.1',method:['SI','CI']}]},{day:15,aoc:'C',service:'Human Resources',title:'Human Resources & Attendance',task:'Verify all sanctioned positions filled, attendance registers, and training records.',me:'ME C1',aocTags:['AoC C — Inputs'],methods:['RR','SI'],roles:{prime:'CHO',support:['ANM']},cps:[{t:'Well ventilated & illuminated clinic room with examination space',r:'OB',aoc:'C',me:'ME C1.1',method:['OB']},{t:'Availability of adequate patient amentities',r:'OB',aoc:'C',me:'ME C1.1',method:['OB']},{t:'Demarcated space for Laboratory / diagnostics, drug storage',r:'OB',aoc:'C',me:'ME C1.1',method:['OB']},{t:'Adequate space/ room for Yoga and immunization activities',r:'OB',aoc:'C',me:'ME C1.1',method:['OB']},{t:'Availability of regular &  uninterrupted electricity supply',r:'OB',aoc:'C',me:'ME C1.1',method:['SI','OB']},{t:'Adequate water supply with storage facility',r:'OB',aoc:'C',me:'ME C1.1',method:['SI','OB']},{t:'Availability of separate room for delivery with required amenities',r:'CHO',aoc:'C',me:'ME C1.1',method:['OB']},{t:'Ayushman Arogya Mandir has installed fire  extinguisher and staff know how to operate it',r:'OB',aoc:'C',me:'ME C1.2',method:['SI','OB']},{t:'Ayushman Arogya Mandir does not have temporary connections and loosely hanging wires',r:'OB',aoc:'C',me:'ME C1.2',method:['SI','OB']},{t:'Ayushman Arogya Mandir has adequate ICT hardware  for  efficient delivery of services',r:'CHO',aoc:'C',me:'ME C1.3',method:['SI','RR']},{t:'Ayushman Arogya Mandir has adequate ICT software  for  efficient delivery of services',r:'CHO',aoc:'C',me:'ME C1.3',method:['SI','RR']},{t:'Availability of Community Health Officer',r:'CHO',aoc:'C',me:'ME C2.1',method:['SI','RR']},{t:'Availability of ANM',r:'CHO',aoc:'C',me:'ME C2.2',method:['SI','RR']},{t:'Availability of Multipurpose Worker',r:'CHO',aoc:'C',me:'ME C2.2',method:['SI','RR']},{t:'Availability of ASHA & ASHA facilitator',r:'CHO',aoc:'C',me:'ME C2.2',method:['SI','RR']},{t:'Check duty roster is prepared prepared, updated & followed for all cadres',r:'CHO',aoc:'C',me:'ME C2.3',method:['RR']},{t:'Check field visit plans are prepared, updated & followed by primary healthcare team',r:'CHO',aoc:'C',me:'ME C2.3',method:['RR']},{t:'Check parameters for assessing skills and proficiency of  staff has been defined',r:'CHO',aoc:'C',me:'ME C3.1',method:['SI','RR']},{t:'Check for performance evaluation is done at least once in a year',r:'CHO',aoc:'C',me:'ME C3.1',method:['SI','RR']},{t:'CHO is trained as per mandate',r:'CHO',aoc:'C',me:'ME C3.2',method:['SI','RR']}]},{day:16,aoc:'C',service:'Drugs & Equipment',title:'Drugs, Equipment & Diagnostics',task:'Inspect drug availability, expiry, storage, equipment calibration, and diagnostic services.',me:'ME C2 | ME C3',aocTags:['AoC C — Inputs'],methods:['OB','RR'],roles:{prime:'ANM',support:['CHO']},cps:[{t:'MPW is trained as per mandate',r:'MPW',aoc:'C',me:'ME C3.2',method:['SI','RR']},{t:'AHSA  is trained as per mandate',r:'ASHA',aoc:'C',me:'ME C3.2',method:['SI','RR']},{t:'Staff is provided with Quality assurance training',r:'CHO',aoc:'C',me:'ME C3.2',method:['SI','RR']},{t:'Availability of disposables for Dressing / Emergency management',r:'OB',aoc:'C',me:'ME C4.2',method:['RR','OB']},{t:'Availability of disposables at Clinics',r:'OB',aoc:'C',me:'ME C4.2',method:['RR','OB']},{t:'Availability of functional Equipment & instruments  for examination & Monitoring  at Clinic',r:'OB',aoc:'C',me:'ME C5.1',method:['OB']},{t:'Availability of functional Equipment & instruments  for ENT services',r:'OB',aoc:'C',me:'ME C5.1',method:['OB']},{t:'Availability of functional equipment &  instruments for normal delivery services',r:'CHO',aoc:'C',me:'ME C5.1',method:['OB']},{t:'Availability of furniture & fixture at Clinics',r:'OB',aoc:'C',me:'ME C5.2',method:['OB']},{t:'Availability of Anaesthetics agents',r:'CHO',aoc:'C',me:'ME C4.1',method:['RR','OB']},{t:'Availability of  Analgesics, Anti Pyretic, NSAIDS, and Anti-allergic',r:'CHO',aoc:'C',me:'ME C4.1',method:['RR','OB']},{t:'Availability on Anticonvulsants /Anti epileptics',r:'CHO',aoc:'C',me:'ME C4.1',method:['RR','OB']},{t:'Availability of Intestinal Anti Helminthes and Antifilarial',r:'CHO',aoc:'C',me:'ME C4.1',method:['RR','OB']},{t:'Availability of Anti Bacterial',r:'CHO',aoc:'C',me:'ME C4.1',method:['RR','OB']},{t:'Availability of Anti leprosy',r:'CHO',aoc:'C',me:'ME C4.1',method:['RR','OB']},{t:'Availability of Anti Malarial',r:'CHO',aoc:'C',me:'ME C4.1',method:['RR','OB']},{t:'Availability of anti Anaemic drug',r:'CHO',aoc:'C',me:'ME C4.1',method:['RR','OB']},{t:'Availability of drugs for Palliative care',r:'CHO',aoc:'C',me:'ME C4.1',method:['RR','OB']},{t:'Availability of Cardiovascular medicines',r:'CHO',aoc:'C',me:'ME C4.1',method:['RR','OB']},{t:'Availability of drugs for Hypertension',r:'CHO',aoc:'C',me:'ME C4.1',method:['RR','OB']}]},{day:17,aoc:'C',service:'Infrastructure',title:'Infrastructure, WASH & Safety',task:'Inspect SC building, water, sanitation, electricity, waste disposal, and fire safety.',me:'ME C4 | ME C5',aocTags:['AoC C — Inputs'],methods:['OB'],roles:{prime:'CHO',support:['ANM']},cps:[{t:'Availability of drugs for Hypolipidemic',r:'CHO',aoc:'C',me:'ME C4.1',method:['RR','OB']},{t:'Availability of Dermatological & antifungal  Medicines',r:'CHO',aoc:'C',me:'ME C4.1',method:['RR','OB']},{t:'Availability of Diuretics',r:'CHO',aoc:'C',me:'ME C4.1',method:['RR','OB']},{t:'Availability of Drugs for dementia',r:'CHO',aoc:'C',me:'ME C4.1',method:['RR','OB']},{t:'Availability of Eye drugs',r:'CHO',aoc:'C',me:'ME C4.1',method:['RR','OB']},{t:'Availability of ENT drugs',r:'CHO',aoc:'C',me:'ME C4.1',method:['RR','OB']},{t:'Availability of Gastroinstinal medicines',r:'CHO',aoc:'C',me:'ME C4.1',method:['RR','OB']},{t:'Availability of Contraceptives',r:'CHO',aoc:'C',me:'ME C4.1',method:['RR','OB']},{t:'Availability of drugs for diabetes Mellitus',r:'CHO',aoc:'C',me:'ME C4.1',method:['RR','OB']},{t:'Availability of drugs for Thyroid',r:'CHO',aoc:'C',me:'ME C4.1',method:['RR','OB']},{t:'Availability of Oxytocin and Antioxytocics',r:'CHO',aoc:'C',me:'ME C4.1',method:['RR','OB']},{t:'Availability of medicines for Tespiratory tract',r:'CHO',aoc:'C',me:'ME C4.1',method:['RR','OB']},{t:'Availability of IV Fluids',r:'CHO',aoc:'C',me:'ME C4.1',method:['RR','OB']},{t:'Availability of Vitamins and Minerals',r:'CHO',aoc:'C',me:'ME C4.1',method:['RR','OB']},{t:'Availability of Antidotes',r:'CHO',aoc:'C',me:'ME C4.1',method:['RR','OB']},{t:'Availability of injectables and antispetics',r:'CHO',aoc:'C',me:'ME C4.1',method:['RR','OB']},{t:'Availability of Emergency Drug Tray / injectables at injection room',r:'CHO',aoc:'C',me:'ME C4.1',method:['OB']},{t:'Availability of drugs for oral health',r:'CHO',aoc:'C',me:'ME C4.1',method:['RR','OB']},{t:'Availability of  Rapid Diagnostic Kits',r:'OB',aoc:'C',me:'ME C4.2',method:['RR','OB']},{t:'Availability of Drugs and Consumables for  VHNDs or camps',r:'OB',aoc:'C',me:'ME C4.2',method:['RR','OB']}]},{day:18,aoc:'D',service:'BMW & Housekeeping',title:'Biomedical Waste & Housekeeping',task:'Inspect BMW segregation, disposal, and SC cleanliness.',me:'ME D1 | ME D2',aocTags:['AoC D — Support Services'],methods:['OB','RR','SI'],roles:{prime:'CHO',support:['ANM']},cps:[{t:'Ayushman Arogya Mandir Building is painted/whitewashed in uniform colour & its branding done as per the guideline',r:'OB',aoc:'D',me:'ME D1.1',method:['OB']},{t:'Check building & its premises is well maintained',r:'OB',aoc:'D',me:'ME D1.1',method:['OB']},{t:'No condemned/Junk material in Ayushman Arogya Mandir (corridors, roof,  administrative area , backyard)',r:'CHO',aoc:'D',me:'ME D1.1',method:['RR','OB']},{t:'There is system of timely corrective & preventive   break down maintenance of the equipment',r:'CHO',aoc:'D',me:'ME D1.1',method:['RR']},{t:'All the measuring equipment/ instrument  are calibrated',r:'CHO',aoc:'D',me:'ME D1.1',method:['RR']},{t:'Check all the areas are clean & hygienic',r:'OB',aoc:'D',me:'ME D1.2',method:['OB']},{t:'Check availability of adequate supply of cleaning material',r:'OB',aoc:'D',me:'ME D1.2',method:['RR','OB']},{t:'Check staff is aware of use of 2 bucket system & disinfection of mop after cleaning',r:'ANM',aoc:'D',me:'ME D1.2',method:['SI','OB']},{t:'Clean and adequate linen is available',r:'ANM',aoc:'D',me:'ME D1.2',method:['RR','OB']},{t:'Information regarding  illness and minor aliments are recorded & updated using IT platform',r:'CHO',aoc:'D',me:'ME D3.1',method:['SI','RR']},{t:'Information regarding RMNCHA care seekers are recorded & updated using IT platform',r:'CHO',aoc:'D',me:'ME D3.1',method:['RR']},{t:'Information regarding cases of  communicable & Non- communicable  diseases  are recorded & updated using IT platform',r:'CHO',aoc:'D',me:'ME D3.1',method:['RR']},{t:'Functional platform/s and updated digital records   to assess the coverage and measure outcomes of healthcare facility',r:'CHO',aoc:'D',me:'ME D3.1',method:['RR']},{t:'Functional platform/s and updated digital records for work/ task management and reporting and monitoring of the  performance of health care provider',r:'CHO',aoc:'D',me:'ME D3.1',method:['RR']},{t:'Ayushman Arogya Mandir has established  procedure for safe keeping & retrieval of  paper based records',r:'OB',aoc:'D',me:'ME D3.2',method:['SI','OB']},{t:'Ayushman Arogya Mandir has established procedure for access & retrieval of  electronic records',r:'ANM',aoc:'D',me:'ME D3.2',method:['SI','OB']},{t:'Hubs are identified for tele consultation',r:'CHO',aoc:'D',me:'ME D3.3',method:['RR','OB']},{t:'Cases are identified for tele consultation for specialist & non specialist consultation',r:'CHO',aoc:'D',me:'ME D3.3',method:['SI','RR']}]},{day:19,aoc:'D',service:'Sterilisation',title:'Sterilisation, Linen & Referral Transport',task:'Verify sterilisation procedures, linen management, and referral transport linkages.',me:'ME D3 | ME D4',aocTags:['AoC D — Support Services'],methods:['OB','RR'],roles:{prime:'ANM',support:['CHO']},cps:[{t:'Co ordination with specialist / super specialist and patients for tele consultation',r:'CHO',aoc:'D',me:'ME D3.3',method:['SI','RR']},{t:'Dispense drugs as per prescription received through tele consultation',r:'CHO',aoc:'D',me:'ME D3.3',method:['RR']},{t:'Ayushman Arogya Mandir has functional  Jan Arogya  Samiti',r:'CHO',aoc:'D',me:'ME D4.1',method:['SI','RR']},{t:'Committee members are aware of its roles & responsibilities',r:'CHO',aoc:'D',me:'ME D4.1',method:['SI','RR','CI']},{t:'JAS  meetings are held at defined intervals',r:'CHO',aoc:'D',me:'ME D4.1',method:['RR']},{t:'Timely planning & utilization of untied funds',r:'CHO',aoc:'D',me:'ME D4.1',method:['RR']},{t:'Check JAS   provide support for Health promotion & prevention activities',r:'ANM',aoc:'D',me:'ME D4.1',method:['SI','RR']},{t:'Check social accountability mechanism are place and conducted at periodic intervals.',r:'CHO',aoc:'D',me:'ME D4.2',method:['RR']},{t:'Check JAS committee has prepared action plan along with Ayushman Arogya Mandir',r:'CHO',aoc:'D',me:'ME D4.2',method:['RR']},{t:'Check CHO conducts periodic meetings with MPW & ASHA',r:'MPW',aoc:'D',me:'ME D4.3',method:['SI','RR']},{t:'Check CHO provide  on job mentoring & supervision for VHSND or  campaign and household visits',r:'ANM',aoc:'D',me:'ME D4.3',method:['SI','RR']},{t:'Check PHC -MO provide supportive supervision  & monitoring for Ayushman Arogya Mandir activities',r:'CHO',aoc:'D',me:'ME D4.3',method:['SI','RR']},{t:'Check Ayushman Arogya Mandir is aware of community level approaches for health promotion and disease  prevention',r:'ANM',aoc:'D',me:'ME D5.1',method:['SI','CI']},{t:'Check VHSNC are constituted & functional',r:'CHO',aoc:'D',me:'ME D5.1',method:['SI','RR']},{t:'Check number of VHND planned & conducted in CHO\'s catering area in preceding quarter',r:'CHO',aoc:'D',me:'ME D5.1',method:['RR','CI']},{t:'Check the process followed to identify key challenges and list of priorities for monthly campaigns',r:'ASHA',aoc:'D',me:'ME D5.1',method:['SI','RR']},{t:'Check Annual calendar is prepared for monthly campaign  based on situational analysis',r:'CHO',aoc:'D',me:'ME D5.1',method:['RR']},{t:'Check health promotion campaign  are conducted as per planning',r:'CHO',aoc:'D',me:'ME D5.1',method:['RR']}]},{day:20,aoc:'D',service:'Records & MIS',title:'Records, MIS & HMIS Reporting',task:'Review all SC registers and HMIS reporting for completeness, accuracy, and timely submission.',me:'ME D5',aocTags:['AoC D — Support Services'],methods:['RR','SI'],roles:{prime:'ANM',support:['CHO']},cps:[{t:'There is a system of taking feedback  from ASHAs / VHNSCs/ VHND to improve the services',r:'ASHA',aoc:'D',me:'ME D5.1',method:['SI','RR']},{t:'Ayushman Arogya Mandir have created Patient support groups for  various issues/ disease conditions',r:'CI',aoc:'D',me:'ME D5.2',method:['RR','CI']},{t:'Check members of PSGs aware of their roles',r:'CI',aoc:'D',me:'ME D5.2',method:['SI','CI']},{t:'Check the  frequency , location & timing of PSG meetings facilitated by Ayushman Arogya Mandir',r:'CI',aoc:'D',me:'ME D5.2',method:['RR','CI']},{t:'Primary health care team/worker is aware of their role in conducting PSGs',r:'CI',aoc:'D',me:'ME D5.2',method:['SI']},{t:'Ayushman Arogya Mandir engage other allied departments for intersectoral convergence',r:'CHO',aoc:'D',me:'ME D5.3',method:['SI','RR']},{t:'Ayushman Arogya Mandir promotes wellness & health promotion through Yoga',r:'CHO',aoc:'D',me:'ME D5.3',method:['SI','RR']},{t:'Authorization for Bio Medical waste Management  and latest copy of regulation is available',r:'CHO',aoc:'D',me:'ME D6.1',method:['RR']},{t:'No Smoking sign is displayed at the prominent places',r:'OB',aoc:'D',me:'ME D6.1',method:['OB']},{t:'Any positive report of notifiable disease is intimated to designated authorities',r:'CHO',aoc:'D',me:'ME D6.1',method:['RR']},{t:'Ayushman Arogya Mandir  has a process to consolidate and calculate the consumption',r:'CHO',aoc:'D',me:'ME D2.1',method:['SI','RR']},{t:'Check Drugs and consumables forecasting  and indenting is IT enabled',r:'CHO',aoc:'D',me:'ME D2.1',method:['RR']},{t:'Check there is established system to timely indent the drugs as per services package',r:'CHO',aoc:'D',me:'ME D2.1',method:['SI','RR']},{t:'Check there is no stock out of essential & vital drugs',r:'CHO',aoc:'D',me:'ME D2.1',method:['RR']},{t:'There is specified place to store medicines in Ayushman Arogya Mandir',r:'OB',aoc:'D',me:'ME D2.2',method:['OB']},{t:'Check drugs are kept in  racks and shelves with proper  labelling',r:'OB',aoc:'D',me:'ME D2.2',method:['OB']},{t:'Check process followed to maintain the temperature of  refrigerator used for drugs/ vaccine/ lab kits',r:'OB',aoc:'D',me:'ME D2.2',method:['RR','OB']},{t:'There is system in place to maintain expiry & near expiry of drugs',r:'CHO',aoc:'D',me:'ME D2.3',method:['SI','OB']},{t:'No expired drug is found in Ayushman Arogya Mandir',r:'CHO',aoc:'D',me:'ME D2.3',method:['OB']}]},{day:21,aoc:'Boss',service:'Boss Battle',title:'⚔️ BOSS BATTLE I — Mid-Programme Mock Assessment',task:'⚔️ Full self-audit of all Areas of Concern. Score each area honestly and prepare gap closure plan.',me:'All MEs',aocTags:['All Areas of Concern'],methods:['SI','RR','OB','CI'],roles:{prime:'CHO',support:['ANM','ASHA']},isBoss:true,cps:[{t:'AoC A (Service Provision) — self-audit complete',r:'CHO',aoc:'Boss',me:'',method:['SI']},{t:'AoC B (Patient Rights) — self-audit complete',r:'CHO',aoc:'Boss',me:'',method:['CI']},{t:'AoC C (Inputs) — self-audit complete',r:'CHO',aoc:'Boss',me:'',method:['OB']},{t:'AoC D (Support Services) — self-audit complete',r:'CHO',aoc:'Boss',me:'',method:['OB']},{t:'AoC E (Clinical Services) — self-audit complete',r:'CHO',aoc:'Boss',me:'',method:['SI']},{t:'AoC F (Infection Control) — self-audit complete',r:'CHO',aoc:'Boss',me:'',method:['OB']},{t:'AoC G (Quality Management) — self-audit complete',r:'CHO',aoc:'Boss',me:'',method:['RR']},{t:'AoC H (Outcome) — reviewed and documented',r:'CHO',aoc:'Boss',me:'',method:['RR']},{t:'Top gaps identified — corrective action plan prepared',r:'CHO',aoc:'Boss',me:'',method:['RR']},{t:'Block/PHC supervisor informed of readiness status',r:'CHO',aoc:'Boss',me:'',method:['SI']}]},{day:22,aoc:'F',service:'Hand Hygiene',title:'Hand Hygiene, PPE & Standard Precautions',task:'Observe hand hygiene practices, PPE use, needle disposal, and standard precautions.',me:'ME F1 | ME F2',aocTags:['AoC F — Infection Control'],methods:['OB','SI'],roles:{prime:'CHO',support:['ANM']},cps:[{t:'Staff is working as team to improve sanitation & hygiene of the facility',r:'CHO',aoc:'F',me:'ME F1.1',method:['SI','RR']},{t:'Check Records of Medical Check-up and Immunization',r:'CHO',aoc:'F',me:'ME F1.1',method:['RR']},{t:'Facility  has a system to monitor cleanliness & hygiene  practices',r:'OB',aoc:'F',me:'ME F1.1',method:['RR','OB']},{t:'Availability of Hand washing facilities',r:'OB',aoc:'F',me:'ME F2.1',method:['OB']},{t:'Check  Washbasin, tap & running water as per standard protocols',r:'OB',aoc:'F',me:'ME F2.1',method:['SI','OB']},{t:'Staff is trained and adheres to hand washing practices',r:'CHO',aoc:'F',me:'ME F2.1',method:['SI','OB']},{t:'Check availability & use of  PPE',r:'OB',aoc:'F',me:'ME F3.1',method:['RR','OB']},{t:'Compliance to correct method of wearing and removing PPE',r:'CHO',aoc:'F',me:'ME F3.1',method:['SI','OB']},{t:'Adequate supply of decontamination  and cleaning agents  at the point of use',r:'OB',aoc:'F',me:'ME F4.1',method:['RR','OB']},{t:'Decontamination and cleaning of instruments and surfaces',r:'ANM',aoc:'F',me:'ME F4.1',method:['SI','OB']},{t:'Availability of disinfectants',r:'OB',aoc:'F',me:'ME F4.2',method:['RR','OB']},{t:'Staff adhere to the process of disinfection',r:'ANM',aoc:'F',me:'ME F4.2',method:['SI','RR']},{t:'Sterilization/HLD records are maintained',r:'CHO',aoc:'F',me:'ME F4.2',method:['RR']}]},{day:23,aoc:'F',service:'Sterilisation',title:'Antisepsis, Sterilisation & HAI Prevention',task:'Inspect antisepsis, sterilisation practices, surface disinfection, and HAI prevention.',me:'ME F3 | ME F4',aocTags:['AoC F — Infection Control'],methods:['OB','RR'],roles:{prime:'ANM',support:['CHO']},cps:[{t:'Availability of colour coded bins and non chlorinated plastic bags and needle cutters  at point of waste generation',r:'OB',aoc:'F',me:'ME F5.1',method:['SI','OB']},{t:'Segregation of BMW is done as per latest prevalent rules',r:'OB',aoc:'F',me:'ME F5.1',method:['SI','OB']},{t:'Check there is no mixing of the Biomedical & general waste',r:'OB',aoc:'F',me:'ME F5.1',method:['OB']},{t:'Ayushman Arogya Mandir has designated area for storage for BMW',r:'OB',aoc:'F',me:'ME F5.1',method:['SI','OB']},{t:'Disinfection of  broken / discarded Glassware   is done as per recommended procedure',r:'OB',aoc:'F',me:'ME F5.2',method:['SI','OB']},{t:'Sharp waste is stored in puncture proof container',r:'OB',aoc:'F',me:'ME F5.2',method:['SI','OB']},{t:'Check saff is aware what to do in case of exposure to injury or any blood/body fluid',r:'CHO',aoc:'F',me:'ME F5.2',method:['SI','RR']},{t:'Facility has provision for liquid waste management',r:'OB',aoc:'F',me:'ME F5.3',method:['SI','OB']},{t:'Check facility is mercury free',r:'OB',aoc:'F',me:'ME F5.3',method:['SI','OB']},{t:'Ayushman Arogya Mandir  waste is collected & transported in close container/bag',r:'CHO',aoc:'F',me:'ME F5.4',method:['RR']},{t:'Ayushman Arogya Mandir has facility for disposal of Biomedical waste',r:'CHO',aoc:'F',me:'ME F5.4',method:['RR']},{t:'Facility manages recyclable waste as per approved procedure',r:'CHO',aoc:'F',me:'ME F5.4',method:['RR']},{t:'No burning of any category of waste within/outside Ayushman Arogya Mandir',r:'OB',aoc:'F',me:'ME F5.4',method:['OB']}]},{day:24,aoc:'G',service:'QI System',title:'Quality Improvement System & SOPs',task:'Review QI meetings, SOPs, quality indicators, and KAYAKALP/5S activities.',me:'ME G1 | ME G2',aocTags:['AoC G — Quality Management'],methods:['RR','SI'],roles:{prime:'CHO',support:['ANM']},cps:[{t:'The Ayushman Arogya Mandir  has  Quality team in place',r:'CHO',aoc:'G',me:'ME G1.1',method:['RR']},{t:'Quality  team meets monthly and review its activities',r:'CHO',aoc:'G',me:'ME G1.1',method:['RR']},{t:'Review the minutes of meeting',r:'CHO',aoc:'G',me:'ME G1.1',method:['RR']},{t:'Results of Kayakalp and NQAS Internal /External assessments are reviewed',r:'CHO',aoc:'G',me:'ME G1.1',method:['RR']},{t:'Client satisfaction survey is done',r:'CHO',aoc:'G',me:'ME G2.1',method:['RR']},{t:'Analysis of low performing attributes is done and action is planned',r:'CHO',aoc:'G',me:'ME G2.1',method:['RR']},{t:'Instructions for using RDK are available',r:'CHO',aoc:'G',me:'ME G3.1',method:['RR']},{t:'Work instruction for RMNCHA services',r:'CHO',aoc:'G',me:'ME G3.1',method:['RR']},{t:'Protocols and instructions for preventing, identifying and managing AEFI are displayed at immunization site',r:'CHO',aoc:'G',me:'ME G3.1',method:['RR']},{t:'WI for screening, management and appropriate referral of NCDs',r:'CHO',aoc:'G',me:'ME G3.1',method:['RR']},{t:'WI for screening, management and appropriate referral of Communicable disease',r:'CHO',aoc:'G',me:'ME G3.1',method:['RR']},{t:'WI for screening and referral of patients with mental disorders',r:'CHO',aoc:'G',me:'ME G3.1',method:['RR']},{t:'WI for screening of common ophthalmic  problems',r:'CHO',aoc:'G',me:'ME G3.1',method:['RR']},{t:'WI for screening of  ENT problems',r:'CHO',aoc:'G',me:'ME G3.1',method:['RR']}]},{day:25,aoc:'G',service:'Patient Safety',title:'Patient Safety, Staff Training & Competency',task:'Verify patient safety systems, training records, and skill competency assessments.',me:'ME G3 | ME G4',aocTags:['AoC G — Quality Management'],methods:['OB','RR','SI'],roles:{prime:'CHO',support:['ANM','ASHA']},cps:[{t:'WI for screening of common oral  problems',r:'CHO',aoc:'G',me:'ME G3.1',method:['RR']},{t:'WI for screening of common elderly & palliative care',r:'CHO',aoc:'G',me:'ME G3.1',method:['RR']},{t:'WI for management of emergency medical services',r:'CHO',aoc:'G',me:'ME G3.1',method:['RR']},{t:'Work instruction for conducting the Normal vaginal delivery',r:'CHO',aoc:'G',me:'ME G3.1',method:['RR']},{t:'Work instruction for management of new born',r:'CHO',aoc:'G',me:'ME G3.1',method:['RR']},{t:'Service delivery and performance of Ayushman Arogya Mandir is reviewed  regularly',r:'CHO',aoc:'G',me:'ME G4.1',method:['SI','RR']},{t:'Ayushman Arogya Mandir performance is reviewed regularly by block/district/state nodal officer',r:'CHO',aoc:'G',me:'ME G4.1',method:['RR']},{t:'Check gaps have been identified and actions are taken',r:'CHO',aoc:'G',me:'ME G4.1',method:['RR']},{t:'Periodic assessment using NQAS checklist',r:'CHO',aoc:'G',me:'ME G4.2',method:['RR']},{t:'Periodic assessment using Kayakalp checklist',r:'CHO',aoc:'G',me:'ME G4.2',method:['RR']},{t:'Non Compliance found in the internal Assessment using NQAS, Kayakalp and other monitoring checklists are recorded',r:'CHO',aoc:'G',me:'ME G4.3',method:['RR']},{t:'Root cause analysis is done',r:'CHO',aoc:'G',me:'ME G4.3',method:['RR']},{t:'Ayushman Arogya Mandir team improve  on the identified non compliances & action are taken',r:'CHO',aoc:'G',me:'ME G4.3',method:['RR']},{t:'Quality policy are defined',r:'CHO',aoc:'G',me:'ME G5.1',method:['RR']},{t:'Quality objectives are defined for the Ayushman Arogya Mandir',r:'CHO',aoc:'G',me:'ME G5.1',method:['RR']}]},{day:26,aoc:'H',service:'Outcomes',title:'Health Outcomes & Patient Satisfaction',task:'Review health outcome indicators, patient satisfaction, and NQAS score improvement.',me:'ME H',aocTags:['AoC H — Outcome'],methods:['RR','CI'],roles:{prime:'CHO',support:['ANM','ASHA']},cps:[{t:'No. of Case specific OPD of pregnant mothers per month',r:'CHO',aoc:'H',me:'ME H1.1',method:['RR']},{t:'No. of follow up cases (repeat visit) per month pregnant mothers',r:'CHO',aoc:'H',me:'ME H1.1',method:['RR']},{t:'No. of  cases referred to higher centre per month (Case specific referral of pregnant mothers)',r:'CHO',aoc:'H',me:'ME H1.1',method:['RR']},{t:'No. of Normal deliveries conducted',r:'CHO',aoc:'H',me:'ME H1.1',method:['RR']},{t:'Percentage of women receiving all four ANCs',r:'CHO',aoc:'H',me:'ME H2.1',method:['RR']},{t:'No. of high risk pregnancy identified during ANC',r:'CHO',aoc:'H',me:'ME H3.1',method:['RR']},{t:'No. of Case specific OPD of neonate &  infant per month',r:'CHO',aoc:'H',me:'ME H1.1',method:['RR']},{t:'No. of follow up cases (repeat visit) per month neonate & infant',r:'CHO',aoc:'H',me:'ME H1.1',method:['RR']},{t:'No. of  cases referred to higher centre per month (Case specific referral of neonate & infant)',r:'CHO',aoc:'H',me:'ME H1.1',method:['RR']},{t:'Drop out rate for Pentavalent immunization',r:'CHO',aoc:'H',me:'ME H2.1',method:['RR']},{t:'No. of AEFI cases reported',r:'CHO',aoc:'H',me:'ME H3.1',method:['RR']},{t:'No. of Children with diarrhoea treated with ORS & Zn',r:'CHO',aoc:'H',me:'ME H3.1',method:['RR']},{t:'No. of Case specific OPD of children & adolescent per month',r:'CHO',aoc:'H',me:'ME H1.1',method:['RR']},{t:'No. of follow up cases (repeat visit) per month children & adolescent',r:'CHO',aoc:'H',me:'ME H1.1',method:['RR']},{t:'No. of  cases referred to higher centre per month (Case specific referral of children & adolescent)',r:'CHO',aoc:'H',me:'ME H1.1',method:['RR']},{t:'No. of Anaemia cases treated successfully',r:'CHO',aoc:'H',me:'ME H3.1',method:['RR']},{t:'No. of Case specific OPD of Family Planning per month',r:'CHO',aoc:'H',me:'ME H1.1',method:['RR']},{t:'No. of follow up cases (repeat visit) per month of FP',r:'CHO',aoc:'H',me:'ME H1.1',method:['RR']},{t:'No. of  cases referred to higher centre per month (Case specific referral of Femily Planning)',r:'CHO',aoc:'H',me:'ME H1.1',method:['RR']},{t:'Contraceptives acceptance rate',r:'CHO',aoc:'H',me:'ME H3.1',method:['RR']},{t:'No. of Case specific OPD of CD per month',r:'CHO',aoc:'H',me:'ME H1.1',method:['RR']},{t:'No. of follow up cases (repeat visit) per month of CD',r:'CHO',aoc:'H',me:'ME H1.1',method:['RR']},{t:'No. of  cases referred to higher centre per month (Case specific referral of Communicable Diseases)',r:'CHO',aoc:'H',me:'ME H1.1',method:['RR']},{t:'Treatment completion rate for Tuberculosis',r:'CHO',aoc:'H',me:'ME H3.1',method:['RR']},{t:'No. of Case specific OPD per month NCD (Hypertension, Diabetes & cancer)',r:'CHO',aoc:'H',me:'ME H1.1',method:['RR']},{t:'No. of  cases referred to higher centre per month NCD (Hypertension, Diabetes & cancer)',r:'CHO',aoc:'H',me:'ME H1.1',method:['RR']},{t:'No. of case specific follow up per month NCD (Hypertension, Diabetes & cancer)',r:'CHO',aoc:'H',me:'ME H1.1',method:['RR']},{t:'No. of  drop out rate cases following identification NCD (Hypertension, Diabetes & cancer)',r:'CHO',aoc:'H',me:'ME H1.1',method:['RR']},{t:'Drop out rate for NCDs',r:'CHO',aoc:'H',me:'ME H2.1',method:['RR']},{t:'Percentage of cases on treatment achieved blood pressure control',r:'CHO',aoc:'H',me:'ME H3.1',method:['RR']},{t:'Percentage of cases on treatment achieved blood sugar control',r:'CHO',aoc:'H',me:'ME H3.1',method:['RR']},{t:'Percentage of cases screened positive for cancer underwent biopsy',r:'CHO',aoc:'H',me:'ME H3.1',method:['RR']},{t:'Percentage of cancer cases underwent treatment for each cancer',r:'CHO',aoc:'H',me:'ME H3.1',method:['RR']},{t:'Percentage of  chronic cases who started treatment at PHC/above are still under treatment for last 3 months',r:'CHO',aoc:'H',me:'ME H4.1',method:['RR']},{t:'No. of Case specific OPD per month (Eye & ENT)',r:'CHO',aoc:'H',me:'ME H1.1',method:['RR']},{t:'No. of  cases referred to higher centre per month (Eye & ENT)',r:'CHO',aoc:'H',me:'ME H1.1',method:['RR']},{t:'No. of case specific follow up per month (Eye & ENT)',r:'CHO',aoc:'H',me:'ME H1.1',method:['RR']},{t:'No. of  drop out rate cases following identification (Eye & ENT)',r:'CHO',aoc:'H',me:'ME H1.1',method:['RR']},{t:'No. of Case specific OPD per month (Oral Health)',r:'CHO',aoc:'H',me:'ME H1.1',method:['RR']},{t:'No. of  cases referred to higher centre per month (Oral Health)',r:'CHO',aoc:'H',me:'ME H1.1',method:['RR']},{t:'No. of case specific follow up per month (Oral Health)',r:'CHO',aoc:'H',me:'ME H1.1',method:['RR']},{t:'No. of  drop out rate cases following identification (Oral Health)',r:'CHO',aoc:'H',me:'ME H1.1',method:['RR']},{t:'No. of Case specific OPD per month (Elderly & Palliative Care)',r:'CHO',aoc:'H',me:'ME H1.1',method:['RR']},{t:'No. of  cases referred to higher centre per month (Elderly & Palliative Care)',r:'CHO',aoc:'H',me:'ME H1.1',method:['RR']},{t:'No. of case specific follow up per month (Elderly & Palliative Care)',r:'CHO',aoc:'H',me:'ME H1.1',method:['RR']},{t:'No. of  drop out rate cases following identification (Elderly & Palliative Care)',r:'CHO',aoc:'H',me:'ME H1.1',method:['RR']},{t:'No. of Case specific OPD per month (Medical Emergency)',r:'CHO',aoc:'H',me:'ME H1.1',method:['RR']},{t:'No. of  cases referred to higher centre per month (Medical Emergency)',r:'CHO',aoc:'H',me:'ME H1.1',method:['RR']},{t:'No. of case specific follow up per month (Medical Emergency)',r:'CHO',aoc:'H',me:'ME H1.1',method:['RR']},{t:'No. of  drop out rate cases following identification (Medical Emergency)',r:'CHO',aoc:'H',me:'ME H1.1',method:['RR']},{t:'No. of Case specific OPD per month (Mental Health)',r:'CHO',aoc:'H',me:'ME H1.1',method:['RR']},{t:'No. of  cases referred to higher centre per month (Mental Health)',r:'CHO',aoc:'H',me:'ME H1.1',method:['RR']},{t:'No. of case specific follow up per month (Mental Health)',r:'CHO',aoc:'H',me:'ME H1.1',method:['RR']},{t:'No. of  drop out rate cases following identification (Mental Health)',r:'CHO',aoc:'H',me:'ME H1.1',method:['RR']},{t:'No. of stock out days of essential medicines',r:'CHO',aoc:'H',me:'ME H2.1',method:['RR']},{t:'No. of stock out days of essential diagnostic test',r:'CHO',aoc:'H',me:'ME H2.1',method:['RR']},{t:'No. of Yoga session conducted in month',r:'CHO',aoc:'H',me:'ME H2.1',method:['RR']},{t:'No of VHNDs conducted (for vulnerable population)',r:'CHO',aoc:'H',me:'ME H2.1',method:['RR']},{t:'Client Satisfaction Score (Patients)',r:'CHO',aoc:'H',me:'ME H4.1',method:['RR']},{t:'Client Satisfaction Score (Community)',r:'CHO',aoc:'H',me:'ME H4.1',method:['RR']}]},{day:27,aoc:'Boss',service:'Boss Battle',title:'⚔️ BOSS BATTLE II — Pre-Revision Mock Assessment',task:'⚔️ Full self-audit of all Areas of Concern. Score each area honestly and prepare gap closure plan.',me:'All MEs',aocTags:['All Areas of Concern'],methods:['SI','RR','OB','CI'],roles:{prime:'CHO',support:['ANM','ASHA']},isBoss:true,cps:[{t:'AoC A (Service Provision) — self-audit complete',r:'CHO',aoc:'Boss',me:'',method:['SI']},{t:'AoC B (Patient Rights) — self-audit complete',r:'CHO',aoc:'Boss',me:'',method:['CI']},{t:'AoC C (Inputs) — self-audit complete',r:'CHO',aoc:'Boss',me:'',method:['OB']},{t:'AoC D (Support Services) — self-audit complete',r:'CHO',aoc:'Boss',me:'',method:['OB']},{t:'AoC E (Clinical Services) — self-audit complete',r:'CHO',aoc:'Boss',me:'',method:['SI']},{t:'AoC F (Infection Control) — self-audit complete',r:'CHO',aoc:'Boss',me:'',method:['OB']},{t:'AoC G (Quality Management) — self-audit complete',r:'CHO',aoc:'Boss',me:'',method:['RR']},{t:'AoC H (Outcome) — reviewed and documented',r:'CHO',aoc:'Boss',me:'',method:['RR']},{t:'Top gaps identified — corrective action plan prepared',r:'CHO',aoc:'Boss',me:'',method:['RR']},{t:'Block/PHC supervisor informed of readiness status',r:'CHO',aoc:'Boss',me:'',method:['SI']}]},{day:28,aoc:'AE',service:'Pregnancy & Child Birth',title:'[Deep Dive] Pregnancy & Child Birth — Gap Closure & Evidence',task:'Deep-dive revision of Pregnancy & Child Birth — close all identified gaps, strengthen evidence folder.',me:'ME A | ME E',aocTags:['AoC A+E — Deep Dive Revision'],methods:['SI','RR','CI','OB'],roles:{prime:'CHO',support:['ANM','ASHA']},cps:[{t:'Availability of functional ANC services  with minimum 4 ANC check-ups',r:'CHO',aoc:'A',me:'ME A1.1',method:['SI','RR']},{t:'First aid, referral  & follow up services for high risk pregnancies are provided',r:'CHO',aoc:'A',me:'ME A1.1',method:['SI','RR']},{t:'Availability of Normal Vaginal delivery services  and referral services for Obstetrics emergencies',r:'CHO',aoc:'A',me:'ME A1.1',method:['SI','RR']},{t:'Availability of  prompt referral services for Obstetrics emergencies',r:'CHO',aoc:'A',me:'ME A1.1',method:['SI','RR']},{t:'Facility provides and updates “Mother and Child Protection Card”',r:'CHO',aoc:'E',me:'ME E16.1',method:['RR','CI']},{t:'Facility ensures early registration & line listing of high risk ANC  cases',r:'CHO',aoc:'E',me:'ME E16.1',method:['SI','RR']},{t:'Clinical information & records of ANC is kept with Ayushman Arogya Mandir',r:'ANM',aoc:'E',me:'ME E16.1',method:['SI','RR']},{t:'Staff has knowledge of calculating expected pregnancies in the area',r:'CHO',aoc:'E',me:'ME E16.1',method:['SI','RR']},{t:'Tracking of Missed and left out ANC',r:'CHO',aoc:'E',me:'ME E16.1',method:['SI','RR']},{t:'All pregnant women get ANC check-up as per recommended schedule',r:'CHO',aoc:'E',me:'ME E16.1',method:['SI','RR']},{t:'At ANC clinic, Pregnancy is confirmed by performing urine test',r:'CHO',aoc:'E',me:'ME E16.2',method:['RR']},{t:'Last menstrual period (LMP) is recorded and Expected date of Delivery (EDD) is calculated on first visit.',r:'CHO',aoc:'E',me:'ME E16.2',method:['SI','RR']},{t:'Comprehensive Obstetric history is recorded',r:'CHO',aoc:'E',me:'ME E16.2',method:['SI','RR']},{t:'Physical Examination & vitals  of Pregnant Women is done on every ANC visit',r:'CHO',aoc:'E',me:'ME E16.2',method:['RR']},{t:'Abdominal Examination is done as per protocol',r:'CHO',aoc:'E',me:'ME E16.2',method:['SI','RR']},{t:'Diagnostic  test for every pregnant women',r:'CHO',aoc:'E',me:'ME E16.3',method:['SI','RR']},{t:'Tetanus Toxoid (2 Dosages/ Booster) have been during ANC visits',r:'CHO',aoc:'E',me:'ME E16.3',method:['SI','RR']},{t:'Staff can recognize the cases, which would need referral to higher centre(FRU)',r:'CHO',aoc:'E',me:'ME E16.4',method:['SI','RR']},{t:'Staff is competent to identify Hypertension / Pregnancy Induced Hypertension',r:'CHO',aoc:'E',me:'ME E16.4',method:['SI','RR']},{t:'Staff is competent to identify Pre-Eclampsia',r:'CHO',aoc:'E',me:'ME E16.4',method:['SI','RR']},{t:'Staff is competent to identify high risk cases based on Abdominal examination',r:'CHO',aoc:'E',me:'ME E16.4',method:['SI','RR']},{t:'Staff is competent to classify anaemia according to Haemoglobin Level',r:'CHO',aoc:'E',me:'ME E16.4',method:['SI','RR']},{t:'Staff is aware of prophylactic & Therapeutic dose of IFA &  progress is monitored',r:'CHO',aoc:'E',me:'ME E16.4',method:['SI','RR']},{t:'Pregnant women is counselled for planning and preparation for birth',r:'CHO',aoc:'E',me:'ME E16.5',method:['SI','CI']},{t:'Pregnant women is counselled recognize danger signs during pregnancy',r:'CHO',aoc:'E',me:'ME E16.5',method:['SI','CI']},{t:'Pregnant women is counselled diet, rest, breast feeding & family planning.',r:'CHO',aoc:'E',me:'ME E16.5',method:['SI','CI']},{t:'Management of 1st stage of labour:',r:'CHO',aoc:'E',me:'ME E17.1',method:['SI','RR']},{t:'Management of 2nd stage of labour:',r:'CHO',aoc:'E',me:'ME E17.1',method:['SI','RR']},{t:'Check no unnecessary episiotomy and unnecessary augmentation and induction labour is done using uterotonic drugs',r:'CHO',aoc:'E',me:'ME E17.1',method:['SI','RR']},{t:'Active Management of Third stage of labour',r:'CHO',aoc:'E',me:'ME E17.1',method:['SI','RR']},{t:'Staff is aware of route, doses and time of Uterotonic Drugs',r:'CHO',aoc:'E',me:'ME E17.1',method:['SI','RR']},{t:'Wipes the baby with a clean pre-warmed towel and wraps baby in second pre-warmed towel.',r:'CHO',aoc:'E',me:'ME E17.2',method:['SI','RR']},{t:'Performs delayed cord clamping and cutting (1-3 min) & Initiates breast-feeding soon after birth',r:'CHO',aoc:'E',me:'ME E17.2',method:['SI','OB']},{t:'Records birth weight and gives injection vitamin K',r:'CHO',aoc:'E',me:'ME E17.2',method:['SI','RR']},{t:'New born Resuscitation',r:'CHO',aoc:'E',me:'ME E17.2',method:['SI','OB']},{t:'Staff is aware of Indications for reffering patient for to higher centre',r:'CHO',aoc:'E',me:'ME E17.3',method:['SI','RR']},{t:'Initial Management of  Eclampsia \\Pre Eclampsia',r:'CHO',aoc:'E',me:'ME E17.3',method:['SI','RR']},{t:'Post Partum Haemorrhage',r:'CHO',aoc:'E',me:'ME E17.3',method:['SI','RR']},{t:'Mother is monitored as per post natal care guideline',r:'CHO',aoc:'E',me:'ME E18.1',method:['SI','RR']},{t:'Check Mother is educated & counselled about danger signs during puerperium &  during postnatal visit',r:'CHO',aoc:'E',me:'ME E18.2',method:['SI','RR']}]},{day:29,aoc:'AE',service:'Neonatal & Infant Care',title:'[Deep Dive] Neonatal & Infant Care — Gap Closure & Evidence',task:'Deep-dive revision of Neonatal & Infant Care — close all identified gaps, strengthen evidence folder.',me:'ME A | ME E',aocTags:['AoC A+E — Deep Dive Revision'],methods:['SI','RR','CI','OB'],roles:{prime:'CHO',support:['ANM','ASHA']},cps:[{t:'Identification, primary management & prompt referral  of sick new born & infant',r:'CHO',aoc:'A',me:'ME A1.2',method:['SI','RR']},{t:'Availability of Immunization Services',r:'ANM',aoc:'A',me:'ME A1.2',method:['SI','RR']},{t:'CHO & CHW  are aware of danger signs of new born & infant',r:'CHO',aoc:'E',me:'ME E13.1',method:['SI','RR']},{t:'Primary management & prompt referral of sick new born & infants',r:'CHO',aoc:'E',me:'ME E13.1',method:['SI','RR']},{t:'Staff is aware of post natal care Counselling',r:'CHO',aoc:'E',me:'ME E13.1',method:['SI','CI']},{t:'Check for vaccines & diluents are kept as per the recommendation of guidelines',r:'OB',aoc:'E',me:'ME E13.2',method:['SI','OB']},{t:'Reconstituted vaccines are not used after recommended time',r:'ANM',aoc:'E',me:'ME E13.2',method:['SI','OB']},{t:'Staff checks VVM level before using vaccines  and identify discard point',r:'ANM',aoc:'E',me:'ME E13.2',method:['SI']},{t:'Parents are counselled for informing any untoward event of concern following vaccination',r:'CI',aoc:'E',me:'ME E13.2',method:['CI','OB']},{t:'Vaccinator is aware about how to manage any immediate serious reaction/anaphylaxis',r:'ANM',aoc:'E',me:'ME E13.2',method:['SI']},{t:'Check the availability of anaphylaxis kit with ANM at session site',r:'ANM',aoc:'E',me:'ME E13.2',method:['OB']},{t:'Check adrenaline is not expired in kit',r:'ANM',aoc:'E',me:'ME E13.2',method:['OB']},{t:'Staff is aware of the shelf life of Vit A once it is opened and ensures it is not given after shelf life',r:'ANM',aoc:'E',me:'ME E13.2',method:['SI','OB']},{t:'ANM/CHW is aware segregation policy after completion of immunization session',r:'ANM',aoc:'E',me:'ME E13.2',method:['SI','OB']},{t:'Staff is aware of  Open vial policy',r:'ANM',aoc:'E',me:'ME E13.2',method:['SI','OB']},{t:'Staff is aware of how to calculate the number of beneficiaries, quantity of vaccines & syringes',r:'ANM',aoc:'E',me:'ME E13.2',method:['SI','RR']},{t:'Ayushman Arogya Mandir -SC maintain tracking bag/ tickler box',r:'ANM',aoc:'E',me:'ME E13.2',method:['SI','RR']},{t:'Check Vaccinator is aware of different categories of AEFI',r:'ANM',aoc:'E',me:'ME E13.2',method:['SI','RR']},{t:'Check person responsible for notifying & reporting of the AEFI is identified',r:'ANM',aoc:'E',me:'ME E13.2',method:['SI','RR']},{t:'Process of reporting and route is communicated to all concerned',r:'ANM',aoc:'E',me:'ME E13.2',method:['SI','RR']},{t:'Reporting  of AEFI cases is ensured by ANM',r:'ANM',aoc:'E',me:'ME E13.2',method:['RR']},{t:'Vaccinator is aware about how to prevent immunization error related reactions',r:'ANM',aoc:'E',me:'ME E13.2',method:['SI']}]},{day:30,aoc:'AE',service:'Childhood & Adolescent Health',title:'[Deep Dive] Childhood & Adolescent Health — Gap Closure & Evidence',task:'Deep-dive revision of Childhood & Adolescent Health — close all identified gaps, strengthen evidence folder.',me:'ME A | ME E',aocTags:['AoC A+E — Deep Dive Revision'],methods:['SI','RR','CI'],roles:{prime:'CHO',support:['ANM','ASHA']},cps:[{t:'Identification, primary management, referral & follow up services for Childhood ailments',r:'CHO',aoc:'A',me:'ME A1.3',method:['SI','RR']},{t:'Education, Counselling and referral  services for Adolescent health',r:'CHO',aoc:'A',me:'ME A1.3',method:['SI','CI']},{t:'Assessment for identification of ARI, diarrhoea, malnutrition and Other Illness',r:'CHO',aoc:'E',me:'ME E13.3',method:['SI','RR']},{t:'Assessment for identification of possible serious bacterial infections among young infant (0-59 days) & children (2 -59 months)',r:'CHO',aoc:'E',me:'ME E13.3',method:['SI','RR']},{t:'Management of diarrhoea  is  done as per protocols',r:'CHO',aoc:'E',me:'ME E13.3',method:['SI','RR']},{t:'Management of ARI  is  done as per protocols',r:'CHO',aoc:'E',me:'ME E13.3',method:['SI','RR']},{t:'Management of Possible serious bacterial infection as per protocols',r:'CHO',aoc:'E',me:'ME E13.3',method:['SI','RR']},{t:'Management of Malnutrition  is  done as per protocols',r:'CHO',aoc:'E',me:'ME E13.3',method:['SI','CI']},{t:'Screening, referral and follow up of children for anomalies, disabilities and developmental delays',r:'CHO',aoc:'E',me:'ME E13.3',method:['SI','RR']},{t:'Provision of education & counselling services for  adolescent',r:'CHO',aoc:'E',me:'ME E15.1',method:['SI','CI']},{t:'Services for treatment & referral  of common  RTI/STI\'s, Nutritional Anaemia & Menstrual disorders',r:'CHO',aoc:'E',me:'ME E15.1',method:['RR','CI']}]},{day:31,aoc:'AE',service:'Family Planning',title:'[Deep Dive] Family Planning — Gap Closure & Evidence',task:'Deep-dive revision of Family Planning — close all identified gaps, strengthen evidence folder.',me:'ME A | ME E',aocTags:['AoC A+E — Deep Dive Revision'],methods:['SI','RR','CI'],roles:{prime:'CHO',support:['ANM','ASHA']},cps:[{t:'Availability of family planning services',r:'CHO',aoc:'A',me:'ME A1.4',method:['SI','RR']},{t:'Education, Counselling and referral services for family planning services',r:'CI',aoc:'A',me:'ME A1.4',method:['SI','CI']},{t:'The client is given full information about family planning methods',r:'CHO',aoc:'E',me:'ME E14.1',method:['SI','RR']},{t:'Staff is aware of Method specific counselling approaches',r:'CHO',aoc:'E',me:'ME E14.1',method:['SI','CI']},{t:'Staff is aware of case selection criteria for family planning spacing  methods',r:'CHO',aoc:'E',me:'ME E14.2',method:['SI','RR']},{t:'Staff is aware of  options, indications & methods for administration for Oral Contraceptives',r:'CHO',aoc:'E',me:'ME E14.2',method:['SI','RR']},{t:'IUD insertion & follow up is done as per standard protocol',r:'CHO',aoc:'E',me:'ME E14.2',method:['SI','RR']},{t:'Injectable Contraceptives are given as per protocols',r:'CHO',aoc:'E',me:'ME E14.2',method:['SI','RR']},{t:'Staff is aware of case selection criteria for limiting mentors',r:'CHO',aoc:'E',me:'ME E14.3',method:['SI','RR']},{t:'AAM is supporting & encouraging the clients for post sterilization follow up',r:'CHO',aoc:'E',me:'ME E14.3',method:['SI','RR']}]},{day:32,aoc:'AE',service:'Management of Communicable Diseases',title:'[Deep Dive] Management of Communicable Diseases — Gap Closure & Evidence',task:'Deep-dive revision of Management of Communicable Diseases — close all identified gaps, strengthen evidence folder.',me:'ME A | ME E',aocTags:['AoC A+E — Deep Dive Revision'],methods:['SI','RR','CI','OB'],roles:{prime:'CHO',support:['ANM','ASHA']},cps:[{t:'Preventive & promotive services under NVBDCP',r:'CHO',aoc:'A',me:'ME A1.5',method:['SI','RR']},{t:'Case detection, treatment, referral & follow up of cases under NVBDCP',r:'CHO',aoc:'A',me:'ME A1.5',method:['SI','RR']},{t:'Preventive & promotive measures  under NTEP',r:'CI',aoc:'A',me:'ME A1.5',method:['SI','CI']},{t:'Case detection, treatment, referral & follow up of cases under NTEP',r:'CHO',aoc:'A',me:'ME A1.5',method:['SI','RR']},{t:'Preventive & promotive measures under NLEP',r:'CHO',aoc:'A',me:'ME A1.5',method:['SI','CI']},{t:'Case detection, treatment, referral & follow up of cases under NLEP',r:'CHO',aoc:'A',me:'ME A1.5',method:['SI','RR']},{t:'Preventive & promotive services under NACP',r:'CHO',aoc:'A',me:'ME A1.5',method:['SI','CI']},{t:'Referral & follow up of cases under NACP',r:'CHO',aoc:'A',me:'ME A1.5',method:['SI','RR']},{t:'Provision for the screening for HIV',r:'CHO',aoc:'A',me:'ME A1.5',method:['SI','RR']},{t:'Preventive & promotive measures  under NVHCP',r:'CHO',aoc:'A',me:'ME A1.5',method:['SI','CI']},{t:'Case detection, treatment, referral & follow up of cases under NVHCP',r:'CHO',aoc:'A',me:'ME A1.5',method:['SI','RR']},{t:'Availability of functional services under IDSP/ IHIP',r:'CHO',aoc:'A',me:'ME A1.5',method:['SI','RR']},{t:'Identification, management and  referral of acute illness & minor aliments',r:'CHO',aoc:'A',me:'ME A1.6',method:['SI','RR']},{t:'Preventive & promotive measures  for acute illness',r:'CHO',aoc:'A',me:'ME A1.6',method:['SI','CI']},{t:'Primary care team  is aware of  vector born disease control strategies',r:'CHO',aoc:'E',me:'ME E10.1',method:['SI','RR']},{t:'Case detection is done for Malaria',r:'CHO',aoc:'E',me:'ME E10.1',method:['SI','RR']},{t:'Staff is aware of Malaria treatment protocols',r:'CHO',aoc:'E',me:'ME E10.1',method:['SI','RR']},{t:'Staff is aware of Malaria referral protocols',r:'CHO',aoc:'E',me:'ME E10.1',method:['SI','RR']},{t:'Staff is aware of diagnostic & management of dengue as per protocols',r:'CHO',aoc:'E',me:'ME E10.1',method:['SI','RR']},{t:'NVBDCP register & records are maintained',r:'ASHA',aoc:'E',me:'ME E10.1',method:['SI','RR']},{t:'Facilities have adequate stock of commodities & drugs',r:'CHO',aoc:'E',me:'ME E10.1',method:['SI','RR']},{t:'Staff is aware of sign & symptoms of prevalent vector born diseases in area',r:'CHO',aoc:'E',me:'ME E10.1',method:['SI']},{t:'Identification of presumptive case  & their referral',r:'CHO',aoc:'E',me:'ME E10.2',method:['RR']},{t:'Ayushman Arogya Mandir support, supervision & manage presumptive, confirmed & on treatment cases including DR- TB patients',r:'CHO',aoc:'E',me:'ME E10.2',method:['RR','OB']},{t:'Staff is aware of follow up protocol after treatment completion',r:'CHO',aoc:'E',me:'ME E10.2',method:['SI','RR']},{t:'NTEP register & records are maintained',r:'CHO',aoc:'E',me:'ME E10.2',method:['RR']},{t:'Primary healthcare team  identify and ensure referral of suspected cases of Leprosy',r:'CHO',aoc:'E',me:'ME E10.3',method:['SI','RR']},{t:'NLEP register & records are maintained',r:'CHO',aoc:'E',me:'ME E10.3',method:['RR']},{t:'Facility provide awareness about leprosy & availability of its treatment',r:'CHO',aoc:'E',me:'ME E10.3',method:['SI','CI']},{t:'Ayushman Arogya Mandir-HSC is aware of their roles in NACP',r:'CHO',aoc:'E',me:'ME E10.4',method:['SI','RR']},{t:'Ayushman Arogya Mandir -SC has linkage for management of HIV/AIDS complications',r:'CHO',aoc:'E',me:'ME E10.4',method:['RR']},{t:'Staff is aware of promotional & supportive  activities done under NACP',r:'CHO',aoc:'E',me:'ME E10.4',method:['SI','RR']},{t:'Staff is aware of syndrome under surveillance in IDSP/IHIP',r:'CHO',aoc:'E',me:'ME E10.5',method:['SI','RR']},{t:'Check process to collect information in form S/ IHIP',r:'CHO',aoc:'E',me:'ME E10.5',method:['RR']},{t:'Check  Analysis & reporting of information for syndromic surveillance is done',r:'CHO',aoc:'E',me:'ME E10.5',method:['SI','RR']},{t:'Availability of diagnostic & treatment services',r:'CHO',aoc:'E',me:'ME E10.6',method:['RR']},{t:'Staff is aware of preventive measures for NVHCP',r:'CHO',aoc:'E',me:'ME E10.6',method:['SI','OB']}]},{day:33,aoc:'AE',service:'Management of Non-Communicable Diseases',title:'[Deep Dive] Management of Non-Communicable Diseases — Gap Closure & Evidence',task:'Deep-dive revision of Management of Non-Communicable Diseases — close all identified gaps, strengthen evidence folder.',me:'ME A | ME E',aocTags:['AoC A+E — Deep Dive Revision'],methods:['SI','RR','CI'],roles:{prime:'CHO',support:['ANM','ASHA']},cps:[{t:'Availability of services for Hypertension',r:'CHO',aoc:'A',me:'ME A1.7',method:['SI','RR']},{t:'Availability of services for Diabetes',r:'CHO',aoc:'A',me:'ME A1.7',method:['SI','RR']},{t:'Availability of services for Nonalcoholic fatty liver disease (NAFLD)',r:'CHO',aoc:'A',me:'ME A1.7',method:['SI','RR']},{t:'Availability of Services for  Cancers',r:'CHO',aoc:'A',me:'ME A1.7',method:['SI','RR']},{t:'Availability of services for respiratory diseases',r:'CHO',aoc:'A',me:'ME A1.7',method:['SI','RR']},{t:'Availability of services for Epilepsy',r:'CHO',aoc:'A',me:'ME A1.7',method:['SI','RR']},{t:'Availability of  services for  locally prevalent health diseases & substance abuse',r:'CHO',aoc:'A',me:'ME A1.7',method:['RR']},{t:'Preventive & promotive services under NCD',r:'CHO',aoc:'A',me:'ME A1.7',method:['SI','CI']},{t:'Ayushman Arogya Mandir undertakes  health promotion and disease prevention activities through Community level resources',r:'CI',aoc:'A',me:'ME A1.14',method:['RR','CI']},{t:'Provision of wellness services through Yoga and other activities',r:'CHO',aoc:'A',me:'ME A1.14',method:['SI','CI']},{t:'Provision of AYUSH services',r:'CHO',aoc:'A',me:'ME A1.14',method:['SI','RR']},{t:'Provision of counselling services for Eat Right',r:'CHO',aoc:'A',me:'ME A1.14',method:['SI','CI']},{t:'Staff is aware of process of population identification and referral for hypertension',r:'CHO',aoc:'E',me:'ME E11.1',method:['SI','RR']},{t:'CHO is  aware of sign & symptoms  of Hypertension',r:'CHO',aoc:'E',me:'ME E11.1',method:['SI']},{t:'Ayushman Arogya Mandir ensures frequency of follow up & supply of required medicines',r:'CHO',aoc:'E',me:'ME E11.1',method:['RR','CI']},{t:'Staff is aware of promotional & supportive  activities for Hypertension',r:'CHO',aoc:'E',me:'ME E11.1',method:['SI','CI']},{t:'Staff is aware of process of population identification and referral for diabetes',r:'CHO',aoc:'E',me:'ME E11.2',method:['SI','RR']},{t:'CHO is  aware of sign & symptoms  of diabetes',r:'CHO',aoc:'E',me:'ME E11.2',method:['SI']},{t:'Ayushman Arogya Mandir ensures frequency of follow up & supply of required medicines',r:'CHO',aoc:'E',me:'ME E11.2',method:['RR','CI']},{t:'Check Patient is counselled about identification & immediate management hypoglycaemia',r:'CHO',aoc:'E',me:'ME E11.2',method:['SI','CI']},{t:'Ayushman Arogya Mandir is aware of  risk factors of  Nonalcoholic fatty liver disease (NAFLD)',r:'CHO',aoc:'E',me:'ME E11.2',method:['SI','RR']},{t:'Staff is aware of promotional & supportive  activities for diabetes',r:'CHO',aoc:'E',me:'ME E11.2',method:['SI','CI']},{t:'Check cancer screening services are provided through Ayushman Arogya Mandir',r:'CHO',aoc:'E',me:'ME E11.3',method:['SI','RR']},{t:'Staff is aware about sign & symptom of cervical cancer',r:'CHO',aoc:'E',me:'ME E11.3',method:['SI']},{t:'Staff is aware about sign & symptom of Breast cancer',r:'CHO',aoc:'E',me:'ME E11.3',method:['SI']},{t:'Staff is aware about sign & symptom of Oral Cancer',r:'CHO',aoc:'E',me:'ME E11.3',method:['SI']},{t:'Check with  staff about methodology followed for  cancer screening',r:'CHO',aoc:'E',me:'ME E11.3',method:['SI','RR']},{t:'Check CHW is aware of referral centre for all types of cancer',r:'CHO',aoc:'E',me:'ME E11.3',method:['SI','RR']},{t:'Staff is aware of promotional & supportive  activities for cancers',r:'CHO',aoc:'E',me:'ME E11.3',method:['SI','CI']},{t:'Confirmation and referral of cases for Tobacco/alcohol/ substance abuse',r:'CHO',aoc:'E',me:'ME E11.4',method:['SI','RR']},{t:'Promotional & supportive  activities for Tobacco/alcohol/ substance abuse',r:'CHO',aoc:'E',me:'ME E11.4',method:['SI','RR','CI']},{t:'Check Screening & referral  locally prevalent diseases',r:'CHO',aoc:'E',me:'ME E11.4',method:['SI','CI']},{t:'Check Ayushman Arogya Mandir is providing Yoga services',r:'ASHA',aoc:'E',me:'ME E11.5',method:['SI','RR']},{t:'Check Yoga sessions are conducted regularly',r:'CHO',aoc:'E',me:'ME E11.5',method:['RR','CI']},{t:'Check counselling of mother\'s for nutrition & hygiene maintenance under Eat right',r:'CHO',aoc:'E',me:'ME E11.5',method:['SI','CI']},{t:'Check staff counsel and guide the mother\'s about household preparation of complementary feeds',r:'CHO',aoc:'E',me:'ME E11.5',method:['SI','CI']},{t:'Check Primary  health care team generate awareness  in community about balanced diet',r:'CHO',aoc:'E',me:'ME E11.5',method:['SI','CI']},{t:'Check Primary  health care team generate awareness  in community about food fortification',r:'CHO',aoc:'E',me:'ME E11.5',method:['SI','CI']},{t:'Check Primary  health care team generate awareness  in community about Eat safe practices',r:'CHO',aoc:'E',me:'ME E11.5',method:['SI','CI']},{t:'Check Primary  health care team generate awareness  in community about food safety',r:'CHO',aoc:'E',me:'ME E11.5',method:['SI','CI']}]},{day:34,aoc:'AE',service:'Drugs & Diagnostics',title:'[Deep Dive] Drugs & Diagnostics — Gap Closure & Evidence',task:'Deep-dive revision of Drugs & Diagnostics — close all identified gaps, strengthen evidence folder.',me:'ME A | ME E',aocTags:['AoC A+E — Deep Dive Revision'],methods:['RR','CI','SI'],roles:{prime:'CHO',support:['ANM','ASHA']},cps:[{t:'Availability of basic diagnostic services including NHP',r:'ANM',aoc:'A',me:'ME A2.1',method:['RR','CI']},{t:'Linkages with the Central diagnostic units (Hub & spoke)',r:'ANM',aoc:'A',me:'ME A2.1',method:['SI','RR']},{t:'Availability of drugs as per EDL',r:'CHO',aoc:'A',me:'ME A2.2',method:['SI','RR']},{t:'Availability of drugs for refill for chronic cases',r:'CHO',aoc:'A',me:'ME A2.2',method:['SI','RR']}]},{day:35,aoc:'AE',service:'Emergency',title:'[Deep Dive] Emergency — Gap Closure & Evidence',task:'Deep-dive revision of Emergency — close all identified gaps, strengthen evidence folder.',me:'ME A | ME E',aocTags:['AoC A+E — Deep Dive Revision'],methods:['SI','RR','CI','OB'],roles:{prime:'CHO',support:['ANM','ASHA']},cps:[{t:'Availability of services for Medical Emergencies including trauma & burns',r:'CHO',aoc:'A',me:'ME A1.12',method:['SI','RR']},{t:'Emergency protocols for first aid and stabilization are available',r:'CHO',aoc:'E',me:'ME E 7.1',method:['SI','RR']},{t:'Staff is aware of  procedure for CPR',r:'CHO',aoc:'E',me:'ME E 7.1',method:['SI','RR']},{t:'Ayushman Arogya Mandir ensures timely availability of ambulances services for emergency cases',r:'CHO',aoc:'E',me:'ME E 7.1',method:['RR','CI']},{t:'Emergency care is given in case of disaster',r:'CHO',aoc:'E',me:'ME E 7.2',method:['SI','OB']},{t:'Staff is aware of  process of sorting the patients in case of mass causalty/ outbreak',r:'CHO',aoc:'E',me:'ME E 7.2',method:['SI','RR']}]},{day:36,aoc:'AE',service:'Care of Common Ophthalmic and ENT',title:'[Deep Dive] Care of Common Ophthalmic and ENT — Gap Closure & Evidence',task:'Deep-dive revision of Care of Common Ophthalmic and ENT — close all identified gaps, strengthen evidence folder.',me:'ME A | ME E',aocTags:['AoC A+E — Deep Dive Revision'],methods:['SI','RR','CI','OB'],roles:{prime:'CHO',support:['ANM','ASHA']},cps:[{t:'Availability of  Ophthalmic  Services',r:'CHO',aoc:'A',me:'ME A1.8',method:['SI','RR']},{t:'Preventive & promotive services under for Ophthalmic',r:'CHO',aoc:'A',me:'ME A1.8',method:['SI','CI']},{t:'Availability of  ENT Services',r:'CHO',aoc:'A',me:'ME A1.9',method:['SI','RR']},{t:'Preventive & promotive services under for ENT',r:'CHO',aoc:'A',me:'ME A1.9',method:['SI','CI']},{t:'Staff screen & refer cases of common ophthalmic aliments  lead to blindness & refractive errors',r:'CHO',aoc:'E',me:'ME E8.1',method:['SI','RR']},{t:'Staff is aware of identification & primary management common ophthalmic conditions including emergencies',r:'CHO',aoc:'E',me:'ME E8.1',method:['SI','RR','OB']},{t:'Staff is aware of  methods for measuring the refractive errors',r:'CHO',aoc:'E',me:'ME E8.1',method:['SI','RR']},{t:'Staff maintain records under ophthalmic care',r:'CHO',aoc:'E',me:'ME E8.1',method:['SI','RR']},{t:'Promotion & supportive activities for ophthalmic care',r:'CHO',aoc:'E',me:'ME E8.1',method:['RR','CI']},{t:'Screening of population for ENT aliments',r:'CHO',aoc:'E',me:'ME E8.2',method:['SI','RR']},{t:'Identification & primary management of common ear problems',r:'CHO',aoc:'E',me:'ME E8.2',method:['SI','RR']},{t:'Staff is trained & using diagnostic tools for identification of ear problems',r:'CHO',aoc:'E',me:'ME E8.2',method:['RR','OB']},{t:'Identification & management of nose problem',r:'CHO',aoc:'E',me:'ME E8.2',method:['RR','OB']},{t:'Staff is trained & using diagnostic tools for identification of Nose aliments',r:'CHO',aoc:'E',me:'ME E8.2',method:['SI','OB']},{t:'Identification & primary management  of throat aliments',r:'CHO',aoc:'E',me:'ME E8.2',method:['SI','RR']},{t:'Check staff is trained & able to  perform Heimlich manoeuvre/ dislodge obstruction from windpipe',r:'CHO',aoc:'E',me:'ME E8.2',method:['SI','RR']},{t:'Staff is trained to identify ENT aliments require referral to higher centre',r:'CHO',aoc:'E',me:'ME E8.2',method:['SI','RR']},{t:'Promotion & supportive activities for ENT',r:'CHO',aoc:'E',me:'ME E8.2',method:['SI','RR','CI']}]},{day:37,aoc:'AE',service:'Oral Health Care',title:'[Deep Dive] Oral Health Care — Gap Closure & Evidence',task:'Deep-dive revision of Oral Health Care — close all identified gaps, strengthen evidence folder.',me:'ME A | ME E',aocTags:['AoC A+E — Deep Dive Revision'],methods:['SI','RR','CI'],roles:{prime:'CHO',support:['ANM','ASHA']},cps:[{t:'Availability of  early identification & referral services for oral Health conditions',r:'CHO',aoc:'A',me:'ME A1.10',method:['SI','RR']},{t:'Availability of  symptomatic management & referral services for oral Health conditions',r:'CHO',aoc:'A',me:'ME A1.10',method:['SI','RR']},{t:'Preventive & promotive services under oral health',r:'CHO',aoc:'A',me:'ME A1.10',method:['SI','CI']},{t:'Staff is aware about Oral health conditions, primary management & referral',r:'CHO',aoc:'E',me:'ME E8.3',method:['SI']},{t:'Staff is aware of symptomatic  treatment for dental emergencies',r:'CHO',aoc:'E',me:'ME E8.3',method:['SI','RR']},{t:'Screening of oral health conditions is done as per protocol',r:'CHO',aoc:'E',me:'ME E8.3',method:['SI','RR']},{t:'Promotion & supportive activities for oral health',r:'CHO',aoc:'E',me:'ME E8.3',method:['SI','CI']}]},{day:38,aoc:'AE',service:'Mental Health',title:'[Deep Dive] Mental Health — Gap Closure & Evidence',task:'Deep-dive revision of Mental Health — close all identified gaps, strengthen evidence folder.',me:'ME A | ME E',aocTags:['AoC A+E — Deep Dive Revision'],methods:['SI','RR','CI'],roles:{prime:'CHO',support:['ANM','ASHA']},cps:[{t:'Availability of services for mental health',r:'CHO',aoc:'A',me:'ME A1.13',method:['SI','RR']},{t:'Preventive & promotive services under mental health',r:'CHO',aoc:'A',me:'ME A1.13',method:['SI','CI']},{t:'Check staff is aware of MNS (Mental, neurological & substance use)  conditions',r:'CHO',aoc:'E',me:'ME E9.1',method:['SI','RR']},{t:'Check Staff  uses specific  tools for early identification & screening of MNS',r:'ASHA',aoc:'E',me:'ME E9.1',method:['SI','RR']},{t:'Staff is competent for basic management, referral & follow up of MNS',r:'CHO',aoc:'E',me:'ME E9.1',method:['SI','RR']},{t:'Check staff is trained for emergency management of  Epilepsy',r:'CHO',aoc:'E',me:'ME E9.1',method:['SI','RR']},{t:'Promotion & supportive activities for mental health',r:'CHO',aoc:'E',me:'ME E9.1',method:['SI','CI']}]},{day:39,aoc:'AE',service:'Elderly & Pallative Care',title:'[Deep Dive] Elderly & Pallative Care — Gap Closure & Evidence',task:'Deep-dive revision of Elderly & Pallative Care — close all identified gaps, strengthen evidence folder.',me:'ME A | ME E',aocTags:['AoC A+E — Deep Dive Revision'],methods:['SI','RR','OB','CI'],roles:{prime:'CHO',support:['ANM','ASHA']},cps:[{t:'Availability of services for elderly care',r:'CHO',aoc:'A',me:'ME A1.11',method:['SI','RR']},{t:'Availability of services for palliative care',r:'CHO',aoc:'A',me:'ME A1.11',method:['SI','RR']},{t:'Elderly population is mapped & screened',r:'CHO',aoc:'E',me:'ME E12.1',method:['SI','RR']},{t:'CHO is aware &  competent to use various geriatric tools',r:'CHO',aoc:'E',me:'ME E12.1',method:['RR','OB']},{t:'Ayushman Arogya Mandir ­undertake preliminary assessment for the need of assistive devices',r:'CHO',aoc:'E',me:'ME E12.1',method:['RR']},{t:'Promotional & supportive activities for Geriatric care',r:'CHO',aoc:'E',me:'ME E12.1',method:['SI','CI']},{t:'Screening, basic management & referral  of Palliative Care patient is done',r:'CHO',aoc:'E',me:'ME E12.2',method:['RR','CI']},{t:'Home based palliative care services are being provided',r:'CHO',aoc:'E',me:'ME E12.2',method:['SI','RR']},{t:'Check Home care kit is available & case sheet are  updated',r:'CHO',aoc:'E',me:'ME E12.2',method:['SI','RR']},{t:'Check patient support groups are available',r:'CHO',aoc:'E',me:'ME E12.2',method:['SI','RR']},{t:'Promotional & supportive activities for palliative care',r:'CHO',aoc:'E',me:'ME E12.2',method:['SI','CI']}]},{day:40,aoc:'AE',service:'Pregnancy & Child Birth',title:'[Revision] Pregnancy & Child Birth — Verification & Documentation',task:'Revisit Pregnancy & Child Birth — verify all corrective actions implemented and documentation complete.',me:'ME A | ME E',aocTags:['AoC A+E — Revision'],methods:['SI','RR','CI','OB'],roles:{prime:'CHO',support:['ANM','ASHA']},cps:[{t:'Availability of functional ANC services  with minimum 4 ANC check-ups',r:'CHO',aoc:'A',me:'ME A1.1',method:['SI','RR']},{t:'First aid, referral  & follow up services for high risk pregnancies are provided',r:'CHO',aoc:'A',me:'ME A1.1',method:['SI','RR']},{t:'Availability of Normal Vaginal delivery services  and referral services for Obstetrics emergencies',r:'CHO',aoc:'A',me:'ME A1.1',method:['SI','RR']},{t:'Availability of  prompt referral services for Obstetrics emergencies',r:'CHO',aoc:'A',me:'ME A1.1',method:['SI','RR']},{t:'Facility provides and updates “Mother and Child Protection Card”',r:'CHO',aoc:'E',me:'ME E16.1',method:['RR','CI']},{t:'Facility ensures early registration & line listing of high risk ANC  cases',r:'CHO',aoc:'E',me:'ME E16.1',method:['SI','RR']},{t:'Clinical information & records of ANC is kept with Ayushman Arogya Mandir',r:'ANM',aoc:'E',me:'ME E16.1',method:['SI','RR']},{t:'Staff has knowledge of calculating expected pregnancies in the area',r:'CHO',aoc:'E',me:'ME E16.1',method:['SI','RR']},{t:'Tracking of Missed and left out ANC',r:'CHO',aoc:'E',me:'ME E16.1',method:['SI','RR']},{t:'All pregnant women get ANC check-up as per recommended schedule',r:'CHO',aoc:'E',me:'ME E16.1',method:['SI','RR']},{t:'At ANC clinic, Pregnancy is confirmed by performing urine test',r:'CHO',aoc:'E',me:'ME E16.2',method:['RR']},{t:'Last menstrual period (LMP) is recorded and Expected date of Delivery (EDD) is calculated on first visit.',r:'CHO',aoc:'E',me:'ME E16.2',method:['SI','RR']},{t:'Comprehensive Obstetric history is recorded',r:'CHO',aoc:'E',me:'ME E16.2',method:['SI','RR']},{t:'Physical Examination & vitals  of Pregnant Women is done on every ANC visit',r:'CHO',aoc:'E',me:'ME E16.2',method:['RR']},{t:'Abdominal Examination is done as per protocol',r:'CHO',aoc:'E',me:'ME E16.2',method:['SI','RR']},{t:'Diagnostic  test for every pregnant women',r:'CHO',aoc:'E',me:'ME E16.3',method:['SI','RR']},{t:'Tetanus Toxoid (2 Dosages/ Booster) have been during ANC visits',r:'CHO',aoc:'E',me:'ME E16.3',method:['SI','RR']},{t:'Staff can recognize the cases, which would need referral to higher centre(FRU)',r:'CHO',aoc:'E',me:'ME E16.4',method:['SI','RR']},{t:'Staff is competent to identify Hypertension / Pregnancy Induced Hypertension',r:'CHO',aoc:'E',me:'ME E16.4',method:['SI','RR']},{t:'Staff is competent to identify Pre-Eclampsia',r:'CHO',aoc:'E',me:'ME E16.4',method:['SI','RR']},{t:'Staff is competent to identify high risk cases based on Abdominal examination',r:'CHO',aoc:'E',me:'ME E16.4',method:['SI','RR']},{t:'Staff is competent to classify anaemia according to Haemoglobin Level',r:'CHO',aoc:'E',me:'ME E16.4',method:['SI','RR']},{t:'Staff is aware of prophylactic & Therapeutic dose of IFA &  progress is monitored',r:'CHO',aoc:'E',me:'ME E16.4',method:['SI','RR']},{t:'Pregnant women is counselled for planning and preparation for birth',r:'CHO',aoc:'E',me:'ME E16.5',method:['SI','CI']},{t:'Pregnant women is counselled recognize danger signs during pregnancy',r:'CHO',aoc:'E',me:'ME E16.5',method:['SI','CI']},{t:'Pregnant women is counselled diet, rest, breast feeding & family planning.',r:'CHO',aoc:'E',me:'ME E16.5',method:['SI','CI']},{t:'Management of 1st stage of labour:',r:'CHO',aoc:'E',me:'ME E17.1',method:['SI','RR']},{t:'Management of 2nd stage of labour:',r:'CHO',aoc:'E',me:'ME E17.1',method:['SI','RR']},{t:'Check no unnecessary episiotomy and unnecessary augmentation and induction labour is done using uterotonic drugs',r:'CHO',aoc:'E',me:'ME E17.1',method:['SI','RR']},{t:'Active Management of Third stage of labour',r:'CHO',aoc:'E',me:'ME E17.1',method:['SI','RR']},{t:'Staff is aware of route, doses and time of Uterotonic Drugs',r:'CHO',aoc:'E',me:'ME E17.1',method:['SI','RR']},{t:'Wipes the baby with a clean pre-warmed towel and wraps baby in second pre-warmed towel.',r:'CHO',aoc:'E',me:'ME E17.2',method:['SI','RR']},{t:'Performs delayed cord clamping and cutting (1-3 min) & Initiates breast-feeding soon after birth',r:'CHO',aoc:'E',me:'ME E17.2',method:['SI','OB']},{t:'Records birth weight and gives injection vitamin K',r:'CHO',aoc:'E',me:'ME E17.2',method:['SI','RR']},{t:'New born Resuscitation',r:'CHO',aoc:'E',me:'ME E17.2',method:['SI','OB']},{t:'Staff is aware of Indications for reffering patient for to higher centre',r:'CHO',aoc:'E',me:'ME E17.3',method:['SI','RR']},{t:'Initial Management of  Eclampsia \\Pre Eclampsia',r:'CHO',aoc:'E',me:'ME E17.3',method:['SI','RR']},{t:'Post Partum Haemorrhage',r:'CHO',aoc:'E',me:'ME E17.3',method:['SI','RR']},{t:'Mother is monitored as per post natal care guideline',r:'CHO',aoc:'E',me:'ME E18.1',method:['SI','RR']},{t:'Check Mother is educated & counselled about danger signs during puerperium &  during postnatal visit',r:'CHO',aoc:'E',me:'ME E18.2',method:['SI','RR']}]},{day:41,aoc:'AE',service:'Neonatal & Infant Care',title:'[Revision] Neonatal & Infant Care — Verification & Documentation',task:'Revisit Neonatal & Infant Care — verify all corrective actions implemented and documentation complete.',me:'ME A | ME E',aocTags:['AoC A+E — Revision'],methods:['SI','RR','CI','OB'],roles:{prime:'CHO',support:['ANM','ASHA']},cps:[{t:'Identification, primary management & prompt referral  of sick new born & infant',r:'CHO',aoc:'A',me:'ME A1.2',method:['SI','RR']},{t:'Availability of Immunization Services',r:'ANM',aoc:'A',me:'ME A1.2',method:['SI','RR']},{t:'CHO & CHW  are aware of danger signs of new born & infant',r:'CHO',aoc:'E',me:'ME E13.1',method:['SI','RR']},{t:'Primary management & prompt referral of sick new born & infants',r:'CHO',aoc:'E',me:'ME E13.1',method:['SI','RR']},{t:'Staff is aware of post natal care Counselling',r:'CHO',aoc:'E',me:'ME E13.1',method:['SI','CI']},{t:'Check for vaccines & diluents are kept as per the recommendation of guidelines',r:'OB',aoc:'E',me:'ME E13.2',method:['SI','OB']},{t:'Reconstituted vaccines are not used after recommended time',r:'ANM',aoc:'E',me:'ME E13.2',method:['SI','OB']},{t:'Staff checks VVM level before using vaccines  and identify discard point',r:'ANM',aoc:'E',me:'ME E13.2',method:['SI']},{t:'Parents are counselled for informing any untoward event of concern following vaccination',r:'CI',aoc:'E',me:'ME E13.2',method:['CI','OB']},{t:'Vaccinator is aware about how to manage any immediate serious reaction/anaphylaxis',r:'ANM',aoc:'E',me:'ME E13.2',method:['SI']},{t:'Check the availability of anaphylaxis kit with ANM at session site',r:'ANM',aoc:'E',me:'ME E13.2',method:['OB']},{t:'Check adrenaline is not expired in kit',r:'ANM',aoc:'E',me:'ME E13.2',method:['OB']},{t:'Staff is aware of the shelf life of Vit A once it is opened and ensures it is not given after shelf life',r:'ANM',aoc:'E',me:'ME E13.2',method:['SI','OB']},{t:'ANM/CHW is aware segregation policy after completion of immunization session',r:'ANM',aoc:'E',me:'ME E13.2',method:['SI','OB']},{t:'Staff is aware of  Open vial policy',r:'ANM',aoc:'E',me:'ME E13.2',method:['SI','OB']},{t:'Staff is aware of how to calculate the number of beneficiaries, quantity of vaccines & syringes',r:'ANM',aoc:'E',me:'ME E13.2',method:['SI','RR']},{t:'Ayushman Arogya Mandir -SC maintain tracking bag/ tickler box',r:'ANM',aoc:'E',me:'ME E13.2',method:['SI','RR']},{t:'Check Vaccinator is aware of different categories of AEFI',r:'ANM',aoc:'E',me:'ME E13.2',method:['SI','RR']},{t:'Check person responsible for notifying & reporting of the AEFI is identified',r:'ANM',aoc:'E',me:'ME E13.2',method:['SI','RR']},{t:'Process of reporting and route is communicated to all concerned',r:'ANM',aoc:'E',me:'ME E13.2',method:['SI','RR']},{t:'Reporting  of AEFI cases is ensured by ANM',r:'ANM',aoc:'E',me:'ME E13.2',method:['RR']},{t:'Vaccinator is aware about how to prevent immunization error related reactions',r:'ANM',aoc:'E',me:'ME E13.2',method:['SI']}]},{day:42,aoc:'AE',service:'Childhood & Adolescent Health',title:'[Revision] Childhood & Adolescent Health — Verification & Documentation',task:'Revisit Childhood & Adolescent Health — verify all corrective actions implemented and documentation complete.',me:'ME A | ME E',aocTags:['AoC A+E — Revision'],methods:['SI','RR','CI'],roles:{prime:'CHO',support:['ANM','ASHA']},cps:[{t:'Identification, primary management, referral & follow up services for Childhood ailments',r:'CHO',aoc:'A',me:'ME A1.3',method:['SI','RR']},{t:'Education, Counselling and referral  services for Adolescent health',r:'CHO',aoc:'A',me:'ME A1.3',method:['SI','CI']},{t:'Assessment for identification of ARI, diarrhoea, malnutrition and Other Illness',r:'CHO',aoc:'E',me:'ME E13.3',method:['SI','RR']},{t:'Assessment for identification of possible serious bacterial infections among young infant (0-59 days) & children (2 -59 months)',r:'CHO',aoc:'E',me:'ME E13.3',method:['SI','RR']},{t:'Management of diarrhoea  is  done as per protocols',r:'CHO',aoc:'E',me:'ME E13.3',method:['SI','RR']},{t:'Management of ARI  is  done as per protocols',r:'CHO',aoc:'E',me:'ME E13.3',method:['SI','RR']},{t:'Management of Possible serious bacterial infection as per protocols',r:'CHO',aoc:'E',me:'ME E13.3',method:['SI','RR']},{t:'Management of Malnutrition  is  done as per protocols',r:'CHO',aoc:'E',me:'ME E13.3',method:['SI','CI']},{t:'Screening, referral and follow up of children for anomalies, disabilities and developmental delays',r:'CHO',aoc:'E',me:'ME E13.3',method:['SI','RR']},{t:'Provision of education & counselling services for  adolescent',r:'CHO',aoc:'E',me:'ME E15.1',method:['SI','CI']},{t:'Services for treatment & referral  of common  RTI/STI\'s, Nutritional Anaemia & Menstrual disorders',r:'CHO',aoc:'E',me:'ME E15.1',method:['RR','CI']}]},{day:43,aoc:'AE',service:'Family Planning',title:'[Revision] Family Planning — Verification & Documentation',task:'Revisit Family Planning — verify all corrective actions implemented and documentation complete.',me:'ME A | ME E',aocTags:['AoC A+E — Revision'],methods:['SI','RR','CI'],roles:{prime:'CHO',support:['ANM','ASHA']},cps:[{t:'Availability of family planning services',r:'CHO',aoc:'A',me:'ME A1.4',method:['SI','RR']},{t:'Education, Counselling and referral services for family planning services',r:'CI',aoc:'A',me:'ME A1.4',method:['SI','CI']},{t:'The client is given full information about family planning methods',r:'CHO',aoc:'E',me:'ME E14.1',method:['SI','RR']},{t:'Staff is aware of Method specific counselling approaches',r:'CHO',aoc:'E',me:'ME E14.1',method:['SI','CI']},{t:'Staff is aware of case selection criteria for family planning spacing  methods',r:'CHO',aoc:'E',me:'ME E14.2',method:['SI','RR']},{t:'Staff is aware of  options, indications & methods for administration for Oral Contraceptives',r:'CHO',aoc:'E',me:'ME E14.2',method:['SI','RR']},{t:'IUD insertion & follow up is done as per standard protocol',r:'CHO',aoc:'E',me:'ME E14.2',method:['SI','RR']},{t:'Injectable Contraceptives are given as per protocols',r:'CHO',aoc:'E',me:'ME E14.2',method:['SI','RR']},{t:'Staff is aware of case selection criteria for limiting mentors',r:'CHO',aoc:'E',me:'ME E14.3',method:['SI','RR']},{t:'AAM is supporting & encouraging the clients for post sterilization follow up',r:'CHO',aoc:'E',me:'ME E14.3',method:['SI','RR']}]},{day:44,aoc:'AE',service:'Management of Communicable Diseases',title:'[Revision] Management of Communicable Diseases — Verification & Documentation',task:'Revisit Management of Communicable Diseases — verify all corrective actions implemented and documentation complete.',me:'ME A | ME E',aocTags:['AoC A+E — Revision'],methods:['SI','RR','CI','OB'],roles:{prime:'CHO',support:['ANM','ASHA']},cps:[{t:'Preventive & promotive services under NVBDCP',r:'CHO',aoc:'A',me:'ME A1.5',method:['SI','RR']},{t:'Case detection, treatment, referral & follow up of cases under NVBDCP',r:'CHO',aoc:'A',me:'ME A1.5',method:['SI','RR']},{t:'Preventive & promotive measures  under NTEP',r:'CI',aoc:'A',me:'ME A1.5',method:['SI','CI']},{t:'Case detection, treatment, referral & follow up of cases under NTEP',r:'CHO',aoc:'A',me:'ME A1.5',method:['SI','RR']},{t:'Preventive & promotive measures under NLEP',r:'CHO',aoc:'A',me:'ME A1.5',method:['SI','CI']},{t:'Case detection, treatment, referral & follow up of cases under NLEP',r:'CHO',aoc:'A',me:'ME A1.5',method:['SI','RR']},{t:'Preventive & promotive services under NACP',r:'CHO',aoc:'A',me:'ME A1.5',method:['SI','CI']},{t:'Referral & follow up of cases under NACP',r:'CHO',aoc:'A',me:'ME A1.5',method:['SI','RR']},{t:'Provision for the screening for HIV',r:'CHO',aoc:'A',me:'ME A1.5',method:['SI','RR']},{t:'Preventive & promotive measures  under NVHCP',r:'CHO',aoc:'A',me:'ME A1.5',method:['SI','CI']},{t:'Case detection, treatment, referral & follow up of cases under NVHCP',r:'CHO',aoc:'A',me:'ME A1.5',method:['SI','RR']},{t:'Availability of functional services under IDSP/ IHIP',r:'CHO',aoc:'A',me:'ME A1.5',method:['SI','RR']},{t:'Identification, management and  referral of acute illness & minor aliments',r:'CHO',aoc:'A',me:'ME A1.6',method:['SI','RR']},{t:'Preventive & promotive measures  for acute illness',r:'CHO',aoc:'A',me:'ME A1.6',method:['SI','CI']},{t:'Primary care team  is aware of  vector born disease control strategies',r:'CHO',aoc:'E',me:'ME E10.1',method:['SI','RR']},{t:'Case detection is done for Malaria',r:'CHO',aoc:'E',me:'ME E10.1',method:['SI','RR']},{t:'Staff is aware of Malaria treatment protocols',r:'CHO',aoc:'E',me:'ME E10.1',method:['SI','RR']},{t:'Staff is aware of Malaria referral protocols',r:'CHO',aoc:'E',me:'ME E10.1',method:['SI','RR']},{t:'Staff is aware of diagnostic & management of dengue as per protocols',r:'CHO',aoc:'E',me:'ME E10.1',method:['SI','RR']},{t:'NVBDCP register & records are maintained',r:'ASHA',aoc:'E',me:'ME E10.1',method:['SI','RR']},{t:'Facilities have adequate stock of commodities & drugs',r:'CHO',aoc:'E',me:'ME E10.1',method:['SI','RR']},{t:'Staff is aware of sign & symptoms of prevalent vector born diseases in area',r:'CHO',aoc:'E',me:'ME E10.1',method:['SI']},{t:'Identification of presumptive case  & their referral',r:'CHO',aoc:'E',me:'ME E10.2',method:['RR']},{t:'Ayushman Arogya Mandir support, supervision & manage presumptive, confirmed & on treatment cases including DR- TB patients',r:'CHO',aoc:'E',me:'ME E10.2',method:['RR','OB']},{t:'Staff is aware of follow up protocol after treatment completion',r:'CHO',aoc:'E',me:'ME E10.2',method:['SI','RR']},{t:'NTEP register & records are maintained',r:'CHO',aoc:'E',me:'ME E10.2',method:['RR']},{t:'Primary healthcare team  identify and ensure referral of suspected cases of Leprosy',r:'CHO',aoc:'E',me:'ME E10.3',method:['SI','RR']},{t:'NLEP register & records are maintained',r:'CHO',aoc:'E',me:'ME E10.3',method:['RR']},{t:'Facility provide awareness about leprosy & availability of its treatment',r:'CHO',aoc:'E',me:'ME E10.3',method:['SI','CI']},{t:'Ayushman Arogya Mandir-HSC is aware of their roles in NACP',r:'CHO',aoc:'E',me:'ME E10.4',method:['SI','RR']},{t:'Ayushman Arogya Mandir -SC has linkage for management of HIV/AIDS complications',r:'CHO',aoc:'E',me:'ME E10.4',method:['RR']},{t:'Staff is aware of promotional & supportive  activities done under NACP',r:'CHO',aoc:'E',me:'ME E10.4',method:['SI','RR']},{t:'Staff is aware of syndrome under surveillance in IDSP/IHIP',r:'CHO',aoc:'E',me:'ME E10.5',method:['SI','RR']},{t:'Check process to collect information in form S/ IHIP',r:'CHO',aoc:'E',me:'ME E10.5',method:['RR']},{t:'Check  Analysis & reporting of information for syndromic surveillance is done',r:'CHO',aoc:'E',me:'ME E10.5',method:['SI','RR']},{t:'Availability of diagnostic & treatment services',r:'CHO',aoc:'E',me:'ME E10.6',method:['RR']},{t:'Staff is aware of preventive measures for NVHCP',r:'CHO',aoc:'E',me:'ME E10.6',method:['SI','OB']}]},{day:45,aoc:'AE',service:'Management of Non-Communicable Diseases',title:'[Revision] Management of Non-Communicable Diseases — Verification & Documentation',task:'Revisit Management of Non-Communicable Diseases — verify all corrective actions implemented and documentation complete.',me:'ME A | ME E',aocTags:['AoC A+E — Revision'],methods:['SI','RR','CI'],roles:{prime:'CHO',support:['ANM','ASHA']},cps:[{t:'Availability of services for Hypertension',r:'CHO',aoc:'A',me:'ME A1.7',method:['SI','RR']},{t:'Availability of services for Diabetes',r:'CHO',aoc:'A',me:'ME A1.7',method:['SI','RR']},{t:'Availability of services for Nonalcoholic fatty liver disease (NAFLD)',r:'CHO',aoc:'A',me:'ME A1.7',method:['SI','RR']},{t:'Availability of Services for  Cancers',r:'CHO',aoc:'A',me:'ME A1.7',method:['SI','RR']},{t:'Availability of services for respiratory diseases',r:'CHO',aoc:'A',me:'ME A1.7',method:['SI','RR']},{t:'Availability of services for Epilepsy',r:'CHO',aoc:'A',me:'ME A1.7',method:['SI','RR']},{t:'Availability of  services for  locally prevalent health diseases & substance abuse',r:'CHO',aoc:'A',me:'ME A1.7',method:['RR']},{t:'Preventive & promotive services under NCD',r:'CHO',aoc:'A',me:'ME A1.7',method:['SI','CI']},{t:'Ayushman Arogya Mandir undertakes  health promotion and disease prevention activities through Community level resources',r:'CI',aoc:'A',me:'ME A1.14',method:['RR','CI']},{t:'Provision of wellness services through Yoga and other activities',r:'CHO',aoc:'A',me:'ME A1.14',method:['SI','CI']},{t:'Provision of AYUSH services',r:'CHO',aoc:'A',me:'ME A1.14',method:['SI','RR']},{t:'Provision of counselling services for Eat Right',r:'CHO',aoc:'A',me:'ME A1.14',method:['SI','CI']},{t:'Staff is aware of process of population identification and referral for hypertension',r:'CHO',aoc:'E',me:'ME E11.1',method:['SI','RR']},{t:'CHO is  aware of sign & symptoms  of Hypertension',r:'CHO',aoc:'E',me:'ME E11.1',method:['SI']},{t:'Ayushman Arogya Mandir ensures frequency of follow up & supply of required medicines',r:'CHO',aoc:'E',me:'ME E11.1',method:['RR','CI']},{t:'Staff is aware of promotional & supportive  activities for Hypertension',r:'CHO',aoc:'E',me:'ME E11.1',method:['SI','CI']},{t:'Staff is aware of process of population identification and referral for diabetes',r:'CHO',aoc:'E',me:'ME E11.2',method:['SI','RR']},{t:'CHO is  aware of sign & symptoms  of diabetes',r:'CHO',aoc:'E',me:'ME E11.2',method:['SI']},{t:'Ayushman Arogya Mandir ensures frequency of follow up & supply of required medicines',r:'CHO',aoc:'E',me:'ME E11.2',method:['RR','CI']},{t:'Check Patient is counselled about identification & immediate management hypoglycaemia',r:'CHO',aoc:'E',me:'ME E11.2',method:['SI','CI']},{t:'Ayushman Arogya Mandir is aware of  risk factors of  Nonalcoholic fatty liver disease (NAFLD)',r:'CHO',aoc:'E',me:'ME E11.2',method:['SI','RR']},{t:'Staff is aware of promotional & supportive  activities for diabetes',r:'CHO',aoc:'E',me:'ME E11.2',method:['SI','CI']},{t:'Check cancer screening services are provided through Ayushman Arogya Mandir',r:'CHO',aoc:'E',me:'ME E11.3',method:['SI','RR']},{t:'Staff is aware about sign & symptom of cervical cancer',r:'CHO',aoc:'E',me:'ME E11.3',method:['SI']},{t:'Staff is aware about sign & symptom of Breast cancer',r:'CHO',aoc:'E',me:'ME E11.3',method:['SI']},{t:'Staff is aware about sign & symptom of Oral Cancer',r:'CHO',aoc:'E',me:'ME E11.3',method:['SI']},{t:'Check with  staff about methodology followed for  cancer screening',r:'CHO',aoc:'E',me:'ME E11.3',method:['SI','RR']},{t:'Check CHW is aware of referral centre for all types of cancer',r:'CHO',aoc:'E',me:'ME E11.3',method:['SI','RR']},{t:'Staff is aware of promotional & supportive  activities for cancers',r:'CHO',aoc:'E',me:'ME E11.3',method:['SI','CI']},{t:'Confirmation and referral of cases for Tobacco/alcohol/ substance abuse',r:'CHO',aoc:'E',me:'ME E11.4',method:['SI','RR']},{t:'Promotional & supportive  activities for Tobacco/alcohol/ substance abuse',r:'CHO',aoc:'E',me:'ME E11.4',method:['SI','RR','CI']},{t:'Check Screening & referral  locally prevalent diseases',r:'CHO',aoc:'E',me:'ME E11.4',method:['SI','CI']},{t:'Check Ayushman Arogya Mandir is providing Yoga services',r:'ASHA',aoc:'E',me:'ME E11.5',method:['SI','RR']},{t:'Check Yoga sessions are conducted regularly',r:'CHO',aoc:'E',me:'ME E11.5',method:['RR','CI']},{t:'Check counselling of mother\'s for nutrition & hygiene maintenance under Eat right',r:'CHO',aoc:'E',me:'ME E11.5',method:['SI','CI']},{t:'Check staff counsel and guide the mother\'s about household preparation of complementary feeds',r:'CHO',aoc:'E',me:'ME E11.5',method:['SI','CI']},{t:'Check Primary  health care team generate awareness  in community about balanced diet',r:'CHO',aoc:'E',me:'ME E11.5',method:['SI','CI']},{t:'Check Primary  health care team generate awareness  in community about food fortification',r:'CHO',aoc:'E',me:'ME E11.5',method:['SI','CI']},{t:'Check Primary  health care team generate awareness  in community about Eat safe practices',r:'CHO',aoc:'E',me:'ME E11.5',method:['SI','CI']},{t:'Check Primary  health care team generate awareness  in community about food safety',r:'CHO',aoc:'E',me:'ME E11.5',method:['SI','CI']}]},{day:46,aoc:'AE',service:'Drugs & Diagnostics',title:'[Revision] Drugs & Diagnostics — Verification & Documentation',task:'Revisit Drugs & Diagnostics — verify all corrective actions implemented and documentation complete.',me:'ME A | ME E',aocTags:['AoC A+E — Revision'],methods:['RR','CI','SI'],roles:{prime:'CHO',support:['ANM','ASHA']},cps:[{t:'Availability of basic diagnostic services including NHP',r:'ANM',aoc:'A',me:'ME A2.1',method:['RR','CI']},{t:'Linkages with the Central diagnostic units (Hub & spoke)',r:'ANM',aoc:'A',me:'ME A2.1',method:['SI','RR']},{t:'Availability of drugs as per EDL',r:'CHO',aoc:'A',me:'ME A2.2',method:['SI','RR']},{t:'Availability of drugs for refill for chronic cases',r:'CHO',aoc:'A',me:'ME A2.2',method:['SI','RR']}]},{day:47,aoc:'AE',service:'Emergency',title:'[Revision] Emergency — Verification & Documentation',task:'Revisit Emergency — verify all corrective actions implemented and documentation complete.',me:'ME A | ME E',aocTags:['AoC A+E — Revision'],methods:['SI','RR','CI','OB'],roles:{prime:'CHO',support:['ANM','ASHA']},cps:[{t:'Availability of services for Medical Emergencies including trauma & burns',r:'CHO',aoc:'A',me:'ME A1.12',method:['SI','RR']},{t:'Emergency protocols for first aid and stabilization are available',r:'CHO',aoc:'E',me:'ME E 7.1',method:['SI','RR']},{t:'Staff is aware of  procedure for CPR',r:'CHO',aoc:'E',me:'ME E 7.1',method:['SI','RR']},{t:'Ayushman Arogya Mandir ensures timely availability of ambulances services for emergency cases',r:'CHO',aoc:'E',me:'ME E 7.1',method:['RR','CI']},{t:'Emergency care is given in case of disaster',r:'CHO',aoc:'E',me:'ME E 7.2',method:['SI','OB']},{t:'Staff is aware of  process of sorting the patients in case of mass causalty/ outbreak',r:'CHO',aoc:'E',me:'ME E 7.2',method:['SI','RR']}]},{day:48,aoc:'AE',service:'Care of Common Ophthalmic and ENT',title:'[Revision] Care of Common Ophthalmic and ENT — Verification & Documentation',task:'Revisit Care of Common Ophthalmic and ENT — verify all corrective actions implemented and documentation complete.',me:'ME A | ME E',aocTags:['AoC A+E — Revision'],methods:['SI','RR','CI','OB'],roles:{prime:'CHO',support:['ANM','ASHA']},cps:[{t:'Availability of  Ophthalmic  Services',r:'CHO',aoc:'A',me:'ME A1.8',method:['SI','RR']},{t:'Preventive & promotive services under for Ophthalmic',r:'CHO',aoc:'A',me:'ME A1.8',method:['SI','CI']},{t:'Availability of  ENT Services',r:'CHO',aoc:'A',me:'ME A1.9',method:['SI','RR']},{t:'Preventive & promotive services under for ENT',r:'CHO',aoc:'A',me:'ME A1.9',method:['SI','CI']},{t:'Staff screen & refer cases of common ophthalmic aliments  lead to blindness & refractive errors',r:'CHO',aoc:'E',me:'ME E8.1',method:['SI','RR']},{t:'Staff is aware of identification & primary management common ophthalmic conditions including emergencies',r:'CHO',aoc:'E',me:'ME E8.1',method:['SI','RR','OB']},{t:'Staff is aware of  methods for measuring the refractive errors',r:'CHO',aoc:'E',me:'ME E8.1',method:['SI','RR']},{t:'Staff maintain records under ophthalmic care',r:'CHO',aoc:'E',me:'ME E8.1',method:['SI','RR']},{t:'Promotion & supportive activities for ophthalmic care',r:'CHO',aoc:'E',me:'ME E8.1',method:['RR','CI']},{t:'Screening of population for ENT aliments',r:'CHO',aoc:'E',me:'ME E8.2',method:['SI','RR']},{t:'Identification & primary management of common ear problems',r:'CHO',aoc:'E',me:'ME E8.2',method:['SI','RR']},{t:'Staff is trained & using diagnostic tools for identification of ear problems',r:'CHO',aoc:'E',me:'ME E8.2',method:['RR','OB']},{t:'Identification & management of nose problem',r:'CHO',aoc:'E',me:'ME E8.2',method:['RR','OB']},{t:'Staff is trained & using diagnostic tools for identification of Nose aliments',r:'CHO',aoc:'E',me:'ME E8.2',method:['SI','OB']},{t:'Identification & primary management  of throat aliments',r:'CHO',aoc:'E',me:'ME E8.2',method:['SI','RR']},{t:'Check staff is trained & able to  perform Heimlich manoeuvre/ dislodge obstruction from windpipe',r:'CHO',aoc:'E',me:'ME E8.2',method:['SI','RR']},{t:'Staff is trained to identify ENT aliments require referral to higher centre',r:'CHO',aoc:'E',me:'ME E8.2',method:['SI','RR']},{t:'Promotion & supportive activities for ENT',r:'CHO',aoc:'E',me:'ME E8.2',method:['SI','RR','CI']}]},{day:49,aoc:'AE',service:'Oral Health Care',title:'[Revision] Oral Health Care — Verification & Documentation',task:'Revisit Oral Health Care — verify all corrective actions implemented and documentation complete.',me:'ME A | ME E',aocTags:['AoC A+E — Revision'],methods:['SI','RR','CI'],roles:{prime:'CHO',support:['ANM','ASHA']},cps:[{t:'Availability of  early identification & referral services for oral Health conditions',r:'CHO',aoc:'A',me:'ME A1.10',method:['SI','RR']},{t:'Availability of  symptomatic management & referral services for oral Health conditions',r:'CHO',aoc:'A',me:'ME A1.10',method:['SI','RR']},{t:'Preventive & promotive services under oral health',r:'CHO',aoc:'A',me:'ME A1.10',method:['SI','CI']},{t:'Staff is aware about Oral health conditions, primary management & referral',r:'CHO',aoc:'E',me:'ME E8.3',method:['SI']},{t:'Staff is aware of symptomatic  treatment for dental emergencies',r:'CHO',aoc:'E',me:'ME E8.3',method:['SI','RR']},{t:'Screening of oral health conditions is done as per protocol',r:'CHO',aoc:'E',me:'ME E8.3',method:['SI','RR']},{t:'Promotion & supportive activities for oral health',r:'CHO',aoc:'E',me:'ME E8.3',method:['SI','CI']}]},{day:50,aoc:'AE',service:'Mental Health',title:'[Revision] Mental Health — Verification & Documentation',task:'Revisit Mental Health — verify all corrective actions implemented and documentation complete.',me:'ME A | ME E',aocTags:['AoC A+E — Revision'],methods:['SI','RR','CI'],roles:{prime:'CHO',support:['ANM','ASHA']},cps:[{t:'Availability of services for mental health',r:'CHO',aoc:'A',me:'ME A1.13',method:['SI','RR']},{t:'Preventive & promotive services under mental health',r:'CHO',aoc:'A',me:'ME A1.13',method:['SI','CI']},{t:'Check staff is aware of MNS (Mental, neurological & substance use)  conditions',r:'CHO',aoc:'E',me:'ME E9.1',method:['SI','RR']},{t:'Check Staff  uses specific  tools for early identification & screening of MNS',r:'ASHA',aoc:'E',me:'ME E9.1',method:['SI','RR']},{t:'Staff is competent for basic management, referral & follow up of MNS',r:'CHO',aoc:'E',me:'ME E9.1',method:['SI','RR']},{t:'Check staff is trained for emergency management of  Epilepsy',r:'CHO',aoc:'E',me:'ME E9.1',method:['SI','RR']},{t:'Promotion & supportive activities for mental health',r:'CHO',aoc:'E',me:'ME E9.1',method:['SI','CI']}]},{day:51,aoc:'AE',service:'Elderly & Pallative Care',title:'[Revision] Elderly & Pallative Care — Verification & Documentation',task:'Revisit Elderly & Pallative Care — verify all corrective actions implemented and documentation complete.',me:'ME A | ME E',aocTags:['AoC A+E — Revision'],methods:['SI','RR','OB','CI'],roles:{prime:'CHO',support:['ANM','ASHA']},cps:[{t:'Availability of services for elderly care',r:'CHO',aoc:'A',me:'ME A1.11',method:['SI','RR']},{t:'Availability of services for palliative care',r:'CHO',aoc:'A',me:'ME A1.11',method:['SI','RR']},{t:'Elderly population is mapped & screened',r:'CHO',aoc:'E',me:'ME E12.1',method:['SI','RR']},{t:'CHO is aware &  competent to use various geriatric tools',r:'CHO',aoc:'E',me:'ME E12.1',method:['RR','OB']},{t:'Ayushman Arogya Mandir ­undertake preliminary assessment for the need of assistive devices',r:'CHO',aoc:'E',me:'ME E12.1',method:['RR']},{t:'Promotional & supportive activities for Geriatric care',r:'CHO',aoc:'E',me:'ME E12.1',method:['SI','CI']},{t:'Screening, basic management & referral  of Palliative Care patient is done',r:'CHO',aoc:'E',me:'ME E12.2',method:['RR','CI']},{t:'Home based palliative care services are being provided',r:'CHO',aoc:'E',me:'ME E12.2',method:['SI','RR']},{t:'Check Home care kit is available & case sheet are  updated',r:'CHO',aoc:'E',me:'ME E12.2',method:['SI','RR']},{t:'Check patient support groups are available',r:'CHO',aoc:'E',me:'ME E12.2',method:['SI','RR']},{t:'Promotional & supportive activities for palliative care',r:'CHO',aoc:'E',me:'ME E12.2',method:['SI','CI']}]},{day:52,aoc:'AE',service:'Consolidation',title:'AoC B+C Consolidation',task:'Review patient rights evidence folder and confirm all input resources are documented.',me:'All MEs',aocTags:['All Areas of Concern — Consolidation'],methods:['RR','SI','OB'],roles:{prime:'CHO',support:['ANM','ASHA']},cps:[{t:'AoC B evidence folder verified — consent forms, rights charter in place',r:'CHO',aoc:'AE',me:'',method:['RR']},{t:'AoC C — all essential medicines, equipment, and HR documents ready',r:'ANM',aoc:'AE',me:'',method:['OB']},{t:'Patient feedback system active — last 3 months records available',r:'CHO',aoc:'AE',me:'',method:['RR']}]},{day:53,aoc:'AE',service:'Consolidation',title:'AoC D+F Consolidation',task:'Verify all support services and infection control gaps are closed.',me:'All MEs',aocTags:['All Areas of Concern — Consolidation'],methods:['RR','SI','OB'],roles:{prime:'CHO',support:['ANM','ASHA']},cps:[{t:'BMW management fully compliant — no open waste found',r:'CHO',aoc:'AE',me:'',method:['OB']},{t:'Sterilisation records accurate — all instruments within sterile period',r:'ANM',aoc:'AE',me:'',method:['RR']},{t:'Hand hygiene compliance >90% — observed and documented',r:'CHO',aoc:'AE',me:'',method:['OB']}]},{day:54,aoc:'AE',service:'Consolidation',title:'AoC G+H Consolidation',task:'Complete quality management evidence and confirm all outcome indicators are documented.',me:'All MEs',aocTags:['All Areas of Concern — Consolidation'],methods:['RR','SI','OB'],roles:{prime:'CHO',support:['ANM','ASHA']},cps:[{t:'QI meeting minutes for last 3 months filed and accessible',r:'CHO',aoc:'AE',me:'',method:['RR']},{t:'All health outcome indicators documented and improving vs baseline',r:'CHO',aoc:'AE',me:'',method:['RR']},{t:'Patient satisfaction survey results compiled and displayed',r:'CHO',aoc:'AE',me:'',method:['RR']}]},{day:55,aoc:'AE',service:'Consolidation',title:'Final Evidence Review',task:'Final check of all 8 Area of Concern evidence folders — nothing missing.',me:'All MEs',aocTags:['All Areas of Concern — Consolidation'],methods:['RR','SI','OB'],roles:{prime:'CHO',support:['ANM','ASHA']},cps:[{t:'All 8 AoC evidence folders complete with supporting documents',r:'CHO',aoc:'AE',me:'',method:['RR']},{t:'Each ME has at least 1 supporting document in evidence folder',r:'CHO',aoc:'AE',me:'',method:['RR']},{t:'Evidence folder indexed and organised for quick access during assessment',r:'ANM',aoc:'AE',me:'',method:['RR']}]},{day:56,aoc:'AE',service:'Consolidation',title:'Staff Confidence Drill',task:'Final staff interview and observation drill — all team members confident in their roles.',me:'All MEs',aocTags:['All Areas of Concern — Consolidation'],methods:['RR','SI','OB'],roles:{prime:'CHO',support:['ANM','ASHA']},cps:[{t:'CHO can answer all AoC A,B,C questions confidently',r:'CHO',aoc:'AE',me:'',method:['SI']},{t:'ANM can answer all immunisation, ANC, and drug-related questions',r:'ANM',aoc:'AE',me:'',method:['SI']},{t:'ASHA can explain her community role, records, and outreach activities',r:'ASHA',aoc:'AE',me:'',method:['SI']}]},{day:57,aoc:'AE',service:'Consolidation',title:'Display & Documentation Check',task:'Verify all display boards, registers, and facility readiness for NQAS assessor visit.',me:'All MEs',aocTags:['All Areas of Concern — Consolidation'],methods:['RR','SI','OB'],roles:{prime:'CHO',support:['ANM','ASHA']},cps:[{t:'All display boards updated — patient rights, services list, contact numbers',r:'CHO',aoc:'AE',me:'',method:['OB']},{t:'SC premises clean, well-lit, and equipment in working order',r:'CHO',aoc:'AE',me:'',method:['OB']},{t:'All registers up to date — no missing entries for last 3 months',r:'ANM',aoc:'AE',me:'',method:['RR']}]},{day:58,aoc:'AE',service:'Consolidation',title:'Peer Assessment',task:'Internal peer assessment — team members assess each other across all AoC.',me:'All MEs',aocTags:['All Areas of Concern — Consolidation'],methods:['RR','SI','OB'],roles:{prime:'CHO',support:['ANM','ASHA']},cps:[{t:'Peer assessment completed — each staff member assessed by colleague',r:'CHO',aoc:'AE',me:'',method:['OB']},{t:'All peer assessment findings documented and corrective actions taken',r:'CHO',aoc:'AE',me:'',method:['RR']},{t:'Team debrief conducted — final motivation session held',r:'CHO',aoc:'AE',me:'',method:['SI']}]},{day:59,aoc:'AE',service:'Mock Assessment',title:'Mock Assessment — Evidence Folder & Staff Drill',task:'Full mock assessment run-through. Simulate NQAS assessor visit across all Areas of Concern.',me:'All MEs',aocTags:['All Areas of Concern'],methods:['SI','RR','OB','CI'],roles:{prime:'CHO',support:['ANM','ASHA']},cps:[{t:'SI drill: All staff can answer their role-specific questions',r:'CHO',aoc:'AE',me:'',method:['SI']},{t:'RR drill: All registers produced and verified within 2 minutes',r:'ANM',aoc:'AE',me:'',method:['RR']},{t:'OB drill: SC premises — zero violations found',r:'CHO',aoc:'AE',me:'',method:['OB']},{t:'Evidence folder complete for all 8 Areas of Concern',r:'CHO',aoc:'AE',me:'',method:['RR']},{t:'All gap closure actions confirmed complete',r:'CHO',aoc:'AE',me:'',method:['SI']},{t:'Block/PHC supervisor briefed on final readiness',r:'CHO',aoc:'AE',me:'',method:['SI']},{t:'Team confident and motivated — ready for NQAS assessment',r:'CHO',aoc:'AE',me:'',method:['SI']}]},{day:60,aoc:'Boss',service:'Grand Finale',title:'🏆 GRAND FINALE — Complete NQAS Mock Assessment',task:'🏆 Full simulation of NQAS assessment across all 8 Areas of Concern. Celebrate your preparation!',me:'All MEs',aocTags:['All Areas of Concern'],methods:['SI','RR','OB','CI'],roles:{prime:'CHO',support:['ANM','ASHA']},isBoss:true,cps:[{t:'AoC A (Service Provision) — verified and fully compliant',r:'CHO',aoc:'Boss',me:'',method:['SI']},{t:'AoC B (Patient Rights) — verified and fully compliant',r:'CHO',aoc:'Boss',me:'',method:['CI']},{t:'AoC C (Inputs) — verified and fully compliant',r:'CHO',aoc:'Boss',me:'',method:['OB']},{t:'AoC D (Support Services) — verified and fully compliant',r:'CHO',aoc:'Boss',me:'',method:['OB']},{t:'AoC E (Clinical Services) — verified and fully compliant',r:'CHO',aoc:'Boss',me:'',method:['SI']},{t:'AoC F (Infection Control) — verified and fully compliant',r:'CHO',aoc:'Boss',me:'',method:['OB']},{t:'AoC G (Quality Management) — verified and fully compliant',r:'CHO',aoc:'Boss',me:'',method:['RR']},{t:'AoC H (Outcome) — reviewed and documented',r:'CHO',aoc:'Boss',me:'',method:['RR']},{t:'Evidence folder complete for all 8 Areas of Concern',r:'CHO',aoc:'Boss',me:'',method:['RR']},{t:'🎉 Team celebrated — NQAS | FAST Programme Complete!',r:'CHO',aoc:'Boss',me:'',method:['SI']}]}];
// ══════════════════════════════════════════════════════════════
// CONSTANTS & FIREBASE CONFIG
// ══════════════════════════════════════════════════════════════
const ADMIN_PASSWORD = (window.__scTest&&window.__scTest.adminPw)||null;   // never set in the live app: HealSol signs in with a personal account
const PROGRESS_KEY   = 'nqas_progress_v2';
const editKey   = id => id + '_edits_v1';
const cfgKey    = id => id + '_cfg_v1';
const pubVerKey = id => id + '_version';
const codesKey  = id => id + '_codes_v1';
const accessKeyPath = id => 'shared/accesskey_' + id;

const FIREBASE_CONFIG = NF_APP.firebase;

var NF_APPCHECK_SITE_KEY=NF_APP.appCheckKey;   // Fraud Defense (reCAPTCHA Enterprise) site key, registered in Firebase App Check
let db=null;
var _nfAppCheckOn=false;
function nfStartAppCheck(){
  if(_nfAppCheckOn) return;
  try{
    var key=(typeof NF_APPCHECK_SITE_KEY!=='undefined')?NF_APPCHECK_SITE_KEY:'';
    if(!key||typeof firebase.appCheck!=='function'||!firebase.apps.length) return;
    firebase.appCheck().activate(new firebase.appCheck.ReCaptchaEnterpriseProvider(key),true);
    _nfAppCheckOn=true;
  }catch(e){ console.warn('App Check:',e&&e.message); }
}
function initFirebase(){
  try{
    if(typeof firebase==='undefined'){setTimeout(initFirebase,500);return;}
    if(db) return;
    firebase.initializeApp(FIREBASE_CONFIG);
    nfStartAppCheck();                       // App Check must start right after the app, before the database is used
    db=firebase.database();
    console.log('Firebase connected ✓');
  }catch(e){
    if(e.code==='app/duplicate-app'){db=firebase.database();}
    else{console.warn('Firebase:',e.message);setTimeout(initFirebase,1000);}
  }
}
async function fbGet(path){
  try{if(!db)return null;const s=await db.ref(path).get();return s.exists()?s.val():null;}catch(e){return null;}
}
async function fbSet(path,val){
  try{
    if(!db){ console.warn('fbSet: db not ready for path:',path); return false; }
    await db.ref(path).set(val);
    return true;
  }catch(e){
    console.error('fbSet error at',path,':',e.message);
    return false;
  }
}
const storage={
  async get(key,shared=false){
    if(shared&&db){const v=await fbGet('shared/'+key);if(v!==null)return{key,value:typeof v==='string'?v:JSON.stringify(v)};}
    try{const v=localStorage.getItem(shared?'sh_'+key:key);return v?{key,value:v}:null;}catch(e){return null;}
  },
  async set(key,value,shared=false){
    if(shared&&db){const ok=await fbSet('shared/'+key,value);if(ok){try{localStorage.setItem('sh_'+key,value);}catch(e){}return{key,value};}}
    try{localStorage.setItem(shared?'sh_'+key:key,value);return{key,value};}catch(e){return null;}
  }
};

// ══════════════════════════════════════════════════════════════
// PROGRAMME DEFINITIONS
// ══════════════════════════════════════════════════════════════
const PROGRAMS=[
  {id:'nqas_12A',name:'12-Package · Type A',desc:'Expanded SC without delivery',icon:'🏨',pkg:'12',type:'A',days:60},
  {id:'nqas_12B',name:'12-Package · Type B',desc:'Expanded SC with delivery',   icon:'🌟',pkg:'12',type:'B',days:60},
];
const PROG_DAYS_MAP={
  'nqas_12A':DAYS_12A,'nqas_12B':DAYS_12B
};
function getProg(id){return PROGRAMS.find(p=>p.id===id)||PROGRAMS[0];}
function getDaysArr(progId){return PROG_DAYS_MAP[progId]||DAYS_12A;}

// ══════════════════════════════════════════════════════════════
// AOC DEFINITIONS
// ══════════════════════════════════════════════════════════════
const AOC_DEFS=[
  {key:'A', label:'AoC A',fullLabel:'Area of Concern A — Service Provision', color:'#1E6B5E',pzCls:'aAE'},
  {key:'E', label:'AoC E',fullLabel:'Area of Concern E — Clinical Services',  color:'#2A8A79',pzCls:'aAE'},
  {key:'B', label:'AoC B',fullLabel:'Area of Concern B — Patient Rights',     color:'#16A34A',pzCls:'aB'},
  {key:'C', label:'AoC C',fullLabel:'Area of Concern C — Inputs',             color:'#D97706',pzCls:'aC'},
  {key:'D', label:'AoC D',fullLabel:'Area of Concern D — Support Services',   color:'#EA580C',pzCls:'aD'},
  {key:'F', label:'AoC F',fullLabel:'Area of Concern F — Infection Control',  color:'#0369A1',pzCls:'aF'},
  {key:'G', label:'AoC G',fullLabel:'Area of Concern G — Quality Management', color:'#5B21B6',pzCls:'aG'},
  {key:'H', label:'AoC H',fullLabel:'Area of Concern H — Outcome',            color:'#9D174D',pzCls:'aH'},
  {key:'Boss',label:'Readiness',fullLabel:'Readiness week',                            color:'#D97706',pzCls:'aBoss'},
];
function getAoCDef(key){return AOC_DEFS.find(a=>a.key===key)||AOC_DEFS[0];}

// Services for service readiness
const SERVICES=[
  {name:'Pregnancy & Child Birth',icon:'🤰',color:'#1E6B5E',progIds:['nqas_12A','nqas_12B']},
  {name:'Neonatal & Infant Care',icon:'👶',color:'#16A34A',progIds:['nqas_12A','nqas_12B']},
  {name:'Childhood & Adolescent Health',icon:'🧒',color:'#D97706',progIds:['nqas_12A','nqas_12B']},
  {name:'Family Planning',icon:'💊',color:'#9D174D',progIds:['nqas_12A','nqas_12B']},
  {name:'Management of Communicable Diseases',icon:'🦠',color:'#5B21B6',progIds:['nqas_12A','nqas_12B']},
  {name:'Management of Non-Communicable Diseases',icon:'❤️',color:'#DC2626',progIds:['nqas_12A','nqas_12B']},
  {name:'Drugs & Diagnostics',icon:'💉',color:'#0369A1',progIds:['nqas_12A','nqas_12B']},
  {name:'Emergency',icon:'🚨',color:'#EA580C',progIds:['nqas_12A','nqas_12B']},
  {name:'Care of Common Ophthalmic and ENT',icon:'👁️',color:'#0891B2',progIds:['nqas_12A','nqas_12B']},
  {name:'Oral Health Care',icon:'🦷',color:'#0369A1',progIds:['nqas_12A','nqas_12B']},
  {name:'Mental Health',icon:'🧠',color:'#5B21B6',progIds:['nqas_12A','nqas_12B']},
  {name:'Elderly & Pallative Care',icon:'🧓',color:'#16A34A',progIds:['nqas_12A','nqas_12B']},
];

// Roles for role readiness
const ROLES=[
  {key:'CHO',  label:'CHO',  color:'#1E6B5E',bg:'rgba(30,107,94,0.9)'},
  {key:'ANM',  label:'ANM',  color:'#0369A1',bg:'rgba(3,105,161,0.9)'},
  {key:'ASHA', label:'ASHA', color:'#9D174D',bg:'rgba(157,23,77,0.9)'},
  {key:'MPW',  label:'MPW',  color:'#D97706',bg:'rgba(217,119,6,0.9)'},
  {key:'RR',   label:'Record Review',color:'#5B21B6',bg:'rgba(91,33,182,0.9)',methodBased:true},
];

// ══════════════════════════════════════════════════════════════
// STATE
// ══════════════════════════════════════════════════════════════
let appMode=null;
let adminEdits={};
let adminActiveProg=null;
let adminEditorDay=null;
let adminPubMeta={};
let facilityCodes={};
let fcActiveProg=PROGRAMS[0].id;

// ── 3-Tier System Constants ───────────────────────────────────
const SC_ADMIN_PASSWORD = (window.__scTest&&window.__scTest.adminPw)||null;
const SC_VERIFIER_ROLES = NF_CFG.verifierRoles.slice(); // in-charge and designated MO can verify (SC); refilled by nfSetLevel

// Staff roles of this level (see NF_LEVELS)
const SC_ROLES = NF_CFG.roles.slice();   // refilled by nfSetLevel

function getScRole(id){ return SC_ROLES.find(r=>r.id===id)||SC_ROLES[0]; }
function scCanVerify(roleId){ return SC_VERIFIER_ROLES.includes(roleId); }
function scSafeName(n){ return (n||'').replace(/[^a-zA-Z0-9]/g,'_').toLowerCase()||'unnamed'; }
function scFacilityPath(code){ return 'sc_facilities/'+code; }
function scStaffPath(code,mobile){ return 'sc_facilities/'+code+'/staff/'+mobile; }
function scProgressPath(code,mobile,di){ return 'sc_progress/'+code+'/'+mobile+'/day_'+di; }

// Sub-admin state
let scSubAdminCode = '';
let scSubAdminData = {};
let scSubAdminStaff = {};
let scMasterFacilities = {};
let scMasterProgress = {};

let choState={
  progId:'nqas_12A',
  roleId:'CHO',
  staffName:'',
  staffMobile:'',
  facilityCode:'',
  facility:{name:'',district:'',state:''},
  startDate:null,
  currentDay:1,
  cards:{},
  streak:0,
  setupDone:false,
  roleDone:true,
  view:'cards',
  questTab:'role'
};

// ══════════════════════════════════════════════════════════════
// UTILITY
// ══════════════════════════════════════════════════════════════
function $(id){return document.getElementById(id);}
let toastTimer;
function showToast(msg,type=''){
  const t=$('toast');
  t.className='toast show'+(type?' '+type:'');
  t.innerHTML=(type==='ok'?'<i class="ti ti-check" style="font-size:13px;"></i> ':type==='err'?'<i class="ti ti-alert-circle" style="font-size:13px;"></i> ':'')+msg;
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>t.classList.remove('show'),3200);
}
function launchConfetti(){
  const c=$('confetti');c.style.display='block';c.innerHTML='';
  const cols=['#1E6B5E','#F5A623','#22C55E','#EF4444','#5B21B6','#0369A1'];
  for(let i=0;i<50;i++){
    const p=document.createElement('div');p.className='cf';
    p.style.cssText=`left:${Math.random()*100}%;top:-10px;background:${cols[i%cols.length]};border-radius:${Math.random()>.5?'50%':'3px'};animation-delay:${Math.random()*.9}s;animation-duration:${1.4+Math.random()*.8}s;`;
    c.appendChild(p);
  }
  setTimeout(()=>c.style.display='none',3200);
}

// ══════════════════════════════════════════════════════════════
// DAY LOGIC — Option C: Calendar + Catch-up
// ══════════════════════════════════════════════════════════════
function computeCurrentDay(startDateStr, totalDays){
  if(!startDateStr) return 1;
  const p=startDateStr.split('-');
  const start=new Date(parseInt(p[0]),parseInt(p[1])-1,parseInt(p[2]));
  const today=new Date();
  start.setHours(0,0,0,0); today.setHours(0,0,0,0);
  const diff=Math.floor((today-start)/(1000*60*60*24));
  return Math.max(1,Math.min(diff+1,totalDays));
}
function updateCurrentDay(){
  const prog=getProg(choState.progId);
  if(choState.startDate){
    choState.currentDay=computeCurrentDay(choState.startDate,prog.days);
  }
}
function formatDate(dateStr){
  if(!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'});
}

// ══════════════════════════════════════════════════════════════
// URL PARAMETER
// ══════════════════════════════════════════════════════════════
function getProgFromURL(){
  const p=new URLSearchParams(window.location.search).get('prog');
  if(p){const m=PROGRAMS.find(x=>x.id==='nqas_'+p.toUpperCase());if(m)return m.id;}
  return null;
}

// ══════════════════════════════════════════════════════════════
// LOGIN
// ══════════════════════════════════════════════════════════════
// switchLoginTab overridden by scSwitchTab
function switchLoginTab(t){ scSwitchTab(t); }

function buildStaffProgSelector(){
  const wrap=$('staff-prog-selector');
  if(!wrap)return;
  wrap.innerHTML=PROGRAMS.map(p=>`
    <div class="prog-opt" id="po-${p.id}" onclick="selectStaffProg('${p.id}')">
      <div class="po-icon">${p.icon}</div>
      <div class="po-name">${p.name}</div>
      <div class="po-tag">${p.desc}</div>
    </div>`).join('');
  selectStaffProg(PROGRAMS[0].id);
}

let selectedStaffProg=PROGRAMS[0].id;
function selectStaffProg(id){
  selectedStaffProg=id;
  document.querySelectorAll('.prog-opt').forEach(el=>el.classList.remove('sel'));
  const el=$('po-'+id);if(el)el.classList.add('sel');
  const ci=$('staff-code');if(ci){ci.value='';ci.classList.remove('invalid');}
  const pf=$('staff-pwd-field');if(pf)pf.style.display='none';
  const af=$('staff-ak-field');if(af)af.style.display='none';
  const err=$('staff-err');if(err)err.classList.remove('show');
}
function onStaffCodeInput(){
  const val=$('staff-code')?.value.trim();
  const pf=$('staff-pwd-field');if(pf)pf.style.display=val?'':'none';
  const saved=getSavedAccessKey(selectedStaffProg);
  const af=$('staff-ak-field');if(af)af.style.display=(val&&!saved)?'':'none';
  $('staff-code')?.classList.remove('invalid');
}

// Access key helpers
function getSavedAccessKey(progId){try{return localStorage.getItem('ak_'+progId)||'';}catch(e){return '';}}
function saveAccessKey(progId,key){try{localStorage.setItem('ak_'+progId,key);}catch(e){}}
async function validateAccessKey(progId,key){
  const pub=await fbGet(accessKeyPath(progId));
  if(!pub) return true; // No key set = open
  return key.trim().toUpperCase()===pub.trim().toUpperCase();
}

async function validateFacilityCode(progId,code,pwd){
  let codes=[];
  try{const r=await storage.get(codesKey(progId),true);if(r&&r.value)codes=JSON.parse(r.value);}catch(e){}
  if(!codes.length){try{const loc=localStorage.getItem('sh_'+codesKey(progId));if(loc)codes=JSON.parse(loc);}catch(e){}}
  if(!codes.length) return {valid:true,name:'',code:code}; // Open access
  const match=codes.find(c=>c.code.toUpperCase()===code.toUpperCase());
  if(!match) return {valid:false,reason:'Facility code not found for this programme.'};
  if(match.pwd&&match.pwd!==pwd) return {valid:false,reason:'Incorrect password for this code.'};
  return {valid:true,name:match.name,code:match.code};
}

async function staffLogin(){ scStaffLogin(); }

function adminLogin(){
  const pwd=$('admin-pwd').value;
  const err=$('admin-err');
  if(!nfAuthOK('admin')&&(ADMIN_PASSWORD===null||pwd!==ADMIN_PASSWORD)){err.textContent='Incorrect password.';err.classList.add('show');return;}
  err.classList.remove('show');
  startAdminApp();
}

// ══════════════════════════════════════════════════════════════
// ADMIN APP
// ══════════════════════════════════════════════════════════════
// startAdminApp overridden
function startAdminApp(){ scStartAdminApp(); }

async function logoutAdmin(){
  const ok = await showConfirm('Logout of admin panel?','🔐','Admin Logout','Logout','var(--teal)');
  if(!ok) return;
  $('admin-app').classList.remove('vis');
  $('login-screen').style.display='';
  adminActiveProg=null;adminEdits={};adminEditorDay=null;
  const aes=$('admin-editor-section');if(aes)aes.style.display='none';
  const apw=$('admin-pwd');if(apw)apw.value='';
}

async function loadAdminPubMeta(){
  for(const p of PROGRAMS){
    try{const r=await storage.get(pubVerKey(p.id),true);if(r&&r.value)adminPubMeta[p.id]=JSON.parse(r.value);}catch(e){}
  }
}

function renderAdminProgGrid(){ /* stubbed - new SC dashboard */ }

async function adminSelectProg(id){ /* stubbed */ }

// Admin card editor
function aeGetDay(di){
  var arr = aeGetActiveArray ? aeGetActiveArray() : [];
  return arr[di];
}







function aeAddCP(){
  if(adminEditorDay===null) return;
  const di=adminEditorDay;const d=aeGetDay(di);const edit=adminEdits[di]||{};
  const cps=JSON.parse(JSON.stringify(edit.cps||d.cps||[]));
  cps.push({t:'New checkpoint — enter description here',r:'CHO',aoc:'AE',method:['SI','RR'],me:''});
  if(!adminEdits[di])adminEdits[di]={};adminEdits[di].cps=cps;aeRenderCPs(di);
}
async function aeDeleteCP(ci){
  const ok = await showConfirm('Remove checkpoint '+(ci+1)+'?','🗑️','Delete Checkpoint','Delete','var(--red)');
  if(!ok) return;
  const di=adminEditorDay;const d=aeGetDay(di);const edit=adminEdits[di]||{};
  const cps=JSON.parse(JSON.stringify(edit.cps||d.cps||[]));
  cps.splice(ci,1);
  if(!adminEdits[di])adminEdits[di]={};adminEdits[di].cps=cps;aeRenderCPs(di);
}


async function aeResetDay(){
  if(adminEditorDay===null) return;
  const di=adminEditorDay;
  if(!adminEdits[di]){showToast('No edits to reset — card already original.');return;}
  const ok = await showConfirm('Reset Day '+(di+1)+' to original content?','🔄','Reset Card','Reset','var(--red)');
  if(!ok) return;
  delete adminEdits[di];
  try{localStorage.setItem(editKey(adminActiveProg.id),JSON.stringify(adminEdits));}catch(e){}
  aeOpenDay(di);buildAeDayStrip();showToast('Card reset to original.');
}

function openPubModal(){
  if(!adminActiveProg) return;
  $('pub-success-box').classList.remove('show');
  $('pub-summary').style.display='';$('pub-confirm-btn').style.display='';
  $('ps-prog').textContent=adminActiveProg.name;
  $('ps-pkg').textContent='12-Service Package';
  $('ps-type').textContent=adminActiveProg.type==='B'?'Type B — With Delivery':'Type A — Without Delivery';
  $('ps-days').textContent=adminActiveProg.days+' days';
  $('ps-edits').textContent=Object.keys(adminEdits).length+' of '+adminActiveProg.days+' cards edited';
  $('pub-overlay').classList.add('open');
}
function closePubModal(){$('pub-overlay').classList.remove('open');}
async function publishNow(){ /* stubbed */ }

// Facility codes
async function fcInit(){
  const tabs=$('fc-prog-tabs');tabs.innerHTML='';
  PROGRAMS.forEach(p=>{
    const btn=document.createElement('button');
    btn.className='fc-prog-tab'+(p.id===fcActiveProg?' fct-active':'');
    btn.dataset.progId=p.id;btn.textContent=p.name;
    btn.onclick=()=>{fcActiveProg=p.id;fcInit();};
    tabs.appendChild(btn);
  });
  for(const p of PROGRAMS){
    try{
      const r=await storage.get(codesKey(p.id),true);
      if(r&&r.value){facilityCodes[p.id]=JSON.parse(r.value);try{localStorage.setItem('sh_'+codesKey(p.id),r.value);}catch(e){}}
      else{const loc=localStorage.getItem('sh_'+codesKey(p.id));facilityCodes[p.id]=loc?JSON.parse(loc):(facilityCodes[p.id]||[]);}
    }catch(e){const loc=localStorage.getItem('sh_'+codesKey(p.id));facilityCodes[p.id]=loc?JSON.parse(loc):(facilityCodes[p.id]||[]);}
  }
  fcRenderList();
}
function fcRenderList(){ /* stubbed */ }
async function fcAddCode(){
  const code=$('fc-code-input')?.value.trim().toUpperCase();
  const name=$('fc-name-input')?.value.trim();
  const pwd=$('fc-pwd-input')?.value.trim();
  if(!code){showToast('Please enter a facility code.','err');return;}
  if(!facilityCodes[fcActiveProg])facilityCodes[fcActiveProg]=[];
  if(facilityCodes[fcActiveProg].some(f=>f.code===code)){showToast('Code "'+code+'" already exists.','err');return;}
  facilityCodes[fcActiveProg].push({code,name:name||code,pwd:pwd||''});
  const val=JSON.stringify(facilityCodes[fcActiveProg]);
  try{localStorage.setItem('sh_'+codesKey(fcActiveProg),val);}catch(e){}
  try{await storage.set(codesKey(fcActiveProg),val,true);showToast('Code "'+code+'" added and saved.','ok');}
  catch(e){showToast('Code added locally — click Publish Codes to sync.','ok');}
  $('fc-code-input').value='';$('fc-name-input').value='';$('fc-pwd-input').value='';
  fcRenderList();
}
async function fcDeleteCode(idx){
  const codeVal = (facilityCodes[fcActiveProg]||[])[idx]?.code||'this code';
  const ok = await showConfirm('Remove facility code "'+codeVal+'"?','🗑️','Remove Code','Remove','var(--red)');
  if(!ok) return;
  const codes=facilityCodes[fcActiveProg]||[];codes.splice(idx,1);
  const val=JSON.stringify(codes);
  try{localStorage.setItem('sh_'+codesKey(fcActiveProg),val);}catch(e){}
  try{await storage.set(codesKey(fcActiveProg),val,true);}catch(e){}
  fcRenderList();showToast('Code removed.','ok');
}
async function fcPublish(){
  const codes=facilityCodes[fcActiveProg]||[];
  if(!codes.length){showToast('Add at least one code before publishing.','err');return;}
  try{
    await storage.set(codesKey(fcActiveProg),JSON.stringify(codes),true);
    showToast(codes.length+' codes published for '+getProg(fcActiveProg).name,'ok');
  }catch(e){showToast('Publish failed: '+e.message,'err');}
}

// Access key
async function adminPublishAccessKey(){
  const key=$('access-key-input')?.value.trim();
  if(!key){showToast('Enter an access key first.','err');return;}
  const ok=await fbSet(accessKeyPath(fcActiveProg),key.toUpperCase());
  if(ok){showToast('Access key published for '+getProg(fcActiveProg).name,'ok');$('access-key-input').value='';}
  else{showToast('Failed to publish key — check Firebase connection.','err');}
}

// Admin start date setter
async function adminSetStartDate(){
  const dateVal=$('admin-start-date')?.value;
  if(!dateVal){showToast('Select a date first.','err');return;}
  const key='nqas_start_'+fcActiveProg;
  const ok=await fbSet('shared/'+key,dateVal);
  if(ok){showToast('Start date set for '+getProg(fcActiveProg).name+': '+formatDate(dateVal),'ok');}
  else{showToast('Failed to set date.','err');}
}

// ══════════════════════════════════════════════════════════════
// CHO APP
// ══════════════════════════════════════════════════════════════
function loadCHOState(){
  try{const r=localStorage.getItem(PROGRESS_KEY+'_'+choState.progId);if(r){const s=JSON.parse(r);Object.assign(choState,s);}}catch(e){}
}
function saveCHOState(){
  try{
    // Save ONLY with mobile-based key — never overwrite shared old key
    const key = getChoStateKey();
    localStorage.setItem(key, JSON.stringify(choState));
  }catch(e){}
  scQueueSync();
}
function getCHOCard(di){
  const arr=getDaysArr(choState.progId);
  if(!choState.cards[di])choState.cards[di]={cpScores:new Array(arr[di]?.cps?.length||0).fill(null),taskDone:false,verified:false,score:null,verifierComment:'',commentDate:'',gapRetries:{}};
  return choState.cards[di];
}
var _SC_PROGID_TO_AELETTER={'nqas_12A':'C','nqas_12B':'D'};
function getDay(di){
  const arr=getDaysArr(choState.progId);
  const base=arr[di];if(!base) return arr[0];
  const aeLetter=_SC_PROGID_TO_AELETTER[choState.progId]||'C';
  const key=aeLetter+'_'+di;
  const edit=adminEdits[key];
  if(!edit) return base;
  return{...base,title:edit.title??base.title,task:edit.task??base.task,me:edit.me??base.me,methods:edit.methods??base.methods,cps:edit.cps??base.cps};
}

async function startCHOApp(){
  appMode='cho';
  $('login-screen').style.display='none';
  $('cho-app').classList.add('vis');
  try{ localStorage.setItem('nqas_last_prog', choState.progId); }catch(e){}
  loadCHOState();
  // Pull published config + edits + start date from Firebase
  try{
    const shared=await fbGet('shared/admin_edits');
    if(shared)adminEdits=shared;
    // Load admin-set start date if facility hasn't set their own
    if(!choState.startDate){
      const sd=await fbGet('shared/nqas_start_'+choState.progId);
      if(sd)choState.startDate=sd;
    }
  }catch(e){adminEdits={};}
  // Set programme from URL if no saved start date
  const p=getProg(choState.progId);
  if(!choState.setupDone){
    $('spi-icon').textContent=p.icon;
    $('spi-name').textContent=p.name;
    $('spi-tag').textContent=p.desc+' · '+p.days+'-day programme';
    // Show admin start date if set
    if(choState.startDate){
      $('admin-sd-note').textContent='Programme start date set by admin: '+formatDate(choState.startDate)+'. You may override below.';
      $('admin-sd-note').style.display='';
      $('setup-start-date').value=choState.startDate;
    }
    $('setup-screen').style.display='flex';
  } else {
    updateCurrentDay();
    showCHOMain();
  }
}

function completeFacilitySetup(){
  const name=$('setup-name').value.trim();
  const district=$('setup-district').value.trim();
  const state=$('setup-state').value.trim();
  const startDate=$('setup-start-date').value;
  if(!name){showToast('Please enter the facility name.','err');return;}
  if(!startDate){showToast('Please select your programme start date.','err');return;}
  choState.facility.name=name;
  choState.facility.district=district;
  choState.facility.state=state;
  choState.startDate=startDate;
  choState.setupDone=true;
  updateCurrentDay();
  saveCHOState();
  try{ localStorage.setItem('nqas_last_prog', choState.progId); }catch(e){}
  $('setup-screen').style.display='none';
  showWelcomeScreen();
}

function showCHOMain(){
  $('cho-nav').style.display='';
  $('cho-main').style.display='';
  updateCHOUI();
  buildDaySelector();
  // Show today's card or first unlocked
  renderCard(choState.currentDay-1);
  scrollToToday();
}

function updateCHOUI(){
  const f=choState.facility;
  const p=getProg(choState.progId);
  $('cho-nav-name').textContent=f.name||'My Facility';
  $('fac-name').textContent=f.name||'—';
  $('fac-loc').textContent=[f.district,f.state].filter(Boolean).join(', ')||'—';
  $('cho-pkg-pill').textContent='12-Pkg · Type '+p.type;
  $('cho-day-pill').textContent='Day '+choState.currentDay+' / '+p.days;
  $('fac-pkg').textContent='12-Package · Type '+p.type;
  const prog=getProg(choState.progId);
  $('fac-day-info').textContent='Started: '+formatDate(choState.startDate)+' · Day '+choState.currentDay+' of '+prog.days;
}

async function logoutCHO(){
  const ok = await showConfirm('Logout and return to login screen?','👋','Logout','Logout','var(--teal)');
  if(!ok) return;
  try{ localStorage.removeItem('nqas_last_prog'); }catch(e){}
  $('welcome-screen').classList.remove('vis');
  $('cho-app').classList.remove('vis');
  $('cho-nav').style.display='none';
  $('cho-main').style.display='none';
  $('login-screen').style.display='';
  adminEdits={};
}
function wsLogout(){ logoutCHO(); }

// ══════════════════════════════════════════════════════════════
// SCORING
// ══════════════════════════════════════════════════════════════
function getDayXP(di){
  const c=choState.cards[di];if(!c)return{xp:0,max:0};
  const d=getDay(di);let xp=0,max=0;
  d.cps.forEach((cp,ci)=>{if(!scMyCp(di,ci))return;const s=c.cpScores[ci];if(s===null||s===undefined)return;max+=2;xp+=s;});
  // Gap closures write Full (2) back into cpScores, so no separate re-attempt bonus is added here.
  return{xp,max};
}
function getDayScore(di){
  const c=choState.cards[di];if(!c||!c.taskDone)return null;
  const{xp,max}=getDayXP(di);if(max===0)return 2;
  if(xp/max>=0.8)return 2;if(xp/max>=0.4)return 1;return 0;
}
function getAoCPct(aocKey){
  if(aocKey&&String(aocKey).indexOf('+')>0){ var rr=scReadiness(choState.progId,choState.cards,choState.roleId||'CHO'), xp=0, mx=0;
    String(aocKey).split('+').forEach(function(k){ var b=rr.byAoc[k]; if(b){ xp+=b.xp; mx+=b.max; } }); return mx>0?Math.round(xp/mx*100):0; }
  // Shared calculation (same as dashboards)
  const r=scReadiness(choState.progId,choState.cards,choState.roleId||'CHO');
  if(aocKey==='AE'){ const a=r.byAoc.A||{xp:0,max:0}, e=r.byAoc.E||{xp:0,max:0}; const mx=a.max+e.max; return mx>0?Math.round((a.xp+e.xp)/mx*100):0; }
  if(aocKey==='Boss') return r.pct;
  return (r.byAoc[aocKey]||{pct:0}).pct;
}
function _legacyGetAoCPct(aocKey){
  let xp=0,mx=0;
  const arr=getDaysArr(choState.progId);
  arr.forEach((d_,di)=>{
    const d=getDay(di);if(d.aoc==='Boss')return;
    if(aocKey!=='AE'&&d.aoc!==aocKey&&!(d.aoc==='AE'&&(aocKey==='A'||aocKey==='E')))return;
    const c=choState.cards[di];
    d.cps.forEach((cp,ci)=>{
      const s=c?c.cpScores[ci]:null;if(s===null||s===undefined)return;
      mx+=2;if(c&&c.taskDone)xp+=s;
    });
  });
  return mx>0?Math.round(xp/mx*100):0;
}
function getRolePct(roleKey){
  let xp=0,mx=0;
  const arr=getDaysArr(choState.progId);
  arr.forEach((d_,di)=>{
    const d=getDay(di);if(d.aoc==='Boss')return;
    const c=choState.cards[di];
    d.cps.forEach((cp,ci)=>{
      if(!c||!c.taskDone)return;
      const s=c.cpScores[ci];
      if(s===null||s===undefined)return;
      let match=false;
      if(roleKey==='RR'){match=cp.method&&cp.method.includes('RR');}
      else{match=scCpHasRole(cp,roleKey);}
      if(!match)return;
      mx+=2;xp+=s;
    });
  });
  return{pct:mx>0?Math.round(xp/mx*100):0,xp,mx};
}

// ══════════════════════════════════════════════════════════════
// DAY SELECTOR
// ══════════════════════════════════════════════════════════════
function buildDaySelector(){
  const scroll=$('ds-scroll');scroll.innerHTML='';
  const arr=getDaysArr(choState.progId);
  arr.forEach((d,di)=>{
    const sc=getDayScore(di);
    const isToday=(di+1)===choState.currentDay;
    const isLocked=(di+1)>choState.currentDay;
    const div=document.createElement('div');
    let cls='ds-day'+(isLocked?' locked-day':'')+(d.isBoss?' boss-day':'');
    if(isToday) cls+=' active today-ring';
    else if(sc===2) cls+=' done-full';
    else if(sc===1) cls+=' done-half';
    else if(sc===0) cls+=' done-zero';
    const _mine=scMyCpIdx(di).length;
    if(!_mine) cls+=' scx-no-cps';
    div.className=cls;
    const z=d.aoc==='AE'?'A+E':d.aoc==='Boss'?'⚔️':d.aoc;
    div.innerHTML=`<div class="dd-n">${String(d.day).padStart(2,'0')}</div><div class="dd-z">AoC ${z}</div>${sc!==null?`<div class="dd-tick">${sc===2?'✓':sc===1?'½':'✗'}</div>`:''}`;
    div.title=`Day ${d.day}: ${d.title}${isLocked?' (Locked)':''}${isToday?' ← Today':''}${_mine?' · '+_mine+' checkpoints for you':' · No checkpoints for your role'}`;
    if(!isLocked)div.onclick=()=>selectDay(di+1);
    scroll.appendChild(div);
  });
}
function selectDay(day){window._scLastDi=day-1;saveCHOState();buildDaySelector();renderCard(day-1);}
function scrollToToday(){const el=$('ds-scroll')?.children[choState.currentDay-1];if(el)el.scrollIntoView({inline:'center',behavior:'smooth'});}

// ══════════════════════════════════════════════════════════════
// CARD RENDER
// ══════════════════════════════════════════════════════════════
function renderCard(di){
  window._scLastDi=di;
  const d=getDay(di);const c=getCHOCard(di);
  if(!phcCheckAccess(di,d)){
    var cont=$('card-container');
    if(cont){renderUpgradeCard(cont,d);}
    return;
  }
  const isLocked=!scDayUnlocked(di);const isBoss=!!d.isBoss;
  const aocColor=isBoss?'#D97706':d.aoc==='AE'?'#1E6B5E':getAoCDef(d.aoc).color;
  const hdBg=isBoss?`linear-gradient(135deg,#D97706,#92400E)`:
    d.aoc==='AE'?`linear-gradient(135deg,#1E6B5E,#2A8A79)`:
    `linear-gradient(135deg,${aocColor},${aocColor}CC)`;

  const methodHTML=d.methods.map(m=>{
    const cls={SI:'si',RR:'rr',CI:'ci',OB:'ob'}[m]||'rr';
    const lbl={SI:'Staff Interview',RR:'Record Review',CI:'Client Interview',OB:'Observation'}[m]||m;
    const ico={SI:'user-check',RR:'file-text',CI:'users',OB:'eye'}[m]||'file';
    return `<div class="mc ${cls}"><i class="ti ti-${ico}" style="font-size:11px;"></i> ${m} — ${lbl}</div>`;
  }).join('');

  const myIdx=scMyCpIdx(di); const hiddenN=d.cps.length-myIdx.length;
  const myRole=choState.roleId||'CHO';
  const cpHTML=myIdx.length
    ? myIdx.map(ci=>cpItemHTML(di,ci,d.cps[ci],d,c,isLocked)).join('')
      +(hiddenN?`<li class="scx-cp-note"><i class="ti ti-users" style="font-size:12px;"></i> ${hiddenN} ${t(hiddenN===1?'other checkpoint is assigned to other staff and scored by them.':'other checkpoints are assigned to other staff and scored by them.')}</li>`:'')
    : `<li class="scx-cp-none"><div style="font-size:22px;">🗂️</div><b>${t('No checkpoints are assigned to your role on this day.')}</b><div>${hiddenN} ${t('checkpoints on this card belong to other staff.')}${scCanVerify(myRole)?' '+t('You can review and verify their work.'):''}</div></li>`;

  // Gap section
  let gapHTML='';
  if(c.taskDone){
    const today=scTodayStr();
    const gaps=d.cps.map((cp,ci)=>({cp,ci})).filter(({ci})=>scMyCp(di,ci)).filter(({ci})=>{const s=c.cpScores[ci];const gr=c.gapRetries&&c.gapRetries[ci];return (s!==null&&s!==undefined&&s<2)||(gr&&gr.closed);});
    if(gaps.length){
      const openN=gaps.filter(({ci})=>c.cpScores[ci]!==2).length;
      const items=gaps.map(({cp,ci})=>{
        const s=c.cpScores[ci];const gr=(c.gapRetries&&c.gapRetries[ci])||null;
        const attempts=gr&&gr.attempts?scAsList(gr.attempts).length:0;
        const closed=!!(gr&&gr.closed)&&s===2;
        const act=closed?null:scMyActionFor(di,ci);
        const od=act&&act.dueDate&&act.dueDate<today;
        let btns;
        if(closed) btns=`<span style="color:var(--green-dk);font-size:10px;font-weight:800;">✓ ${t('Gap closed')} at Full${attempts?' · '+attempts+' attempt'+(attempts>1?'s':''):''}</span>`;
        else btns=`${gr&&gr.score!=null?`<span style="font-size:10px;color:var(--amber-dk);font-weight:700;">Last re-attempt: ${gr.score===1?'Half':'Zero'} · ${attempts} so far</span>`:''}<button class="gap-retry-btn" onclick="gapRetry(${di},${ci})"><i class="ti ti-refresh" style="font-size:10px;"></i> ${t('Re-attempt')}</button>`;
        const orig=closed?(gr.orig===0?'Zero':gr.orig===1?'Half':''):(s===0?'Zero':s===1?'Half':'');
        const actHTML=act?`<div class="scx-gap-action${od?' overdue':''}">📌 <b>${t('Corrective action')}:</b> ${scEsc(act.action)}<br>${act.dueDate?'Due '+scFmtDate(act.dueDate)+(od?' · <b>Overdue</b>':''):'No due date'} · by ${scEsc(act.assignedBy||'—')}${act.assignedByRole?' ('+scEsc(act.assignedByRole)+')':''}</div>`:'';
        return `<div class="gap-item"><div class="gap-cp-text">${act?'📌 ':''}${getCPText(cp)}</div><div class="gap-score-row"><span class="gap-score-lbl">${closed?'Was '+orig:orig+' score'} · ${scEsc(scCpRoleText(cp))}</span>${btns}</div>${actHTML}</div>`;
      }).join('');
      gapHTML=`<div class="gap-section"><div class="gap-title"><i class="ti ti-alert-triangle" style="font-size:12px;"></i> ${openN} ${openN===1?'Gap':'Gaps'} to Close${gaps.length>openN?' · '+(gaps.length-openN)+' closed':''}</div><div style="font-size:10px;color:var(--t3);font-weight:700;margin:-2px 0 8px;">A gap closes only when a re-attempt reaches Full compliance. Re-attempt as often as you need.</div>${items}</div>`;
    }
  }

  const{xp:xpE,max:xpM}=getDayXP(di);
  const aocPct=getAoCPct(d.aoc==='Boss'?'AE':d.aoc);
  const aocLbl=d.aoc==='AE'?'AoC A+E':d.aoc==='Boss'?'Overall':'AoC '+d.aoc;

  let statusHTML='';
  if(c.verified)statusHTML=`<div class="status-banner verified show"><i class="ti ti-shield-check" style="font-size:14px;flex-shrink:0;"></i> Verified${c.verifiedBy?' by '+scEsc(c.verifiedBy)+(c.verifiedByRole?' ('+scEsc(c.verifiedByRole)+')':''):''}${c.verifiedAt?' · '+scFmtDate(c.verifiedAt):''}${c.verifyMode==='sample'?' · sample check':''} · Score: ${getDayScore(di)}/2 XP · Card locked.</div>`;
  else if(c.taskDone)statusHTML=`<div class="status-banner pending show"><i class="ti ti-clock" style="font-size:14px;flex-shrink:0;"></i> Marked done · Awaiting ${scVerifierLabel(choState.roleId||'CHO')} sign-off.${scIsVerifier()&&_scVQ.roster&&!scOtherVerifiers().length?' <b>No '+(scVerifiersFor(choState.roleId||'CHO').indexOf(choState.roleId)>=0?'other ':'')+scVerifierLabel(choState.roleId||'CHO')+' is registered at this facility yet — ask your Facility Admin to add one.</b>':''}</div>`;
  else if(c.sentBackAt&&!isLocked)statusHTML=`<div class="status-banner pending show" style="background:#FEF2F2;border-color:#FCA5A5;color:#991B1B;"><i class="ti ti-arrow-back-up" style="font-size:14px;flex-shrink:0;"></i> <div>Sent back by ${scEsc(c.sentBackBy||'CHO/MO')}${c.sentBackByRole?' ('+scEsc(c.sentBackByRole)+')':''} · ${scFmtDate(c.sentBackAt)}${c.sentBackReason?'<br><b>Reason:</b> '+scEsc(c.sentBackReason):''}<br>Please redo your checkpoints and mark done again.</div></div>`;
  else if(isLocked)statusHTML=`<div class="status-banner locked show"><i class="ti ti-lock" style="font-size:14px;flex-shrink:0;"></i> This card unlocks on Day ${di+1}. Available from ${getUnlockDate(di)}.</div>`;

  const tagsHTML=d.aocTags.map(t=>`<div class="tag aoc"><i class="ti ti-layout-grid" style="font-size:10px;"></i> ${t}</div>`).join('')
    +`<div class="tag me"><i class="ti ti-bookmark" style="font-size:10px;"></i> ${d.me}</div>`
    +`<div class="tag cp-t"><i class="ti ti-list-check" style="font-size:10px;"></i> ${myIdx.length===d.cps.length?d.cps.length+' CPs':myIdx.length+' '+t('of')+' '+d.cps.length+' CPs · '+t('yours')} · ${xpE}/${xpM} XP</div>`;

  const primeHTML=`<div class="role-card prime"><div class="role-av">${d.roles.prime}</div><div><div class="role-nm">${d.roles.prime}</div><div class="role-tg">★ Prime</div></div></div>`;
  const supHTML=(d.roles.support||[]).filter(Boolean).map(r=>`<div class="role-card sup"><div class="role-av">${r}</div><div><div class="role-nm">${r}</div><div class="role-tg">Support</div></div></div>`).join('');

  let commentHTML='';
  if(c.taskDone&&!c.verified&&scCanSelfVerify()){
    commentHTML=`<div class="vc-box"><div class="vc-lbl"><i class="ti ti-message" style="font-size:12px;"></i> Verifier Comment <span style="font-weight:600;color:var(--t3);text-transform:none;letter-spacing:0;">(optional)</span></div><textarea class="vc-ta" id="vc-ta-${di}" rows="3" placeholder="Add observations, suggestions, or reasons for partial/zero scores…">${scEsc(c.verifierComment||'')}</textarea><button class="vc-btn" onclick="saveComment(${di})">Save comment</button></div>`;
  } else if(c.verified&&c.verifierComment){
    commentHTML=`<div class="vc-box"><div class="vc-lbl"><i class="ti ti-message" style="font-size:12px;"></i> Verifier's Comment</div><div class="vc-saved"><i class="ti ti-quote" style="font-size:15px;flex-shrink:0;margin-top:2px;color:var(--green);"></i><div><div>${scEsc(c.verifierComment)}</div><div class="vc-saved-meta">— ${scEsc(c.verifiedBy||'Verifier')} · ${scEsc(c.commentDate||'')}</div></div></div></div>`;
  }

  $('card-container').innerHTML=`
  <div class="card">
    <div class="card-hd" style="background:${hdBg};">
      <div class="hbg hbg1"></div><div class="hbg hbg2"></div>
      <div class="htop">
        <div>
          <div class="day-lbl">Day</div>
          <div class="day-num">${String(d.day).padStart(2,'0')}</div>
          <div class="day-sub">${isBoss?'⚔️ '+d.title:d.service}</div>
        </div>
        <div class="hright">
          <div class="xp-pill">⭐ ${myIdx.length*2} XP max</div>
          ${isLocked?`<div class="locked-tag"><i class="ti ti-lock" style="font-size:9px;"></i> Locked</div>`:`<div class="unlock-tag"><i class="ti ti-lock-open" style="font-size:9px;"></i> ${di+1===choState.currentDay?'Today':'Day '+d.day}</div>`}
        </div>
      </div>
    </div>
    <div class="aoc-strip" style="background:${aocColor}E0;">
      <div class="aoc-badge">${d.aoc==='AE'?'A+E':d.aoc==='Boss'?'All':d.aoc}</div>
      <div class="aoc-info">${d.title}</div>
    </div>
    <div class="cbody">
      ${statusHTML}
      <div class="sec">${t("Today's Micro-task")}</div>
      <div class="task-box"><div class="task-text">${d.task}</div></div>
      <div class="sec">${t('Area of Concern · ME · Checkpoints')}</div>
      <div class="tags-row">${tagsHTML}</div>
      <div class="sec">${t('Assessment Methods')}</div>
      <div class="methods-row">${methodHTML}</div>
      <div class="dvd"></div>
      <div class="sec">${t('Checkpoints')} <span style="font-weight:600;color:var(--t3);font-size:9px;letter-spacing:0;text-transform:none;">— tap ⓘ for guidance · ${t('Full')} / ${t('Half')} / ${t('Zero')}</span></div>
      <ul class="cp-list">${cpHTML}</ul>
      ${gapHTML}
      <div class="dvd"></div>
      <div class="sec">${t('Responsible Staff')}</div>
      <div class="roles-grid">${primeHTML}${supHTML}</div>
      <div class="prog-wrap">
        <div class="prog-lbs"><span>${aocLbl} readiness</span><span>${aocPct}%</span></div>
        <div class="prog-bg"><div class="prog-fill" style="width:${aocPct}%;background:${aocColor};"></div></div>
      </div>
    </div>
    ${commentHTML}
    <div class="card-footer">
      <div class="streak-area"><span style="font-size:18px;">🔥</span><span class="streak-lbl">Streak</span><span class="streak-num">${choState.streak||0}</span></div>
      ${isLocked?'':`
      <button class="btn-mark${c.taskDone?' done':''}" onclick="markDone(${di})" ${c.taskDone||!myIdx.length?'disabled':''} ${!myIdx.length&&!c.taskDone?'style="opacity:0.45;cursor:not-allowed;"':''}>
        <i class="ti ti-${c.taskDone?'check':'clipboard-check'}"></i> ${c.taskDone?t('Done!'):t('Mark Done')}
      </button>
      ${c.verified?`<button class="btn-verify vdone" disabled><i class="ti ti-shield-check"></i> ${t('Verified')} ✓</button>`
        :scCanSelfVerify()?`<button class="btn-verify${c.taskDone?' active':''}" onclick="verifyCard(${di})" ${c.taskDone?'':'disabled'}><i class="ti ti-shield-check"></i> ${t('Verify')}</button>`
        :`<button class="btn-verify" disabled title="${t('Verified by')} ${scVerifierLabel(choState.roleId||'CHO')}" style="opacity:0.6;cursor:default;"><i class="ti ti-shield"></i> ${c.taskDone?t('Awaiting')+' '+scVerifierLabel(choState.roleId||'CHO'):scVerifierLabel(choState.roleId||'CHO')+' '+t('verifies')}</button>`}`}
    </div>
    ${c.taskDone&&!c.verified?`<div class="reset-bar vis"><button class="btn-reset" onclick="resetCard(${di})"><i class="ti ti-refresh"></i> ${t('Undo Mark Done — redo this card')}</button></div>`:''}
  </div>`;
}

function getUnlockDate(di){
  if(!choState.startDate) return 'Day '+(di+1);
  const d=new Date(choState.startDate);
  d.setDate(d.getDate()+di);
  return d.toLocaleDateString('en-IN',{day:'numeric',month:'short'});
}

function cpItemHTML(di,ci,cp,d,c,isLocked){
  const s=c.cpScores[ci];
  let boxCls='cp-box',icon='';
  if(s===2){boxCls='cp-box t2';icon='✓';}else if(s===1){boxCls='cp-box t1';icon='½';}else if(s===0){boxCls='cp-box t0';icon='✗';}
  const struck=(s!==null&&s!==undefined&&s<2)?' struck':'';
  let scoreRow='';
  if(!isLocked&&!c.taskDone){
    scoreRow=`<div class="cp-score-row">
      <button class="sc-btn s2${s===2?' sel':''}" onclick="event.stopPropagation();setCP(${di},${ci},2)">${t('Full')}</button>
      <button class="sc-btn s1${s===1?' sel':''}" onclick="event.stopPropagation();setCP(${di},${ci},1)">${t('Half')}</button>
      <button class="sc-btn s0${s===0?' sel':''}" onclick="event.stopPropagation();setCP(${di},${ci},0)">${t('Zero')}</button>
    </div>`;
  }
  const mov=cp.mov?`<div class="mov-text">📋 ${cp.mov.substring(0,100)}${cp.mov.length>100?'…':''}</div>`:'';
  return `<li class="cp-item" id="cp-${di}-${ci}">
    <div class="cp-top-row" onclick="${isLocked?'':'cycleCP('+di+','+ci+')'}">
      <div class="${boxCls}"><span class="cp-icon" style="font-size:10px;">${icon}</span></div>
      <div class="cp-body">
        <div class="cp-text${struck}">${getCPText(cp)}</div>
        <div class="cp-meta"><span class="cp-role" style="${scCpHasRole(cp,'General')?'background:#F0FDF4;color:#15803D;':''}">${scEsc(scCpRoleText(cp))}</span>${c.taskDone&&scMyActionFor(di,ci)?'<span class="scx-pin" title="Corrective action assigned">📌 Action</span>':''}${cp.svc||cp.service?`<span class="cp-svc" style="background:#FDF4FF;color:#7C3AED;border-radius:5px;padding:1px 6px;font-size:9px;font-weight:700;">· ${cp.svc||cp.service}</span>`:''} ${cp.me?`<span>· ${cp.me}</span>`:''}</div>
        ${mov}
        ${scoreRow}
        ${c.taskDone&&c.cpVerify&&scCpvValid(c,ci)?`<div class="scx-cpv-ok">${scCpvNote(scCpvValid(c,ci))}</div>`:(c.verified&&c.verifyMode==='sample'?`<div class="scx-cpv-acc">✓ Accepted after sample verification</div>`:'')}
      </div>
      <button class="cp-help-btn" onclick="event.stopPropagation();showHelp(${di},${ci})" title="Assessment guidance">ⓘ</button>
      ${(cp.video||cp.videoHi) ? (isVideoUrl(cp.video||cp.videoHi)
        ? `<button class="cp-video-btn" onclick="event.stopPropagation();scPlayCpVideo(${di},${ci})" title="Watch training video" style="background:#EFF6FF;color:#1D4ED8;border:1.5px solid #BFDBFE;border-radius:8px;padding:4px 9px;font-size:11px;font-weight:800;cursor:pointer;font-family:inherit;flex-shrink:0;">▶ Video</button>`
        : `<button class="cp-video-btn" onclick="event.stopPropagation();scPlayCpVideo(${di},${ci})" title="Open resource link" style="background:#F0FDF4;color:#15803D;border:1.5px solid #86EFAC;border-radius:8px;padding:4px 9px;font-size:11px;font-weight:800;cursor:pointer;font-family:inherit;flex-shrink:0;">🔗 Link</button>`) : ''}
    </div>
    <div class="help-drawer" id="help-${di}-${ci}"></div>
  </li>`;
}

// Interactions
function setCP(di,ci,val){if(choState.cards[di]?.taskDone)return;if(!scMyCp(di,ci)){showToast(t('This checkpoint is assigned to other staff.'),'err');return;}const c=getCHOCard(di);c.cpScores[ci]=(c.cpScores[ci]===val)?null:val;saveCHOState();renderCard(di);}
function cycleCP(di,ci){if(choState.cards[di]?.taskDone)return;if(!scMyCp(di,ci))return;const c=getCHOCard(di);const cur=c.cpScores[ci];const seq=[null,2,1,0];const idx=seq.indexOf(cur);c.cpScores[ci]=seq[(idx+1)%seq.length];saveCHOState();renderCard(di);}
function markDone(di){
  const c=getCHOCard(di);if(c.taskDone)return;
  const d=getDay(di);
  if(!scMyCpIdx(di).length){showToast(t('No checkpoints are assigned to your role on this day.'),'err');return;}
  // Only the staff member's own checkpoints are scored (unscored ones default to Full);
  // checkpoints belonging to other roles are cleared so they never count here.
  c.cpScores=d.cps.map((cp,ci)=>!scMyCp(di,ci)?null:(c.cpScores[ci]===null||c.cpScores[ci]===undefined?2:c.cpScores[ci]));
  c.taskDone=true;c.score=getDayScore(di);
  choState.streak=(choState.streak||0)+1;saveCHOState();
  buildDaySelector();renderCard(di);if(choState.view==='board')buildBoard();
}
function saveComment(di){
  if(!scCanSelfVerify()){ showToast(t('Only a CHO or MO can verify cards.'),'err'); return; }
  const c=getCHOCard(di);const ta=document.getElementById('vc-ta-'+di);
  if(ta)c.verifierComment=ta.value.trim();
  c.commentDate=new Date().toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'});
  saveCHOState();showToast('Comment saved','ok');
}
async function resetCard(di){
  const ok = await showConfirm('Undo Mark Done? Your scores for this day will be cleared so you can redo the card.','🔄','Redo Card','Redo','var(--red)');
  if(!ok) return;
  // Never undo a card a CHO/MO has already signed off
  try{
    const rec=db?await fbGet(scProgressPath(choState.facilityCode,choState.staffMobile,di)):null;
    if(rec&&rec.verified){ await scHydrateProgress(); renderCard(di); showToast(t('This card has already been verified.'),'err'); return; }
    if(rec&&rec.cpVerify&&Object.keys(rec.cpVerify).length){ showToast(t('Verification has started on this card — ask your verifier to send it back.'),'err'); return; }
  }catch(e){}
  const c=getCHOCard(di);c.taskDone=false;c.verified=false;
  c.cpScores=new Array(getDay(di).cps.length).fill(null);c.score=null;c.gapRetries={};
  if(choState.streak>0)choState.streak--;saveCHOState();buildDaySelector();renderCard(di);
  if(choState.view==='board')buildBoard();
}
// gapRetry() → see SC v2 module
// gapReVerify() → see SC v2 module

// Help drawer
let openHelpKey=null;
function showHelp(di,ci){
  const key=`${di}-${ci}`;const drawer=document.getElementById(`help-${di}-${ci}`);if(!drawer)return;
  if(openHelpKey&&openHelpKey!==key){const prev=document.getElementById(`help-${openHelpKey}`);if(prev){prev.classList.remove('open');prev.innerHTML='';}}
  if(drawer.classList.contains('open')){drawer.classList.remove('open');drawer.innerHTML='';openHelpKey=null;return;}
  const d=getDay(di);const cp=d.cps[ci];
  const colors={SI:{bg:'#FFF0F3',c:'#9D174D'},RR:{bg:'#F0FDF4',c:'#166534'},OB:{bg:'#EBF8F5',c:'#1E6B5E'},CI:{bg:'#FEF3E0',c:'#92400E'}};
  const lbm={SI:'Staff Interview',RR:'Record Review',OB:'Observation',CI:'Client Interview'};
  const methods=cp.method&&cp.method.length?cp.method:(d.methods||['SI','RR']);
  const rows=methods.map(m=>{const cl=colors[m]||{bg:'#F3F4F6',c:'#374151'};
    return `<div class="help-row"><div class="help-method-tag" style="background:${cl.bg};color:${cl.c};">${m} — ${lbm[m]||m}</div><div class="help-text">Verify: "${cp.t}" using ${lbm[m]||m}. Check records, observe practice, or interview ${scEsc(scCpRoles(cp).join(' / ')||'staff')} as applicable.</div></div>`;}).join('');
  const full=cp.compFull||'All elements present, correctly implemented, and documented.';
  const half=cp.compHalf||'Some elements present or partially documented.';
  const zero=cp.compZero||'Not available, not followed, or no documentation found.';
  const movSection=cp.mov?`<div style="background:var(--teal-lt);border-radius:8px;padding:8px 10px;margin-top:8px;font-size:11px;color:var(--teal-dk);font-weight:600;"><strong>Means of Verification:</strong> ${cp.mov}</div>`:'';
  drawer.innerHTML=rows+`<div class="help-compliance"><div class="hc-row"><div class="hc-dot" style="background:var(--green);"></div><div class="hc-txt"><strong>Full (2 pts):</strong> ${full}</div></div><div class="hc-row"><div class="hc-dot" style="background:var(--amber);"></div><div class="hc-txt"><strong>Half (1 pt):</strong> ${half}</div></div><div class="hc-row"><div class="hc-dot" style="background:var(--red);"></div><div class="hc-txt"><strong>Zero (0 pts):</strong> ${zero}</div></div></div>${movSection}`;
  drawer.classList.add('open');openHelpKey=key;
}

// ══════════════════════════════════════════════════════════════
// QUEST BOARD
// ══════════════════════════════════════════════════════════════
function buildBoard(){
  const arr=getDaysArr(choState.progId);
  const totalDone=Object.values(choState.cards).filter(c=>c&&c.verified).length;
  const _r=scReadiness(choState.progId,choState.cards,choState.roleId||'CHO');
  const totalXP=_r.xp,totalMax=_r.max,overall=_r.pct;
  $('qb-stats').innerHTML=`<div class="stat-card"><div class="stat-val">${totalDone}</div><div class="stat-lbl">Days completed</div></div><div class="stat-card"><div class="stat-val">${overall}%</div><div class="stat-lbl">Overall readiness</div></div><div class="stat-card"><div class="stat-val">${totalXP}</div><div class="stat-lbl">XP earned</div></div><div class="stat-card"><div class="stat-val">${arr.length-totalDone}</div><div class="stat-lbl">Days remaining</div></div>`;
  buildPuzzleRows(arr);
  buildAoCBars(arr);
  buildRoleReadiness(arr);
  buildSrvReadiness(arr);
  buildAoCLegend();
}

function buildPuzzleRows(arr){
  const cont=$('puzzle-rows');cont.innerHTML='';
  const aocGroups=[
    {key:'AE',label:'AoC A+E — Service Provision & Clinical Quality',color:'#1E6B5E'},
    {key:'B', label:'AoC B — Patient Rights',                        color:'#16A34A'},
    {key:'C', label:'AoC C — Inputs',                                color:'#D97706'},
    {key:'D', label:'AoC D — Support Services',                      color:'#EA580C'},
    {key:'F', label:'AoC F — Infection Control',                     color:'#0369A1'},
    {key:'G', label:'AoC G — Quality Management',                    color:'#5B21B6'},
    {key:'H', label:'AoC H — Outcome',                               color:'#9D174D'},
    {key:'Boss',label:'Readiness week',                                 color:'#D97706'},
  ];
  aocGroups.forEach(grp=>{
    const dayIdxs=arr.map((_,i)=>i).filter(i=>{
      const d=arr[i];
      return grp.key==='Boss'?d.isBoss:(d.aoc===grp.key||d.aoc==='AE'&&grp.key==='AE')&&!d.isBoss;
    });
    if(!dayIdxs.length) return;
    const lbl=document.createElement('div');lbl.className='pz-row-label';
    lbl.innerHTML=`<span style="display:inline-block;width:9px;height:9px;border-radius:2px;background:${grp.color};margin-right:5px;vertical-align:middle;"></span>${grp.label}`;
    cont.appendChild(lbl);
    const grid=document.createElement('div');grid.className='puzzle-grid';
    grid.style.gridTemplateColumns=`repeat(${Math.min(dayIdxs.length,10)},minmax(0,1fr))`;
    dayIdxs.forEach(di=>{
      const d=arr[di];const dayNum=di+1;
      const cell=document.createElement('div');
      const isLocked=dayNum>choState.currentDay;
      const pzAoc=grp.key==='Boss'?'aBoss':grp.key==='AE'?'aAE':'a'+grp.key;
      cell.className='pz '+pzAoc;
      if(isLocked){cell.classList.add('locked-pz');cell.innerHTML='<i class="ti ti-lock" style="font-size:6px;"></i>';}
      else if(d.isBoss){cell.innerHTML='<span style="font-size:9px;">⚔️</span>';}
      else{
        const c=choState.cards[di];
        const{xp,max}=getDayXP(di);const pct=max>0?xp/max:0;
        if(dayNum===choState.currentDay)cell.classList.add('today-pz');
        if(c&&c.taskDone){
          if(pct>=0.8)cell.classList.add('full');
          else if(pct>=0.4)cell.classList.add('half');
          else cell.classList.add('zero');
        } else {cell.textContent=dayNum;}
      }
      cell.title=`Day ${dayNum}: ${d.title}`;
      cell.onclick=()=>{if(!isLocked){switchView('cards');selectDay(dayNum);}};
      grid.appendChild(cell);
    });
    cont.appendChild(grid);
  });
}

function buildAoCBars(arr){
  const cont=$('aoc-bars');cont.innerHTML='';
  const r=scReadiness(choState.progId,choState.cards,choState.roleId||'CHO');
  const cols={A:'#1E6B5E',B:'#16A34A',C:'#D97706',D:'#EA580C',E:'#2A8A79',F:'#0369A1',G:'#5B21B6',H:'#9D174D'};
  SC_AOC_KEYS.forEach(key=>{
    const b=r.byAoc[key]; if(!b||b.max===0) return;
    const row=document.createElement('div');row.className='aoc-bar-row';
    row.innerHTML=`<div class="aoc-bar-lbl">AoC ${key}</div><div class="aoc-bar-bg"><div class="aoc-bar-fill" style="width:${b.pct}%;background:${cols[key]};"></div></div><div class="aoc-bar-pct">${b.pct}%</div><div class="aoc-bar-xp">${b.xp}/${b.max} XP</div>`;
    cont.appendChild(row);
  });
  if(!cont.children.length) cont.innerHTML='<div style="font-size:11px;color:var(--t3);padding:6px 0;">Mark a day card as done to see Area of Concern readiness.</div>';
}

function buildRoleReadiness(arr){
  const cont=$('role-readiness');if(!cont)return;cont.innerHTML='';
  ROLES.forEach(role=>{
    const{pct,xp,mx}=getRolePct(role.key);
    if(mx===0)return;
    const row=document.createElement('div');row.className='role-bar-row';
    row.innerHTML=`<div class="role-bar-icon" style="background:${role.bg};">${role.label.substring(0,3)}</div><div class="role-bar-info"><div class="role-bar-name">${role.label} <span style="font-size:9px;color:var(--t3);font-weight:600;">${xp}/${mx} XP</span></div><div class="role-bar-bg"><div class="role-bar-fill" style="width:${pct}%;background:${pct>=80?'var(--green)':pct>=50?'var(--amber)':'var(--red)'};"></div></div></div><div class="role-bar-pct">${pct}%</div>`;
    cont.appendChild(row);
  });
}

function buildSrvReadiness(arr){
  const cont=$('srv-section');if(!cont)return;cont.innerHTML='';
  const progId=choState.progId;
  SERVICES.filter(s=>s.progIds.includes(progId)).forEach(srv=>{
    let tXP=0,tMax=0,verDays=0,doneDays=0;
    arr.forEach((d_,di)=>{
      const d=getDay(di);
      if(d.service!==srv.name) return;
      const c=choState.cards[di];
      d.cps.forEach((cp,ci)=>{tMax+=2;if(c&&c.taskDone){doneDays++;const s=c.cpScores[ci];if(s!==null&&s!==undefined)tXP+=s;if(c.verified)verDays++;}});
    });
    const pct=tMax>0?Math.round(tXP/tMax*100):0;
    let bText,bBg,bCol;
    if(verDays>0&&tMax>0){bText='✓ Verified';bBg='var(--green-lt)';bCol='var(--green-dk)';}
    else if(doneDays>0){bText='In progress';bBg='var(--amber-lt)';bCol='var(--amber-dk)';}
    else{bText='Upcoming';bBg='var(--grey-lt)';bCol='var(--grey-dk)';}
    const card=document.createElement('div');card.className='srv-card';
    card.innerHTML=`<div class="srv-card-top"><div class="srv-icon" style="background:${srv.color}18;">${srv.icon}</div><div class="srv-name">${srv.name}</div><div class="srv-badge" style="background:${bBg};color:${bCol};">${bText}</div></div><div class="srv-bar-row"><div class="srv-bg"><div class="srv-fill" style="width:${pct}%;background:${pct>=80?'var(--green)':pct>=50?'var(--amber)':'var(--red)'};"></div></div><div class="srv-pct">${pct}%</div></div><div class="srv-meta"><span>⭐ ${tXP}/${tMax} XP</span></div>`;
    cont.appendChild(card);
  });
}

function buildAoCLegend(){
  const cont=$('aoc-legend');if(!cont)return;cont.innerHTML='';
  AOC_DEFS.filter(a=>a.key!=='Boss').forEach(a=>{
    const item=document.createElement('div');item.className='aoc-leg-item';
    item.innerHTML=`<div class="aoc-leg-dot" style="background:${a.color};"></div>${a.fullLabel}`;
    cont.appendChild(item);
  });
}

// View switching
function switchView(v){
  choState.view=v;
  ['cards','board'].forEach(id=>{
    const el=$('view-'+id);if(el)el.style.display=v===id?'':'none';
    const btn=$('bnav-'+id);if(btn)btn.className='cho-tab'+(v===id?' active':'');
  });
  if(v==='board')buildBoard();
  if(v==='cards'&&choState.setupDone)scrollToToday();
}

// ══════════════════════════════════════════════════════════════
// WELCOME SCREEN
const PROG_INSTRUCTIONS = {
  'nqas_12A':{lines:[
    '60-day programme covering 12 services for Expanded Sub-Center (without delivery)',
    'First 12 days: all 12 services assessed including Eye and ENT, Oral Health, Mental Health, Elderly and Palliative Care',
    'Days 1–7: baseline self-assessment, checked by your Quality Champion',
    'Days 8–49: six implementation weeks — fix your gaps with weekly focus actions',
    'Days 50–56: end-line re-score · Days 57–60: Readiness week — verification, final review and graduation',
    'Additional competencies: geriatric screening, mental health assessment, ophthalmic screening',
  ]},
  'nqas_12B':{lines:[
    '60-day programme covering 12 services for Expanded Sub-Center with delivery (Type B)',
    'Most comprehensive NQAS programme: all 12 services plus full delivery care',
    'Days 1–7 baseline · Days 8–49 implementation · Days 50–56 end-line · Days 57–60 Readiness week and graduation',
    'Both CHO and ANM competency critical — delivery skills plus 12-service knowledge required',
    'Graduation on Day 60: NQAS Ready when overall, every Area of Concern and every Standard meet the NQAS minimum',
  ]},
};

let wsGuideExpanded = false;
let wsFirstVisit = true;

function wsCheckFirstVisit(){
  try{ wsFirstVisit = !localStorage.getItem('nqas_ws_seen_' + choState.progId); }
  catch(e){ wsFirstVisit = true; }
}
function wsMarkSeen(){
  try{ localStorage.setItem('nqas_ws_seen_' + choState.progId, '1'); }catch(e){}
}

function showWelcomeScreen(){
  const ws = $('welcome-screen');
  if(!ws) return;
  ws.classList.add('vis');
  wsCheckFirstVisit();
  wsRenderHero();
  wsRenderBody();
  wsSetupSections();
}

function wsRenderHero(){
  const prog = getProg(choState.progId);
  const arr = getDaysArr(choState.progId);
  $('ws-prog-icon').textContent = prog.icon;
  $('ws-prog-name').textContent = prog.name;
  $('ws-prog-tag').textContent = prog.desc + ' - ' + prog.days + '-day programme';
  const chip = $('ws-status-chip');
  const stats = $('ws-stats-row');
  const cd = $('ws-countdown');
  const isPre = wsIsPre();
  const isComplete = wsIsComplete();
  const isActive = !isPre && !isComplete;

  if(!choState.startDate){
    chip.className = 'ws-status-chip pre';
    chip.innerHTML = '<i class="ti ti-calendar" style="font-size:12px;"></i> Start date not set';
    stats.style.display = 'none'; cd.style.display = 'none'; return;
  }
  if(isPre){
    const dLeft = wsGetDaysUntilStart();
    chip.className = 'ws-status-chip pre';
    chip.innerHTML = '<i class="ti ti-clock" style="font-size:12px;"></i> Starts in ' + dLeft + ' day' + (dLeft!==1?'s':'');
    stats.style.display = 'none'; cd.style.display = '';
    $('ws-cd-boxes').innerHTML =
      '<div class="ws-cd-box"><div class="ws-cd-num">' + dLeft + '</div><div class="ws-cd-label">DAYS</div></div>' +
      '<div class="ws-cd-box"><div class="ws-cd-num">00</div><div class="ws-cd-label">HRS</div></div>' +
      '<div class="ws-cd-box"><div class="ws-cd-num">00</div><div class="ws-cd-label">MINS</div></div>';
    $('ws-cd-start').textContent = 'Starting ' + formatDate(choState.startDate);
  } else if(isComplete){
    chip.className = 'ws-status-chip complete';
    chip.innerHTML = '<i class="ti ti-trophy" style="font-size:12px;"></i> Programme Complete!';
    cd.style.display = 'none';
    const done = Object.values(choState.cards).filter(c=>c&&c.verified).length;
    const _rd=scReadiness(choState.progId,choState.cards,choState.roleId||'CHO'); const xp=_rd.xp, mx=_rd.max, pct=_rd.pct;
    stats.style.display = 'flex';
    stats.innerHTML =
      '<div class="ws-stat-chip"><div class="ws-stat-val">'+done+'</div><div class="ws-stat-lbl">Days done</div></div>' +
      '<div class="ws-stat-chip"><div class="ws-stat-val">'+pct+'%</div><div class="ws-stat-lbl">Readiness</div></div>' +
      '<div class="ws-stat-chip"><div class="ws-stat-val">'+(choState.streak||0)+'</div><div class="ws-stat-lbl">Streak</div></div>';
  } else {
    chip.className = 'ws-status-chip active';
    chip.innerHTML = '<i class="ti ti-calendar-check" style="font-size:12px;"></i> Day ' + choState.currentDay + ' of ' + prog.days + ' - Active';
    cd.style.display = 'none';
    const done = Object.values(choState.cards).filter(c=>c&&c.verified).length;
    const _rd=scReadiness(choState.progId,choState.cards,choState.roleId||'CHO'); const xp=_rd.xp, mx=_rd.max, pct=_rd.pct;
    stats.style.display = 'flex';
    stats.innerHTML =
      '<div class="ws-stat-chip"><div class="ws-stat-val">'+choState.currentDay+'/'+prog.days+'</div><div class="ws-stat-lbl">Day</div></div>' +
      '<div class="ws-stat-chip"><div class="ws-stat-val">'+pct+'%</div><div class="ws-stat-lbl">Readiness</div></div>' +
      '<div class="ws-stat-chip"><div class="ws-stat-val">'+(choState.streak||0)+'</div><div class="ws-stat-lbl">Streak</div></div>';
  }
}

function wsRenderBody(){
  const prog = getProg(choState.progId);
  const arr = getDaysArr(choState.progId);
  const isPre = wsIsPre();
  const isComplete = wsIsComplete();
  const isActive = !isPre && !isComplete;

  $('ws-today-section').style.display = isActive ? '' : 'none';
  $('ws-prestart-section').style.display = isPre ? '' : 'none';
  $('ws-complete-section').style.display = isComplete ? '' : 'none';

  if(isActive){
    const di = Math.min(choState.currentDay-1, arr.length-1);
    const d = getDay(di);
    $('ws-today-day-num').textContent = String(d.day).padStart(2,'0');
    $('ws-today-title').textContent = d.title;
    $('ws-today-aoc').textContent = d.aoc==='AE' ? 'Area of Concern A+E' :
      d.aoc==='Boss' ? 'Readiness week — all Areas of Concern' : 'Area of Concern ' + d.aoc;
    $('ws-today-meta').innerHTML =
      '<div class="ws-today-chip"><i class="ti ti-list-check" style="font-size:10px;"></i> '+d.cps.length+' checkpoints</div>' +
      '<div class="ws-today-chip">'+d.methods.join(' / ')+'</div>' +
      '<div class="ws-today-chip">@'+d.roles.prime+'</div>';
  }

  if(isPre){
    const dLeft = wsGetDaysUntilStart();
    $('ws-prestart-msg').innerHTML =
      'Your programme <strong>' + prog.name + '</strong> starts on <strong>' + formatDate(choState.startDate) +
      '</strong> - ' + dLeft + ' day' + (dLeft!==1?'s':'') + ' from today.<br><br>' +
      'Cards unlock automatically on the start date. Use this time to prepare your team.';
  }

  if(isComplete){
    const _rd=scReadiness(choState.progId,choState.cards,choState.roleId||'CHO'); const xp=_rd.xp, mx=_rd.max, pct=_rd.pct;
    $('ws-complete-sub').innerHTML =
      'You completed <strong>' + prog.name + '</strong> with <strong>' + pct + '% readiness</strong>.<br>' +
      'Total XP: ' + xp + ' / ' + mx + '  |  Streak: ' + (choState.streak||0) + ' days';
  }

  const instr = PROG_INSTRUCTIONS[choState.progId] || PROG_INSTRUCTIONS['nqas_12A'];
  $('ws-prog-info-content').innerHTML =
    '<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">' +
    '<span style="font-size:22px;">' + prog.icon + '</span>' +
    '<div><div style="font-size:13px;font-weight:800;color:var(--teal-dk);">' + prog.name + '</div>' +
    '<div style="font-size:10px;color:var(--teal);font-weight:600;">' + prog.desc + '</div></div></div>' +
    instr.lines.map(l =>
      '<div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:7px;">' +
      '<div style="width:6px;height:6px;border-radius:50%;background:var(--teal);flex-shrink:0;margin-top:5px;"></div>' +
      '<div style="font-size:11px;font-weight:600;color:var(--t2);line-height:1.5;">' + l + '</div></div>'
    ).join('');

  const btn = $('ws-cta-btn');
  const lbl = $('ws-cta-label');
  const ico = $('ws-cta-icon');
  if(isPre){
    btn.className = 'ws-cta-btn locked';
    ico.className = 'ti ti-lock';
    lbl.textContent = 'Programme starts ' + formatDate(choState.startDate);
    btn.onclick = null;
  } else if(isComplete){
    btn.className = 'ws-cta-btn';
    ico.className = 'ti ti-chart-bar';
    lbl.textContent = 'View Quest Board';
    btn.onclick = wsViewResults;
  } else {
    btn.className = 'ws-cta-btn';
    ico.className = 'ti ti-cards';
    lbl.textContent = "Go to Today's Card";
    btn.onclick = wsEnterApp;
  }
}

function wsSetupSections(){
  const secs = ['prog','features','howto','scoring'];
  if(wsFirstVisit){
    secs.forEach(s=>{ const t=$('ws-gt-'+s),b=$('ws-gb-'+s); if(t)t.classList.add('open'); if(b)b.classList.add('open'); });
    $('ws-guide-toggle-btn').style.display = 'none';
  } else {
    secs.forEach(s=>{ const t=$('ws-gt-'+s),b=$('ws-gb-'+s); if(t)t.classList.remove('open'); if(b)b.classList.remove('open'); });
    $('ws-guide-toggle-btn').style.display = '';
    $('ws-guide-btn-label').textContent = 'View Guide';
    wsGuideExpanded = false;
  }
}

function wsToggleSection(id){
  const t=$('ws-gt-'+id),b=$('ws-gb-'+id);
  if(!t||!b) return;
  t.classList.toggle('open'); b.classList.toggle('open');
}

function wsToggleGuide(){
  wsGuideExpanded = !wsGuideExpanded;
  ['prog','features','howto','scoring'].forEach(s=>{
    const t=$('ws-gt-'+s),b=$('ws-gb-'+s);
    if(t) t.classList.toggle('open',wsGuideExpanded);
    if(b) b.classList.toggle('open',wsGuideExpanded);
  });
  $('ws-guide-btn-label').textContent = wsGuideExpanded ? 'Hide Guide' : 'View Guide';
}

function wsIsPre(){
  if(!choState.startDate) return false;
  const p=choState.startDate.split('-');
  const start=new Date(parseInt(p[0]),parseInt(p[1])-1,parseInt(p[2]));
  const today=new Date(); today.setHours(0,0,0,0); start.setHours(0,0,0,0);
  return today < start;
}
function wsIsComplete(){
  const prog=getProg(choState.progId);
  if(!choState.startDate) return false;
  const p=choState.startDate.split('-');
  const start=new Date(parseInt(p[0]),parseInt(p[1])-1,parseInt(p[2]));
  const today=new Date(); today.setHours(0,0,0,0); start.setHours(0,0,0,0);
  return Math.floor((today-start)/(1000*60*60*24)) >= prog.days;
}
function wsGetDaysUntilStart(){
  if(!choState.startDate) return 0;
  const p=choState.startDate.split('-');
  const start=new Date(parseInt(p[0]),parseInt(p[1])-1,parseInt(p[2]));
  const today=new Date(); today.setHours(0,0,0,0); start.setHours(0,0,0,0);
  return Math.max(0, Math.ceil((start-today)/(1000*60*60*24)));
}
function wsEnterApp(){
  if(wsIsPre()) return;
  wsMarkSeen();
  $('welcome-screen').classList.remove('vis');
  showCHOMain();
}
function wsViewResults(){
  wsMarkSeen();
  $('welcome-screen').classList.remove('vis');
  showCHOMain();
  setTimeout(function(){ switchView('board'); }, 100);
}
function wsUpgradeTo(){ /* stubbed */ }

// INIT
// ══════════════════════════════════════════════════════════════
window.addEventListener('load',function(){

  // AUTO-LOGIN: same device, skip login if session exists
  try{
    const lastProg = localStorage.getItem('nqas_last_prog');
    if(lastProg){
      const saved = localStorage.getItem(PROGRESS_KEY + '_' + lastProg);
      if(saved){
        const state = JSON.parse(saved);
        if(state && state.setupDone){
          choState.progId = lastProg;
          Object.assign(choState, state);
          updateCurrentDay();
          $('login-screen').style.display = 'none';
          $('cho-app').classList.add('vis');
          initFirebase();
          setTimeout(async function(){
            try{
              const re = await storage.get(editKey(choState.progId), true);
              if(re && re.value) adminEdits = JSON.parse(re.value);
            }catch(e){}
          }, 500);
          showWelcomeScreen();
          return;
        }
      }
    }
  }catch(e){}

  // Normal login flow
  buildStaffProgSelector();
  const selGrid = $('staff-prog-selector');
  if(selGrid) selGrid.style.display = 'grid';
  const urlProg = getProgFromURL();
  if(urlProg){
    selectedStaffProg = urlProg;
    selectStaffProg(urlProg);
    const sel = $('staff-prog-selector');
    if(sel) sel.style.display = 'none';
    const p = PROGRAMS.find(x=>x.id===urlProg);
    const badge = $('staff-prog-badge-url');
    if(badge && p){
      badge.style.display = '';
      if($('spb-icon')) $('spb-icon').textContent = p.icon;
      if($('spb-name')) $('spb-name').textContent = p.name;
      if($('spb-tag')) $('spb-tag').textContent = p.desc + ' - ' + p.days + '-day programme';
    }
    const sub = document.querySelector('#staff-panel .lc-sub');
    if(sub) sub.textContent = 'Enter your facility code to begin.';
  }
  initFirebase();
});



// CUSTOM CONFIRM DIALOG
let confirmCallback = null;
function showConfirm(msg, icon='🔒', title='Logout', okLabel='OK', okColor='var(--red)'){
  return new Promise(resolve => {
    confirmCallback = resolve;
    $('confirm-msg').textContent = msg;
    $('confirm-icon').textContent = icon;
    $('confirm-title').textContent = title;
    $('confirm-ok-btn').textContent = okLabel;
    $('confirm-ok-btn').style.background = okColor;
    $('confirm-overlay').classList.add('open');
  });
}
function confirmResolve(result){
  $('confirm-overlay').classList.remove('open');
  if(confirmCallback){ confirmCallback(result); confirmCallback = null; }
}

// ANTI-COPY PROTECTION
document.addEventListener('contextmenu', function(e){
  if(appMode==='cho'){ e.preventDefault(); return false; }
});
document.addEventListener('selectstart', function(e){
  if(appMode==='cho'){ e.preventDefault(); return false; }
});
document.addEventListener('copy', function(e){
  if(appMode==='cho'){ e.preventDefault(); showToast('Content is protected - HealSol Academy','err'); return false; }
});
// Detect print/screenshot attempt
window.addEventListener('beforeprint', function(){
  if(window._nfAllowPrint) return; // a receipt the user asked to print
  document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;text-align:center;padding:40px;"><div><div style="font-size:48px;margin-bottom:20px;">🔒</div><div style="font-size:24px;font-weight:900;color:#1E6B5E;">HealSol Academy</div><div style="font-size:14px;color:#666;margin-top:10px;">This content is protected. Printing and screenshots are not permitted.</div></div></div>';
});
// Visibility change — blur content when screen recorded or app switched
document.addEventListener('visibilitychange', function(){
  if(document.hidden && appMode==='cho'){
    const overlay = document.getElementById('privacy-overlay');
    if(overlay) overlay.style.display = 'flex';
  } else {
    const overlay = document.getElementById('privacy-overlay');
    if(overlay) overlay.style.display = 'none';
  }
});

document.getElementById('privacy-overlay').addEventListener('click', function(){
  this.style.display='none';
});


// ── Login screen UI helpers ────────────────────────────────────
function scShowLoginPanel(which){
  ['sc-staff-panel','sc-cho-panel','sc-admin-panel','sc-sup-panel'].forEach(function(id){
    var el=document.getElementById(id); if(el) el.style.display=(id===which)?'':'none';
  });
}
function scShowChoLogin(){ scShowLoginPanel('sc-cho-panel'); }
function scShowAdminLogin(){
  scShowLoginPanel('sc-admin-panel');
  setTimeout(()=>document.getElementById('admin-pwd')?.focus(),100);
}
function scShowSupLogin(){
  scShowLoginPanel('sc-sup-panel');
  setTimeout(()=>document.getElementById('sc-sup-id')?.focus(),100);
}
function scHideSecondaryLogin(){ scShowLoginPanel('sc-staff-panel'); }
// Override old tab switcher — no longer needed
function scSwitchTab(tab){
  if(tab==='cho') scShowChoLogin();
  else if(tab==='admin') scShowAdminLogin();
  else scHideSecondaryLogin();
}
function switchLoginTab(tab){
  if(tab==='admin') scShowAdminLogin();
  else scHideSecondaryLogin();
}



// ══════════════════════════════════════════════════════
function buildAeDayStrip(){
  var strip=document.getElementById('ae-day-strip');
  if(!strip||!adminActiveProg)return;
  var arr=(window.TRACK_DAYS_MAP&&window.TRACK_DAYS_MAP['A'])||(window.DAYS_CHC_A)||(window.DAYS_PHC_A)||[];
  strip.innerHTML='';
  arr.forEach(function(d,di){
    var edited=adminEdits[di];
    var btn=document.createElement('button');
    btn.className='ae-day-btn'+(di===adminEditorDay?' active':'')+(edited?' edited':'');
    btn.textContent=d.day||(di+1);
    btn.title=(d.title||'Day '+(di+1))+(edited?' (edited)':'');
    btn.setAttribute('data-di',di);
    btn.addEventListener('click',function(){aeOpenDay(parseInt(this.getAttribute('data-di')));});
    strip.appendChild(btn);
  });
  var editCount=Object.keys(adminEdits).length;
  var ec=document.getElementById('ae-edit-count');
  if(ec)ec.textContent=editCount+' card'+(editCount!==1?'s':'')+' edited';
}

function aeOpenDay(di){
  if(!adminActiveProg)return;
  adminEditorDay=di;
  var d=aeGetDay(di);
  if(!d)return;
  document.querySelectorAll('.ae-day-btn').forEach(function(b){
    b.classList.toggle('active',parseInt(b.getAttribute('data-di'))===di);
  });
  var titleEl=document.getElementById('ae-day-title');
  if(titleEl)titleEl.value=d.title||'';
  var taskEl=document.getElementById('ae-day-task');
  if(taskEl)taskEl.value=d.task||'';
  var modEl=document.getElementById('ae-day-module');
  if(modEl)modEl.textContent=(d.icon||'')+' '+(d.module||'')+'  ·  Day '+(d.day||(di+1));
  var progEl=document.getElementById('ae-day-prog');
  if(progEl)progEl.textContent=(d.prog||'')+'  ·  AoC: '+((d.aocTags||[]).join(', '));
  var panel=document.getElementById('ae-editor-panel');
  if(panel)panel.style.display='';
  aeRenderCPs(di);
}



async function aeSaveDay(){
  var di=adminEditorDay;
  if(di===null||di===undefined){showToast('Select a day first.','err');return;}
  var titleEl=document.getElementById('ae-day-title');
  var taskEl=document.getElementById('ae-day-task');
  if(!adminEdits[di])adminEdits[di]={};
  if(titleEl)adminEdits[di].title=titleEl.value;
  if(taskEl)adminEdits[di].task=taskEl.value;
  var progId=adminActiveProg?(adminActiveProg.id||String(adminActiveProg)):'default';
  try{localStorage.setItem('admin_edits_'+progId,JSON.stringify(adminEdits));}catch(e){}
  if(typeof fbSet==='function'){
    var ok=await fbSet('shared/edits/'+progId,adminEdits);
    showToast(ok?'Day '+(di+1)+' saved to Firebase ✓':'Saved locally. Firebase sync failed.', ok?'ok':'err');
  }else{
    showToast('Day '+(di+1)+' saved locally ✓','ok');
  }
  buildAeDayStrip();
}

function aeOpenProgramme(prog){
  adminActiveProg=prog;
  adminEditorDay=null;
  var progId=prog?(prog.id||String(prog)):'default';
  try{
    var saved=localStorage.getItem('admin_edits_'+progId);
    adminEdits=saved?JSON.parse(saved):{};
  }catch(e){adminEdits={};}
  var sec=document.getElementById('admin-editor-section');
  if(sec)sec.style.display='';
  var panel=document.getElementById('ae-editor-panel');
  if(panel)panel.style.display='none';
  buildAeDayStrip();
}

// toggleAdminEditor defined in v3 editor below



// ── Admin Card Editor v3 (SC) ──────────────────────────────
var _AE_PROGS  = ['C', 'D'];
var _AE_LABELS = ['12A (60d)', '12B (60d)'];

function aeGetActiveArray(){
  // Direct variable references — not window. to avoid timing issues
  try{
    var progMap = {
      'C': typeof DAYS_12A !=='undefined' ? DAYS_12A : null,
      'D': typeof DAYS_12B !=='undefined' ? DAYS_12B : null,
    };
    var key = adminActiveProg || 'C';
    return progMap[key] || progMap['C'] || progMap['D'] || [];
  }catch(e){ return []; }
}

function buildAeDayStrip(){
  var strip = document.getElementById('ae-day-strip');
  var selRow = document.getElementById('ae-prog-sel-row');

  // Rebuild programme selector
  if(selRow){
    selRow.innerHTML = '';
    _AE_PROGS.forEach(function(p,i){
      var active = (adminActiveProg||_AE_PROGS[0]) === p;
      var b = document.createElement('button');
      b.style.cssText = 'padding:4px 12px;border-radius:8px;font-size:10px;font-weight:800;cursor:pointer;font-family:inherit;border:1.5px solid '+(active?'var(--green)':'var(--br)')+';background:'+(active?'var(--green)':'var(--bgc)')+';color:'+(active?'#fff':'var(--t2)')+';white-space:nowrap;transition:all 0.1s;';
      b.textContent = _AE_LABELS[i];
      b.setAttribute('data-prog', p);
      b.addEventListener('click', function(){
        adminActiveProg = this.getAttribute('data-prog');
        adminEditorDay  = null;
        var panel = document.getElementById('ae-editor-panel');
        if(panel) panel.style.display = 'none';
        buildAeDayStrip();
      });
      selRow.appendChild(b);
    });
  }

  if(!adminActiveProg) adminActiveProg = _AE_PROGS[0];

  var arr = aeGetActiveArray();
  if(!strip) return;

  if(!arr || arr.length === 0){
    // Retry once after 300ms if arrays not loaded yet
    if(!strip._retried){
      strip._retried = true;
      strip.innerHTML = '<div style="padding:12px 14px;color:var(--t3);font-size:12px;">Loading days...</div>';
      setTimeout(buildAeDayStrip, 300);
    } else {
      strip.innerHTML = '<div style="padding:12px 14px;color:#DC2626;font-size:12px;font-weight:600;">⚠ Days not found. Please refresh the page and try again.</div>';
      strip._retried = false;
    }
    return;
  }

  strip.innerHTML = '';
  arr.forEach(function(d, di){
    var key  = adminActiveProg + '_' + di;
    var edited = !!adminEdits[key];
    var isActive = di === adminEditorDay;
    var b = document.createElement('button');
    b.style.cssText = 'min-width:34px;height:30px;border-radius:7px;font-size:10px;font-weight:800;cursor:pointer;font-family:inherit;transition:all 0.1s;border:1.5px solid '
      + (isActive ? 'var(--green)' : (edited ? '#F59E0B' : 'var(--br)'))
      + ';background:' + (isActive ? 'var(--green)' : (edited ? '#FFF7ED' : 'var(--bgs)'))
      + ';color:' + (isActive ? '#fff' : (edited ? '#B45309' : 'var(--t2)')) + ';';
    b.textContent  = d.day || (di + 1);
    b.title = (d.title || ('Day '+(di+1))) + (edited?' ✏':'');
    b.setAttribute('data-di', di);
    b.addEventListener('click', function(){ aeOpenDay(parseInt(this.getAttribute('data-di'))); });
    strip.appendChild(b);
  });

  var edited = Object.keys(adminEdits).filter(function(k){ return k.indexOf(adminActiveProg+'_') === 0; }).length;
  var ec = document.getElementById('ae-edit-count');
  if(ec) ec.textContent = edited + ' card'+(edited!==1?'s':'')+' edited in this track';
}

function aeOpenDay(di){
  if(!adminActiveProg) adminActiveProg = _AE_PROGS[0];
  adminEditorDay = di;
  var arr = aeGetActiveArray();
  var d   = arr[di];
  if(!d){ console.warn('aeOpenDay: no day at',di,'in',adminActiveProg); return; }

  buildAeDayStrip(); // refresh strip highlight

  var key    = adminActiveProg + '_' + di;
  var edited = adminEdits[key] || {};

  var t = document.getElementById('ae-day-title');
  if(t) t.value = edited.title !== undefined ? edited.title : (d.title||'');
  var tk = document.getElementById('ae-day-task');
  if(tk) tk.value = edited.task !== undefined ? edited.task : (d.task||'');
  var mod = document.getElementById('ae-day-module');
  if(mod) mod.textContent = (d.icon||'')+ ' ' +(d.module||'') + '  ·  Day '+(d.day||(di+1));
  var pg  = document.getElementById('ae-day-prog');
  if(pg)  pg.textContent  = (d.prog||adminActiveProg)+'  ·  AoC: '+((d.aocTags||[]).join(', '));

  var panel = document.getElementById('ae-editor-panel');
  if(panel) panel.style.display = '';
  aeRenderCPs(di);
}

// aeRenderCPs — see enhanced version below


function aeEnsure(di){
  if(di === null || di === undefined) di = _aeDiU;
  var key = adminActiveProg+'_'+di;
  if(!adminEdits[key]){
    var arr = aeGetActiveArray(); var d = arr[di];
    adminEdits[key] = { cps: JSON.parse(JSON.stringify(d?d.cps||[]:[]) ) };
    _aeCps = adminEdits[key].cps;
  }
}

function aeAddCP(){
  var di = adminEditorDay;
  if(di===null||di===undefined){showToast('Select a day first.','err');return;}
  aeEnsure(di);
  var key = adminActiveProg+'_'+di;
  adminEdits[key].cps.push({
    t:'New checkpoint — enter text here.',
    r:'CHO', aoc:'A', svc:'', method:['SI','RR'], video:'', me:''
  });
  aeRenderCPs(di);
}

function aeDeleteCP(ci){
  var di = adminEditorDay;
  if(di===null||di===undefined) return;
  aeEnsure(di);
  adminEdits[adminActiveProg+'_'+di].cps.splice(ci,1);
  aeRenderCPs(di);
}

async function aeResetDay(){
  var di = adminEditorDay;
  if(di===null||di===undefined){showToast('Select a day first.','err');return;}
  var ok = await showConfirm('Reset Day '+(di+1)+' to its original content? This also resets it for all staff.','🔄','Reset Card','Reset','var(--red)');
  if(!ok) return;
  delete adminEdits[adminActiveProg+'_'+di];
  try{localStorage.setItem('adminEdits_v2',JSON.stringify(adminEdits));}catch(e){}
  var saved = await fbSet('shared/admin_edits', adminEdits);
  aeOpenDay(di); buildAeDayStrip();
  showToast(saved?'Day '+(di+1)+' reset to original':'Reset locally — Firebase save failed', saved?'ok':'err');
}

async function aeSaveDay(){
  var di = adminEditorDay;
  if(di===null||di===undefined){showToast('Select a day first.','err');return;}
  var key = adminActiveProg+'_'+di;
  aeEnsure(di);
  var tEl=document.getElementById('ae-day-title');
  var tkEl=document.getElementById('ae-day-task');
  if(tEl)  adminEdits[key].title = tEl.value;
  if(tkEl) adminEdits[key].task  = tkEl.value;
  try{localStorage.setItem('adminEdits_v2',JSON.stringify(adminEdits));}catch(e){}
  if(typeof fbSet==='function'){
    var ok = await fbSet('shared/admin_edits',adminEdits);
    showToast(ok?'✓ Day '+(di+1)+' saved to Firebase':'Saved locally only',ok?'ok':'err');
  }else{
    showToast('✓ Day '+(di+1)+' saved locally','ok');
  }
  buildAeDayStrip();
}

function toggleAdminEditor(){
  var sec = document.getElementById('admin-editor-section');
  if(!sec){ showToast('Editor not available.','err'); return; }
  var isHidden = sec.style.display === 'none' || sec.style.display === '';
  if(isHidden){
    sec.style.display = 'block';
    // Edits were loaded from Firebase at login; only fall back to the local copy if none are loaded
    if(!adminEdits||!Object.keys(adminEdits).length){ try{ var s=localStorage.getItem('adminEdits_v2'); if(s) adminEdits=JSON.parse(s); }catch(e){} }
    if(!adminActiveProg) adminActiveProg = _AE_PROGS[0];
    setTimeout(function(){
      sec.scrollIntoView({behavior:'smooth', block:'nearest'});
      buildAeDayStrip();
    }, 100);
  } else {
    sec.style.display = 'none';
  }
}


// ── SC Enhanced Card Editor ────────────────────────────────────
var _SC_ROLES    = ['General', 'CHO', 'ANM', 'ASHA', 'MPW', 'MO'];
var _SC_SERVICES = ['Pregnancy & Child Birth', 'Neonatal & Infant Care', 'Childhood & Adolescent Health', 'Family Planning', 'Elderly & Pallative Care', 'Management of Communicable Diseases', 'Management of Non-Communicable Diseases', 'Mental Health', 'Oral Health Care', 'Care of Common Ophthalmic and ENT', 'Emergency', 'Patient Rights', 'Drugs & Diagnostics', 'Drugs & Equipment', 'Infrastructure', 'Human Resources', 'Records & MIS', 'QI System', 'Patient Safety', 'Outcomes', 'Hand Hygiene', 'BMW & Housekeeping', 'Sterilisation'];
var _SC_AOC      = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
var _SC_METHODS  = ['SI', 'RR', 'OB', 'CI'];



// ── Video popup for staff (show play button if video link exists) ──
// ── Media/Link handler ─────────────────────────────────────────
// isVideoUrl() → see SC v2 module

// showVideoPopup() → see SC v2 module


// Active CP data for editor (module-level so renderFiltered can access)
var _aeCps  = [];
var _aeCpsOriginal = [];
var _aeDiU  = null;

function aeRenderCPs(di){
  var cont = document.getElementById('ae-cp-list');
  if(!cont) return;
  if(!adminActiveProg) adminActiveProg = _AE_PROGS[0];

  var diU = (di !== undefined && di !== null) ? di : adminEditorDay;
  if(diU === null || diU === undefined){
    cont.innerHTML = '<div style="padding:14px;color:#94A3B8;font-size:12px;">↑ Click a day number above to edit its checkpoints.</div>';
    return;
  }

  var arr = aeGetActiveArray();
  var d   = arr[diU];
  if(!d){
    cont.innerHTML = '<div style="padding:14px;color:#EF4444;font-size:12px;">Day not found at index '+diU+'.</div>';
    return;
  }

  // Store active CPs at module level
  var key = adminActiveProg + '_' + diU;
  _aeDiU  = diU;
  if(adminEdits[key] && adminEdits[key].cps){
    _aeCps = adminEdits[key].cps;
  } else {
    _aeCps = JSON.parse(JSON.stringify(d.cps || []));
  }
  _aeCpsOriginal = JSON.parse(JSON.stringify(_aeCps));

  cont.innerHTML =
    '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px;padding:10px 12px;background:#F8FAFC;border-radius:10px;border:1px solid #E2E8F0;">'
    + '<span style="font-size:10px;font-weight:800;color:#94A3B8;text-transform:uppercase;letter-spacing:0.5px;padding:4px 0;margin-right:4px;">Filter:</span>'
    + '<select id="ae-filter-role" onchange="aeFilterCPs(true)" style="border:1.5px solid #E2E8F0;border-radius:7px;padding:4px 8px;font-size:11px;font-family:inherit;">'
    + '<option value="">All Roles</option>'
    + _SC_ROLES.map(function(r){ return '<option value="'+r+'"'+(_aeFilt.role===r?' selected':'')+'>'+r+'</option>'; }).join('')
    + '</select>'
    + '<select id="ae-filter-aoc" onchange="aeFilterCPs(true)" style="border:1.5px solid #E2E8F0;border-radius:7px;padding:4px 8px;font-size:11px;font-family:inherit;">'
    + '<option value="">All AoC</option>'
    + _SC_AOC.map(function(a){ return '<option value="'+a+'"'+(_aeFilt.aoc===a?' selected':'')+'>AoC '+a+'</option>'; }).join('')
    + '</select>'
    + ((_aeFilt.role||_aeFilt.aoc)?'<button onclick="_aeFilt={role:\'\',aoc:\'\'};aeRenderCPs()" style="border:1.5px solid #E2E8F0;border-radius:7px;padding:4px 8px;font-size:11px;font-family:inherit;background:#fff;color:#64748B;cursor:pointer;">Clear</button>':'')
    + '<span id="ae-cp-count" style="font-size:11px;color:#64748B;font-weight:600;padding:4px 0;margin-left:auto;"></span>'
    + '</div>'
    + '<div id="ae-cp-items"></div>';

  aeFilterCPs();
}

function aeFilterCPs(fromUser){
  var list = document.getElementById('ae-cp-items');
  if(!list) return;
  if(fromUser){
    _aeFilt.role = (document.getElementById('ae-filter-role')||{}).value || '';
    _aeFilt.aoc  = (document.getElementById('ae-filter-aoc') ||{}).value || '';
  }
  var roleF = _aeFilt.role, aocF = _aeFilt.aoc;
  var rf=document.getElementById('ae-filter-role'); if(rf) rf.value=roleF;
  var af=document.getElementById('ae-filter-aoc'); if(af) af.value=aocF;
  list.innerHTML = '';
  var shown = 0;

  _aeCps.forEach(function(cp, ci){
    if(roleF && !scCpHasRole(cp, roleF)) return;
    if(aocF  && (cp.aoc||'') !== aocF)  return;
    shown++;

    var card = document.createElement('div');
    card.style.cssText = 'background:#fff;border:1.5px solid #E2E8F0;border-radius:12px;padding:12px 14px;margin-bottom:10px;';

    // ── Row 1: AoC + Role + Service + Delete ──
    var r1 = '<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:8px;">';

    r1 += '<select data-field="aoc" data-ci="'+ci+'" onchange="aeUpdateField(this)" style="border:1.5px solid #E2E8F0;border-radius:7px;padding:3px 7px;font-size:11px;font-weight:800;font-family:inherit;background:#ECFDF5;color:#065F46;cursor:pointer;">'
      + _SC_AOC.map(function(a){ return '<option value="'+a+'"'+(cp.aoc===a?' selected':'')+'>AoC '+a+'</option>'; }).join('')
      + '</select>';



    r1 += '<select data-field="svc" data-ci="'+ci+'" onchange="aeUpdateField(this)" style="border:1.5px solid #E2E8F0;border-radius:7px;padding:3px 7px;font-size:11px;font-weight:600;font-family:inherit;background:#FDF4FF;color:#7C3AED;cursor:pointer;flex:1;min-width:140px;">'
      + '<option value="">Service…</option>'
      + _SC_SERVICES.map(function(s){ return '<option value="'+s+'"'+((cp.svc===s||cp.service===s)?' selected':'')+'>'+s+'</option>'; }).join('')
      + '</select>';

    r1 += '<button onclick="aePropagateCP('+ci+')" title="Apply this edit to matching checkpoints elsewhere" style="background:#EEF2FF;color:#4F46E5;border:1.5px solid #C7D2FE;border-radius:7px;padding:3px 9px;font-size:11px;cursor:pointer;font-family:inherit;flex-shrink:0;">🔗 Propagate</button>';
    r1 += '<button onclick="aeDeleteCPByIndex('+ci+')" style="background:#FEF2F2;color:#DC2626;border:1.5px solid #FECACA;border-radius:7px;padding:3px 10px;font-size:12px;cursor:pointer;font-family:inherit;flex-shrink:0;">✕</button>';
    r1 += '</div>';
    r1 += '<div style="margin:-2px 0 8px;">'+aeRoleChipsHTML(cp,ci)+'</div>';

    // ── Row 2: Checkpoint text EN + Hindi ──
    var enText = (cp.t||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    var hiText = (cp.hi||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    var r2 = '<div style="margin-bottom:6px;">'
      + '<label style="font-size:9px;font-weight:800;color:#94A3B8;text-transform:uppercase;letter-spacing:0.4px;display:block;margin-bottom:3px;">English Text</label>'
      + '<textarea data-field="t" data-ci="'+ci+'" onchange="aeUpdateField(this)" oninput="aeUpdateField(this)"'
      + ' style="width:100%;border:1.5px solid #E2E8F0;border-radius:8px;padding:8px 10px;font-size:12px;font-family:inherit;resize:vertical;min-height:48px;color:#0F172A;box-sizing:border-box;">'
      + enText
      + '</textarea></div>'
      + '<div style="margin-bottom:8px;">'
      + '<label style="font-size:9px;font-weight:800;color:#F59E0B;text-transform:uppercase;letter-spacing:0.4px;display:block;margin-bottom:3px;">हिंदी अनुवाद (Hindi)</label>'
      + '<textarea data-field="hi" data-ci="'+ci+'" onchange="aeUpdateField(this)" oninput="aeUpdateField(this)"'
      + ' placeholder="यहाँ हिंदी अनुवाद लिखें..."'
      + ' style="width:100%;border:1.5px solid #FDE68A;border-radius:8px;padding:8px 10px;font-size:12px;font-family:inherit;resize:vertical;min-height:48px;color:#92400E;background:#FFFBEB;box-sizing:border-box;">'
      + hiText
      + '</textarea></div>';
        // ── Row 3: Methods + Video ──
    var methods = cp.method || [];
    var r3 = '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">'
      + '<span style="font-size:10px;font-weight:700;color:#94A3B8;">Method:</span>';
    _SC_METHODS.forEach(function(m){
      var chk = methods.indexOf(m)>=0 ? 'checked' : '';
      var activeBg = chk ? '#EFF6FF' : '#fff';
      var activeCol = chk ? '#1D4ED8' : '#94A3B8';
      r3 += '<label style="display:flex;align-items:center;gap:3px;font-size:10px;font-weight:700;cursor:pointer;padding:3px 8px;border-radius:6px;border:1.5px solid #E2E8F0;background:'+activeBg+';color:'+activeCol+';">'
        + '<input type="checkbox" data-kind="method" value="'+m+'" data-ci="'+ci+'" '+chk+' onchange="aeUpdateMethod(this)" style="width:11px;height:11px;cursor:pointer;"> '+m+'</label>';
    });
    r3 += '<span style="font-size:10px;font-weight:700;color:#94A3B8;margin-left:auto;">🎬 Video:</span>'
      + '<input type="url" data-field="video" data-ci="'+ci+'" onchange="aeUpdateField(this)" placeholder="YouTube, Wix video (video.wixstatic.com) or link…" value="'+scEsc(cp.video||'')+'" style="border:1.5px solid #E2E8F0;border-radius:7px;padding:4px 9px;font-size:11px;font-family:inherit;min-width:200px;flex:1;">'
      + '<input type="url" data-field="videoHi" data-ci="'+ci+'" onchange="aeUpdateField(this)" placeholder="Hindi video link (optional)" value="'+scEsc(cp.videoHi||'')+'" style="border:1.5px solid #E2E8F0;border-radius:7px;padding:4px 9px;font-size:11px;font-family:inherit;min-width:160px;flex:1;">';
    r3 += '</div>';

    card.innerHTML = r1 + r2 + r3;
    list.appendChild(card);
  });

  if(shown === 0){
    list.innerHTML = '<div style="padding:16px;text-align:center;color:#94A3B8;font-size:12px;">'
      + (_aeCps.length === 0 ? 'No checkpoints yet. Click + Add Checkpoint.' : 'No checkpoints match the filter.')
      + '</div>';
  }
  var cc = document.getElementById('ae-cp-count');
  if(cc) cc.textContent = shown+' of '+_aeCps.length+' checkpoints';
}

function aeUpdateField(el){
  var ci    = parseInt(el.getAttribute('data-ci'));
  var field = el.getAttribute('data-field');
  var val   = el.value;
  aeEnsure(_aeDiU);
  if(adminEdits[adminActiveProg+'_'+_aeDiU].cps[ci] !== undefined){
    adminEdits[adminActiveProg+'_'+_aeDiU].cps[ci][field] = val;
    _aeCps[ci][field] = val;
  }
}

// ══ PROPAGATE EDIT — apply a checkpoint's edit to every matching occurrence ══
// across all 4 packages AND repeated gap-closure/consolidation days within each.
// Matching is done by the checkpoint's ORIGINAL text (captured when the day was
// opened), so it's safe even if you've already changed the text in this session.
function _aeArrayForProg(prog){
  var progMap = {
    'C': typeof DAYS_12A !=='undefined' ? DAYS_12A : null,
    'D': typeof DAYS_12B !=='undefined' ? DAYS_12B : null,
  };
  return progMap[prog] || [];
}
function _aeEffectiveCps(prog, di){
  var key = prog+'_'+di;
  if(adminEdits[key] && adminEdits[key].cps) return adminEdits[key].cps;
  var arr = _aeArrayForProg(prog);
  var d = arr[di];
  return d ? (d.cps||[]) : [];
}
async function aePropagateCP(ci){
  var origCp = _aeCpsOriginal[ci];
  var oldText = origCp ? (origCp.t||'').trim() : '';
  if(!oldText){ showToast('Nothing to match on yet.','err'); return; }
  var curCp = _aeCps[ci];
  var newVals = { t: curCp.t, hi: curCp.hi, video: curCp.video, method: (curCp.method||[]).slice() };
  var curProg = adminActiveProg, curDi = _aeDiU;

  var matches = [];
  _AE_PROGS.forEach(function(prog){
    var arr = _aeArrayForProg(prog);
    arr.forEach(function(day, di){
      if(prog===curProg && di===curDi) return; // this day is handled by the normal Save
      var cps = _aeEffectiveCps(prog, di);
      cps.forEach(function(cp, ci2){
        if((cp.t||'').trim() === oldText) matches.push({prog:prog, di:di, ci:ci2});
      });
    });
  });

  if(!matches.length){ showToast('No other matching checkpoints found.','ok'); return; }

  var ok = await showConfirm(
    'Found this checkpoint in '+matches.length+' other place'+(matches.length===1?'':'s')+' (across packages and/or repeated revision days). Apply this same edit to all of them?',
    '🔗','Propagate Edit','Apply to All','var(--teal)'
  );
  if(!ok) return;

  matches.forEach(function(m){
    var key = m.prog+'_'+m.di;
    if(!adminEdits[key]){
      var arr = _aeArrayForProg(m.prog); var d = arr[m.di];
      adminEdits[key] = { cps: JSON.parse(JSON.stringify(d?d.cps||[]:[])) };
    }
    if(adminEdits[key].cps[m.ci]){
      adminEdits[key].cps[m.ci].t      = newVals.t;
      adminEdits[key].cps[m.ci].hi     = newVals.hi;
      adminEdits[key].cps[m.ci].video  = newVals.video;
      adminEdits[key].cps[m.ci].method = newVals.method.slice();
    }
  });

  try{ localStorage.setItem('adminEdits_v2', JSON.stringify(adminEdits)); }catch(e){}
  var saveOk = (typeof fbSet==='function') ? await fbSet('shared/admin_edits', adminEdits) : false;
  _aeCpsOriginal[ci] = JSON.parse(JSON.stringify(_aeCps[ci])); // reset baseline for this cp
  showToast(saveOk ? ('✓ Applied to '+matches.length+' other checkpoint(s)') : 'Applied locally — Firebase save failed', saveOk?'ok':'err');
  buildAeDayStrip();
}

function aeUpdateMethod(cb){
  var ci = parseInt(cb.getAttribute('data-ci'));
  aeEnsure(_aeDiU);
  var card = cb.closest('div');
  var methods = [];
  card.querySelectorAll('input[data-kind="method"]').forEach(function(c){
    if(c.checked) methods.push(c.value);
    // Update label styling
    var lbl = c.parentElement;
    lbl.style.background = c.checked ? '#EFF6FF' : '#fff';
    lbl.style.color = c.checked ? '#1D4ED8' : '#94A3B8';
  });
  if(adminEdits[adminActiveProg+'_'+_aeDiU].cps[ci]){
    adminEdits[adminActiveProg+'_'+_aeDiU].cps[ci].method = methods;
    _aeCps[ci].method = methods;
  }
}

function aeDeleteCPByIndex(ci){
  aeEnsure(_aeDiU);
  _aeCps.splice(ci, 1);
  adminEdits[adminActiveProg+'_'+_aeDiU].cps = _aeCps.slice();
  aeFilterCPs(); // re-render without full rebuild
}


// ══════════════════════════════════════════════════════════════
// HINDI LANGUAGE TOGGLE SYSTEM
// ══════════════════════════════════════════════════════════════
var _appLang = 'en';

var HINDI_UI = {
  'Staff Login':'स्टाफ लॉगिन','Facility ID':'स्वास्थ्य केंद्र आईडी','Mobile Number':'मोबाइल नंबर',
  'Password':'पासवर्ड','Welcome back':'वापस स्वागत है','Day':'दिन',
  'Start date not set':'प्रारंभ तिथि निर्धारित नहीं','days remaining':'दिन शेष',
  'programme complete':'कार्यक्रम पूर्ण','Quest Board':'क्वेस्ट बोर्ड',
  'Hide Guide':'गाइड छुपाएं','Show Guide':'गाइड दिखाएं','Logout':'लॉग आउट',
  'Checkpoints':'चेकपॉइंट','Staff Interview':'स्टाफ साक्षात्कार',
  'Record Review':'अभिलेख समीक्षा','Observation':'अवलोकन',
  'Client Interview':'रोगी साक्षात्कार','Mark as done':'पूर्ण के रूप में चिह्नित करें',
  'Not applicable':'लागू नहीं','Verified':'सत्यापित',
  'Submit for verification':'सत्यापन के लिए जमा करें',
  'Service Provision':'सेवा प्रावधान','Patient Rights':'रोगी अधिकार',
  'Inputs':'इनपुट / संसाधन','Support Services':'सहायक सेवाएं',
  'Clinical Services':'नैदानिक सेवाएं','Infection Control':'संक्रमण नियंत्रण',
  'Quality Management':'गुणवत्ता प्रबंधन','Outcome Indicators':'परिणाम संकेतक',
  'Pregnancy & Child Birth':'गर्भावस्था और प्रसव','Neonatal & Infant Care':'नवजात और शिशु देखभाल',
  'Family Planning':'परिवार नियोजन','Immunization':'टीकाकरण',
  'Emergency':'आपातकाल','Boss Battle':'बॉस बैटल','Grand Finale':'ग्रैंड फिनाले',
  'Mock Assessment':'मॉक मूल्यांकन','Consolidation':'समेकन',
  'Mobile not registered. Contact your CHO.':'मोबाइल पंजीकृत नहीं। अपने CHO से संपर्क करें।',
  'Incorrect password.':'पासवर्ड गलत है।',
};

function t(key){ return (_appLang==='hi' && HINDI_UI[key]) ? HINDI_UI[key] : key; }

function getCPText(cp){
  if(!cp) return '';
  if(_appLang==='hi' && cp.hi) return cp.hi;
  return cp.t || '';
}

// setLang() → see SC v2 module

// initLang() → see SC v2 module
window.addEventListener('load', function(){ initLang(); });





// ══════════════════════════════════════════════════════════════
// DEMO SIGNUP + SUBSCRIPTION PAYWALL + LEADS (SC — package-based)
// ══════════════════════════════════════════════════════════════

var _SC_PKG_LABELS={
  'nqas_12A':'12A — 12 Services (60 days)',
  'nqas_12B':'12B — 12 Services + Delivery (60 days)'
};

function phcOpenDemoSignup(){ var ov=document.getElementById('demo-signup-overlay'); if(ov)ov.classList.add('open'); }
function phcCloseDemoSignup(){ var ov=document.getElementById('demo-signup-overlay'); if(ov)ov.classList.remove('open'); }

async function phcSubmitDemoSignup(){
  var name=(document.getElementById('demo-fac-name')||{}).value||'';name=name.trim();
  var district=(document.getElementById('demo-fac-district')||{}).value||'';district=district.trim();
  var state=(document.getElementById('demo-fac-state')||{}).value||'';state=state.trim();
  var progId=(document.getElementById('demo-fac-pkg')||{}).value||'nqas_12A';
  var contactName=(document.getElementById('demo-contact-name')||{}).value||'';contactName=contactName.trim();
  var mobile=(document.getElementById('demo-contact-mobile')||{}).value||'';mobile=mobile.trim();
  var errEl=document.getElementById('demo-signup-err');
  if(errEl)errEl.style.display='none';
  if(!name||!contactName||!mobile||mobile.length!==10||!/^\d{10}$/.test(mobile)){
    if(errEl){errEl.textContent='Please fill facility name, your name, and a valid 10-digit mobile number.';errEl.style.display='block';}
    return;
  }
  var btn=document.querySelector('#demo-signup-body .fc-add-btn');
  if(btn){btn.disabled=true;btn.innerHTML='Creating…';}
  try{
    var code=null, attempts=0;
    while(attempts<10){
      var candidate='DEMO-SC-'+Math.floor(1000+Math.random()*9000);
      var existing=await fbGet(scFacilityPath(candidate));
      if(!existing){code=candidate;break;}
      attempts++;
    }
    if(!code){ throw new Error('Could not allocate a facility code. Please try again.'); }
    var pwd=Math.random().toString(36).slice(2,8).toUpperCase();
    var facData={
      name:name, district:district, state:state, progId:progId,
      choName:contactName, choPassword:pwd, contactMobile:mobile,
      enrolledAt:new Date().toISOString(), active:true, suspended:false,
      isDemo:true,
      trialStartDate:new Date().toISOString(),
      subscriptionStatus:'trial',
      accessKeyVerified:true,
      staff:{[mobile]:{name:contactName,mobile:mobile,role:'CHO',password:mobile.slice(-4),addedAt:new Date().toISOString(),addedBy:'demo-signup'}}
    };
    var ok=await fbSet(scFacilityPath(code),facData);
    if(!ok) throw new Error('Could not save facility. Please check your connection and try again.');
    var body=document.getElementById('demo-signup-body');
    if(body){
      body.innerHTML='<div style="text-align:center;padding:10px 0;">'
        +'<div style="font-size:40px;margin-bottom:10px;">🎉</div>'
        +'<div style="font-size:15px;font-weight:800;color:var(--t1);margin-bottom:6px;">'+nfRegT('Your facility is registered!')+'</div>'
        +'<div style="font-size:12px;color:var(--t3);margin-bottom:18px;">Save these details. Log in with Staff Login — as CHO you get both My Cards and the Facility dashboard.</div>'
        +'<div style="background:var(--bgs,#F9FAFB);border-radius:12px;padding:14px;margin-bottom:8px;text-align:left;">'
        +'<div style="font-size:10px;font-weight:800;color:var(--t3);text-transform:uppercase;">Facility ID</div>'
        +'<div style="font-size:16px;font-weight:800;color:var(--teal-dk);font-family:monospace;">'+code+'</div></div>'
        +'<div style="background:var(--bgs,#F9FAFB);border-radius:12px;padding:14px;margin-bottom:18px;text-align:left;">'
        +'<div style="font-size:10px;font-weight:800;color:var(--t3);text-transform:uppercase;">Your mobile · Password</div>'
        +'<div style="font-size:16px;font-weight:800;color:var(--teal-dk);font-family:monospace;">'+mobile+' · '+mobile.slice(-4)+'</div>'
        +'<div style="font-size:10px;color:var(--t3);margin-top:4px;">Password is the last 4 digits of your mobile. You can change it later from the Facility dashboard.</div></div>'
        +'<button class="fc-add-btn" style="width:100%;padding:12px;border-radius:10px;font-size:13px;" id="demo-login-now-btn">'
        +'<i class="ti ti-login-2"></i> Log in now</button></div>';
      var loginBtn=document.getElementById('demo-login-now-btn');
      if(loginBtn)loginBtn.onclick=function(){
        phcCloseDemoSignup();
        if(typeof scHideSecondaryLogin==='function')scHideSecondaryLogin();
        var fidEl=document.getElementById('sc-staff-fid'); if(fidEl)fidEl.value=code;
        var mobEl=document.getElementById('sc-staff-mob'); if(mobEl)mobEl.value=mobile;
        var pwdEl=document.getElementById('sc-staff-pwd'); if(pwdEl)pwdEl.focus();
      };
    }
  }catch(e){
    if(errEl){errEl.textContent=e.message||'Something went wrong. Please try again.';errEl.style.display='block';}
    if(btn){btn.disabled=false;btn.innerHTML='<i class="ti ti-check" style="font-size:14px;"></i> '+nfRegT('Register');}
  }
}

function phcOpenLeadModal(){ var ov=document.getElementById('lead-signup-overlay'); if(ov)ov.classList.add('open'); }
function phcCloseLeadModal(){ var ov=document.getElementById('lead-signup-overlay'); if(ov)ov.classList.remove('open'); }

async function phcSubmitLead(){
  var orgName=(document.getElementById('lead-org-name')||{}).value||'';orgName=orgName.trim();
  var contactName=(document.getElementById('lead-contact-name')||{}).value||'';contactName=contactName.trim();
  var mobile=(document.getElementById('lead-contact-mobile')||{}).value||'';mobile=mobile.trim();
  var facCount=(document.getElementById('lead-fac-count')||{}).value||'';facCount=facCount.trim();
  var errEl=document.getElementById('lead-signup-err');
  if(errEl)errEl.style.display='none';
  if(!orgName||!contactName||!mobile||mobile.length!==10||!/^\d{10}$/.test(mobile)){
    if(errEl){errEl.textContent='Please fill organization name, your name, and a valid 10-digit mobile number.';errEl.style.display='block';}
    return;
  }
  var btn=document.querySelector('#lead-signup-body .fc-add-btn');
  if(btn){btn.disabled=true;btn.innerHTML='Submitting…';}
  try{
    var leadId='lead_'+Date.now()+'_'+Math.floor(Math.random()*1000);
    var lead={ orgName:orgName, contactName:contactName, mobile:mobile, facilityCount:facCount||null, submittedAt:new Date().toISOString(), status:'new' };
    var ok=await fbSet('shared/sc_leads/'+leadId, lead);
    if(!ok) throw new Error('Could not submit — please check your connection and try again.');
    var body=document.getElementById('lead-signup-body');
    if(body){
      body.innerHTML='<div style="text-align:center;padding:10px 0;">'
        +'<div style="font-size:40px;margin-bottom:10px;">🙌</div>'
        +'<div style="font-size:15px;font-weight:800;color:var(--t1);margin-bottom:6px;">Thanks, '+scEsc(contactName)+'!</div>'
        +'<div style="font-size:12px;color:var(--t3);margin-bottom:18px;">Our team will reach out to '+scEsc(mobile)+' shortly to discuss enrolling '+scEsc(orgName)+'.</div>'
        +'<button class="fc-add-btn" style="width:100%;padding:12px;border-radius:10px;font-size:13px;" onclick="phcCloseLeadModal()">Close</button></div>';
    }
  }catch(e){
    if(errEl){errEl.textContent=e.message||'Something went wrong. Please try again.';errEl.style.display='block';}
    if(btn){btn.disabled=false;btn.innerHTML='<i class="ti ti-send" style="font-size:14px;"></i> Submit Enquiry';}
  }
}
var _phcLeadsCache={};
async function renderLeadsPanel(){
  var box=document.getElementById('leads-box');var list=document.getElementById('leads-list');
  if(!box||!list)return;
  var leads=await fbGet('shared/sc_leads');
  _phcLeadsCache=leads||{};
  var ids=Object.keys(_phcLeadsCache).filter(function(id){return _phcLeadsCache[id].status!=='closed';});
  if(!ids.length){box.style.display='none';return;}
  box.style.display='block';
  ids.sort(function(a,b){return new Date(_phcLeadsCache[b].submittedAt)-new Date(_phcLeadsCache[a].submittedAt);});
  while(list.firstChild)list.removeChild(list.firstChild);
  ids.forEach(function(id){
    var lead=_phcLeadsCache[id];
    var row=document.createElement('div');
    row.style.cssText='display:flex;align-items:center;gap:12px;padding:12px;border:1.5px solid var(--br);border-radius:12px;margin-bottom:8px;flex-wrap:wrap;';
    var when='';try{ when=new Date(lead.submittedAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}); }catch(e){}
    row.innerHTML='<div style="flex:1;min-width:220px;">'
      +'<div style="font-weight:800;font-size:13px;color:var(--t1);">'+scEsc(lead.orgName)+(lead.facilityCount?(' <span style="color:var(--t3);font-weight:600;font-size:11px;">· ~'+scEsc(lead.facilityCount)+' facilities</span>'):'')+'</div>'
      +'<div style="font-size:11px;color:var(--t3);margin-top:2px;">'+scEsc(lead.contactName)+' · '+scEsc(lead.mobile)+' · Submitted '+scEsc(when)+([lead.district,lead.state].filter(Boolean).length?' · '+scEsc([lead.district,lead.state].filter(Boolean).join(', ')):'')+'</div></div>';
    var closeBtn=document.createElement('button');closeBtn.className='rm-cancel';closeBtn.style.cssText='padding:7px 12px;border-radius:8px;font-size:11px;flex-shrink:0;';closeBtn.textContent='Mark Contacted';
    closeBtn.onclick=function(){ phcCloseLead(id); };
    try{ if(typeof nfWaNum==='function'&&nfWaNum(lead.mobile)){ var wa=document.createElement('div'); wa.innerHTML=nfWaBtn('nfWaLead(\''+scJs(id)+'\')',' WhatsApp',''); row.appendChild(wa.firstChild); } }catch(e){}
    row.appendChild(closeBtn);list.appendChild(row);
  });
}
async function phcCloseLead(id){
  if(!_phcLeadsCache[id])return;
  _phcLeadsCache[id].status='closed';
  await fbSet('shared/sc_leads/'+id, _phcLeadsCache[id]);
  renderLeadsPanel();showToast('Lead marked as contacted.','ok');
}

// ── Pricing config (4 packages, not departments) ────────────────
var _phcPricingCache=null;
function _phcAllPriceableItems(){
  // each item: {id, label, type (sc|uphc|phc|chc), grp (package | base | addon | catchup)}
  var L=Object.keys(_SC_PKG_LABELS).map(function(id){return {id:id,label:'Sub-Centre · '+_SC_PKG_LABELS[id],type:'sc',grp:'package'};});
  // 21 Oct: UPHC / PHC packages; CHC priced as a base (FRU / Non-FRU) plus an add-on per optional department (prices decided later; blank = not sold yet)
  try{ ['uphc','phc'].forEach(function(t){ var LV=NF_LEVELS[t]||{}; (LV.programmes||[]).forEach(function(p){ L.push({id:p.id,label:(LV.short||t.toUpperCase())+' · '+String(p.label).replace(/^[^—]*—\s*/,''),type:t,grp:'package'}); }); });
    var C=NF_LEVELS.chc||{}, core=(C.departments||[]).filter(function(d){ return !d.optional; }).map(function(d){ return d.name; }).join(', ');
    L.push({id:'nqas_chc_fru',label:'CHC (FRU) · base price',hint:'Covers '+core,type:'chc',grp:'base'});
    L.push({id:'nqas_chc_nonfru',label:'CHC (Non-FRU) · base price',hint:'Covers '+core,type:'chc',grp:'base'});
    (C.departments||[]).filter(function(d){ return d.optional; }).forEach(function(d){ L.push({id:'chc_dept_'+d.id,label:'CHC add-on · '+d.name,type:'chc',grp:'addon'}); }); }catch(e){}
  return L.concat(L.filter(function(it){ return it.grp!=='addon'; }).map(function(it){ return {id:'catchup_'+it.id,label:'Catch-up · '+it.label.replace(/ · base price$/,''),type:it.type,grp:'catchup'}; }));
}
function _phcPriceLabel(id){ var it=_phcAllPriceableItems().find(function(x){ return x.id===id; }); return it?it.label:(_SC_PKG_LABELS[id]||''); }
async function phcLoadPricing(force){
  if(_phcPricingCache&&!force)return _phcPricingCache;
  var cfg=null;
  try{cfg=await fbGet('shared/sc_pricing_config');}catch(e){}
  var base=_phcAllPriceableItems();
  var priceMap={};
  if(cfg&&cfg.items)cfg.items.forEach(function(it){priceMap[it.id]=it.price;});
  base.forEach(function(it){it.price=(priceMap[it.id]!==undefined)?priceMap[it.id]:null;});
  _phcPricingCache={items:base};
  return _phcPricingCache;
}
var _phcPriceTab='sc';
async function adminRenderPricingPanel(){
  var cont=document.getElementById('pricing-list');if(!cont)return;
  var cfg=await phcLoadPricing(true);
  while(cont.firstChild)cont.removeChild(cont.firstChild);
  // one tab per facility type (HealSol 21 Oct); every input stays in the page so Save keeps all prices
  var tabs=document.createElement('div');tabs.className='hs-tabs pr-tabs';tabs.setAttribute('role','tablist');
  ['sc','uphc','phc','chc'].forEach(function(t){ var b=document.createElement('button');b.type='button';b.className='hs-tab'+(t===_phcPriceTab?' on':'');b.textContent=(NF_LEVELS[t]||{}).plural||t;b.setAttribute('data-t',t);
    b.onclick=function(){ _phcPriceTab=t; tabs.querySelectorAll('button').forEach(function(x){ x.classList.toggle('on',x.getAttribute('data-t')===t); }); cont.querySelectorAll('[data-pt]').forEach(function(r){ r.style.display=r.getAttribute('data-pt')===t?'':'none'; }); };
    tabs.appendChild(b); });
  cont.appendChild(tabs);
  var GRP={package:'Packages',base:'Base price (core departments)',addon:'Add-on price per optional department — added for each department the CHC has',catchup:'Catch-up'}, last='';
  cfg.items.forEach(function(it){
    var t=it.type||'sc', key=t+'|'+it.grp;
    if(key!==last){ last=key; var h=document.createElement('div');h.className='pr-grp';h.setAttribute('data-pt',t);h.textContent=GRP[it.grp]||'';cont.appendChild(h); }
    var row=document.createElement('div');row.className='pricing-row';row.setAttribute('data-pt',t);
    var lbl=document.createElement('div');lbl.style.cssText='flex:1;font-size:12px;font-weight:700;color:var(--t1);';lbl.textContent=it.label;
    if(it.hint){ var sm=document.createElement('small');sm.style.cssText='display:block;font-weight:600;color:var(--t3);font-size:10.5px;';sm.textContent=it.hint;lbl.appendChild(sm); }
    var rupee=document.createElement('span');rupee.style.cssText='font-size:12px;color:var(--t3);';rupee.textContent='₹';
    var inp=document.createElement('input');inp.type='number';inp.min='0';inp.placeholder='Not set';
    inp.value=(it.price!==null&&it.price!==undefined)?it.price:'';inp.dataset.itemId=it.id;
    row.appendChild(lbl);row.appendChild(rupee);row.appendChild(inp);cont.appendChild(row);
  });
  var note=document.createElement('div');note.className='pr-grp';note.setAttribute('data-pt','chc');note.style.cssText='font-weight:600;text-transform:none;letter-spacing:0;';
  note.textContent='A CHC pays its base price (FRU or Non-FRU, chosen at enrolment) plus the add-on of each optional department it has. The enrolment form shows the total.';
  cont.appendChild(note);
  cont.querySelectorAll('[data-pt]').forEach(function(r){ r.style.display=r.getAttribute('data-pt')===_phcPriceTab?'':'none'; });
}
// price of a facility being enrolled: package price, or for a CHC its base (FRU / Non-FRU) + the ticked optional departments
async function nfEnrollPriceLine(){
  var el=document.getElementById('nf-enroll-price'), ty=(document.getElementById('sc-enroll-type')||{}).value||'sc'; if(!el) return;
  if(ty!=='chc'){ el.textContent=''; return; }
  var cfg=await phcLoadPricing(), P={}; cfg.items.forEach(function(it){ P[it.id]=it.price; });
  var kind=(document.querySelector('input[name="nf-chc-kind"]:checked')||{}).value||'fru', base=P['nqas_chc_'+kind], on=[].filter.call(document.querySelectorAll('#sc-enroll-depts input[data-nf-dept]'),function(c){ return c.checked; }).map(function(c){ return c.getAttribute('data-nf-dept'); });
  var add=0, unset=[]; on.forEach(function(d){ var v=P['chc_dept_'+d]; if(v==null) unset.push(d); else add+=+v; });
  var fmt=function(n){ return '₹'+Number(n).toLocaleString('en-IN'); };
  if(base==null){ el.textContent='Price: not set yet (Settings → Pricing → CHCs).'; return; }
  el.textContent='Price: '+fmt(base)+' base + '+fmt(add)+' for '+on.length+' department'+(on.length===1?'':'s')+' = '+fmt(+base+add)+(unset.length?' · no price yet for '+unset.join(', '):'');
}
async function adminSavePricing(){
  var cont=document.getElementById('pricing-list');if(!cont)return;
  var items=[];
  cont.querySelectorAll('input[data-item-id]').forEach(function(inp){
    var v=inp.value.trim();items.push({id:inp.dataset.itemId,label:_phcPriceLabel(inp.dataset.itemId),price:v===''?null:Number(v)});
  });
  var ok=await fbSet('shared/sc_pricing_config',{items:items});
  _phcPricingCache=null;
  showToast(ok?'Pricing saved!':'Save failed — check connection.',ok?'ok':'err');
}

// ── Access gate (day-index based — SC has one linear package, no sub-modules) ──
function phcCheckAccess(di,day){
  var fac=(typeof choState!=='undefined'?choState.facility:null)||{};
  var status=fac.subscriptionStatus;
  if(!status)return true;
  if(status==='contract'||status==='paid')return true;
  return (di+1)<=7;
}

function upgradeCardHTML(day){
  return '<div class="upgrade-card">'
    +'<div class="upgrade-hd"><div style="font-size:34px;margin-bottom:6px;">🔒</div>'
    +'<div style="font-size:16px;font-weight:800;">Your 7-day free trial has ended</div>'
    +'<div style="font-size:12px;opacity:0.9;margin-top:4px;">Subscribe to continue your programme from where you left off.</div></div>'
    +'<div class="upgrade-body"><div id="upgrade-pkg-list" style="margin-bottom:14px;"></div>'
    +'<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-top:1.5px solid var(--br);margin-bottom:14px;">'
    +'<span style="font-size:12px;font-weight:800;color:var(--t3);">Total</span>'
    +'<span id="upgrade-total" style="font-size:18px;font-weight:800;color:var(--teal-dk);">₹0</span></div>'
    +'<button class="fc-add-btn" id="upgrade-pay-btn" style="width:100%;padding:13px;border-radius:12px;font-size:14px;" disabled>'
    +'<i class="ti ti-credit-card" style="font-size:15px;"></i> Loading your package…</button></div></div>';
}
var _upgradeSelected={};
async function renderUpgradeCard(container, day){
  container.innerHTML=upgradeCardHTML(day);
  _upgradeSelected={};
  var cfg=await phcLoadPricing();
  var myProgId=(choState.facility||{}).progId||choState.progId;
  var list=document.getElementById('upgrade-pkg-list');if(!list)return;
  var it=cfg.items.find(function(x){return x.id===myProgId;});
  if(it&&it.price!==null&&it.price!==undefined){
    _upgradeSelected[it.id]=it.price;
    var row=document.createElement('div');row.className='pkg-item checked';
    var box=document.createElement('div');
    box.style.cssText='width:20px;height:20px;border-radius:6px;border:2px solid var(--teal);background:var(--teal);display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;flex-shrink:0;';
    box.textContent='✓';
    var lbl=document.createElement('div');lbl.style.cssText='flex:1;font-size:13px;font-weight:700;color:var(--t1);';lbl.textContent='Your Package: '+it.label;
    var price=document.createElement('div');price.style.cssText='font-size:13px;font-weight:800;color:var(--teal-dk);';price.textContent='₹'+it.price;
    row.appendChild(box);row.appendChild(lbl);row.appendChild(price);
    list.appendChild(row);
  }else{
    var none=document.createElement('div');none.style.cssText='padding:14px;text-align:center;font-size:12px;color:var(--t3);';
    none.textContent='Pricing hasn\'t been set up for your package yet — please contact HealSol Academy to subscribe.';list.appendChild(none);
  }
  updateUpgradeTotal();
}
function updateUpgradeTotal(){
  var total=Object.values(_upgradeSelected).reduce(function(a,b){return a+b;},0);
  var totalEl=document.getElementById('upgrade-total');if(totalEl)totalEl.textContent='₹'+total;
  var payBtn=document.getElementById('upgrade-pay-btn');
  if(payBtn){
    var n=Object.keys(_upgradeSelected).length;
    payBtn.disabled=n===0;
    payBtn.innerHTML=n===0?'<i class="ti ti-credit-card" style="font-size:15px;"></i> Contact HealSol to subscribe':'<i class="ti ti-credit-card" style="font-size:15px;"></i> Pay ₹'+total+' & Unlock';
    payBtn.onclick=n===0?null:function(){phcStartCheckout(Object.keys(_upgradeSelected),total);};
  }
}

var RAZORPAY_KEY_ID='rzp_test_1234567890abcd';
function phcStartCheckout(moduleIds,totalRupees){
  if(typeof Razorpay==='undefined'){showToast('Payment system unavailable — check your connection.','err');return;}
  var options={
    key:RAZORPAY_KEY_ID, amount:Math.round(totalRupees*100), currency:'INR',
    name:'HealSol Academy',
    description:'NQAS | FAST — SC subscription ('+(_SC_PKG_LABELS[moduleIds[0]]||moduleIds[0])+')',
    prefill:{name:(choState.facility||{}).name||'',contact:choState.staffMobile||''},
    theme:{color:'#1E6B5E'},
    handler:async function(response){
      try{
        var pay={subscriptionStatus:'paid',lastPayment:{id:response.razorpay_payment_id,amount:totalRupees,package:moduleIds[0],at:new Date().toISOString()}};
        await db.ref(scFacilityPath(choState.facilityCode)).update(pay);   // only the payment fields
        choState.facility.subscriptionStatus='paid';
        showToast('Payment successful! Unlocked.','ok');
        if(typeof renderCard==='function'&&choState.currentDay)renderCard(choState.currentDay-1);
      }catch(e){ showToast('Payment received but unlocking failed — contact support with payment ID '+response.razorpay_payment_id,'err'); }
    },
    modal:{ondismiss:function(){}}
  };
  var rzp=new Razorpay(options);rzp.open();
}

// ── Admin: Demo Facilities panel + Confirm Payment / code reassignment ──
function renderDemoFacilitiesPanel(){
  var box=document.getElementById('demo-facilities-box');var list=document.getElementById('demo-facilities-list');
  if(!box||!list)return;
  var demoCodes=Object.keys(scMasterFacilities).filter(function(c){return scMasterFacilities[c]&&scMasterFacilities[c].isDemo&&!scMasterFacilities[c].migratedTo;});
  if(!demoCodes.length){box.style.display='none';return;}
  box.style.display='block';
  while(list.firstChild)list.removeChild(list.firstChild);
  demoCodes.forEach(function(code){
    var fac=scMasterFacilities[code];
    var row=document.createElement('div');
    row.style.cssText='display:flex;align-items:center;gap:12px;padding:12px;border:1.5px solid var(--br);border-radius:12px;margin-bottom:8px;flex-wrap:wrap;';
    var daysElapsed='—';
    if(fac.trialStartDate){var ms=Date.now()-new Date(fac.trialStartDate).getTime();daysElapsed=Math.max(0,Math.floor(ms/86400000))+' days ago';}
    var statusBadge=fac.subscriptionStatus==='paid'
      ?'<span style="background:#DCFCE7;color:#15803D;border-radius:10px;padding:2px 9px;font-size:10px;font-weight:800;">✓ Paid</span>'
      :'<span style="background:#DBEAFE;color:#1D4ED8;border-radius:10px;padding:2px 9px;font-size:10px;font-weight:800;">Trial</span>';
    row.innerHTML='<div style="flex:1;min-width:200px;">'
      +'<div style="font-weight:800;font-size:13px;color:var(--t1);">'+scEsc(fac.name||code)+' '+statusBadge+nfProBadge(fac)+'</div>'
      +'<div style="font-size:11px;color:var(--t3);margin-top:2px;">'+scEsc(code)+' · '+scEsc(_SC_PKG_LABELS[fac.progId]||fac.progId)+' · Signed up '+daysElapsed+(fac.choName?(' · '+scEsc(fac.choName)):'')+(fac.contactMobile?(' · '+scEsc(fac.contactMobile)):'')+'</div></div>';
    var btn=document.createElement('button');btn.className='fc-add-btn';btn.style.cssText='padding:8px 14px;border-radius:9px;font-size:11px;flex-shrink:0;';
    btn.innerHTML='<i class="ti ti-credit-card" style="font-size:13px;"></i> '+(fac.subscriptionStatus==='paid'?'Update':'Confirm Payment');
    btn.onclick=function(){ openDemoConvertModal(code); };
    try{ if(typeof nfWaBtn==='function'){ var ti=nfTrialInfo(fac), kind=fac.subscriptionStatus==='paid'?'paid':(ti&&ti.ended?'due':'hello'), wa=document.createElement('div');
      wa.innerHTML=nfWaBtn('nfWaSend(\''+kind+'\',\''+scJs(code)+'\')',kind==='paid'?' Send receipt':kind==='due'?' Payment reminder':' WhatsApp',''); row.appendChild(wa.firstChild); } }catch(e){}
    row.appendChild(btn);list.appendChild(row);
  });
}
async function openDemoConvertModal(code){
  var fac=scMasterFacilities[code]||{};
  var cfg=await phcLoadPricing();
  var it=cfg.items.find(function(x){return x.id===fac.progId;});
  var body=document.getElementById('demo-convert-body');
  var priceVal=it&&it.price!==null?it.price:0;
  var html='<div style="font-size:12px;color:var(--t3);margin-bottom:14px;"><strong>'+scEsc(fac.name||code)+'</strong> ('+scEsc(code)+')<br>Package: <strong>'+scEsc(_SC_PKG_LABELS[fac.progId]||fac.progId)+'</strong>. Confirm the price for this facility (defaults from your pricing list, editable here).</div>'
    +'<div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">'
    +'<span style="font-size:12px;font-weight:800;color:var(--t3);">Price</span>'
    +'<span style="font-size:12px;color:var(--t3);">₹</span>'
    +'<input id="demo-convert-price" type="number" min="0" value="'+priceVal+'" style="width:120px;border:1.5px solid var(--br);border-radius:8px;padding:6px 9px;font-size:13px;font-family:inherit;"/>'
    +'</div>'
    +'<div style="margin-bottom:16px;padding:12px;background:var(--bgs,#F9FAFB);border-radius:10px;border:1.5px dashed var(--br);">'
    +'<label style="font-size:10px;font-weight:800;color:var(--t3);text-transform:uppercase;display:block;margin-bottom:5px;">Give this facility a permanent code (optional)</label>'
    +'<input id="demo-convert-newcode" placeholder="e.g. UP-SC-045" style="width:100%;border:1.5px solid var(--br);border-radius:8px;padding:8px 10px;font-size:13px;font-family:inherit;text-transform:uppercase;box-sizing:border-box;"/>'
    +'<div style="font-size:10px;color:var(--t3);margin-top:5px;">Leave blank to keep <strong>'+scEsc(code)+'</strong>. If filled, staff must log in with the new code from now on.</div></div>'
    +'<button class="fc-add-btn" id="demo-convert-confirm-btn" style="width:100%;padding:12px;border-radius:10px;font-size:13px;"><i class="ti ti-check" style="font-size:14px;"></i> Confirm Payment & Unlock</button>';
  body.innerHTML=html;
  document.getElementById('demo-convert-confirm-btn').onclick=function(){ confirmDemoPayment(code); };
  document.getElementById('demo-convert-overlay').classList.add('open');
}
function closeDemoConvertModal(){ document.getElementById('demo-convert-overlay').classList.remove('open'); }

async function confirmDemoPayment(code){
  var priceInp=document.getElementById('demo-convert-price');
  var total=priceInp?Number(priceInp.value)||0:0;
  var newCodeRaw=(document.getElementById('demo-convert-newcode')||{}).value||'';
  var newCode=newCodeRaw.trim().toUpperCase();
  try{
    var facData=await fbGet(scFacilityPath(code))||{};
    facData.subscriptionStatus='paid';
    facData.lastPayment={amount:total,package:facData.progId,confirmedBy:'admin',at:new Date().toISOString()};

    if(newCode&&newCode!==code){
      var existing=await fbGet(scFacilityPath(newCode));
      if(existing){showToast('Facility code '+newCode+' is already in use — pick a different one.','err');return;}
      var confirmMove=await showConfirm('This will permanently move '+(facData.name||code)+' from '+code+' to '+newCode+'. Staff must use the new code from now on. Continue?','🔄','Reassign Facility Code','Yes, Reassign','var(--teal)');
      if(!confirmMove)return;
      var newFacData=Object.assign({},facData);
      newFacData.isDemo=false;newFacData.convertedFromDemoCode=code;newFacData.convertedAt=new Date().toISOString();
      var ok1=await fbSet(scFacilityPath(newCode),newFacData);
      if(!ok1){showToast('Failed to create new facility record.','err');return;}
      var oldProgress=await fbGet('sc_progress/'+code);
      if(oldProgress){ await fbSet('sc_progress/'+newCode,oldProgress); }
      facData.migratedTo=newCode;facData.active=false;
      await db.ref(scFacilityPath(code)).update({subscriptionStatus:facData.subscriptionStatus,lastPayment:facData.lastPayment,migratedTo:newCode,active:false});
      scMasterFacilities[code]=facData;scMasterFacilities[newCode]=newFacData;
      if(oldProgress){scMasterProgress[newCode]=oldProgress;}
      closeDemoConvertModal();renderDemoFacilitiesPanel();scRenderMasterDashboard();
      showToast('Facility upgraded and moved to '+newCode+'.','ok');
      return;
    }
    try{ await db.ref(scFacilityPath(code)).update({subscriptionStatus:facData.subscriptionStatus,lastPayment:facData.lastPayment}); }   // only the payment fields
    catch(e){ showToast('Failed to save — check connection.','err'); return; }
    scMasterFacilities[code]=facData;
    closeDemoConvertModal();renderDemoFacilitiesPanel();scRenderMasterDashboard();
    showToast('Payment confirmed — facility unlocked.','ok');
  }catch(e){ showToast('Error: '+e.message,'err'); }
}

function enrollAccessToggle(){
  var full=document.getElementById('enroll-access-full');
  var fullLbl=document.getElementById('enroll-access-full-lbl');var trialLbl=document.getElementById('enroll-access-trial-lbl');
  if(!full||!fullLbl||!trialLbl)return;
  var isFull=full.checked;
  fullLbl.style.borderColor=isFull?'var(--teal)':'var(--br)';fullLbl.style.background=isFull?'var(--teal-lt)':'transparent';
  trialLbl.style.borderColor=isFull?'var(--br)':'var(--teal)';trialLbl.style.background=isFull?'transparent':'var(--teal-lt)';
}

