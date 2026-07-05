const fs = require('fs');
let code = fs.readFileSync('src/pages/SettingsPage.tsx', 'utf-8');

// I will add a 2FA enrollment UI using Firebase SMS MFA
const imports = `import { multiFactor, PhoneAuthProvider, PhoneMultiFactorGenerator, RecaptchaVerifier } from 'firebase/auth';
import { auth } from '../lib/firebase';`;

if (!code.includes('import { multiFactor')) {
  code = code.replace("import { motion, AnimatePresence } from 'motion/react';", "import { motion, AnimatePresence } from 'motion/react';\n" + imports);
}

const enrollmentState = `
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [mfaStep, setMfaStep] = useState(0); // 0 = disabled, 1 = entering phone, 2 = entering code, 3 = enrolled
`;

code = code.replace("const [is2FAEnabled, setIs2FAEnabled] = useState(false);", enrollmentState);

const enrollmentUI = `
                        {/* Option 2: 2FA Real Firebase SMS MFA */}
                        <div className="p-4 bg-[#FAF9F6] border border-stone-150/60 rounded-2xl flex flex-col gap-4">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                              <h4 className="text-sm font-bold text-stone-900">
                                Enable Two-Factor Authentication (Firebase SMS MFA)
                              </h4>
                              <p className="text-xs text-stone-400 mt-0.5">Secure your account with official Firebase SMS second factor.</p>
                            </div>
                            <button 
                              onClick={() => setMfaStep(mfaStep === 3 ? 0 : 1)}
                              className={\`w-12 h-6.5 rounded-full p-0.5 transition-colors duration-200 outline-none flex items-center relative \${
                                mfaStep === 3 ? 'bg-[#b08d2c]' : 'bg-stone-200'
                              }\`}
                            >
                              <div className={\`w-5.5 h-5.5 bg-white rounded-full shadow-md transition-transform duration-200 \${
                                mfaStep === 3 ? 'translate-x-[22px]' : 'translate-x-0.5'
                              }\`} />
                            </button>
                          </div>
                          
                          {mfaStep === 1 && (
                            <div className="mt-4 pt-4 border-t border-stone-200 flex flex-col gap-2">
                              <label className="text-xs font-bold">Phone Number (+1...)</label>
                              <input type="text" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} className="w-full px-3 py-2 border rounded-md text-sm" placeholder="+1234567890" />
                              <div id="recaptcha-container" className="my-2"></div>
                              <button onClick={async () => {
                                if (!auth.currentUser) return;
                                try {
                                  const session = await multiFactor(auth.currentUser).getSession();
                                  const provider = new PhoneAuthProvider(auth);
                                  const appVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' });
                                  const verId = await provider.verifyPhoneNumber({ phoneNumber, session }, appVerifier);
                                  setVerificationId(verId);
                                  setMfaStep(2);
                                } catch (e: any) {
                                  console.error(e);
                                  alert("Error sending SMS: " + e.message);
                                }
                              }} className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-bold mt-2">Send SMS</button>
                            </div>
                          )}

                          {mfaStep === 2 && (
                            <div className="mt-4 pt-4 border-t border-stone-200 flex flex-col gap-2">
                              <label className="text-xs font-bold">Verification Code</label>
                              <input type="text" value={verificationCode} onChange={e => setVerificationCode(e.target.value)} className="w-full px-3 py-2 border rounded-md text-sm" placeholder="123456" />
                              <button onClick={async () => {
                                if (!auth.currentUser) return;
                                try {
                                  const cred = PhoneAuthProvider.credential(verificationId, verificationCode);
                                  const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(cred);
                                  await multiFactor(auth.currentUser).enroll(multiFactorAssertion, 'My Phone');
                                  setMfaStep(3);
                                  alert('Successfully enrolled in MFA!');
                                } catch (e: any) {
                                  console.error(e);
                                  alert("Error verifying code: " + e.message);
                                }
                              }} className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-bold mt-2">Verify & Enroll</button>
                            </div>
                          )}
                        </div>
`;

code = code.replace(/\{\/\*\s*Option 2: 2FA Real[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/motion\.div>/, enrollmentUI + '\n                      </div>\n                    </div>\n                  </motion.div>');

fs.writeFileSync('src/pages/SettingsPage.tsx', code);
console.log("Updated MFA");
