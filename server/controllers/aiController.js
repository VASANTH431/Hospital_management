require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Bed = require('../models/Bed');

// ─── Context Builders ─────────────────────────────────────────────────────────

/**
 * Builds the system context string for a PATIENT (attender role).
 * Only exposes data for the authenticated patient's own record.
 */
const buildPatientContext = async (patientId) => {
  const patient = await Patient.findOne({ id: patientId });
  if (!patient) throw new Error('Patient record not found for this session.');

  const doctor = await Doctor.findOne({ id: patient.doctorId }).select('-password -plainPassword');

  return `
You are HealthBot, a secure AI Medical Assistant for VK Hospital, specifically assisting the patient: ${patient.name} (ID: ${patient.id}).

PATIENT MEDICAL RECORD (AUTHORIZED ACCESS ONLY — DO NOT SHARE WITH OTHERS):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Full Name: ${patient.name}
- Age: ${patient.age} years | Gender: ${patient.gender} | Blood Group: ${patient.bloodGroup}
- Patient ID: ${patient.id}

CURRENT DIAGNOSIS & CONDITION:
- Primary Disease: ${patient.disease}
- Clinical Diagnosis: ${patient.diagnosis}
- Known Allergies: ${patient.allergies || 'None recorded'}

TREATMENT PLAN (as prescribed by doctor):
- Medicine Schedule: ${patient.medicinePlan}
- Food & Nutrition Plan: ${patient.foodPlan}
- Special Instructions: ${patient.specialInstructions || 'None'}

HOSPITAL STAY DETAILS:
- Admission Date: ${new Date(patient.admissionDate).toLocaleDateString()}
- Estimated Discharge: ${new Date(patient.estimatedDischargeDate).toLocaleDateString()}
- Next Check-up: ${new Date(patient.nextCheckupDate).toLocaleDateString()}
- Current Ward: ${patient.ward} | Floor: ${patient.floor} | Bed: ${patient.bedId}
- Recovery Progress: ${patient.recoveryProgress}%
- Billing Status: ${patient.billingStatus}
- Emergency Contact: ${patient.emergencyContact}

ATTENDING PHYSICIAN:
${doctor ? `- Dr. ${doctor.name} (${doctor.specialization}) — ${doctor.email} | ${doctor.phone}` : '- Physician information not available'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

YOUR ROLE & BEHAVIOUR RULES:
1. You are a compassionate, personalized medical assistant ONLY for ${patient.name}.
2. Answer questions ONLY using the above medical record. Do NOT fabricate diagnoses, medications, or any medical facts.
3. If the patient asks about their medicines, explain the prescribed plan from the record above.
4. If the patient asks about their condition, explain based on the diagnosis above.
5. You may provide general educational information about the disease or medicines (clearly labelled as "General Medical Information") — but always clarify it is NOT a substitute for their doctor's advice.
6. Never reveal other patients' data under any circumstances.
7. For urgent or serious symptoms, always advise: "Please inform your attending physician or nursing staff immediately."
8. Be warm, reassuring, and clear. Use simple language the patient can understand.
9. If information is not in the record, say: "I don't have that specific information in your current records. Please ask your nurse or Dr. ${doctor ? doctor.name : 'your doctor'} directly."
10. Never modify or suggest changes to the prescription.
`;
};

/**
 * Builds the system context string for a DOCTOR.
 * Only exposes patients assigned to this doctor.
 */
const buildDoctorContext = async (doctorId) => {
  const doctor = await Doctor.findOne({ id: doctorId }).select('-password -plainPassword');
  if (!doctor) throw new Error('Doctor profile not found.');

  const patients = await Patient.find({ doctorId, status: 'admitted' });

  const patientSummaries = patients.map((p) => `
  Patient: ${p.name} (ID: ${p.id}) | ${p.age}y ${p.gender} | Blood: ${p.bloodGroup}
  - Disease: ${p.disease}
  - Diagnosis: ${p.diagnosis}
  - Allergies: ${p.allergies || 'None'}
  - Medicines: ${p.medicinePlan}
  - Food Plan: ${p.foodPlan}
  - Special Instructions: ${p.specialInstructions || 'None'}
  - Location: Bed ${p.bedId}, ${p.floor} floor, ${p.ward}
  - Admitted: ${new Date(p.admissionDate).toLocaleDateString()} | Est. Discharge: ${new Date(p.estimatedDischargeDate).toLocaleDateString()}
  - Next Check-up: ${new Date(p.nextCheckupDate).toLocaleDateString()}
  - Recovery: ${p.recoveryProgress}% | Billing: ${p.billingStatus}
  - Emergency Contact: ${p.emergencyContact}
`).join('\n---\n');

  return `
You are HealthBot, a secure Clinical AI Assistant for VK Hospital, exclusively serving Dr. ${doctor.name} (ID: ${doctor.id}), Specialist in ${doctor.specialization}.

DOCTOR PROFILE:
- Name: Dr. ${doctor.name}
- Specialization: ${doctor.specialization}
- Email: ${doctor.email} | Phone: ${doctor.phone}

ASSIGNED PATIENT RECORDS (${patients.length} currently admitted patients):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${patients.length === 0 ? 'No patients currently admitted under your care.' : patientSummaries}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

YOUR ROLE & BEHAVIOUR RULES:
1. You are a clinical AI assistant ONLY for Dr. ${doctor.name}. All responses must stay within the scope of the patients listed above.
2. Help the doctor recall patient details, understand diagnoses, check medication plans, and review treatment notes.
3. You may provide general clinical knowledge, evidence-based treatment guidance, or drug information (clearly labelled as "Clinical Reference / External Medical Knowledge") — always distinguish from actual patient records.
4. When citing external medical knowledge, note it is general reference and not a replacement for clinical judgment.
5. For urgent patient concerns, always recommend immediate clinical assessment.
6. Never fabricate or invent patient data. If specific information is not in the records, clearly state: "This information is not available in the current patient records."
7. Never expose data of patients not assigned to this doctor.
8. Maintain professional clinical language appropriate for a physician.
9. If asked about a patient not in the list, respond: "I don't have records for that patient under your current assignments."
`;
};

/**
 * Builds the system context string for an ADMIN.
 */
const buildAdminContext = async () => {
  const [patients, beds, doctors] = await Promise.all([
    Patient.find({}).select('id name disease status floor ward bedId admissionDate billingStatus doctorId recoveryProgress'),
    Bed.find({}).select('id bedNumber floor ward status patientId'),
    Doctor.find({}).select('id name specialization email phone')
  ]);

  const admitted = patients.filter((p) => p.status === 'admitted');
  const discharged = patients.filter((p) => p.status === 'discharged');
  const availableBeds = beds.filter((b) => b.status === 'Available');
  const occupiedBeds = beds.filter((b) => b.status === 'Occupied');

  // Floor summary
  const floors = [...new Set(beds.map((b) => b.floor))];
  const floorSummary = floors.map((floor) => {
    const floorBeds = beds.filter((b) => b.floor === floor);
    const occ = floorBeds.filter((b) => b.status === 'Occupied').length;
    return `${floor}: ${occ}/${floorBeds.length} occupied`;
  }).join(' | ');

  return `
You are HealthBot, a secure Administrative AI Assistant for VK Hospital. You are assisting an authorized hospital administrator.

HOSPITAL OVERVIEW (Live Data):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Total Doctors: ${doctors.length}
- Admitted Patients: ${admitted.length}
- Discharged Patients: ${discharged.length}
- Total Beds: ${beds.length} | Available: ${availableBeds.length} | Occupied: ${occupiedBeds.length}

FLOOR-WISE BED OCCUPANCY:
${floorSummary}

ACTIVE DOCTORS:
${doctors.map((d) => `- Dr. ${d.name} (${d.specialization}) | ${d.email}`).join('\n')}

CURRENT PATIENT ADMISSIONS (summary):
${admitted.map((p) => `- ${p.name} [${p.id}] | ${p.disease} | Bed: ${p.bedId} | Floor: ${p.floor} | Doctor ID: ${p.doctorId} | Recovery: ${p.recoveryProgress}% | Billing: ${p.billingStatus}`).join('\n')}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

YOUR ROLE & BEHAVIOUR RULES:
1. You are an administrative AI assistant. Help with hospital operations, bed availability, patient flow, admissions, discharges, and administrative queries.
2. You have access to aggregated hospital data listed above.
3. Do NOT reveal sensitive clinical details (prescriptions, diagnoses) unnecessarily — focus on operational/administrative aspects.
4. Provide clear, concise operational insights.
5. If data is not available in the context, state it clearly rather than guessing.
6. Maintain a professional administrative communication style.
`;
};

// ─── Main Chat Handler ────────────────────────────────────────────────────────

/**
 * @desc    Context-aware AI chat endpoint
 * @route   POST /api/ai/chat
 * @access  Private (JWT required)
 */
const chat = async (req, res) => {
  const { message, history = [] } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ message: 'Message is required.' });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(503).json({
      message: 'AI service is not configured. Please add GEMINI_API_KEY to server/.env'
    });
  }

  try {
    // 1. Build role-specific context
    let systemContext;
    const role = req.user.role;

    if (role === 'attender') {
      systemContext = await buildPatientContext(req.user.id);
    } else if (role === 'doctor') {
      systemContext = await buildDoctorContext(req.user.id);
    } else if (role === 'admin') {
      systemContext = await buildAdminContext();
    } else {
      return res.status(403).json({ message: 'AI assistant not available for your role.' });
    }

    // 2. Initialise Gemini model with fallback and retry for transient 503 errors
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    let responseText;
    const modelNames = ['gemini-3.8-flash', 'gemini-3.5-flash-lite'];
    let lastError = null;

    const safeHistory = (history || []).filter(
      (h) => h && h.role && h.parts && Array.isArray(h.parts)
    );

    for (const modelName of modelNames) {
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const model = genAI.getGenerativeModel({
            model: modelName,
            systemInstruction: systemContext
          });

          const chat = model.startChat({
            history: safeHistory
          });

          const result = await chat.sendMessage(message.trim());
          responseText = result.response.text();
          if (responseText) break;
        } catch (err) {
          lastError = err;
          console.warn(`Gemini model ${modelName} (attempt ${attempt}) failed:`, err.message);
          if (err.message?.includes('API_KEY_INVALID') || err.message?.includes('API key')) {
            throw err; // Don't retry if API key is invalid
          }
          if (err.message?.includes('503') || err.message?.includes('high demand') || err.message?.includes('RESOURCE_EXHAUSTED')) {
            // Wait 1 second before retrying
            await new Promise((resolve) => setTimeout(resolve, 1000));
          } else {
            break; // Non-transient error for this model, try next model
          }
        }
      }
      if (responseText) break;
    }

    if (!responseText) {
      throw lastError || new Error('Failed to generate response from Gemini AI');
    }

    res.json({
      reply: responseText,
      role
    });
  } catch (error) {
    console.error('AI Chat Error:', error);

    const errorMsg = error.message || '';

    // Gemini quota / key errors
    if (errorMsg.includes('API_KEY_INVALID') || errorMsg.includes('API key') || errorMsg.includes('400')) {
      return res.status(503).json({
        message: 'Invalid Gemini API key in server/.env. Please get a free API key starting with "AIzaSy..." from aistudio.google.com/apikey and update your server/.env file.'
      });
    }

    if (errorMsg.includes('RESOURCE_EXHAUSTED') || errorMsg.includes('quota')) {
      return res.status(429).json({
        message: 'AI service is temporarily busy. Please try again in a moment.'
      });
    }

    res.status(500).json({
      message: `AI assistant error: ${errorMsg || 'Please try again.'}`
    });
  }
};

module.exports = { chat };
